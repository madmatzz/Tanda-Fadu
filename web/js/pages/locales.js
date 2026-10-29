// ¿Dónde imprimir?: mapa de la FADU piso por piso y, en un panel deslizable, los locales de ese piso.
//
// El mapa es un carrusel vertical de pisos apilados: se arrastra, se toca arriba o abajo
// (o se usa la rueda) para pasar al piso de arriba o de abajo. El panel de la lista tiene tres alturas: mínima, media y completa.
// Los dos se animan cambiando el DOM que ya está dibujado: cada render dibuja la posición
// anterior (shownFloor, shownSheet) y afterRender los lleva a la nueva con una transición.

const DEFAULT_FILTERS = { service: "all", mode: "all", paper: "all", maxWait: "all", minRating: "all" };

/** Altura visible del panel en sus posiciones mínima y media. La completa lo muestra entero. */
const SHEET_HEIGHTS = { min: 92, peek: 300 };
/**
 * Separación entre pisos, como parte del alto de un plano. Con 0.59 los pisos se tocarían
 * justo (por la forma en rombo); un poco más deja un aire parejo sin que se pisen.
 */
const FLOOR_SPACING = 0.64;

const TOP_LEVEL = FLOOR_PLANS[0].level;
const BOTTOM_LEVEL = FLOOR_PLANS[FLOOR_PLANS.length - 1].level;

const SERVICE_FILTERS = ["bn", "color", "a3", "anillado", "escaneo", "gran-formato"];
const PAPER_FILTERS = [
  { value: "all", label: "Todos los papeles" },
  { value: "obra-80", label: "Papel Obra 80g" },
  { value: "obra-120", label: "Papel Obra 120g" },
  { value: "ilustracion-150", label: "Ilustración 150g" },
  { value: "foamboard-3", label: "Foamboard 3mm" },
];

const backHref = App.params.get("desde") === "imprimir" ? "imprimir.html" : "index.html";
// Con ?local=slug el mapa abre en el piso de ese local y lo marca.
const startLocal = Store.state.locals.find((local) => local.slug === App.params.get("local"));
const startFloor = startLocal ? startLocal.map.floor : 0;
// Al entrar se ve el mapa casi entero; si se llega a un local puntual, también asoma su tarjeta.
const startSheet = startLocal ? "peek" : "min";

/** Entrada: los pisos aparecen de a uno, del subsuelo hacia arriba. */
const INTRO_STEP = 70;
const INTRO_DURATION = 520;

const view = {
  query: "",
  filters: { ...DEFAULT_FILTERS },
  floor: startFloor,
  shownFloor: startFloor,
  sheet: startSheet,
  shownSheet: startSheet,
  intro: true,
  // Piso con las etiquetas abiertas. Arranca en null para que se abran con animación al entrar.
  openFloor: null,
  focusId: startLocal ? startLocal.id : null,
  scrollToFocus: false,
  resetList: false,
};

// ---------- Datos ----------

function floorPlan(level) {
  return FLOOR_PLANS.find((plan) => plan.level === level);
}

function clampLevel(level) {
  return Math.min(TOP_LEVEL, Math.max(BOTTOM_LEVEL, level));
}

function isSearching() {
  return view.query.trim() !== "";
}

function matchesFilters(local) {
  const query = view.query.trim().toLowerCase();
  const filters = view.filters;
  const textMatch =
    !query ||
    [local.name, local.tagline, local.floorLabel].some((text) => text.toLowerCase().includes(query)) ||
    local.services.some((service) => SERVICE_LABELS[service].toLowerCase().includes(query));

  if (!textMatch) return false;
  if (filters.service !== "all" && !local.services.includes(filters.service)) return false;
  if (filters.mode !== "all" && !local.services.includes(filters.mode)) return false;
  if (filters.paper !== "all" && (!local.papers.includes(filters.paper) || local.stock[filters.paper] === "out")) return false;
  if (filters.maxWait !== "all" && local.queue.waitVirtual > Number(filters.maxWait)) return false;
  if (filters.minRating !== "all" && local.rating < Number(filters.minRating)) return false;
  return true;
}

