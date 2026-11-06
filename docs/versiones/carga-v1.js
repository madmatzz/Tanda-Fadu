// Pantalla de carga: las hojas se apilan, se comprimen y se transforman en el logo.
//
// Los valores salen de medir la animación original de After Effects, a 30 cuadros por segundo,
// sobre un lienzo de 1000 × 1000. Cada tabla guarda [cuadro, ...valores]: entre dos filas se
// interpola en línea recta, y así las curvas de movimiento quedan iguales a las del video.

const FPS = 30;
/** Cuadro en el que el logo ya quedó quieto y la pantalla empieza a irse. */
const LAST_FRAME = 140;
const FADE_MS = 320;

// Cada hoja: [cuadro, borde superior, borde inferior, tono de arriba (0 a 255)].
const SHEET_A = [
  [0, 296, 374, 169], [2, 296, 376, 169], [4, 296, 380, 169], [6, 294, 388, 169], [8, 294, 406, 169],
  [10, 292, 438, 169], [12, 292, 484, 169], [14, 292, 530, 169], [16, 292, 564, 169], [18, 292, 590, 169],
  [20, 294, 610, 169], [22, 296, 630, 169], [24, 330, 648, 175], [26, 390, 668, 186], [28, 450, 688, 194],
  [30, 498, 706, 193], [32, 538, 720, 190], [34, 572, 730, 187], [36, 602, 738, 187], [38, 624, 744, 186],
  [40, 642, 748, 187], [42, 656, 750, 188], [44, 666, 750, 189], [46, 674, 752, 190], [48, 682, 752, 194],
  [50, 688, 752, 197], [52, 692, 750, 200], [54, 696, 750, 204], [56, 698, 750, 207], [58, 702, 748, 211],
  [60, 702, 748, 210], [62, 702, 746, 211], [64, 702, 744, 210], [66, 700, 740, 209], [68, 696, 738, 208],
  [70, 692, 732, 206], [72, 686, 726, 204], [74, 678, 718, 202], [76, 666, 706, 197], [78, 650, 690, 190],
  [80, 622, 660, 174], [82, 582, 620, 142],
];
const SHEET_B = [
  [16, 248, 252, 201], [18, 246, 256, 201], [20, 246, 266, 211], [22, 246, 288, 211], [24, 246, 328, 209],
  [26, 246, 390, 202], [28, 250, 448, 197], [30, 254, 496, 188], [32, 262, 536, 180], [34, 272, 572, 172],
  [36, 280, 602, 164], [38, 342, 624, 178], [40, 398, 642, 191], [42, 446, 656, 200], [44, 486, 666, 205],
  [46, 518, 674, 209], [48, 542, 682, 213], [50, 562, 688, 218], [52, 578, 692, 222], [54, 592, 696, 226],
  [56, 604, 698, 230], [58, 614, 702, 231], [60, 624, 702, 231], [62, 630, 702, 231], [64, 634, 702, 229],
  [66, 636, 700, 226], [68, 638, 696, 225], [70, 636, 692, 223], [72, 632, 686, 222], [74, 626, 678, 221],
  [76, 616, 666, 217], [78, 600, 650, 208], [80, 572, 622, 186], [82, 532, 582, 144],
];
const SHEET_C = [
  [32, 180, 186, 179], [34, 182, 210, 211], [36, 184, 274, 211], [38, 188, 342, 211], [40, 196, 398, 211],
  [42, 206, 446, 209], [44, 214, 486, 203], [46, 222, 516, 201], [48, 226, 542, 196], [50, 228, 562, 186],
  [52, 232, 578, 184], [54, 234, 592, 178], [56, 236, 604, 173], [58, 240, 614, 168], [60, 242, 624, 163],
  [62, 246, 630, 160], [64, 248, 634, 156], [66, 252, 636, 154], [68, 256, 638, 151], [70, 262, 636, 150],
  [72, 268, 632, 150], [74, 276, 626, 148], [76, 286, 616, 140], [78, 302, 600, 123], [80, 330, 572, 98],
  [82, 366, 532, 80],
];
/** Tono del blanco de las hojas: al final de la compresión se vuelve lila. */
const SHEET_WHITE = [[0, 255], [76, 255], [78, 252], [80, 244], [82, 234]];

