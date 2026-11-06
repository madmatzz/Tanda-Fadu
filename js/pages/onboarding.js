// Onboarding: presenta los puntos clave de la app a quien la abre por primera vez.
// Cada slide tiene un color pleno de la paleta, una ilustración y una frase.
//
// Las ilustraciones son SVG dibujados acá, con los colores de tokens.css. Sus partes llevan
// las clases onb-rise, onb-pop u onb-drop (se animan al entrar al slide) y --d, la demora en ms.

/**
 * Persona parada de perfil, mirando a la derecha.
 * x: centro · base: dónde apoya los pies · height: altura hasta los hombros.
 * hair: "short" | "long" | "bun" | "curly" · gear: "backpack" | "roll" | "folder" (lo que lleva).
 */
function artPerson({ x, base, height, top, pants, skin, hairColor, hair, gear, delay }) {
  const shoulder = base - height;
  const hip = base - height * 0.56;
  // La cabeza flota sobre el cuerpo, sin cuello, como las figuras de las colas de la app.
  const headY = shoulder - 22;
  // La cabeza y el pelo se dibujan con radio 19 y se achican para mantener a la persona esbelta.
  const headScale = `translate(${x + 2} ${headY}) scale(0.76) translate(${-(x + 2)} ${-headY})`;

  const hairShape = {
    short: `<path d="M${x - 17} ${headY + 7} a20 20 0 1 1 ${37} -12 q-12 -5 -20 3 q-3 7 -9 7 q-1 5 -8 2 z" fill="${hairColor}"/>`,
    long: `<path d="M${x - 19} ${headY + 24} q-6 -14 0 -28 a20 20 0 0 1 39 2 q-12 -4 -20 3 q-1 10 -3 23 z" fill="${hairColor}"/>`,
    bun: `<circle cx="${x - 16}" cy="${headY - 19}" r="10" fill="${hairColor}"/><path d="M${x - 17} ${headY + 7} a20 20 0 1 1 ${37} -12 q-14 -3 -22 4 q-4 6 -7 6 z" fill="${hairColor}"/>`,
    curly: [[-16, 2], [-15, -11], [-6, -19], [6, -20], [15, -13], [-19, -5]]
      .map(([dx, dy]) => `<circle cx="${x + dx}" cy="${headY + dy}" r="10" fill="${hairColor}"/>`).join(""),
  }[hair];

  const behind = {
    backpack: `<rect x="${x - 31}" y="${shoulder + 4}" width="22" height="52" rx="10" fill="var(--color-accent-dark)"/>`,
    roll: `<rect x="${x - 28}" y="${shoulder - 40}" width="11" height="104" rx="5" fill="var(--color-pin-amber)" transform="rotate(-11 ${x - 22} ${shoulder + 12})"/>`,
  }[gear] || "";

  const front = gear === "folder"
    ? `<rect x="${x + 2}" y="${shoulder + 30}" width="30" height="40" rx="4" fill="var(--color-surface)" transform="rotate(5 ${x + 17} ${shoulder + 50})"/>`
    : "";

  return `
    <g class="onb-rise" style="--d: ${delay}">
      ${behind}
      <rect x="${x - 13}" y="${hip}" width="12" height="${base - hip}" rx="5" fill="${pants}"/>
      <rect x="${x + 1}" y="${hip}" width="12" height="${base - hip}" rx="5" fill="${pants}"/>
      <rect x="${x - 14}" y="${base - 9}" width="21" height="10" rx="5" fill="var(--color-ink)"/>
      <rect x="${x}" y="${base - 9}" width="21" height="10" rx="5" fill="var(--color-ink)"/>
      <rect x="${x - 17}" y="${shoulder}" width="34" height="${hip - shoulder + 12}" rx="14" fill="${top}"/>
      <g transform="${headScale}">
        <circle cx="${x + 2}" cy="${headY}" r="19" fill="${skin}"/>
        ${hairShape}
      </g>
      ${front}
      <path d="M${x - 2} ${shoulder + 14} q3 30 13 44" fill="none" stroke="${top}" stroke-width="11" stroke-linecap="round"/>
      <path d="M${x - 2} ${shoulder + 14} q3 30 13 44" fill="none" stroke="var(--color-ink)" stroke-opacity="0.14" stroke-width="11" stroke-linecap="round"/>
      <circle cx="${x + 12}" cy="${shoulder + 60}" r="6" fill="${skin}"/>
    </g>`;
}