function activeFilterCount() {
  return Object.keys(DEFAULT_FILTERS).filter((key) => view.filters[key] !== "all").length;
}

/** El piso con locales más cercano al actual (el de arriba gana si hay empate). */
function nearestFloorWith(locals) {
  const levels = [...new Set(locals.map((local) => local.map.floor))];
  levels.sort((a, b) => Math.abs(a - view.floor) - Math.abs(b - view.floor) || b - a);
  return levels.length ? levels[0] : null;
}

// ---------- Mapa ----------

/**
 * Posición de cada piso respecto del que está en el centro (offset 0 es el actual, 1 el de arriba).
 * Los vecinos se ven tenues y los que siguen, casi transparentes. Como en un edificio,
 * cada piso se dibuja encima del de abajo.
 */
function layerStyle(level, position) {
  const offset = level - position;
  const distance = Math.min(Math.abs(offset), 3);
  const fade = distance <= 1 ? 1 - distance * 0.62 : Math.max(0, 0.38 - (distance - 1) * 0.22);
  return `--offset: ${offset.toFixed(3)}; --fade: ${fade.toFixed(3)}; z-index: ${level + 10}`;
}

/**
 * Líneas punteadas verticales que unen las esquinas de los pisos (sensación de despiece).
 * Van del piso de más arriba al de más abajo y se mueven junto con ellos.
 */
function floorGuides() {
  const corners = FLOOR_PLANS[0].slab.split(" ").map((point) => point.split(",").map(Number));
  const length = (TOP_LEVEL - BOTTOM_LEVEL) * FLOOR_SPACING * 100;
  const lines = corners.map(([x, y]) => {
    const left = (x / FLOOR_VIEWBOX.width) * 100;
    const top = (y / FLOOR_VIEWBOX.height) * 100;
    return `<span style="left: ${left.toFixed(2)}%; top: ${top.toFixed(2)}%; height: ${length}%"></span>`;
  });
  return `
    <div class="floor-guides" style="--offset: ${TOP_LEVEL - view.shownFloor}" aria-hidden="true">
      ${lines.join("")}
    </div>`;
}

/**
 * Un piso con sus locales. En los otros pisos cada local es un círculo de color; en el piso
 * elegido el círculo se abre en una etiqueta con su nombre (clase is-open, ver afterRender).
 * Un piso elegido sin locales muestra un aviso en el medio de la planta.
 */
function floorLayer(plan, locals) {
  const open = plan.level === view.openFloor;
  const onLevel = locals.filter((local) => local.map.floor === plan.level);
  const pins = onLevel
    .map((local) => `
      <button type="button" class="${cx("map-pin", `pin-${local.map.color}`, open && "is-open", local.id === view.focusId && "is-focused")}"
        style="left: ${local.map.x * 100}%; top: ${local.map.y * 100}%"
        aria-label="${local.name}" ${on("focusLocal", { id: local.id })}>
        <span class="map-pin-label">${local.name}</span>
      </button>`)
    .join("");
  const empty = plan.level === view.floor && !onLevel.length
    ? `<span class="${cx("floor-empty", open && "is-open")}">Sin locales en este piso</span>`
    : "";

  return `
    <div class="${cx("floor-layer", plan.level === view.floor && "is-current")}" data-level="${plan.level}"
      style="${layerStyle(plan.level, view.shownFloor)}; --intro-delay: ${(plan.level - BOTTOM_LEVEL) * INTRO_STEP}ms"
      aria-hidden="${plan.level !== view.floor}">
      <svg class="floor-plan" viewBox="0 0 ${FLOOR_VIEWBOX.width} ${FLOOR_VIEWBOX.height}" aria-hidden="true">
        <polygon class="floor-slab" points="${plan.slab}"/>
        <path class="floor-walls" d="${plan.walls}"/>
        <path class="floor-patios" d="${plan.patios}"/>
      </svg>
      ${pins}
      ${empty}
    </div>`;
}

