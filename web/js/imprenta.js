// Piezas compartidas de la vista de imprenta: el local que se administra, el encabezado,
// la barra de navegación de abajo y los paneles que se abren desde varias pantallas.
// Las páginas de la imprenta están en imprenta/ y usan <base href="../">: todos los links
// se escriben desde la carpeta web/ (por ejemplo "imprenta/cola.html" o "index.html").

function shopLocal(state) {
  return localById(state, SHOP_LOCAL_ID);
}

/** Título de la imprenta para una tanda: "Impresión A4 B&N · 1 a 10 páginas". */
function tandaShopTitle(tanda) {
  return `Impresión ${tanda.size} ${modeShort(tanda.mode)} · ${tanda.minPages} a ${tanda.maxPages} páginas`;
}

const SHOP_TABS = [
  { id: "panel", label: "Panel", icon: "house", href: "imprenta/index.html" },
  { id: "cola", label: "Cola", icon: "list-checks", href: "imprenta/cola.html" },
  { id: "tandas", label: "Tandas", icon: "layers", href: "imprenta/tandas.html" },
  { id: "local", label: "Mi local", icon: "store", href: "imprenta/local.html" },
];

const ShopUI = {
  /**
   * Pantalla de la imprenta. Las secciones principales (tab) llevan la barra de abajo;
   * las secundarias llevan botón volver (back) y su propio pie.
   */
  screen({ tab, title, back, content, footer }) {
    const local = shopLocal(Store.state);
    return UI.screen({
      title: tab
        ? `<span class="row gap-2">${UI.localLogo(local, "sm")}<span class="truncate">${local.name}</span></span>`
        : title,
      back,
      actions: `
        ${UI.chip("Imprenta", { tone: "ink" })}
        ${tab ? UI.iconButton({ label: "Ver la app como estudiante", icon: "repeat-2", href: "index.html" }) : ""}`,
      content,
      footer: tab ? ShopUI.nav(tab) : footer,
    });
  },

  /** Barra de navegación de abajo con las cuatro secciones de la imprenta. */
  nav(active) {
    return `
      <nav class="shop-nav" aria-label="Secciones de la imprenta">
        ${SHOP_TABS.map((tab) => `
          <a class="${cx("shop-nav-item", tab.id === active && "is-active")}" href="${tab.href}"${tab.id === active ? ' aria-current="page"' : ""}>
            ${icon(tab.icon)}
            <span>${tab.label}</span>
          </a>`).join("")}
      </nav>`;
  },

  /** Número grande con su etiqueta, para los indicadores del panel. */
  metric(value, label) {
    return `
      <span class="stack gap-05">
        <span class="shop-metric">${value}</span>
        <span class="t-caption">${label}</span>
      </span>`;
  },

  /**
   * Fila de un pedido: número, quién lo pidió, archivo y configuración.
   * aside: lo que va a la derecha (un estado o un botón) · tanda: si vino de una tanda, la marca.
   */
  orderRow(order, aside = "", tanda = null) {
    const specs = order.specs;
    return `
      <div class="card shop-order">
        <span class="shop-order-ticket">#${order.ticket}</span>
        <span class="stack gap-05 grow shop-order-info">
          <span class="row gap-2 t-strong"><span class="truncate">${esc(order.owner)}</span>${tanda ? `<span class="t-caption fw-semibold c-tanda nowrap">${tanda.label}</span>` : ""}</span>
          <span class="t-caption c-secondary truncate">${esc(order.file.name)} · ${plural(specs.pages, "pág.", "págs.")} · ${specs.size} ${modeShort(specs.mode)}</span>
        </span>
        ${aside}
      </div>`;
  },
};

