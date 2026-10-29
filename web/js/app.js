// Motor chico de las pantallas: dibuja la pantalla actual y conecta los eventos.
//
// Cada página llama a App.start({ ... }) con:
//   render()    → HTML de la pantalla (se vuelve a dibujar cuando cambia el estado)
//   sheet()     → HTML del panel abierto, si hay uno (opcional)
//   actions     → funciones que se disparan desde el HTML:
//                   data-action="nombre"  al hacer clic
//                   data-input="nombre"   al escribir en un campo
//                   data-change="nombre"  al elegir una opción, casilla o archivo
//   init()      → se ejecuta una vez al abrir la página (opcional)
//   afterRender() → se ejecuta después de cada dibujo (opcional)
//   statusBar   → "surface" para pintar la barra de estado del color de las tarjetas (opcional)

const App = {
  page: null,
  params: new URLSearchParams(window.location.search),
  /** Nombre del panel abierto, o null. Cada pantalla decide qué mostrar con ese nombre. */
  openSheetName: null,

  start(page) {
    this.page = page;
    this.screenEl = document.getElementById("screen");
    this.sheetEl = document.getElementById("sheet-root");
    this.bindEvents();
    this.enableDragScroll();
    this.mountViewSwitch();
    Store.subscribe(() => this.render());
    if (page.init) page.init();
    this.render();
  },

  /** Vuelve a dibujar la pantalla manteniendo el foco y el scroll. */
  render() {
    // Si ya se está yendo a otra página, no se redibuja (evita ver un estado intermedio).
    if (this.leaving) return;
    const page = this.page;
    const focused = document.activeElement;
    const focusId = focused && focused.id;
    const selection = focused && "selectionStart" in focused ? [focused.selectionStart, focused.selectionEnd] : null;
    const scroll = this.screenEl.scrollTop;
    const oldSheetBody = this.sheetEl.querySelector(".sheet-body");
    const sheetScroll = oldSheetBody ? oldSheetBody.scrollTop : 0;
    // Zonas que scrollean por su cuenta (data-scroll con id): se mantienen en el mismo lugar.
    const innerScrolls = [...this.screenEl.querySelectorAll("[data-scroll][id]")].map((el) => [el.id, el.scrollTop]);

    this.screenEl.innerHTML = UI.statusBar(page.statusBar) + page.render();
    const sheetHtml = page.sheet && this.openSheetName ? page.sheet(this.openSheetName) : "";
    const sheetWasOpen = this.sheetEl.childElementCount > 0;
    this.sheetEl.innerHTML = sheetHtml;
    this.screenEl.classList.toggle("is-locked", Boolean(sheetHtml));
    this.screenEl.scrollTop = scroll;
    innerScrolls.forEach(([id, top]) => {
      const el = document.getElementById(id);
      if (el) el.scrollTop = top;
    });

    // El panel se anima solo al abrirse; al redibujarlo queda quieto y en el mismo scroll.
    if (sheetHtml && sheetWasOpen) {
      this.sheetEl.querySelector(".sheet").classList.add("is-static");
      this.sheetEl.querySelector(".sheet-body").scrollTop = sheetScroll;
    }

    const restored = focusId && document.getElementById(focusId);
    if (restored) {
      restored.focus();
      if (selection && restored.setSelectionRange) {
        try {
          restored.setSelectionRange(selection[0], selection[1]);
        } catch (error) {
          // Algunos campos no permiten mover el cursor.
        }
      }
    } else if (sheetHtml && !sheetWasOpen) {
      this.sheetEl.querySelector(".sheet-panel").focus();
    }

    if (page.afterRender) page.afterRender();
  },

  openSheet(name) {
    this.openSheetName = name;
    this.render();
  },

  closeSheet() {
    this.openSheetName = null;
    this.render();
  },

  /** Va a otra página. Llamarlo antes de cambiar el estado que esa otra página va a mostrar. */
  go(url) {
    this.leaving = true;
    window.location.href = url;
  },

  /** Busca la acción en la página; "closeSheet" está disponible en todas. */
  handler(name) {
    if (name === "closeSheet") return () => this.closeSheet();
    return this.page.actions && this.page.actions[name];
  },

  /**
   * Selector "Vista estudiante / Vista imprenta" arriba del teléfono (solo en computadora).
   * La vista actual se sabe por la clase theme-imprenta del <html>. Las páginas de la imprenta
   * usan <base href="../">, así que los dos links se escriben desde la carpeta web/.
   */
  mountViewSwitch() {
    const stage = document.querySelector(".stage");
    const device = document.querySelector(".device");
    if (!stage || !device || stage.querySelector(".view-switch")) return;
    const shop = document.documentElement.classList.contains("theme-imprenta");
    const option = (label, href, current) =>
      `<a class="${cx("segmented-option", current && "is-checked")}" href="${href}"${current ? ' aria-current="page"' : ""}>${label}</a>`;
    device.insertAdjacentHTML("beforebegin", `
      <nav class="segmented view-switch" aria-label="Cambiar vista">
        ${option("Vista estudiante", "index.html", !shop)}
        ${option("Vista imprenta", "imprenta/index.html", shop)}
      </nav>`);
  },

  /** Ignora el clic que llega al soltar un arrastre, para que no active botones ni links. */
  suppressClick() {
    this.clickSuppressed = true;
    setTimeout(() => {
      this.clickSuppressed = false;
    }, 0);
  },

  /**
   * En computadora, la pantalla del teléfono se scrollea arrastrando con el mouse,
   * como con el dedo en un celular, y sigue un poco por inercia al soltar.
   * En pantallas táctiles no hace nada: el navegador ya scrollea con el dedo.
   * Además de la pantalla y los paneles, scrollea cualquier zona marcada con data-scroll.
   * Las zonas con data-gesture manejan sus propios arrastres (por ejemplo, un mapa).
   */
  enableDragScroll() {
    let drag = null;
    let momentum = null;

    const stopMomentum = () => {
      if (momentum) cancelAnimationFrame(momentum);
      momentum = null;
    };

    document.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      // En los campos de texto el mouse sirve para escribir y seleccionar, no para scrollear.
      if (event.target.closest("input, textarea, select, [data-gesture]")) return;
      const scroller = event.target.closest("[data-scroll], .sheet-body, .device-screen");
      if (!scroller) return;
      stopMomentum();
      drag = { scroller, startY: event.clientY, startTop: scroller.scrollTop, lastY: event.clientY, lastTime: event.timeStamp, velocity: 0, moved: false };
    });

    document.addEventListener("pointermove", (event) => {
      if (!drag) return;
      const distance = event.clientY - drag.startY;
      // Recién se considera arrastre después de unos píxeles, para no confundirlo con un clic.
      if (!drag.moved && Math.abs(distance) < 6) return;
      if (!drag.moved) {
        drag.moved = true;
        document.body.classList.add("is-dragging");
      }
      drag.scroller.scrollTop = drag.startTop - distance;
      const elapsed = Math.max(1, event.timeStamp - drag.lastTime);
      drag.velocity = (drag.lastY - event.clientY) / elapsed;
      drag.lastY = event.clientY;
      drag.lastTime = event.timeStamp;
    });

    document.addEventListener("pointerup", () => {
      if (!drag) return;
      const { scroller, moved } = drag;
      let velocity = drag.velocity * 16; // píxeles por cuadro
      drag = null;
      if (!moved) return;
      document.body.classList.remove("is-dragging");
      this.suppressClick();
      const glide = () => {
        if (Math.abs(velocity) < 0.5) {
          momentum = null;
          return;
        }
        scroller.scrollTop += velocity;
        velocity *= 0.95;
        momentum = requestAnimationFrame(glide);
      };
      momentum = requestAnimationFrame(glide);
    });

    // La rueda del mouse frena la inercia.
    document.addEventListener("wheel", stopMomentum, { passive: true });

    // Links e imágenes no se "arrastran" como archivos: el gesto es solo para scrollear.
    document.addEventListener("dragstart", (event) => {
      if (event.target.closest && event.target.closest(".device")) event.preventDefault();
    });

    window.addEventListener("click", (event) => {
      if (!this.clickSuppressed) return;
      event.preventDefault();
      event.stopPropagation();
      this.clickSuppressed = false;
    }, true);
  },

  bindEvents() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("[data-action]");
      if (!target || target.disabled) return;
      // Si se tocó un link o botón que está adentro del elemento, gana ese.
      const inner = event.target.closest("a[href], button");
      if (inner && inner !== target && target.contains(inner)) return;
      const handler = this.handler(target.dataset.action);
      if (handler) handler(target, event);
    });

    // Elementos con data-action que no son botones (por ejemplo, tarjetas) también responden al teclado.
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.openSheetName) {
        this.closeSheet();
        return;
      }
      if (event.key === "Escape" && this.page.onEscape) {
        this.page.onEscape();
        return;
      }
      const target = event.target;
      if ((event.key === "Enter" || event.key === " ") && target.matches("[data-action]:not(button):not(a)")) {
        event.preventDefault();
        target.click();
      }
    });

    document.addEventListener("input", (event) => {
      const name = event.target.dataset && event.target.dataset.input;
      const handler = name && this.handler(name);
      if (handler) handler(event.target, event);
    });

    document.addEventListener("change", (event) => {
      const name = event.target.dataset && event.target.dataset.change;
      const handler = name && this.handler(name);
      if (handler) handler(event.target, event);
    });
  },
};

/** Sufijo de las direcciones cuando el pedido viene del flujo de tandas. */
function flowSuffix() {
  return App.params.get("flujo") === "tanda" ? "?flujo=tanda" : "";
}

function isTandaFlow() {
  return App.params.get("flujo") === "tanda";
}