// La T: [cuadro, izquierda, derecha, arriba, base de la barra, palo izq., palo der., abajo].
const LOGO_T = [
  [83, 288, 710, 432, 540, 444, 552, 658], [84, 284, 712, 396, 506, 444, 552, 680], [85, 284, 714, 380, 490, 444, 554, 690],
  [86, 282, 714, 366, 478, 444, 554, 694], [87, 282, 714, 356, 468, 442, 554, 700], [88, 282, 716, 348, 460, 442, 554, 702],
  [89, 280, 716, 340, 452, 442, 554, 704], [90, 280, 716, 334, 446, 442, 554, 706], [91, 280, 716, 328, 440, 442, 554, 706],
  [92, 280, 716, 324, 436, 442, 554, 706], [93, 280, 716, 318, 432, 442, 554, 706], [94, 280, 716, 314, 428, 442, 554, 706],
  [95, 280, 716, 314, 426, 442, 554, 708], [96, 280, 716, 312, 424, 442, 554, 708], [104, 282, 714, 312, 424, 442, 554, 708],
  [106, 282, 714, 312, 424, 444, 554, 706], [107, 284, 712, 314, 424, 444, 554, 704], [108, 284, 712, 314, 424, 444, 552, 702],
  [109, 286, 710, 316, 424, 444, 552, 700], [110, 290, 706, 318, 424, 446, 552, 696], [111, 294, 702, 320, 426, 446, 552, 690],
  [112, 298, 700, 322, 426, 448, 552, 686], [113, 300, 698, 324, 426, 448, 552, 684], [114, 300, 696, 324, 426, 448, 552, 682],
  [115, 302, 696, 326, 426, 448, 550, 682], [116, 302, 694, 326, 426, 448, 548, 680], [119, 304, 694, 326, 426, 448, 548, 678],
  [120, 304, 694, 328, 426, 450, 548, 678],
];
/** Sombreado de la T: [cuadro, tono lila de arriba R, G, B, tono de abajo]. Se va hasta quedar blanca. */
const LOGO_SHADE = [[83, 225, 203, 241, 208], [92, 208, 184, 227, 232], [100, 240, 228, 246, 245], [110, 255, 255, 255, 255]];

// El círculo: sale por detrás de la barra, sube, cae, y reaparece por detrás del palo hacia la derecha.
const BALL_UP = [
  [83, 430], [84, 382], [85, 340], [86, 312], [87, 292], [88, 276], [89, 262], [90, 250], [91, 242], [92, 234], [93, 228],
  [94, 224], [95, 222], [96, 220], [98, 219], [100, 225], [102, 238], [104, 257], [106, 290], [107, 308], [108, 328], [109, 352],
];
const BALL_UP_COLOR = [[83, 226, 135, 255], [88, 191, 107, 255], [92, 160, 83, 222], [96, 146, 69, 208], [106, 140, 62, 201]];
const BALL_SIDE = [
  [110, 500], [111, 554], [112, 586], [113, 606], [114, 618], [115, 628], [116, 636], [117, 640], [118, 644], [119, 648],
  [120, 650], [121, 652], [122, 654], [123, 656], [124, 658], [126, 660], [130, 661], [134, 662],
];
const BALL_SIDE_COLOR = [[110, 168, 81, 237], [114, 152, 70, 217], [118, 143, 64, 206], [124, 140, 62, 203]];

const view = { start: null, done: false };

/** Valores de una tabla en un cuadro, interpolando entre filas. Null si cae antes de la primera. */
function track(rows, frame) {
  if (frame < rows[0][0]) return null;
  const nextIndex = rows.findIndex((row) => row[0] > frame);
  if (nextIndex === -1) return rows[rows.length - 1].slice(1);
  const before = rows[nextIndex - 1];
  const after = rows[nextIndex];
  const progress = (frame - before[0]) / (after[0] - before[0]);
  return before.slice(1).map((value, index) => value + (after[index + 1] - value) * progress);
}

/** Color lavanda de las hojas a partir de su tono: cuanto más oscuro, más violeta. */
function lavender(tone) {
  const depth = 255 - tone;
  return `rgb(${Math.round(tone + depth * 0.2)} ${Math.round(tone)} ${Math.round(tone + depth * 0.5)})`;
}

const rgb = (values) => `rgb(${values.map(Math.round).join(" ")})`;

