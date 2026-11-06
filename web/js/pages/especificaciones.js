// Especificaciones: páginas, copias, papel, color y pedidos especiales.
// Si el pedido viene de sumarse a una tanda, sus parámetros arrancan con los de la tanda y se
// marcan en violeta. Si el usuario cambia uno, el pedido sale de la tanda y se le avisa.

/** Tanda a la que se sumó el estudiante antes de cargar el archivo, o null si imprime suelto. */
function joinedTanda(state) {
  const draft = state.draft;
  return isTandaFlow() && draft.tandaPreselected && draft.tandaId ? tandaById(state, draft.tandaId) : null;
}

/** "en" si el pedido entra en la tanda, "fuera" si ya no entra, y undefined si no hay tanda. */
function tandaStatus(state) {
  const tanda = joinedTanda(state);
  if (!tanda) return undefined;
  return tandaMismatches(tanda, state.draft.specs).length ? "fuera" : "en";
}

/** Cambia las especificaciones y, si con eso el pedido sale de la tanda, lo avisa. */
function changeSpecs(patch) {
  const before = tandaStatus(Store.state);
  actions.setSpecs(patch);
  if (before === "en" && tandaStatus(Store.state) === "fuera") {
    App.toast("Al cambiar este parámetro estás saliendo de la tanda");
  }
}