/** Estrella de cuatro puntas para los destellos. */
function artSparkle(x, y, r, color, delay) {
  const q = r * 0.16;
  return `
    <g class="onb-pop" style="--d: ${delay}">
      <path d="M${x} ${y - r} Q${x + q} ${y - q} ${x + r} ${y} Q${x + q} ${y + q} ${x} ${y + r} Q${x - q} ${y + q} ${x - r} ${y} Q${x - q} ${y - q} ${x} ${y - r} z" fill="${color}"/>
    </g>`;
}

/** 1 · Archivo con un tick: está listo para imprimir. */
function artFile() {
  return `
    <circle cx="170" cy="172" r="138" fill="var(--color-sun-1)"/>
    <g class="onb-pop" style="--d: 60">
      <rect x="96" y="58" width="176" height="232" rx="16" fill="var(--color-accent-dark)" transform="rotate(9 170 170)"/>
    </g>
    <g class="onb-rise" style="--d: 120">
      <g transform="rotate(-5 170 170)">
        <path d="M86 56 H208 L256 104 V284 a14 14 0 0 1 -14 14 H86 a14 14 0 0 1 -14 -14 V70 a14 14 0 0 1 14 -14 z" fill="var(--color-surface)"/>
        <path d="M208 56 L256 104 H220 a12 12 0 0 1 -12 -12 z" fill="var(--color-fill-deep)"/>
        <rect x="96" y="120" width="136" height="76" rx="10" fill="var(--color-tanda-muted)"/>
        <circle cx="200" cy="142" r="12" fill="var(--color-accent)"/>
        <path d="M96 188 L140 146 L172 176 L188 162 L232 196 H106 a10 10 0 0 1 -10 -8 z" fill="var(--color-tanda)"/>
        <rect x="96" y="212" width="136" height="10" rx="5" fill="var(--color-fill-deep)"/>
        <rect x="96" y="232" width="104" height="10" rx="5" fill="var(--color-fill-deep)"/>
        <rect x="96" y="252" width="120" height="10" rx="5" fill="var(--color-fill-deep)"/>
      </g>
    </g>
    <g class="onb-pop" style="--d: 420">
      <circle cx="256" cy="252" r="54" fill="var(--color-tanda)" stroke="var(--color-surface)" stroke-width="7"/>
      <path d="M230 253 L249 272 L284 234" fill="none" stroke="var(--color-surface)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    ${artSparkle(58, 84, 20, "var(--color-surface)", 560)}
    ${artSparkle(300, 66, 14, "var(--color-tanda-muted)", 640)}
    ${artSparkle(40, 248, 12, "var(--color-surface)", 720)}`;
}

/** Pin de mapa con forma de gota. x, y: la punta · r: radio de la cabeza. */
function artPin(x, y, r, color, delay) {
  return `
    <ellipse cx="${x}" cy="${y}" rx="${r * 0.6}" ry="${r * 0.2}" fill="var(--color-ink)" opacity="0.18"/>
    <g class="onb-drop" style="--d: ${delay}">
      <path d="M${x} ${y} C${x - r * 0.35} ${y - r * 0.75} ${x - r} ${y - r * 1.05} ${x - r} ${y - r * 1.6} a${r} ${r} 0 1 1 ${r * 2} 0 C${x + r} ${y - r * 1.05} ${x + r * 0.35} ${y - r * 0.75} ${x} ${y} z" fill="${color}"/>
      <circle cx="${x}" cy="${y - r * 1.6}" r="${r * 0.42}" fill="var(--color-surface)"/>
    </g>`;
}

/**
 * 2 · La FADU simplificada: conserva el contorno y los dos patios del plano real (floors.js),
 * con las aulas como bloques redondeados y un recorrido hasta el local elegido.
 */
