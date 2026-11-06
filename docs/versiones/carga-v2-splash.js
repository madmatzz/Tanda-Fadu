// Pantalla de carga: las hojas se apilan, se comprimen y se transforman en el logo.
//
// Corre como una capa encima de la pantalla que sigue (Inicio u Onboarding), que ya está dibujada
// debajo. Al terminar la capa se desvanece, sin cambiar de página: nada se vuelve a armar y no hay
// parpadeos. js/entrada.js decide si se muestra, antes de que se pinte nada.
//
// Los tiempos salen de la animación original de After Effects, a 30 cuadros por segundo, sobre
// un lienzo de 1000 × 1000. Cada tabla guarda [cuadro, ...valores] y entre sus filas se pasa con
// una curva suave, para que nada cambie de golpe. La v1, copiada cuadro por cuadro del video,
// está en docs/versiones/carga-v1.js.

const Splash = (() => {
  const FPS = 30;
  /** Cuadro en el que la pantalla empieza a irse: el logo armado se sostiene un momento. */
  const LAST_FRAME = 155;
  /** Lo que tarda el logo en desvanecerse (igual a la transición de .splash-art en screens.css). */
  const FADE_MS = 450;
  /** Cuadro en el que la pila ya tiene la forma de la barra de la T. */
  const STACK_END = 84;

  // Las hojas se describen por sus bordes. Las de abajo arrancan donde termina la de arriba:
  // así, al empujarse, nunca queda un salto entre ellas.
  const STACK = [
    // cuadro, arriba de C, base de C, arriba de B, base de B, arriba de A, base de A
    [0, 180, 180, 246, 246, 294, 296],
    [6, 180, 180, 246, 246, 294, 384],
    [14, 180, 180, 246, 246, 294, 530],
    [16, 180, 180, 246, 246, 294, 564],
    [22, 180, 180, 246, 288, 294, 630],
    [28, 180, 180, 250, 448, 294, 688],
    [32, 180, 180, 262, 536, 294, 720],
    [36, 184, 274, 272, 602, 294, 738],
    [40, 196, 398, 272, 642, 294, 748],
    [44, 214, 486, 272, 666, 294, 750],
    [50, 228, 562, 272, 688, 294, 752],
    [56, 236, 604, 272, 698, 294, 750],
    [62, 246, 630, 272, 702, 294, 746],
    [68, 256, 637, 272, 696, 294, 738],
    [72, 268, 632, 272, 686, 294, 726],
    [76, 286, 616, 272, 666, 294, 706],
    [80, 330, 572, 272, 622, 294, 660],
    [82, 366, 532, 272, 582, 294, 620],
    [84, 396, 462, 272, 486, 294, 506],
  ];

  // Tono de arriba de cada hoja (0 a 255): lavanda arriba de la pila, más claro al quedar tapada.
  const TONE_A = [[0, 172], [22, 172], [30, 192], [60, 208], [72, 204], [78, 190], [82, 168], [84, 214]];
  const TONE_B = [[16, 205], [28, 190], [36, 176], [44, 200], [56, 226], [68, 226], [76, 216], [82, 168], [84, 214]];
  const TONE_C = [[32, 205], [44, 200], [56, 176], [70, 152], [76, 142], [80, 118], [82, 128], [84, 214]];
  /** Tono del blanco de las hojas: mientras se comprimen se vuelve lila. */
  const SHEET_WHITE = [[0, 255], [74, 255], [80, 244], [82, 240], [84, 250]];
  /** Cuánto está tapada cada hoja: 0 si está arriba de todo, 1 si otra la cubre. */
  const COVER_A = [[0, 0], [22, 0], [30, 1]];
  const COVER_B = [[0, 0], [34, 0], [42, 1]];

  // La T: [cuadro, izquierda, derecha, arriba, base de la barra, palo izq., palo der., abajo].
  // Arranca igual a la pila y de ahí baja el palo.
  const LOGO_T = [
    [82, 288, 710, 366, 620, 444, 552, 620], [84, 286, 712, 396, 506, 444, 552, 506], [86, 282, 714, 366, 478, 444, 554, 660],
    [88, 282, 716, 348, 460, 442, 554, 702], [92, 280, 716, 324, 436, 442, 554, 706], [96, 280, 716, 312, 424, 442, 554, 708],
    [104, 282, 714, 312, 424, 442, 554, 708], [108, 284, 712, 314, 424, 444, 552, 702], [112, 298, 700, 322, 426, 448, 552, 686],
    [116, 302, 694, 326, 426, 448, 548, 680], [120, 304, 694, 328, 426, 450, 548, 678],
  ];
  /** La T aparece encima de la pila mientras esta termina de comprimirse. */
  const LOGO_OPACITY = [[82, 0], [84.5, 1]];
  /** Sombreado de la T: [cuadro, tono lila de arriba R, G, B, tono de abajo]. Se va hasta quedar blanca. */
  const LOGO_SHADE = [[82, 214, 192, 232, 216], [92, 208, 184, 227, 232], [100, 240, 228, 246, 245], [110, 255, 255, 255, 255]];

  // El círculo: sale por detrás de la barra, sube, cae, y reaparece por detrás del palo hacia la derecha.
  const BALL_UP = [[83, 430], [85, 340], [87, 292], [89, 262], [92, 234], [96, 220], [98, 219], [102, 238], [104, 257], [106, 290], [109, 352]];
  const BALL_UP_COLOR = [[83, 226, 135, 255], [88, 191, 107, 255], [92, 160, 83, 222], [96, 146, 69, 208], [106, 140, 62, 201]];
  const BALL_SIDE = [[110, 500], [112, 586], [114, 618], [116, 636], [120, 650], [124, 658], [130, 661], [134, 662]];
  const BALL_SIDE_COLOR = [[110, 168, 81, 237], [114, 152, 70, 217], [118, 143, 64, 206], [124, 140, 62, 203]];

  /** Capa negra sobre el fondo: se aclara de a poco y termina rápido, cuando las hojas pasan a ser la T. */
  const BACKDROP = [
    [0, 1], [6, 0.96], [12, 0.88], [18, 0.85], [24, 0.81], [30, 0.73], [36, 0.65], [42, 0.62], [48, 0.54],
    [54, 0.5], [60, 0.46], [66, 0.38], [72, 0.31], [80, 0.27], [82, 0.15], [84, 0.12], [86, 0],
  ];

  const view = { start: null, done: false };
  const root = document.documentElement;

  /** Pendientes de una curva monótona: pasa por cada fila sin pasarse ni rebotar entre ellas. */
  function slopes(rows, column) {
    const gaps = rows.slice(1).map((row, index) => (row[column] - rows[index][column]) / (row[0] - rows[index][0]));
    return rows.map((row, index) => {
      if (index === 0) return gaps[0];
      if (index === rows.length - 1) return gaps[index - 1];
      const [before, after] = [gaps[index - 1], gaps[index]];
      return before * after <= 0 ? 0 : (2 * before * after) / (before + after);
    });
  }

  /** Valores de una tabla en un cuadro, con una curva suave entre filas. Null si cae antes de la primera. */
  function track(rows, frame) {
    if (frame < rows[0][0]) return null;
    const nextIndex = rows.findIndex((row) => row[0] > frame);
    if (nextIndex === -1) return rows[rows.length - 1].slice(1);
    const before = rows[nextIndex - 1];
    const after = rows[nextIndex];
    const span = after[0] - before[0];
    const t = (frame - before[0]) / span;
    return before.slice(1).map((value, index) => {
      const column = index + 1;
      const tangents = slopes(rows, column);
      const [m0, m1] = [tangents[nextIndex - 1], tangents[nextIndex]];
      return (2 * t ** 3 - 3 * t ** 2 + 1) * value + (t ** 3 - 2 * t ** 2 + t) * span * m0
        + (-2 * t ** 3 + 3 * t ** 2) * after[column] + (t ** 3 - t ** 2) * span * m1;
    });
  }

  /** Color lavanda de las hojas a partir de su tono: cuanto más oscuro, más violeta. */
  function lavender(tone) {
    const depth = 255 - tone;
    return `rgb(${Math.round(tone + depth * 0.2)} ${Math.round(tone)} ${Math.round(tone + depth * 0.5)})`;
  }

  const rgb = (values) => `rgb(${values.map(Math.round).join(" ")})`;
  const lerp = (from, to, amount) => from + (to - from) * amount;

  /** Dibuja una hoja entre dos bordes. `reach` es hasta dónde llega su degradé antes del blanco. */
  function drawSheet(id, top, bottom, tone, white, reach) {
    const rect = document.getElementById(`sheet-${id}`);
    const height = bottom - top;
    rect.style.display = height > 0.5 ? "" : "none";
    if (height <= 0.5) return;
    const gradient = document.getElementById(`sheet-${id}-fill`);
    rect.setAttribute("y", top);
    rect.setAttribute("height", height);
    // Al nacer, la hoja aparece de a poco en lugar de surgir de golpe.
    rect.setAttribute("opacity", Math.min(1, height / 40));
    gradient.setAttribute("y1", top);
    gradient.setAttribute("y2", top + reach);
    gradient.children[0].setAttribute("stop-color", lavender(tone));
    gradient.children[1].setAttribute("stop-color", lavender(white));
  }

  function drawStack(frame) {
    document.getElementById("splash-stack").style.display = frame <= STACK_END + 0.5 ? "" : "none";
    if (frame > STACK_END + 0.5) return;
    const [topC, bottomC, restB, bottomB, restA, bottomA] = track(STACK, Math.min(frame, STACK_END));
    const topB = Math.max(restB, bottomC);
    const topA = Math.max(restA, bottomB);
    const [white] = track(SHEET_WHITE, frame);
    const [coverA] = track(COVER_A, frame);
    const [coverB] = track(COVER_B, frame);
    const heightA = bottomA - topA;
    const heightB = bottomB - topB;
    drawSheet("a", topA, bottomA, track(TONE_A, frame)[0], white, lerp(300, heightA * 0.85, coverA));
    drawSheet("b", topB, bottomB, frame < 16 ? 205 : track(TONE_B, frame)[0], white, heightB * lerp(0.58, 0.85, coverB));
    drawSheet("c", topC, bottomC, frame < 32 ? 205 : track(TONE_C, frame)[0], white, (bottomC - topC) * 0.6);
  }

  function drawLogo(frame) {
    const logo = document.getElementById("splash-t");
    const values = track(LOGO_T, frame);
    logo.style.display = values ? "" : "none";
    if (!values) return;
    const [left, right, top, barBottom, stemLeft, stemRight, bottom] = values;
    logo.setAttribute("points", [
      [left, top], [right, top], [right, barBottom], [stemRight, barBottom],
      [stemRight, Math.max(bottom, barBottom)], [stemLeft, Math.max(bottom, barBottom)], [stemLeft, barBottom], [left, barBottom],
    ].join(" "));
    logo.setAttribute("opacity", track(LOGO_OPACITY, frame)[0]);
    const [red, green, blue, base] = track(LOGO_SHADE, frame);
    const gradient = document.getElementById("splash-t-fill");
    gradient.setAttribute("y1", top);
    gradient.setAttribute("y2", Math.max(bottom, top + 1));
    gradient.children[0].setAttribute("stop-color", rgb([red, green, blue]));
    gradient.children[3].setAttribute("stop-color", rgb([base, base - 8 * (255 - base) / 47, base + 2 * (255 - base) / 47]));
  }

  function drawBall(frame) {
    const ball = document.getElementById("splash-ball");
    const rising = frame < 110;
    const position = rising ? track(BALL_UP, frame) : track(BALL_SIDE, frame);
    ball.style.display = position ? "" : "none";
    if (!position) return;
    ball.setAttribute("cx", rising ? 498 : position[0]);
    ball.setAttribute("cy", rising ? position[0] : 625);
    ball.setAttribute("r", rising ? 58 : 52);
    ball.setAttribute("fill", rgb(track(rising ? BALL_UP_COLOR : BALL_SIDE_COLOR, frame)));
  }

  function drawFrame(frame) {
    document.getElementById("splash-backdrop").style.opacity = track(BACKDROP, frame)[0];
    drawStack(frame);
    drawBall(frame);
    drawLogo(frame);
  }

  /** Desvanece el logo y después la capa entera, que descubre la pantalla que ya estaba debajo. */
  function leave() {
    if (view.done) return;
    view.done = true;
    const layer = document.querySelector(".splash-layer");
    layer.classList.add("is-leaving");
    window.setTimeout(() => {
      root.classList.remove("splash-active", "splash-mounted");
      App.screenEl.inert = false;
      layer.addEventListener("animationend", () => layer.remove());
      layer.classList.add("is-revealing");
    }, FADE_MS);
  }
  function tick(now) {
    if (view.done) return;
    if (view.start === null) view.start = now;
    const frame = ((now - view.start) / 1000) * FPS;
    drawFrame(Math.min(frame, LAST_FRAME));
    if (frame >= LAST_FRAME) leave();
    else requestAnimationFrame(tick);
  }

  const sheetFill = (id) => `
    <linearGradient id="sheet-${id}-fill" gradientUnits="userSpaceOnUse" x1="0" x2="0">
      <stop offset="0"/><stop offset="1"/>
    </linearGradient>`;

  function start() {
    // Si se pidió desde el menú demo, se saca el pedido de la dirección para que recargar no la repita.
    if (App.params.has("carga")) {
      App.params.delete("carga");
      const query = App.params.toString();
      history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
    }
    markSplashSeen();
    App.screenEl.inert = true;
    App.screenEl.parentElement.insertAdjacentHTML("beforeend", `
      <div class="splash-layer" role="img" aria-label="Tanda">
        ${UI.statusBar()}
        <span class="splash-backdrop" id="splash-backdrop"></span>
        <svg class="splash-art" viewBox="0 0 1000 1000" aria-hidden="true">
          <defs>
            ${["a", "b", "c"].map(sheetFill).join("")}
            <linearGradient id="splash-t-fill" gradientUnits="userSpaceOnUse" x1="0" x2="0">
              <stop offset="0"/><stop offset="0.24" stop-color="#FFFFFF"/><stop offset="0.45" stop-color="#FFFFFF"/><stop offset="1"/>
            </linearGradient>
          </defs>
          <circle id="splash-ball"/>
          <g id="splash-stack">
            <rect id="sheet-a" x="288" width="422" fill="url(#sheet-a-fill)"/>
            <rect id="sheet-b" x="288" width="422" fill="url(#sheet-b-fill)"/>
            <rect id="sheet-c" x="288" width="422" fill="url(#sheet-c-fill)"/>
          </g>
          <polygon id="splash-t" fill="url(#splash-t-fill)"/>
        </svg>
      </div>`);
    root.classList.add("splash-mounted");

    // Con la animación desactivada en el sistema, se ve el logo quieto un momento.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      drawFrame(LAST_FRAME);
      window.setTimeout(leave, 900);
      return;
    }
    drawFrame(0);
    requestAnimationFrame(tick);
  }

  return { start };
})();