/** Flechas que invitan a subir o bajar de piso. En la punta del edificio se apagan. */
function floorArrow(step) {
  const up = step > 0;
  const atEnd = view.floor === (up ? TOP_LEVEL : BOTTOM_LEVEL);
  return `
    <button type="button" class="${cx("floor-arrow", up ? "is-up" : "is-down")}" ${atEnd ? "disabled" : ""}
      aria-label="${up ? "Piso de arriba" : "Piso de abajo"}" ${on("stepFloor", { step })}>${icon(up ? "arrow-up" : "arrow-down")}</button>`;
}

function floorMap(locals) {
  const plan = floorPlan(view.floor);
  const entering = view.shownFloor !== view.floor;
  return `
    <section class="floor-stage" data-gesture ${on("tapFloors")}
      aria-label="Mapa de la FADU, ${plan.name}. Tocá arriba o abajo, o arrastrá, para cambiar de piso.">
      <div class="floor-heading">
        <span class="t-label c-muted">Mapa</span>
        <h2 class="${cx("floor-name", entering && "is-entering")}">${plan.name}</h2>
      </div>
      <div class="${cx("floor-track", view.intro && "is-intro")}" style="--floor-spacing: ${FLOOR_SPACING * 100}%">
        ${floorGuides()}
        ${FLOOR_PLANS.map((item) => floorLayer(item, locals)).join("")}
      </div>
      ${floorArrow(1)}
      ${floorArrow(-1)}
    </section>`;
}

// ---------- Lista ----------

function placeCard(local, showFloor) {
  return `
    <div class="${cx("card place-card", local.id === view.focusId && "is-focused")}" id="place-${local.slug}"
      role="button" tabindex="0" aria-label="Ver ${local.name} en el mapa" ${on("focusLocal", { id: local.id })}>
      <div class="row gap-3">
        ${UI.localLogo(local)}
        <div class="stack gap-1 grow place-card-info">
          <span class="row gap-2">
            <span class="${cx("pin-dot", `pin-${local.map.color}`)}"></span>
            <span class="t-h3 truncate grow">${local.name}</span>
            <span class="row gap-1 t-small fw-semibold shrink-0">${icon("star", "icon-sm star-on")}${ratingLabel(local.rating)}</span>
          </span>
          <span class="place-card-tag">${UI.chip(showFloor ? `${local.floorLabel} · ${local.tagline}` : local.tagline)}</span>
        </div>
      </div>
      <div class="row between gap-3 divided">
        <div class="row gap-5">
          <span class="stack gap-05">
            <span class="t-caption c-secondary">Cola virtual</span>
            <span class="t-strong">${local.queue.waitVirtual} min</span>
          </span>
          <span class="stack gap-05">
            <span class="t-caption c-secondary">Cola presencial</span>
            <span class="t-strong">${local.queue.waitInPerson} min</span>
          </span>
        </div>
        ${UI.button({ label: "Ver local", variant: "soft", size: "sm", href: `local.html?local=${local.slug}` })}
      </div>
    </div>`;
}

function placeList(matches, onFloor) {
  const plan = floorPlan(view.floor);

  if (!matches.length) {
    return UI.emptyState({
      icon: "search",
      title: "No encontramos locales",
      description: "Probá con otro nombre, servicio o filtro.",
      action: UI.button({ label: "Limpiar búsqueda", variant: "outline", size: "md", action: "clearSearch" }),
    });
  }

  if (isSearching()) {
    return `<div class="stack gap-3">${matches.map((local) => placeCard(local, true)).join("")}</div>`;
  }

  if (!onFloor.length) {
    const nearest = floorPlan(nearestFloorWith(matches));
    return UI.emptyState({
      icon: "map-pin",
      title: `No hay locales en ${plan.level === 0 ? "planta baja" : plan.name.toLowerCase()}`,
      description: activeFilterCount() ? "Ninguno coincide con tus filtros en este piso." : `El más cercano está en ${nearest.name.toLowerCase()}.`,
      action: UI.button({ label: `Ir a ${nearest.name.toLowerCase()}`, variant: "outline", size: "md", action: "setFloor", data: { floor: nearest.level } }),
    });
  }

  return `<div class="stack gap-3">${onFloor.map((local) => placeCard(local, false)).join("")}</div>`;
}