function artMap() {
  const scale = 322 / 902;
  const left = 9;
  const top = 62;
  // u recorre el edificio a lo largo y v a lo ancho, los dos de 0 a 1.
  const point = (u, v) => [left + (8 + 595 * u + 291 * v) * scale, top + (440 - 432 * u + 128 * v) * scale];
  const block = (u0, u1, v0, v1, fill, shift = 0, attrs = "") => {
    const corners = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]]
      .map(([u, v]) => { const [x, y] = point(u, v); return `${x},${y + shift}`; }).join(" ");
    return `<polygon points="${corners}" fill="${fill}" stroke="${fill}" stroke-linejoin="round" ${attrs || 'stroke-width="9"'}/>`;
  };
  const pin = (u, v, r, color, delay) => artPin(...point(u, v), r, color, delay);
  const rooms = [
    [0.05, 0.3, 0.05, 0.25], [0.34, 0.62, 0.05, 0.25], [0.66, 0.95, 0.05, 0.25],
    [0.05, 0.12, 0.33, 0.67], [0.42, 0.59, 0.33, 0.67], [0.88, 0.95, 0.33, 0.67],
    [0.05, 0.33, 0.75, 0.95], [0.42, 0.62, 0.75, 0.95], [0.66, 0.95, 0.75, 0.95],
  ];
  const route = [[0.375, 0.98], [0.375, 0.3], [0.72, 0.3], [0.72, 0.17]].map(([u, v]) => point(u, v));
  const [startX, startY] = route[0];
  return `
    <g class="onb-rise" style="--d: 140">${block(0, 1, 0, 1, "var(--color-surface)", 50, 'stroke-width="9" opacity="0.35"')}</g>
    <g class="onb-rise" style="--d: 40">
      ${block(0, 1, 0, 1, "var(--color-disabled)", 13)}
      ${block(0, 1, 0, 1, "var(--color-surface)")}
      ${rooms.map(([u0, u1, v0, v1]) => block(u0, u1, v0, v1, "var(--color-fill-deep)", 0, 'stroke-width="5"')).join("")}
      ${block(0.164, 0.345, 0.33, 0.67, "var(--color-sun-1)", 0, 'stroke-width="5"')}
      ${block(0.654, 0.835, 0.33, 0.67, "var(--color-sun-1)", 0, 'stroke-width="5"')}
    </g>
    <g class="onb-rise" style="--d: 220">
      <polyline points="${route.map((corner) => corner.join(",")).join(" ")}" fill="none" stroke="var(--color-accent)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 14"/>
      <circle cx="${startX}" cy="${startY}" r="9" fill="var(--color-accent)"/>
    </g>
    ${pin(0.72, 0.17, 36, "var(--color-accent)", 640)}
    ${pin(0.18, 0.15, 19, "var(--color-tanda)", 420)}
    ${pin(0.85, 0.85, 19, "var(--color-ink-soft)", 520)}`;
}

/** 3 · Muchas pilas desparejas y una sola alta, con todas las hojas iguales. */
function artStacks() {
  const sheet = (x, y, width, color, turn = 0, delay = 0) => `
    <g class="onb-rise" style="--d: ${delay}">
      <rect x="${x}" y="${y}" width="${width}" height="15" rx="3" fill="${color}" transform="rotate(${turn} ${x + width / 2} ${y + 7})"/>
    </g>`;
  const messy = [
    [26, 279, 74, "var(--color-accent)", 0], [36, 263, 50, "var(--color-surface)", -3], [20, 247, 66, "var(--color-pin-pink)", 2], [32, 231, 40, "var(--color-sun-1)", -5],
    [112, 279, 56, "var(--color-tanda-muted)", 0], [104, 263, 78, "var(--color-sun-1)", 2], [120, 247, 44, "var(--color-surface)", -4],
    [38, 215, 58, "var(--color-accent)", 4], [116, 231, 56, "var(--color-accent-soft)", 3],
  ];
  const count = 15;
  const tall = Array.from({ length: count }, (_, index) => sheet(196, 279 - index * 15, 118, index % 2 ? "var(--color-tanda-muted)" : "var(--color-surface)", 0, 260 + index * 32));
  return `
    <ellipse cx="170" cy="298" rx="156" ry="12" fill="var(--color-tanda-deep)"/>
    ${messy.map(([x, y, width, color, turn], index) => sheet(x, y, width, color, turn, index * 40)).join("")}
    ${tall.join("")}
    ${artSparkle(160, 92, 16, "var(--color-sun-1)", 800)}
    ${artSparkle(68, 136, 11, "var(--color-surface)", 880)}
    ${artSparkle(326, 40, 12, "var(--color-surface)", 960)}`;
}