/** Cargar un aviso para los estudiantes (stock, problema técnico, descuento o info). */
const AlertSheet = {
  kind: "stock",
  title: "",
  body: "",
  error: "",

  KINDS: [
    { value: "stock", label: "Stock" },
    { value: "tecnico", label: "Técnico" },
    { value: "descuento", label: "Descuento" },
    { value: "info", label: "Info" },
  ],

  sheet() {
    return UI.sheet({
      title: "Cargar aviso",
      description: "Lo ven los estudiantes en Avisos y en el perfil del local.",
      content: `
        <div class="stack gap-4">
          <div class="stack gap-2">
            <span class="form-label">Tipo de aviso</span>
            ${UI.segmented({ name: "alert-kind", label: "Tipo de aviso", value: this.kind, change: "setAlertKind", options: this.KINDS })}
          </div>
          ${UI.textField({ id: "alert-title", label: "Título", value: this.title, placeholder: "Ej.: Poco stock de papel 120g", maxlength: 60, input: "setAlertTitle" })}
          ${UI.textareaField({ id: "alert-body", label: "Detalle", value: this.body, placeholder: "Contales a los estudiantes qué pasa y qué conviene hacer.", maxlength: 160, hint: `${this.body.length}/160 caracteres`, input: "setAlertBody" })}
          ${this.error ? UI.note({ text: this.error }) : ""}
        </div>`,
      footer: UI.button({ label: "Publicar aviso", icon: "megaphone", block: true, action: "publishAlert" }),
    });
  },

  actions: {
    openAlertSheet() {
      Object.assign(AlertSheet, { kind: "stock", title: "", body: "", error: "" });
      App.openSheet("alert");
    },

    setAlertKind(input) {
      AlertSheet.kind = input.value;
      App.render();
    },

    setAlertTitle(input) {
      AlertSheet.title = input.value;
    },

    setAlertBody(input) {
      AlertSheet.body = input.value;
      App.render();
    },

    publishAlert() {
      if (AlertSheet.title.trim().length < 4) {
        AlertSheet.error = "Escribí un título para el aviso.";
        App.render();
        return;
      }
      App.openSheetName = null;
      actions.addAlert(SHOP_LOCAL_ID, { kind: AlertSheet.kind, title: AlertSheet.title.trim(), body: AlertSheet.body.trim() });
    },

    removeAlert(button) {
      actions.removeAlert(button.dataset.id);
    },
  },
};

/** El local actualiza cuánta gente hay en la cola presencial. */
const InPersonSheet = {
  count: "0",

  sheet() {
    const count = Number(this.count);
    const valid = this.count !== "" && Number.isInteger(count) && count >= 0 && count <= 99;
    return UI.sheet({
      title: "Cola presencial",
      description: "¿Cuántas personas hay esperando en el local?",
      content: `
        <div class="stack gap-3">
          <div class="count-input">
            <button type="button" class="stepper-btn" id="people-minus" aria-label="Una persona menos" ${count <= 0 ? "disabled" : ""} ${on("stepPeople", { step: -1 })}>${icon("minus")}</button>
            <input id="people-count" class="count-input-field" type="number" inputmode="numeric" min="0" max="99"
              value="${esc(this.count)}" aria-label="Personas en la fila" data-input="setPeople">
            <button type="button" class="stepper-btn" id="people-plus" aria-label="Una persona más" ${count >= 99 ? "disabled" : ""} ${on("stepPeople", { step: 1 })}>${icon("plus")}</button>
          </div>
          <p class="t-caption c-muted text-center">Los estudiantes ven el dato y la espera estimada al instante.</p>
        </div>`,
      footer: UI.button({ label: "Actualizar cola", block: true, action: "submitPeople", disabled: !valid }),
    });
  },

  actions: {
    openPeopleSheet() {
      InPersonSheet.count = String(shopLocal(Store.state).queue.inPerson);
      App.openSheet("people");
    },

    setPeople(input) {
      InPersonSheet.count = input.value.replace(/\D/g, "").slice(0, 2);
      App.render();
    },

    stepPeople(button) {
      const next = (Number(InPersonSheet.count) || 0) + Number(button.dataset.step);
      InPersonSheet.count = String(Math.min(99, Math.max(0, next)));
      App.render();
    },

    submitPeople() {
      App.openSheetName = null;
      actions.reportQueue(SHOP_LOCAL_ID, Number(InPersonSheet.count));
    },
  },
};