App.start({
  render() {
    const state = Store.state;
    const file = state.draft.file;
    const specs = state.draft.specs;
    const title = isTandaFlow() ? "Tandas" : "Imprimir FADU";
    const tanda = joinedTanda(state);
    const mismatches = tanda ? tandaMismatches(tanda, specs) : [];
    // Clase de cada parámetro: violeta mientras siga coincidiendo con la tanda.
    const tp = (key) => cx("tanda-param", tanda && !mismatches.includes(key) && "is-in-tanda");

    if (!file) {
      return UI.screen({
        title,
        back: `imprimir.html${flowSuffix()}`,
        trailing: "Configuración",
        content: UI.emptyState({
          title: "Falta tu archivo",
          description: "Subí un archivo para configurar la impresión.",
          action: UI.button({ label: "Subir archivo", variant: "outline", size: "md", href: `imprimir.html${flowSuffix()}` }),
        }),
      });
    }

    // Con el local ya elegido (perfil del local, tanda o comparación) el precio y el aviso de
    // stock son los de ese local; si todavía no se eligió, el precio es el promedio entre locales.
    const local = chosenLocal(state);
    const stock = local ? specsStock(local, specs) : "ok";
    const range = specs.range || fullRange(file.pages);
    const rangeValid = countPages(range, file.pages) !== null;
    const specials = specs.specials || [];
    const missingLabel = specials.includes("rotulado") && !specs.labelFile;

    const footer = `
      <div class="stack gap-2">
        ${UI.priceSummary({
          total: local ? estimateTotal(specs, local) : averageTotal(specs, state.locals),
          source: local ? `En ${local.name}` : "Promedio entre locales",
          perPage: local ? pricePerPage(specs, local) : averagePricePerPage(specs, state.locals),
          specs,
        })}
        ${UI.button({ label: "Validar archivo", icon: "shield-check", block: true, disabled: !rangeValid || missingLabel, action: "validate" })}
      </div>`;

    const mountSection = specials.includes("montaje")
      ? `
        <div class="stack gap-2 specials-extra">
          <span class="form-label">Material de montado</span>
          <div class="grid-3 gap-2">
            ${MOUNT_OPTIONS.map((option) => UI.radioCard({
              name: "mount",
              value: option.value,
              checked: specs.mountMaterial === option.value,
              title: option.label,
              description: `+$${option.price}`,
              tone: "accent",
              size: "sm",
              change: "chooseMount",
            })).join("")}
          </div>
        </div>`
      : "";

    const labelSection = specials.includes("rotulado")
      ? `
        <div class="stack gap-2 specials-extra">
          <span class="form-label">Archivo de rótulo</span>
          ${specs.labelFile
            ? UI.fileCard({ name: specs.labelFile, meta: "Rótulo cargado", removeAction: "removeLabel" })
            : `
              <label class="btn btn-outline btn-md btn-block">
                <input type="file" class="sr-only" accept=".pdf,.jpg,.jpeg,.png" data-change="uploadLabel">
                ${icon("upload")}Subir rótulo
              </label>
              <span class="t-caption c-secondary">PDF o JPG con tus datos. Lo necesitamos para validar el pedido.</span>`}
        </div>`
      : "";

    const stockWarning = local && stock !== "ok"
      ? UI.note({
          tone: "warning",
          small: true,
          text: stock === "out"
            ? `Sin stock de ${paperDisplay(specs)} en ${local.name}. Podés elegir otro papel o local.`
            : `Stock bajo de ${paperDisplay(specs)} en ${local.name}. Confirmá antes de retirar.`,
        })
      : "";

    return UI.screen({
      title,
      back: `imprimir.html${flowSuffix()}`,
      trailing: "Configuración",
      footer,
      content: `
        <div class="stack gap-5">
          ${UI.fileCard({ name: file.name, meta: fileMeta(file), removeAction: "removeFile", tanda: tandaStatus(state) })}

          ${UI.pageTitle("Especificaciones", "Elegí cómo imprimirlo. Después validamos que el archivo sirva para eso.")}

          <div class="grid-2 gap-3">
            <div class="${tp("pages")}">
              ${UI.textField({
                id: "pages",
                label: "Páginas",
                value: range,
                inputmode: "numeric",
                input: "changeRange",
                error: rangeValid ? "" : `Usá un rango entre 1 y ${file.pages}`,
                hint: rangeValid
                  ? tanda && !mismatches.includes("pages")
                    ? `Tanda de ${tanda.minPages} a ${tanda.maxPages} · ${file.pages} en total`
                    : `De ${file.pages} en total`
                  : "",
              })}
            </div>
            <div class="form-field">
              <span class="form-label">Copias</span>
              ${UI.stepper({ id: "copies", label: "Cantidad de copias", value: specs.copies, min: 1, max: 20, action: "changeCopies" })}
            </div>
          </div>

          <div class="grid-2 gap-3">
            <div class="${tp("size")}">
              ${UI.selectField({
                id: "size",
                label: "Tamaño de papel",
                value: specs.size,
                change: "changeSize",
                options: [{ value: "A4", label: "A4" }, { value: "A3", label: "A3" }],
              })}
            </div>
            <div class="${tp("grammage")}">
              ${UI.selectField({
                id: "grammage",
                label: "Gramaje",
                value: specs.grammage,
                change: "changeGrammage",
                options: GRAMMAGE_OPTIONS[specs.paper].map((grammage) => ({ value: grammage, label: `${grammage} g/m²` })),
              })}
            </div>
          </div>

          <div class="form-field ${tp("mode")}">
            <span class="form-label">Tipo de impresión</span>
            ${UI.segmented({
              name: "mode",
              label: "Tipo de impresión",
              value: specs.mode,
              change: "changeMode",
              options: [{ value: "bn", label: "Blanco y negro" }, { value: "color", label: "Color" }],
            })}
          </div>

          <div class="form-field ${tp("paper")}">
            <span class="form-label">Tipo de papel</span>
            <div class="grid-3 gap-2">
              ${PAPER_OPTIONS.map((paper) => UI.radioCard({
                name: "paper",
                value: paper.value,
                checked: specs.paper === paper.value,
                title: paper.label,
                description: paper.description,
                size: "sm",
                change: "choosePaper",
              })).join("")}
            </div>
          </div>

          <section class="specials">
            <div class="row wrap gap-2">
              <span class="row gap-2 t-small fw-semibold c-accent-ink">${icon("sparkles")}Pedidos especiales</span>
              <span class="t-caption c-muted">Opcional · podés elegir varios</span>
            </div>
            <div class="grid-3 gap-2">
              ${SPECIAL_OPTIONS.map((option) => UI.checkCard({
                name: "special",
                value: option.value,
                checked: specials.includes(option.value),
                title: option.label,
                description: option.description,
                note: option.price ? `+$${option.price}` : "Según material",
                change: "toggleSpecial",
              })).join("")}
            </div>
            ${mountSection}
            ${labelSection}
          </section>

          ${stockWarning}

          ${UI.textareaField({
            id: "notes",
            label: "Observaciones",
            value: specs.notes,
            placeholder: "Sin abrochar. Retiro por mostrador.",
            maxlength: 180,
            input: "changeNotes",
          })}
        </div>`,
    });
  },

  actions: {
    removeFile() {
      App.go(`imprimir.html${flowSuffix()}`);
      actions.setFile(null);
    },

    changeRange(input) {
      const pages = countPages(input.value, Store.state.draft.file.pages);
      changeSpecs(pages === null ? { range: input.value } : { range: input.value, pages });
    },

    changeCopies(button) {
      changeSpecs({ copies: Store.state.draft.specs.copies + Number(button.dataset.step) });
    },

    changeSize(select) {
      changeSpecs({ size: select.value });
    },

    changeGrammage(select) {
      changeSpecs({ grammage: select.value });
    },

    changeMode(input) {
      changeSpecs({ mode: input.value });
    },

    choosePaper(input) {
      changeSpecs({ paper: input.value, grammage: GRAMMAGE_OPTIONS[input.value][0] });
    },

    toggleSpecial(input) {
      const specs = Store.state.draft.specs;
      const current = specs.specials || [];
      const id = input.value;
      const patch = { specials: input.checked ? [...current, id] : current.filter((item) => item !== id) };
      if (id === "montaje" && input.checked && !specs.mountMaterial) patch.mountMaterial = "carton";
      if (id === "rotulado" && !input.checked) patch.labelFile = null;
      changeSpecs(patch);
    },

    chooseMount(input) {
      changeSpecs({ mountMaterial: input.value });
    },

    uploadLabel(input) {
      const selected = input.files[0];
      if (selected) changeSpecs({ labelFile: selected.name });
    },

    removeLabel() {
      changeSpecs({ labelFile: null });
    },

    changeNotes(textarea) {
      changeSpecs({ notes: textarea.value });
    },

    validate() {
      const draft = Store.state.draft;
      actions.setValidation(validationOutcome(draft.file, draft.specs));
      App.go(`validacion.html${flowSuffix()}`);
    },
  },
});