/** 4 · Una fila de estudiantes esperando su turno. Vos sos la persona del medio: la #36. */
function artQueue() {
  const base = 306;
  const person = (props) => artPerson({ base, ...props });
  return `
    <circle cx="170" cy="168" r="138" fill="var(--color-surface)" opacity="0.46"/>
    <ellipse cx="170" cy="${base + 3}" rx="160" ry="12" fill="var(--color-accent)" opacity="0.32"/>
    ${person({ x: 36, height: 174, top: "var(--color-tanda)", pants: "var(--color-ink-soft)", skin: "var(--color-accent-dark)", hairColor: "var(--color-ink)", hair: "short", gear: "backpack", delay: 40 })}
    ${person({ x: 103, height: 162, top: "var(--color-pin-pink)", pants: "var(--color-tanda-deep)", skin: "var(--color-art-skin)", hairColor: "var(--color-pin-amber)", hair: "long", gear: "folder", delay: 120 })}
    ${person({ x: 170, height: 184, top: "var(--color-accent)", pants: "var(--color-ink)", skin: "var(--color-sun-1)", hairColor: "var(--color-tanda-deep)", hair: "bun", delay: 200 })}
    ${person({ x: 237, height: 168, top: "var(--color-surface)", pants: "var(--color-ink-soft)", skin: "var(--color-accent-ink)", hairColor: "var(--color-ink)", hair: "curly", gear: "roll", delay: 280 })}
    ${person({ x: 304, height: 178, top: "var(--color-tanda-deep)", pants: "var(--color-ink-soft)", skin: "var(--color-art-skin)", hairColor: "var(--color-accent-ink)", hair: "short", delay: 360 })}
    <g class="onb-pop" style="--d: 620">
      <rect x="130" y="14" width="88" height="46" rx="16" fill="var(--color-surface)"/>
      <path d="M163 58 L174 72 L185 58 z" fill="var(--color-surface)"/>
      <text x="174" y="46" text-anchor="middle" font-size="26" font-weight="800" fill="var(--color-accent)">#36</text>
    </g>
    ${artSparkle(58, 72, 16, "var(--color-surface)", 760)}
    ${artSparkle(284, 58, 13, "var(--color-tanda)", 840)}`;
}

const SLIDES = [
  { title: "Cargá y optimizá tu archivo para imprimir", art: artFile },
  { title: "Buscá y compará locales de FADU", art: artMap },
  { title: "Elegí una tanda para ahorrar tiempo", art: artStacks },
  { title: "Seguí tu pedido en tiempo real para saber cuándo está listo", art: artQueue },
];

// Al volver desde Ingresar se abre directo el último slide, el que tiene las dos opciones.
const view = { index: App.params.has("final") ? SLIDES.length - 1 : 0 };

