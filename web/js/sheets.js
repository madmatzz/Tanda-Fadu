// Paneles que se usan en varias pantallas: menú demo e informar cola.
// Cada pantalla suma sus acciones con ...DemoMenu.actions o ...ReportSheet.actions
// y los muestra desde su sheet(): if (name === "demo") return DemoMenu.sheet();

const DemoMenu = {
  sheet() {
    const row = (iconName, label, meta, action, data) => `
      <button type="button" class="menu-row" ${on(action, data)}>
        <span class="round-icon">${icon(iconName)}</span>
        <span class="stack gap-05 grow">
          <span class="t-strong">${label}</span>
          <span class="t-caption c-secondary">${meta}</span>
        </span>
        <span class="c-muted">${icon("chevron-right")}</span>
      </button>`;

    return UI.sheet({
      title: "Menú demo",
      description: "Datos ficticios, reloj fijo y estados listos para mostrar.",
      content: `
        <div class="stack gap-5">
          <div class="soft-box is-accent stack gap-1">
            <p class="t-label c-accent-ink">Demo · miércoles 11:20</p>
            <p class="t-small c-accent-ink">Los cambios se guardan en este navegador. Podés reiniciar cuando quieras.</p>
          </div>
          <div class="stack gap-2">
            ${UI.sectionLabel("Estados del estudiante")}
            ${row("printer", "Flujo de impresión", "Nueva impresión desde el inicio", "demoGo", { href: "imprimir.html?nuevo=1" })}
            ${row("list-checks", "Archivo óptimo", "Validación aprobada para A4 · B&N", "demoValidation", { file: "entrega_final.pdf" })}
            ${row("alert-triangle", "Archivo rechazado", "Resolución insuficiente", "demoValidation", { file: "foto-baja-res.jpg" })}
            ${row("flask-conical", "Conversión en curso", "Procesamiento simulado al 65%", "demoValidation", { file: "monografia.docx" })}
            ${row("map", "Mapa de locales", "FADU · Planta baja, piso 1 y piso 2", "demoGo", { href: "locales.html" })}
            ${row("list-checks", "Pedido en cola", "Ticket #36 en El Poli", "demoGo", { href: "pedido.html?id=order-36" })}
          </div>
          <div class="divider"></div>
          <div class="stack gap-2">
            ${UI.sectionLabel("Vistas")}
            ${row("user-round", "Estudiante", "Inicio de la app", "demoGo", { href: "index.html" })}
            ${row("store", "Imprenta", "Panel de El Poli (modo oscuro)", "demoGo", { href: "imprenta/index.html" })}
          </div>
          <div class="divider"></div>
          <div class="stack gap-2">
            ${UI.sectionLabel("Sistema")}
            ${row("rotate-ccw", "Reiniciar demo", "Vuelve a los datos originales", "demoReset")}
          </div>
        </div>`,
    });
  },

  actions: {
    openDemoMenu() {
      App.openSheet("demo");
    },

    demoGo(element) {
      App.go(element.dataset.href);
    },

    /** Carga un archivo de ejemplo y muestra su validación (la conversión ya en curso). */
    demoValidation(element) {
      const file = structuredClone(DEMO_FILES.find((item) => item.name === element.dataset.file));
      const outcome = validationOutcome(file, { ...Store.state.draft.specs, size: "A4", mode: "bn" });
      actions.setFile(file);
      actions.setSpecs({ size: "A4", mode: "bn" });
      if (outcome === "ajustable") actions.setValidation("conversion", 65);
      else actions.setValidation(outcome);
      App.go("validacion.html");
    },

    demoReset() {
      actions.resetDemo();
      App.go("index.html");
    },
  },
};

/** Informar cuánta gente hay en la cola presencial de un local. */
const ReportSheet = {
  localId: null,
  inQueue: true,
  /** Cantidad escrita en el campo (texto, para que se pueda borrar y escribir otro número). */
  count: "0",

  sheet() {
    const local = localById(Store.state, this.localId);
    const count = Number(this.count);
    const valid = this.count !== "" && Number.isInteger(count) && count >= 0 && count <= 99;

    return UI.sheet({
      title: "Informar cola",
      description: `Cola presencial de ${local.name} · ${local.floorLabel}`,
      content: `
        <div class="stack gap-5">
          <div class="stack gap-2">
            ${UI.radioCard({ name: "in-queue", value: "si", checked: this.inQueue, title: "Ya estoy en la fila", change: "setInQueue" })}
            ${UI.radioCard({ name: "in-queue", value: "no", checked: !this.inQueue, title: "Solo estoy mirando", change: "setInQueue" })}
          </div>
          <div class="stack gap-3">
            <div class="stack gap-05">
              <span class="t-label c-muted">Actualizar cola</span>
              <label class="t-h3" for="queue-count">¿Cuántas personas hay ahora?</label>
            </div>
            <div class="count-input">
              <button type="button" class="stepper-btn" id="queue-count-minus" aria-label="Una persona menos" ${count <= 0 ? "disabled" : ""} ${on("stepCount", { step: -1 })}>${icon("minus")}</button>
              <input id="queue-count" class="count-input-field" type="number" inputmode="numeric" min="0" max="99"
                value="${esc(this.count)}" aria-label="Personas en la fila" data-input="setCount">
              <button type="button" class="stepper-btn" id="queue-count-plus" aria-label="Una persona más" ${count >= 99 ? "disabled" : ""} ${on("stepCount", { step: 1 })}>${icon("plus")}</button>
            </div>
            <p class="t-caption c-muted text-center">${this.inQueue ? "Contate a vos también." : "Contá a todos los que están esperando."}</p>
          </div>
        </div>`,
      footer: UI.button({ label: "Actualizar cola", block: true, action: "submitReport", disabled: !valid }),
    });
  },

  actions: {
    openReport(element) {
      ReportSheet.localId = element.dataset.id;
      ReportSheet.count = String(localById(Store.state, element.dataset.id).queue.inPerson);
      App.openSheet("report");
    },

    setInQueue(input) {
      ReportSheet.inQueue = input.value === "si";
      App.render();
    },

    setCount(input) {
      ReportSheet.count = input.value.replace(/\D/g, "").slice(0, 2);
      App.render();
    },

    stepCount(button) {
      const next = (Number(ReportSheet.count) || 0) + Number(button.dataset.step);
      ReportSheet.count = String(Math.min(99, Math.max(0, next)));
      App.render();
    },

    submitReport() {
      App.openSheetName = null;
      actions.reportQueue(ReportSheet.localId, Number(ReportSheet.count));
    },
  },
};