function placeSheet(matches, onFloor) {
  const plan = floorPlan(view.floor);
  const title = isSearching() ? "Resultados" : "Locales";
  const meta = isSearching()
    ? `${plural(matches.length, "local", "locales")} en la FADU`
    : onFloor.length ? `${plural(onFloor.length, "local", "locales")} en este piso` : "Ninguno en este piso";

  return `
    <section class="places-sheet" ${view.shownSheet === "full" ? "" : "data-gesture"} aria-label="Lista de locales">
      <div class="places-sheet-head" data-gesture role="button" tabindex="0"
        aria-label="${view.shownSheet === "full" ? "Achicar" : "Expandir"} la lista" ${on("toggleSheet")}>
        <span class="places-sheet-grip" aria-hidden="true"></span>
        <div class="row between gap-2">
          <div class="stack gap-05">
            <span class="t-h3">${title}</span>
            <span class="t-caption c-muted">${meta}</span>
          </div>
          ${isSearching() ? "" : UI.chip(plan.short, { outline: true })}
        </div>
      </div>
      <div class="places-list" id="places-list" data-scroll>
        ${placeList(matches, onFloor)}
        <p class="t-caption c-muted text-center">Las colas son informadas por los locales y los estudiantes.</p>
      </div>
    </section>`;
}

// ---------- Filtros ----------

function filterSheet() {
  const filters = view.filters;
  const serviceChip = (value, label) => `
    <button type="button" class="chip-button" aria-pressed="${filters.service === value}" ${on("setService", { value })}>
      ${UI.chip(label, { tone: filters.service === value ? "ink" : "neutral" })}
    </button>`;

  return UI.sheet({
    title: "Filtros",
    description: "Ajustá la búsqueda según tu impresión.",
    footer: `
      <div class="row gap-2">
        ${UI.button({ label: "Limpiar", variant: "outline", size: "md", block: true, action: "clearFilters" })}
        ${UI.button({ label: "Aplicar", size: "md", block: true, action: "closeSheet" })}
      </div>`,
    content: `
      <div class="stack gap-5">
        <div class="stack gap-2">
          ${UI.sectionLabel("Servicio")}
          <div class="row wrap gap-2">
            ${serviceChip("all", "Todos")}
            ${SERVICE_FILTERS.map((service) => serviceChip(service, SERVICE_LABELS[service])).join("")}
          </div>
        </div>
        <div class="stack gap-2">
          ${UI.sectionLabel("Color")}
          ${UI.segmented({ name: "mode", label: "Tipo de impresión", value: filters.mode, change: "setFilter", options: [{ value: "all", label: "Todos" }, { value: "bn", label: "B&N" }, { value: "color", label: "Color" }] })}
        </div>
        <div class="stack gap-2">
          ${UI.sectionLabel("Papel disponible")}
          ${UI.selectField({ id: "paper", label: "Papel", value: filters.paper, change: "setFilter", options: PAPER_FILTERS })}
        </div>
        <div class="stack gap-2">
          ${UI.sectionLabel("Espera máxima")}
          ${UI.segmented({ name: "maxWait", label: "Espera máxima", value: filters.maxWait, change: "setFilter", options: [{ value: "all", label: "Sin límite" }, { value: "10", label: "10 min" }, { value: "20", label: "20 min" }] })}
        </div>
        <div class="stack gap-2">
          ${UI.sectionLabel("Valoración mínima")}
          ${UI.segmented({ name: "minRating", label: "Valoración mínima", value: filters.minRating, change: "setFilter", options: [{ value: "all", label: "Todas" }, { value: "4", label: "4.0+" }, { value: "4.5", label: "4.5+" }] })}
        </div>
      </div>`,
  });
}

