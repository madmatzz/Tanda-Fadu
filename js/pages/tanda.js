// Tu tanda coincide: después de validar, elegís la tanda compatible con tu pedido.

const compatibleAtStart = Store.state.tandas.filter((tanda) => tandaCompatible(tanda, Store.state.draft.specs));
const initialTanda =
  compatibleAtStart.find((tanda) => tanda.id === Store.state.draft.tandaId) || compatibleAtStart[0] || Store.state.tandas[0];
const view = { selectedId: initialTanda.id };

App.start({
  render() {
    const state = Store.state;
    const file = state.draft.file;
    const specs = state.draft.specs;

    if (!file) {
      return UI.screen({
        title: "Tandas",
        back: "tandas.html",
        trailing: "Coincidencia",
        footer: UI.button({ label: "Subir archivo", variant: "accent", icon: "upload", block: true, href: "imprimir.html?flujo=tanda" }),
        content: UI.emptyState({
          icon: "layers",
          title: "Necesitás un archivo para buscar tanda",
          description: "Subilo, configurá la impresión y te mostramos la tanda que coincide.",
        }),
      });
    }

    const compatible = state.tandas.filter((tanda) => tandaCompatible(tanda, specs));
    const selected = tandaById(state, view.selectedId);
    const selectedLocal = localById(state, selected.localId);
    const canJoin = compatible.some((tanda) => tanda.id === selected.id);
    const visible = state.tandas.filter((tanda, index) => index < 2 || tanda.id === selected.id);

    return UI.screen({
      title: "Tandas",
      back: "validacion.html?flujo=tanda",
      trailing: "Coincidencia",
      footer: `
        <div class="stack gap-2">
          <div class="row between gap-2 t-small c-secondary">
            <span>${selected.label}</span>
            <span class="t-strong c-ink">$${estimateTotal(specs, selectedLocal)}</span>
          </div>
          ${UI.button({ label: `Sumarme a ${selected.label}`, block: true, disabled: !canJoin, action: "join" })}
        </div>`,
      content: `
        <div class="stack gap-5">
          ${UI.pageTitle("Tu tanda coincide", "Buscamos tandas con tu misma configuración.")}

          <div class="soft-box is-compact row between gap-2">
            <div class="stack gap-05 grow">
              <span class="t-small fw-semibold c-ink truncate">${esc(file.name)}</span>
              <span class="t-caption">${plural(specs.pages, "página", "páginas")} · ${specs.size} · ${modeShort(specs.mode)}</span>
            </div>
            ${UI.chip(compatible.length ? `${compatible.length} compatible` : "Sin coincidencia", { tone: compatible.length ? "success" : "warning" })}
          </div>

          <div class="stack gap-3">
            ${visible.map((tanda) => UI.tandaCard(tanda, localById(state, tanda.localId), {
              selected: tanda.id === selected.id,
              compatible: tandaCompatible(tanda, specs),
              action: "chooseTanda",
            })).join("")}
          </div>

          ${compatible.length === 0
            ? UI.infoCard({
                title: "No hay una tanda compatible",
                text: "Podés imprimir suelto, cambiar el tamaño o el color en las especificaciones, o volver más tarde cuando se abra otra tanda.",
              })
            : ""}

          ${UI.button({ label: "Ajustar especificaciones", variant: "outline", size: "md", block: true, href: "especificaciones.html?flujo=tanda" })}

          <p class="t-caption c-muted">La tanda agrupa pedidos con la misma configuración. El local imprime cuando se completa el cupo o al cerrar el horario.</p>
        </div>`,
    });
  },

  actions: {
    /** Solo se pueden elegir las tandas compatibles con el pedido. */
    chooseTanda(card) {
      const tanda = tandaById(Store.state, card.dataset.id);
      if (!tandaCompatible(tanda, Store.state.draft.specs)) return;
      view.selectedId = tanda.id;
      actions.selectTanda(tanda.id);
    },

    join() {
      App.go("pago.html?flujo=tanda");
      actions.selectTanda(view.selectedId);
    },
  },
});
