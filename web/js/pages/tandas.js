// Tandas disponibles: pedidos con la misma configuración que se imprimen juntos.

const requestedTanda = tandaById(Store.state, App.params.get("tanda"));
const view = {
  selectedId: (requestedTanda || tandaById(Store.state, Store.state.draft.tandaId) || Store.state.tandas[0]).id,
};

App.start({
  render() {
    const state = Store.state;
    const selected = tandaById(state, view.selectedId);
    const full = tandaClosed(selected);
    const openCount = state.tandas.filter((tanda) => !tandaClosed(tanda)).length;
    const chosen = state.draft.tandaId ? tandaById(state, state.draft.tandaId) : null;

    return UI.screen({
      title: "Tandas disponibles",
      back: "index.html",
      trailing: "Tandas",
      footer: UI.button({
        label: full ? "Tanda cerrada" : `Sumarme a ${selected.label}`,
        variant: "accent",
        icon: "layers",
        block: true,
        disabled: full,
        action: "join",
      }),
      content: `
        <div class="stack gap-5">
          ${UI.pageTitle("Tandas disponibles", "Compartí la impresión con otros estudiantes y pagá menos espera.")}

          ${UI.card(`
            <div class="row is-top gap-3">
              <span class="round-icon is-sm is-accent is-glassy">${icon("users")}</span>
              <div class="stack gap-1">
                <p class="t-h3">Impresión en tandas</p>
                <p class="t-small c-secondary">Varios pedidos con la misma configuración se imprimen juntos. El local avisa cuando la tanda está completa y retirás en el horario estimado.</p>
              </div>
            </div>`, { tone: "sunrise" })}

          <div class="row between gap-2">
            ${UI.sectionLabel("Tandas activas")}
            <span class="t-caption c-muted">${openCount} disponibles</span>
          </div>

          <div class="stack gap-3">
            ${state.tandas.map((tanda) => UI.tandaCard(tanda, localById(state, tanda.localId), {
              selected: tanda.id === view.selectedId,
              compatible: tandaCompatible(tanda, state.draft.specs),
              action: "selectTanda",
            })).join("")}
          </div>

          ${UI.infoCard({
            title: "Cómo funciona",
            steps: ["Subí tu archivo y configurá la impresión", "Comprobá que coincida con la tanda", "Pagás y el local imprime el grupo completo"],
          })}

          ${chosen ? `<p class="t-caption c-muted">Tanda elegida en esta sesión: ${chosen.label}</p>` : ""}
        </div>`,
    });
  },

  actions: {
    selectTanda(card) {
      view.selectedId = card.dataset.id;
      App.render();
    },

    join() {
      App.go(`imprimir.html?nuevo=1&flujo=tanda&tanda=${view.selectedId}`);
    },
  },
});