// ---------- Movimiento ----------

/** Ubica los pisos alrededor de una posición (puede ser intermedia, mientras se arrastra). */
function placeLayers(position) {
  document.querySelectorAll(".floor-layer").forEach((layer) => {
    layer.setAttribute("style", layerStyle(Number(layer.dataset.level), position));
  });
  // Las líneas arrancan en el piso de más arriba: se ubican como él.
  document.querySelector(".floor-guides").style.setProperty("--offset", TOP_LEVEL - position);
}

/** Cambia de piso. `from` es dónde está el carrusel ahora, para animar desde ahí. */
function goToFloor(level, from = view.floor) {
  const target = clampLevel(level);
  if (target === view.floor) {
    placeLayers(view.floor); // vuelve a su lugar
    return;
  }
  const focused = Store.state.locals.find((local) => local.id === view.focusId);
  if (focused && focused.map.floor !== target) view.focusId = null;
  view.shownFloor = from;
  view.floor = target;
  view.resetList = true;
  App.render();
}

/** Cierra las etiquetas del piso anterior (vuelven a ser círculos) y abre las del piso actual. */
function openFloorTags() {
  if (view.openFloor === view.floor) return;
  document.querySelector(".floor-track").getBoundingClientRect();
  document.querySelectorAll(".floor-track .is-open").forEach((element) => element.classList.remove("is-open"));
  document.querySelectorAll(`.floor-layer[data-level="${view.floor}"] :is(.map-pin, .floor-empty)`)
    .forEach((element) => element.classList.add("is-open"));
  view.openFloor = view.floor;
}

/** Lleva el panel a una de sus alturas: min, peek o full. */
function setSheet(snap) {
  view.sheet = snap;
  applySheet();
}

function applySheet() {
  const body = document.querySelector(".places-body");
  const sheet = document.querySelector(".places-sheet");
  if (!body || !sheet) return;
  sheet.style.transform = "";
  body.dataset.sheet = view.sheet;
  // A media altura todo el panel se arrastra; completo, la lista scrollea y se arrastra desde arriba.
  sheet.toggleAttribute("data-gesture", view.sheet !== "full");
  view.shownSheet = view.sheet;
}

/** Desplazamiento del panel (en píxeles desde arriba) para cada altura. */
function sheetOffset(snap, sheetHeight) {
  return snap === "full" ? 0 : sheetHeight - SHEET_HEIGHTS[snap];
}

/**
 * Sigue un arrastre vertical con el mouse o el dedo desde un pointerdown.
 * onMove(dy) se llama mientras se arrastra; onEnd(dy, velocity) al soltar, con la velocidad en px/ms.
 * Si apenas se movió, no hace nada y el toque queda como un clic común.
 */
function trackDrag(event, { onMove, onEnd }) {
  const startY = event.clientY;
  let last = { y: startY, time: event.timeStamp };
  let velocity = 0;
  let moved = false;

  const move = (moveEvent) => {
    const dy = moveEvent.clientY - startY;
    if (!moved && Math.abs(dy) < 6) return;
    moved = true;
    document.body.classList.add("is-dragging");
    const elapsed = Math.max(1, moveEvent.timeStamp - last.time);
    velocity = (moveEvent.clientY - last.y) / elapsed;
    last = { y: moveEvent.clientY, time: moveEvent.timeStamp };
    onMove(dy);
  };

  const end = (endEvent) => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointercancel", end);
    if (!moved) return;
    document.body.classList.remove("is-dragging");
    App.suppressClick();
    // Si se quedó quieto antes de soltar, no hay envión.
    if (endEvent.timeStamp - last.time > 80) velocity = 0;
    onEnd(endEvent.clientY - startY, velocity);
  };

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);
}