/** Muestra un slide: mueve el carrusel, cambia el color y actualiza puntos y botones. */
function showSlide(index) {
  view.index = Math.max(0, Math.min(SLIDES.length - 1, index));
  const root = document.querySelector(".onb");
  const last = view.index === SLIDES.length - 1;
  App.screenEl.dataset.onb = view.index + 1;
  root.style.setProperty("--onb-index", view.index);
  root.style.setProperty("--onb-drag", "0px");
  root.querySelectorAll("[data-slide]").forEach((element) => {
    const active = Number(element.dataset.slide) === view.index;
    element.classList.toggle("is-active", active);
    element.setAttribute("aria-hidden", !active);
  });
  root.querySelectorAll(".onb-dots span").forEach((dot, index2) => dot.classList.toggle("is-active", index2 === view.index));
  document.getElementById("onb-next").textContent = last ? "Ingresar como estudiante" : "Siguiente";
  root.querySelector(".onb-skip").classList.toggle("is-hidden", last);
  // La opción de imprenta aparece solo al final; mientras tanto no se puede enfocar.
  const shopOption = root.querySelector(".onb-shop");
  shopOption.classList.toggle("is-open", last);
  shopOption.inert = !last;
}

/** El onboarding termina al elegir cómo ingresar: cada opción tiene su pantalla y su tema. */
function finishOnboarding(url) {
  markOnboardingSeen();
  App.go(url);
}

/** Deslizar con el dedo o el mouse pasa de slide. Los extremos ofrecen un poco de resistencia. */
function dragSlides(event) {
  if (event.button !== 0 || event.target.closest("button")) return;
  const root = document.querySelector(".onb");
  const width = root.offsetWidth;
  const startX = event.clientX;
  const startTime = event.timeStamp;
  let moved = false;

  const move = (moveEvent) => {
    let dx = moveEvent.clientX - startX;
    if (!moved && Math.abs(dx) < 6) return;
    moved = true;
    root.classList.add("is-dragging");
    const atEdge = (view.index === 0 && dx > 0) || (view.index === SLIDES.length - 1 && dx < 0);
    if (atEdge) dx *= 0.3;
    root.style.setProperty("--onb-drag", `${dx}px`);
  };

  const end = (endEvent) => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointercancel", end);
    if (!moved) return;
    root.classList.remove("is-dragging");
    App.suppressClick();
    const dx = endEvent.clientX - startX;
    const fast = Math.abs(dx) / Math.max(1, endEvent.timeStamp - startTime) > 0.4;
    const step = Math.abs(dx) > width * 0.22 || fast ? -Math.sign(dx) : 0;
    showSlide(view.index + step);
  };

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);
}

App.start({
  init() {
    document.addEventListener("pointerdown", dragSlides);
    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") showSlide(view.index + 1);
      if (event.key === "ArrowLeft") showSlide(view.index - 1);
    });
  },

  render() {
    return `
      <div class="onb" data-gesture>
        <button type="button" class="onb-skip" ${on("skip")}>Saltar</button>
        <div class="onb-stage">
          <div class="onb-track">
            ${SLIDES.map((slide, index) => `
              <div class="onb-slide" data-slide="${index}">
                <svg class="onb-art" viewBox="0 0 340 340" role="img" aria-label="${slide.title}">${slide.art()}</svg>
              </div>`).join("")}
          </div>
        </div>
        <section class="onb-sheet">
          <div class="onb-copy">
            <div class="onb-track">
              ${SLIDES.map((slide, index) => `<h1 class="onb-title t-h1" data-slide="${index}">${slide.title}</h1>`).join("")}
            </div>
          </div>
          <div class="onb-dots" aria-hidden="true">${SLIDES.map(() => "<span></span>").join("")}</div>
          <div class="onb-actions">
            ${UI.button({ label: "Siguiente", block: true, id: "onb-next", action: "next" })}
            <div class="onb-shop">
              <div class="onb-shop-inner">
                ${UI.button({ label: "Ingresar como imprenta", variant: "outline", block: true, action: "enterShop" })}
              </div>
            </div>
          </div>
        </section>
      </div>`;
  },

  afterRender() {
    showSlide(view.index);
  },

  actions: {
    next() {
      if (view.index === SLIDES.length - 1) finishOnboarding("ingresar.html");
      else showSlide(view.index + 1);
    },

    enterShop() {
      finishOnboarding("imprenta/ingresar.html");
    },

    /** Saltar no entra a la app: lleva al último slide para elegir cómo ingresar. */
    skip() {
      showSlide(SLIDES.length - 1);
    },
  },
});
