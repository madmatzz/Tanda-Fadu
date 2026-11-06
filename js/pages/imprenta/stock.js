// Imprenta · Stock de papel: hay, queda poco o no hay. Se refleja al instante para los estudiantes.

const LEVELS = [
  { value: "ok", label: "Hay" },
  { value: "low", label: "Poco" },
  { value: "out", label: "No hay" },
];

App.start({
  render() {
    const local = shopLocal(Store.state);

    const rows = local.papers.map((paper) => `
      <div class="card stack gap-3">
        <div class="row between gap-2">
          <span class="t-strong">${PAPER_NAMES[paper]}</span>
          ${UI.chip(STOCK_LABELS[local.stock[paper]], { tone: stockTone(local.stock[paper]) })}
        </div>
        ${UI.segmented({ name: `stock-${paper}`, label: `Stock de ${PAPER_NAMES[paper]}`, value: local.stock[paper], change: "setStock", options: LEVELS })}
      </div>`).join("");

    return ShopUI.screen({
      title: "Stock de papel",
      back: "imprenta/local.html",
      footer: UI.button({ label: "Listo", block: true, href: "imprenta/index.html" }),
      content: `
        <div class="stack gap-5">
          ${UI.pageTitle("Stock de papel", "Marcá qué papel tenés. Los estudiantes lo ven al buscar y al comparar locales.")}
          <div class="stack gap-3">${rows}</div>
          <div class="soft-box">
            Con “No hay”, ese papel deja de ofrecerse en tu local: los estudiantes que lo necesiten
            van a ver otras opciones al comparar.
          </div>
        </div>`,
    });
  },

  actions: {
    /** Cada segmentado se llama stock-<papel>. */
    setStock(input) {
      actions.setStock(SHOP_LOCAL_ID, input.name.replace("stock-", ""), input.value);
    },
  },
});
