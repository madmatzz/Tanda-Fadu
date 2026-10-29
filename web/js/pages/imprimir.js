// Nueva impresión: el estudiante sube su archivo (o elige uno de ejemplo).

const view = { guideOpen: false };

App.start({
  init() {
    // Los botones que empiezan una impresión nueva llegan con ?nuevo=1: el borrador arranca vacío.
    // Se saca el parámetro de la dirección para que volver atrás no lo vacíe de nuevo.
    if (App.params.get("nuevo")) {
      actions.resetDraft();
      App.params.delete("nuevo");
      const query = App.params.toString();
      history.replaceState(null, "", `imprimir.html${query ? `?${query}` : ""}`);
    }

    const flow = isTandaFlow() ? "tanda" : "print";
    actions.setFlow(flow);
    if (flow === "tanda") {
      const tanda = tandaById(Store.state, App.params.get("tanda")) || Store.state.tandas[0];
      actions.selectTanda(tanda.id);
    }
    const local = App.params.get("local") && localById(Store.state, App.params.get("local"));
    if (local) actions.selectLocal(local.id);
  },

  render() {
    const state = Store.state;
    const file = state.draft.file;
    const tanda = isTandaFlow() ? tandaById(state, state.draft.tandaId) : null;
    // Si se empezó desde el perfil de un local, ya está elegido: no hace falta comparar.
    const local = tanda ? null : chosenLocal(state);

    const examples = DEMO_FILES.map((demo) => `
      <button type="button" class="example-file" ${on("chooseExample", { file: demo.name })}>
        <span class="c-accent-ink">${icon("file-text")}</span>
        <span class="t-small fw-semibold truncate grow">${demo.name}</span>
        <span class="t-caption c-muted shrink-0">${demo.ppi} ppp · ${demo.color === "rgb" ? "color" : "grises"}</span>
      </button>`).join("");

    return UI.screen({
      title: tanda ? "Tandas" : "Imprimir FADU",
      back: tanda ? "tandas.html" : "index.html",
      trailing: "Archivo",
      footer: UI.button({
        label: "Continuar",
        icon: "arrow-right",
        block: true,
        disabled: !file,
        href: `especificaciones.html${flowSuffix()}`,
      }),
      content: `
        <div class="stack gap-5">
          ${UI.pageTitle("Nueva impresión", "Subí tu archivo y después elegí cómo imprimirlo.")}

          ${tanda ? UI.chip(`${tanda.label} · ${tanda.userTitle}`, { tone: "accent", icon: "layers" }) : ""}
          ${local ? UI.chip(`${local.name} · ${local.floorLabel}`, { tone: "accent", icon: "map-pin" }) : ""}

          ${UI.infoCard({
            steps: [
              "Subí un PDF, Word o JPG",
              "Configurá papel y tipo de impresión",
              local ? `Pagá y retirá en ${local.name}` : "Compará precios y tiempos de espera",
            ],
          })}

          ${file ? UI.fileCard({ name: file.name, meta: fileMeta(file), removeAction: "removeFile" }) : ""}

          ${UI.dropzone({
            label: file ? "Subir otro archivo" : "Subir archivo",
            hint: "PDF, Word o JPG · hasta 25 MB",
            change: "uploadFile",
          })}

          <div class="stack gap-2 t-body c-secondary">
            <p>Revisaremos formato, tamaño, resolución y compatibilidad de color cuando elijas cómo imprimirlo.</p>
            ${UI.link("Guía para enviar archivos óptimos", { action: "toggleGuide" })}
            ${view.guideOpen
              ? '<div class="soft-box is-compact">Usá PDF con 300 ppp, tamaño A4 o A3 y fuentes incrustadas. Si tu archivo es Word, lo convertimos antes de imprimir.</div>'
              : ""}
          </div>

          ${UI.card(`
            <div class="stack gap-3">
              ${UI.sectionLabel("¿Sin archivo a mano? Probá uno de ejemplo")}
              <div class="stack gap-2">${examples}</div>
            </div>`)}
        </div>`,
    });
  },

  actions: {
    uploadFile(input) {
      const selected = input.files[0];
      if (selected) actions.setFile(fileFromUpload(selected));
    },

    chooseExample(button) {
      actions.setFile(structuredClone(DEMO_FILES.find((demo) => demo.name === button.dataset.file)));
    },

    removeFile() {
      actions.setFile(null);
    },

    toggleGuide() {
      view.guideOpen = !view.guideOpen;
      App.render();
    },
  },
});
