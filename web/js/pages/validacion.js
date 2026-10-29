// Validación: compara el archivo con las especificaciones.
// Estados: óptimo · ajustable (la app lo corrige) · conversión en curso · convertido · rechazado.

const view = { summaryOpen: false };
let conversionTimer = null;

const TITLES = {
  optimo: "Archivo óptimo",
  ajustable: "Tu archivo necesita ajustes",
  conversion: "Ajustando tu archivo",
  convertido: "Archivo listo para imprimir",
  rechazado: "Archivo rechazado",
};

const SUBTITLES = {
  optimo: "Cumple con todo lo que elegiste. Revisá el resumen antes de seguir.",
  ajustable: "No coincide del todo con lo que elegiste, pero podemos corregirlo por vos.",
  conversion: "Esto puede tardar unos segundos. No cierres esta pantalla.",
  convertido: "Ajustamos el archivo. Revisá el resumen antes de seguir.",
  rechazado: "Este archivo no se puede imprimir con buena calidad.",
};

/** Tarjeta del archivo listo, con el lápiz que abre "Editar especificaciones" y "Reemplazar archivo". */
function fileSummary(file, specs, total) {
  const name = file.state === "convertido" && file.kind === "docx" ? file.name.replace(/\.docx?$/i, ".pdf") : file.name;
  const meta = `${plural(specs.pages, "página", "páginas")} · ${file.sizeLabel} · ${plural(specs.copies, "copia", "copias")}${file.state === "convertido" ? " · ajustado" : ""}`;
  const specials = (specs.specials || []).length
    ? UI.keyValue("Especiales", `${specialsLabel(specs)}${specs.labelFile ? ` (${esc(specs.labelFile)})` : ""}`)
    : "";

  const overlay = view.summaryOpen
    ? `
      <div class="file-summary-overlay" ${on("closeSummary")}>
        <button type="button" class="ghost-btn file-summary-close" aria-label="Cerrar opciones" ${on("closeSummary")}>${icon("x", "icon-lg")}</button>
        <a class="file-summary-option" href="especificaciones.html${flowSuffix()}">${icon("pencil", "icon-lg")}Editar especificaciones</a>
        <a class="file-summary-option" href="imprimir.html${flowSuffix()}">${icon("rotate-cw", "icon-lg")}Reemplazar archivo</a>
      </div>`
    : "";

  return `
    <div class="file-summary">
      <div class="card file-summary-card" role="button" tabindex="0" aria-label="Opciones del archivo" ${on("openSummary")}>
        <div class="stack gap-3">
          <div class="row is-top gap-3">
            <span class="tile-icon">${icon("file-text", "icon-lg")}</span>
            <div class="stack gap-1 grow">
              <span class="t-h3 truncate">${esc(name)}</span>
              <span class="t-small c-secondary">${meta}</span>
            </div>
            <button type="button" class="ghost-btn file-summary-pencil" aria-label="Editar archivo" ${on("openSummary")}>${icon("pencil", "icon-lg")}</button>
          </div>
          <div class="stack gap-2 divided">
            ${UI.keyValue("Papel", `${specs.size} · ${paperDisplay(specs)}`)}
            ${UI.keyValue("Impresión", modeLabel(specs.mode))}
            ${specials}
            ${specs.notes ? UI.keyValue("Observaciones", esc(specs.notes)) : ""}
            ${UI.keyValue("Subtotal estimado", `$${total}`, true)}
          </div>
        </div>
      </div>
      ${overlay}
    </div>`;
}