/** Arrastrar el mapa hacia abajo trae el piso de arriba, y hacia arriba el de abajo. */
function dragFloors(event) {
  const stage = event.target.closest(".floor-stage");
  // El piso sigue al dedo: arrastrar la distancia entre dos pisos recorre uno.
  const gap = stage.querySelector(".floor-layer").offsetHeight * FLOOR_SPACING;
  trackDrag(event, {
    onMove(dy) {
      stage.classList.add("is-dragging");
      let position = view.floor + dy / gap;
      // En el último piso de cada punta se resiste, como un elástico.
      if (position > TOP_LEVEL) position = TOP_LEVEL + (position - TOP_LEVEL) * 0.3;
      if (position < BOTTOM_LEVEL) position = BOTTOM_LEVEL + (position - BOTTOM_LEVEL) * 0.3;
      stage.dataset.position = position;
      placeLayers(position);
    },
    onEnd(dy, velocity) {
      stage.classList.remove("is-dragging");
      const position = Number(stage.dataset.position);
      const flick = Math.abs(velocity) > 0.35 ? Math.sign(velocity) : 0;
      const step = flick || (Math.abs(dy) > gap * 0.3 ? Math.sign(dy) : 0);
      goToFloor(view.floor + step, position);
    },
  });
}

function dragSheet(event) {
  const sheet = document.querySelector(".places-sheet");
  const height = sheet.offsetHeight;
  const start = sheetOffset(view.sheet, height);
  const lowest = sheetOffset("min", height);
  trackDrag(event, {
    onMove(dy) {
      sheet.classList.add("is-dragging");
      sheet.style.transform = `translateY(${Math.min(lowest + 24, Math.max(-12, start + dy))}px)`;
    },
    onEnd(dy, velocity) {
      sheet.classList.remove("is-dragging");
      // Proyecta dónde quedaría con el envión y elige la altura más cercana.
      const projected = start + dy + velocity * 180;
      const snaps = ["full", "peek", "min"];
      const closest = snaps.reduce((best, snap) =>
        Math.abs(sheetOffset(snap, height) - projected) < Math.abs(sheetOffset(best, height) - projected) ? snap : best);
      setSheet(closest);
    },
  });
}

let wheelLock = false;
let wheelTotal = 0;

/** Con la rueda del mouse (o el trackpad) sobre el mapa también se cambia de piso. */
function wheelFloors(event) {
  if (wheelLock) return;
  wheelTotal += event.deltaY;
  if (Math.abs(wheelTotal) < 40) return;
  const step = wheelTotal > 0 ? -1 : 1;
  wheelTotal = 0;
  wheelLock = true;
  setTimeout(() => {
    wheelLock = false;
    wheelTotal = 0;
  }, 520);
  goToFloor(view.floor + step);
}

// ---------- Pantalla ----------

