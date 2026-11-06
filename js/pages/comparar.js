// ¿Dónde imprimir?: la misma impresión en cada local, con precio, espera y tandas.

const desde = App.params.get("desde") || "locales";
const localParam = App.params.get("local");
// Si ya había un local elegido (desde su perfil, o al volver del pago con "Cambiar local"),
// llega marcado y va primero en la lista. Si no, ningún local viene elegido: decide el usuario.
const previous = (localParam && localById(Store.state, localParam)) || chosenLocal(Store.state);
const view = {
  sort: "price",
  selectedId: previous ? previous.id : null,
};

function backHref() {
  if (desde === "validacion") return "validacion.html";
  if (desde === "pago") return "pago.html?desde=comparar";
  if (desde === "local" && localParam) return `local.html?local=${localParam}`;
  return "locales.html";
}

/**
 * Locales con su precio y stock para esta impresión. Primero va el que ya estaba elegido;
 * después, los que tienen una tanda compatible con el pedido; y el resto, ordenados por precio
 * o por espera según la opción elegida.
 */
function compareRows(state, specs) {
  const rows = state.locals.map((local) => ({
    local,
    total: estimateTotal(specs, local),
    stock: specsStock(local, specs),
    hasTanda: state.tandas.some((tanda) => tanda.localId === local.id && tandaCompatible(tanda, specs)),
    chosenBefore: Boolean(previous) && local.id === previous.id,
  }));
  const byChosen = (a, b) => Number(b.chosenBefore) - Number(a.chosenBefore);
  const byTanda = (a, b) => Number(b.hasTanda) - Number(a.hasTanda);
  const byWait = (a, b) => a.local.queue.waitVirtual - b.local.queue.waitVirtual;
  const byPrice = (a, b) => a.total - b.total;
  return rows.sort((a, b) =>
    byChosen(a, b) || byTanda(a, b) || (view.sort === "price" ? byPrice(a, b) || byWait(a, b) : byWait(a, b) || byPrice(a, b)),
  );
}

App.start({
  render() {
    const state = Store.state;
    const specs = state.draft.specs;
    const file = state.draft.file;
    const rows = compareRows(state, specs);
    const cheapest = Math.min(...rows.map((row) => row.total));
    const fastest = Math.min(...rows.map((row) => row.local.queue.waitVirtual));
    const selected = rows.find((row) => row.local.id === view.selectedId);
    const selectedOut = selected && selected.stock === "out";

    const cards = rows.map(({ local, total, stock, hasTanda, chosenBefore }) => {
      const isSelected = Boolean(selected) && local.id === selected.local.id;
      const unavailable = stock === "out";
      const tags = [
        hasTanda && UI.chip("¡Tanda!", { tone: "tanda" }),
        local.id === "local-cefadu"
          ? UI.chip("Solo blanco y negro", { tone: "accent" })
          : total === cheapest && UI.chip("Mejor precio", { tone: "accent" }),
        local.queue.waitVirtual === fastest && UI.chip("Menos espera", { tone: "success" }),
        stock !== "ok" && UI.chip(STOCK_LABELS[stock], { tone: stockTone(stock) }),
      ].filter(Boolean);

      // div con rol radio (y no <button>) porque adentro va el link "Ver local".
      return `
        <div class="${cx("card compare-card", hasTanda && "is-tanda", isSelected && "is-selected", unavailable && "is-unavailable")}"
          role="radio" aria-checked="${isSelected}" aria-disabled="${unavailable}"
          aria-label="${local.name}, $${total}, espera ${local.queue.waitVirtual} min"
          tabindex="${unavailable ? -1 : 0}" ${unavailable ? "" : on("selectLocal", { id: local.id })}>
          ${chosenBefore ? `<span class="row gap-1 t-caption fw-semibold c-accent-ink">${icon("map-pin", "icon-sm")}Seleccionaste este local</span>` : ""}
          ${hasTanda ? '<span class="t-caption fw-semibold c-tanda">Una tanda coincide con tu pedido</span>' : ""}
          <div class="row gap-3">
            ${UI.localLogo(local)}
            <div class="stack gap-1 grow">
              <span class="t-h3">${local.name}</span>
              ${UI.stars(local.rating, { showValue: true })}
            </div>
            ${UI.button({ label: "Ver local", variant: "soft", size: "sm", href: `local.html?local=${local.slug}&desde=comparar` })}
          </div>
          ${tags.length ? `<div class="row wrap gap-2">${tags.join("")}</div>` : ""}
          <div class="row is-bottom between gap-3 divided">
            <div class="stack gap-1">
              <span class="t-caption c-secondary">Espera virtual</span>
              <span class="row gap-1 t-strong">${icon("clock")}${local.queue.waitVirtual} min</span>
            </div>
            <span class="t-h1">$${total}</span>
          </div>
        </div>`;
    }).join("");

    return UI.screen({
      title: "Comparar locales",
      back: backHref(),
      trailing: "Comparación",
      footer: `
        <div class="stack gap-2">
          <div class="row between gap-2 t-small c-secondary">
            ${selected
              ? `<span>${selected.local.name}</span><span class="t-strong c-ink">$${selected.total}</span>`
              : "<span>Tocá un local para elegirlo</span>"}
          </div>
          ${UI.button({
            label: !selected ? "Elegí un local" : selectedOut ? "Sin stock en este local" : "Continuar con este local",
            block: true,
            disabled: !selected || selectedOut,
            action: "continueToPayment",
          })}
        </div>`,
      content: `
        <div class="stack gap-5">
          ${UI.pageTitle("¿Dónde imprimir?", "La misma impresión, distinto precio y espera.")}

          ${UI.card(`
            <div class="stack gap-2">
              <div class="row is-top between gap-2">
                <div class="stack gap-05">
                  <span class="t-h3">${specsSummary(specs)}</span>
                  <span class="t-small c-secondary">${paperDisplay(specs)}</span>
                </div>
                ${file ? "" : UI.chip("Demo", { tone: "accent" })}
              </div>
              <div class="row between gap-2 t-caption c-muted">
                <span>${file ? esc(file.name) : "Sin archivo cargado · precio estimado"}</span>
                ${UI.link("Editar", { href: "especificaciones.html" })}
              </div>
            </div>`)}

          ${UI.segmented({
            name: "sort",
            label: "Ordenar comparación",
            value: view.sort,
            change: "changeSort",
            options: [{ value: "price", label: "Mejor precio" }, { value: "wait", label: "Menor espera" }],
          })}

          <div class="stack gap-3" role="radiogroup" aria-label="Locales">${cards}</div>

          <div class="soft-box">
            Los precios son estimados y se confirman en el local. La comparación usa tu configuración: ${specsSummary(specs)}.
          </div>
        </div>`,
    });
  },

  actions: {
    changeSort(input) {
      view.sort = input.value;
      App.render();
    },

    selectLocal(card) {
      view.selectedId = card.dataset.id;
      App.render();
    },

    continueToPayment() {
      App.go("pago.html?desde=comparar");
      actions.selectLocal(view.selectedId);
    },
  },
});