App.start({
  render() {
    const state = Store.state;
    const file = state.draft.file;
    const specs = state.draft.specs;
    const title = isTandaFlow() ? "Tandas" : "Imprimir FADU";
    const specsHref = `especificaciones.html${flowSuffix()}`;
    const uploadHref = `imprimir.html${flowSuffix()}`;

    if (!file || file.state === "pendiente") {
      return UI.screen({
        title,
        back: file ? specsHref : uploadHref,
        trailing: "Validación",
        footer: UI.button({
          label: file ? "Elegir especificaciones" : "Subir archivo",
          icon: file ? "sliders-horizontal" : "upload",
          block: true,
          href: file ? specsHref : uploadHref,
        }),
        content: UI.emptyState({
          icon: "upload",
          title: file ? "Falta elegir cómo imprimir" : "Primero subí un archivo",
          description: file
            ? "Validamos el archivo contra el papel, tamaño y color que elijas."
            : "Necesitamos un PDF, Word o JPG para validar la impresión.",
        }),
      });
    }

    const checks = fileChecks(file, specs);
    const fixes = checks.filter((check) => check.status === "ajuste");
    const ready = file.state === "optimo" || file.state === "convertido";
    // Si el local ya está elegido (tanda, perfil del local o comparación), se cobra lo de ese local
    // y se pasa directo al pago; si no, primero se comparan locales.
    const fixedLocal = chosenLocal(state);
    const total = fixedLocal ? estimateTotal(specs, fixedLocal) : averageTotal(specs, state.locals);
    const next = isTandaFlow()
      ? { label: "Continuar con la tanda", href: "tanda.html?flujo=tanda" }
      : fixedLocal
        ? { label: "Continuar", href: "pago.html" }
        : { label: "Continuar y elegir local", href: "comparar.html?desde=validacion" };

    let footer;
    if (file.state === "ajustable") {
      footer = UI.button({ label: fixActionLabel(checks), icon: "wand-2", block: true, action: "startFix" });
    } else if (file.state === "conversion") {
      footer = UI.button({ label: "Ajustando archivo…", block: true, loading: true });
    } else if (file.state === "rechazado") {
      footer = UI.button({ label: "Subir otro archivo", icon: "upload", block: true, action: "uploadAnother" });
    } else {
      footer = `
        <div class="stack gap-2">
          ${UI.priceSummary({
            total,
            source: fixedLocal ? `En ${fixedLocal.name}` : "Promedio entre locales",
            perPage: fixedLocal ? pricePerPage(specs, fixedLocal) : averagePricePerPage(specs, state.locals),
            specs,
          })}
          ${UI.button({ label: next.label, block: true, href: next.href })}
        </div>`;
    }

    let body;
    if (ready) {
      body = `
        ${fileSummary(file, specs, total)}
        <div class="row is-top gap-2 t-small c-secondary">
          <span class="check-offset">${UI.checkDot()}</span>
          <span>Verificamos formato, peso, resolución, tamaño y color.${fixes.length ? ` Ajustes: ${fixes.map((check) => check.done).join(" · ")}.` : ""}</span>
        </div>`;
    } else if (file.state === "conversion") {
      body = `
        ${UI.fileCard({ name: file.name, meta: `${specsSummary(specs)} · ${paperDisplay(specs)}` })}
        ${UI.progress({ value: file.progress || 65, label: "Procesando archivo", valueLabel: `${file.progress || 65} %` })}
        ${UI.card(`
          <div class="stack gap-3">
            ${fixes.map((check, index) => `
              <div class="${cx("row gap-2 t-body", index > 0 && "c-muted")}">
                ${index === 0 ? '<span class="running-dot"><span></span></span>' : '<span class="pending-dot">—</span>'}
                ${check.fix}
              </div>`).join("")}
          </div>`)}
        ${UI.link("Cancelar ajuste", { action: "cancelFix" })}`;
    } else {
      body = `
        ${UI.fileCard({ name: file.name, meta: `${specsSummary(specs)} · ${paperDisplay(specs)}` })}
        ${UI.card(`
          <div class="stack gap-3">
            ${checks.map((check) => check.status === "ok"
              ? `
                <div class="row between gap-3">
                  <span class="row gap-2 t-body c-secondary">${UI.checkDot()}${check.label}</span>
                  <span class="t-body text-right">${check.value}</span>
                </div>`
              : UI.note({ title: check.label, text: check.value, tone: check.status === "error" ? "danger" : "warning" })).join("")}
          </div>`)}
        <p class="t-body c-secondary">
          ${file.state === "rechazado"
            ? "La resolución es muy baja y no se puede mejorar automáticamente. Exportá el archivo de nuevo a 300 ppp o más y volvé a subirlo."
            : "Si preferís no ajustarlo, podés cambiar las especificaciones o subir otro archivo."}
        </p>
        ${file.state === "ajustable" ? UI.link("Cambiar especificaciones", { href: specsHref }) : ""}`;
    }

    const status = ready ? "success" : file.state === "rechazado" ? "danger" : "warning";

    return UI.screen({
      title,
      back: specsHref,
      trailing: ready ? "Resumen" : "Validación",
      footer,
      content: `
        <div class="stack gap-5">
          <div class="stack items-start gap-3">
            ${UI.statusBox(status, TITLES[file.state])}
            ${UI.pageTitle(TITLES[file.state], SUBTITLES[file.state])}
          </div>
          ${body}
        </div>`,
    });
  },

  // La conversión es simulada: después de unos segundos el archivo queda listo.
  afterRender() {
    const file = Store.state.draft.file;
    const converting = file && file.state === "conversion";
    if (converting && !conversionTimer) {
      conversionTimer = setTimeout(() => {
        conversionTimer = null;
        actions.setValidation("convertido", 100);
      }, 2400);
    }
    if (!converting && conversionTimer) {
      clearTimeout(conversionTimer);
      conversionTimer = null;
    }
  },

  onEscape() {
    if (view.summaryOpen) {
      view.summaryOpen = false;
      App.render();
    }
  },

  actions: {
    startFix() {
      actions.setValidation("conversion", 65);
    },

    cancelFix() {
      actions.setValidation("ajustable");
    },

    uploadAnother() {
      App.go(`imprimir.html${flowSuffix()}`);
      actions.setFile(null);
    },

    openSummary() {
      view.summaryOpen = true;
      App.render();
    },

    closeSummary() {
      view.summaryOpen = false;
      App.render();
    },
  },
});