App.start({
  statusBar: "surface",

  init() {
    document.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      if (event.target.closest(".floor-stage")) dragFloors(event);
      else if (event.target.closest(".places-sheet[data-gesture], .places-sheet-head")) dragSheet(event);
    });
    document.addEventListener("wheel", (event) => {
      if (event.target.closest(".floor-stage")) wheelFloors(event);
    }, { passive: true });
  },

  render() {
    const state = Store.state;
    const matches = state.locals.filter(matchesFilters);
    const onFloor = matches.filter((local) => local.map.floor === view.floor);
    const filters = activeFilterCount();

    return `
      <div class="places">
        <header class="places-top">
          <div class="row gap-2">
            ${UI.iconButton({ label: "Volver", icon: "arrow-left", href: backHref })}
            <h1 class="t-h1">¿Dónde imprimir?</h1>
          </div>
          <div class="row gap-2">
            <div class="search-field grow">
              ${icon("search")}
              <input id="search" class="input" type="search" placeholder="Buscar local o servicio" aria-label="Buscar local" value="${esc(view.query)}" data-input="search">
            </div>
            <span class="badge-wrap">
              ${UI.iconButton({ label: "Abrir filtros", icon: "sliders-horizontal", action: "openFilters" })}
              ${filters ? `<span class="badge-count">${filters}</span>` : ""}
            </span>
          </div>
        </header>

        <div class="places-body" data-sheet="${view.shownSheet}"
          style="--sheet-min: ${SHEET_HEIGHTS.min}px; --sheet-peek: ${SHEET_HEIGHTS.peek}px">
          ${floorMap(matches)}
          ${placeSheet(matches, onFloor)}
        </div>
      </div>`;
  },

  afterRender() {
    // Anima el carrusel desde el piso dibujado hasta el elegido.
    if (view.shownFloor !== view.floor) {
      document.querySelector(".floor-track").getBoundingClientRect(); // fija la posición de partida
      placeLayers(view.floor);
      view.shownFloor = view.floor;
    }
    // Al entrar, las etiquetas se abren cuando el piso actual ya terminó de aparecer.
    if (view.intro) {
      view.intro = false;
      const landed = (view.floor - BOTTOM_LEVEL) * INTRO_STEP + INTRO_DURATION;
      setTimeout(openFloorTags, landed);
    } else if (view.openFloor !== view.floor) {
      openFloorTags();
    }
    if (view.shownSheet !== view.sheet) {
      document.querySelector(".places-sheet").getBoundingClientRect();
      applySheet();
    }
    const list = document.getElementById("places-list");
    if (view.resetList) {
      list.scrollTop = 0;
      view.resetList = false;
    }
    if (view.scrollToFocus) {
      const card = list.querySelector(".place-card.is-focused");
      if (card) list.scrollTo({ top: card.offsetTop - list.offsetTop - 8, behavior: "smooth" });
      view.scrollToFocus = false;
    }
  },

  sheet(name) {
    if (name === "filters") return filterSheet();
    return "";
  },

  actions: {
    search(input) {
      view.query = input.value;
      if (isSearching()) view.sheet = "full";
      view.resetList = true;
      App.render();
    },

    setFloor(button) {
      goToFloor(Number(button.dataset.floor));
    },

    stepFloor(button) {
      goToFloor(view.floor + Number(button.dataset.step));
    },

    /** Tocar la mitad de arriba del mapa sube un piso; la de abajo, baja uno. */
    tapFloors(stage, event) {
      const box = stage.getBoundingClientRect();
      goToFloor(view.floor + (event.clientY < box.top + box.height / 2 ? 1 : -1));
    },

    /** Marca un local en el mapa (cambiando de piso si hace falta) y en la lista. */
    focusLocal(element) {
      const local = Store.state.locals.find((item) => item.id === element.dataset.id);
      const fromMap = Boolean(element.closest(".floor-stage"));
      view.focusId = local.id;
      view.scrollToFocus = fromMap;
      // Desde la lista se achica el panel para que se vea el mapa; desde el mapa se asoma la lista.
      if (!fromMap || view.sheet === "min") view.sheet = "peek";
      if (local.map.floor !== view.floor) goToFloor(local.map.floor);
      else App.render();
    },

    toggleSheet() {
      setSheet(view.sheet === "full" ? "peek" : "full");
    },

    openFilters() {
      App.openSheet("filters");
    },

    setService(button) {
      view.filters.service = button.dataset.value;
      App.render();
    },

    /** Los segmentados y el select del panel usan su name o id como nombre del filtro. */
    setFilter(input) {
      view.filters[input.name || input.id] = input.value;
      App.render();
    },

    clearFilters() {
      view.filters = { ...DEFAULT_FILTERS };
      App.render();
    },

    clearSearch() {
      view.filters = { ...DEFAULT_FILTERS };
      view.query = "";
      App.render();
    },
  },
});