/** Dibuja una hoja. `spread` es qué parte de la hoja ocupa el degradé hasta llegar al blanco. */
function drawSheet(id, rows, frame, white, spread) {
  const rect = document.getElementById(`sheet-${id}`);
  const values = frame < 83 ? track(rows, frame) : null;
  rect.style.display = values ? "" : "none";
  if (!values) return;
  const [top, bottom, tone] = values;
  const height = bottom - top;
  const gradient = document.getElementById(`sheet-${id}-fill`);
  rect.setAttribute("y", top);
  rect.setAttribute("height", height);
  gradient.setAttribute("y1", top);
  gradient.setAttribute("y2", top + spread(height));
  gradient.children[0].setAttribute("stop-color", lavender(tone));
  gradient.children[1].setAttribute("stop-color", lavender(white));
}

function drawLogo(frame) {
  const logo = document.getElementById("splash-t");
  const values = track(LOGO_T, frame);
  logo.style.display = values ? "" : "none";
  if (!values) return;
  const [left, right, top, barBottom, stemLeft, stemRight, bottom] = values;
  logo.setAttribute("points", [
    [left, top], [right, top], [right, barBottom], [stemRight, barBottom],
    [stemRight, bottom], [stemLeft, bottom], [stemLeft, barBottom], [left, barBottom],
  ].join(" "));
  const [red, green, blue, base] = track(LOGO_SHADE, frame);
  const gradient = document.getElementById("splash-t-fill");
  gradient.setAttribute("y1", top);
  gradient.setAttribute("y2", bottom);
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
  const [white] = track(SHEET_WHITE, frame);
  const pressed = (height) => height * 0.85;
  const onTop = (height) => height * 0.58;
  drawSheet("a", SHEET_A, frame, white, (height) => (frame < 24 ? 300 : pressed(height)));
  drawSheet("b", SHEET_B, frame, white, (height) => (frame < 37 ? onTop(height) : pressed(height)));
  drawSheet("c", SHEET_C, frame, white, onTop);
  drawBall(frame);
  drawLogo(frame);
}

/** Sigue hacia la primera pantalla real de la app. */
function leaveSplash() {
  if (view.done) return;
  view.done = true;
  document.querySelector(".splash").classList.add("is-leaving");
  window.setTimeout(() => {
    App.leaving = true;
    window.location.replace(onboardingSeen() ? "index.html" : "onboarding.html");
  }, FADE_MS);
}

function tick(now) {
  if (view.done) return;
  if (view.start === null) view.start = now;
  const frame = ((now - view.start) / 1000) * FPS;
  drawFrame(Math.min(frame, LAST_FRAME));
  if (frame >= LAST_FRAME) leaveSplash();
  else requestAnimationFrame(tick);
}

const sheetFill = (id) => `
  <linearGradient id="sheet-${id}-fill" gradientUnits="userSpaceOnUse" x1="0" x2="0">
    <stop offset="0"/><stop offset="1"/>
  </linearGradient>`;

App.start({
  init() {
    markSplashSeen();
    App.screenEl.classList.add("is-splash");
  },

  render() {
    return `
      <button type="button" class="splash" aria-label="Tanda. Tocá para continuar" ${on("skip")}>
        <svg class="splash-art" viewBox="0 0 1000 1000" aria-hidden="true">
          <defs>
            ${["a", "b", "c"].map(sheetFill).join("")}
            <linearGradient id="splash-t-fill" gradientUnits="userSpaceOnUse" x1="0" x2="0">
              <stop offset="0"/><stop offset="0.24" stop-color="#FFFFFF"/><stop offset="0.45" stop-color="#FFFFFF"/><stop offset="1"/>
            </linearGradient>
          </defs>
          <rect id="sheet-a" x="288" width="422" fill="url(#sheet-a-fill)"/>
          <rect id="sheet-b" x="288" width="422" fill="url(#sheet-b-fill)"/>
          <rect id="sheet-c" x="288" width="422" fill="url(#sheet-c-fill)"/>
          <circle id="splash-ball"/>
          <polygon id="splash-t" fill="url(#splash-t-fill)"/>
        </svg>
      </button>`;
  },

  afterRender() {
    if (view.start !== null || view.done) return;
    // Con la animación desactivada en el sistema, se ve el logo quieto un momento.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      drawFrame(LAST_FRAME);
      window.setTimeout(leaveSplash, 900);
      return;
    }
    drawFrame(0);
    requestAnimationFrame(tick);
  },

  actions: {
    skip: leaveSplash,
  },
});
