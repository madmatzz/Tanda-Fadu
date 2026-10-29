// Imprenta · Detalle de una tanda: sus pedidos y la impresora con lo que falta y lo impreso.
// "Imprimir tanda" la cierra e imprime todos los pedidos juntos.

const PREVIEW = 4;
const view = { showAll: false };

/** Impresora: arriba la bandeja con los pedidos que esperan, abajo la salida con los impresos. */
function printerIllustration(pending, printed) {
  return `
    <svg class="shop-printer" viewBox="0 0 320 200" role="img" aria-label="${plural(pending, "pedido por imprimir", "pedidos por imprimir")} y ${plural(printed, "impreso", "impresos")}">
      <rect class="shop-printer-paper" x="92" y="8" width="136" height="46" rx="4"/>
      <text class="shop-printer-count" x="160" y="40" text-anchor="middle">${pending}</text>
      <rect class="shop-printer-body" x="36" y="50" width="248" height="90" rx="28"/>
      <circle class="${cx("shop-printer-led", pending && "is-on")}" cx="252" cy="76" r="6"/>
      <rect class="shop-printer-slot" x="92" y="104" width="136" height="26" rx="3"/>
      <path class="shop-printer-tray" d="M92 130 H228 L264 192 H56 Z"/>
      <text class="shop-printer-count" x="160" y="176" text-anchor="middle">${printed}</text>
    </svg>`;
}

App.start({
  render() {
    const state = Store.state;
    const tanda = tandaById(state, App.params.get("id"));

    if (!tanda || tanda.localId !== SHOP_LOCAL_ID) {
      return ShopUI.screen({
        title: "Tanda",
        back: "imprenta/tandas.html",
        content: UI.emptyState({
          icon: "layers",
          title: "No encontramos esa tanda",
          description: "Volvé a la lista de tandas del local.",
          action: UI.button({ label: "Ver tandas", variant: "outline", size: "md", href: "imprenta/tandas.html" }),
        }),
      });
    }

    const orders = tandaOrders(state, tanda.id);
    const pending = orders.filter((order) => order.status === "en-cola" || order.status === "imprimiendo");
    const done = orders.filter((order) => order.status === "listo" || order.status === "entregado");
    const pages = orders.reduce((sum, order) => sum + order.specs.pages, 0);
    const shownPending = view.showAll ? pending : pending.slice(0, PREVIEW);

    const stat = (value, label) => `
      <div class="soft-box is-compact stack gap-05 text-center">
        <span class="t-h2 c-ink">${value}</span>
        <span class="t-caption c-secondary">${label}</span>
      </div>`;

    return ShopUI.screen({
      title: tanda.label,
      back: "imprenta/tandas.html",
      footer: tanda.printed
        ? UI.button({ label: "Tanda impresa", icon: "check", variant: "soft", block: true, disabled: true })
        : UI.button({ label: `Imprimir tanda · ${plural(pending.length, "pedido", "pedidos")}`, icon: "printer", block: true, disabled: !pending.length, action: "askPrint" }),
      content: `
        <div class="stack gap-5">
          <div class="stack gap-3">
            ${UI.pageTitle(tanda.label, tandaShopTitle(tanda))}
            <div class="row wrap gap-2">
              ${tanda.printed
                ? UI.chip("Impresa", { tone: "success", icon: "check" })
                : UI.chip(`Cierra ${tanda.closesAt} h`, { tone: "tanda", icon: "clock" })}
              ${UI.chip(`${PAPER_LABELS[tanda.paper]} ${tanda.grammage}g`)}
            </div>
          </div>

          <div class="grid-3 gap-2">
            ${stat(`${tanda.participants}/${tanda.capacity}`, "cupo")}
            ${stat(pages, "páginas")}
            ${stat(`${tanda.waitMin} min`, "para imprimir")}
          </div>

          <div class="card stack gap-3">
            ${printerIllustration(pending.length, done.length)}
            <p class="t-small text-center c-secondary">
              ${tanda.printed
                ? "Listo: todos los pedidos están impresos y esperan en el mostrador."
                : `${plural(pending.length, "pedido espera", "pedidos esperan")} a que imprimas la tanda.`}
            </p>
          </div>

          <section class="stack gap-3">
            ${UI.sectionLabel(`Por imprimir (${pending.length})`)}
            ${pending.length
              ? `<div class="stack gap-2">${shownPending.map((order) => ShopUI.orderRow(order, UI.chip("En tanda", { tone: "tanda" }))).join("")}</div>
                 ${pending.length > PREVIEW ? UI.button({ label: view.showAll ? "Ver menos" : `Ver los ${pending.length} pedidos`, icon: "chevron-down", variant: "outline", size: "md", block: true, action: "toggleAll" }) : ""}`
              : '<div class="soft-box is-compact">No quedan pedidos por imprimir.</div>'}
          </section>

          ${done.length ? `
            <section class="stack gap-3">
              ${UI.sectionLabel(`Impresos (${done.length})`)}
              <div class="stack gap-2">${done.slice(0, PREVIEW).map((order) => ShopUI.orderRow(order, UI.statusChip(order.status))).join("")}</div>
              ${done.length > PREVIEW ? `<p class="t-caption c-muted">Y ${plural(done.length - PREVIEW, "pedido más", "pedidos más")}. Se entregan desde la cola, en “Para retirar”.</p>` : ""}
            </section>` : ""}
        </div>`,
    });
  },

  sheet(name) {
    if (name !== "print") return "";
    const tanda = tandaById(Store.state, App.params.get("id"));
    const pending = tandaOrders(Store.state, tanda.id).filter((order) => order.status === "en-cola");
    return UI.sheet({
      title: `¿Imprimir ${tanda.label.toLowerCase()}?`,
      description: "La tanda se cierra: ya no se suman pedidos.",
      content: `
        <div class="stack gap-3">
          ${UI.keyValue("Pedidos", pending.length, true)}
          ${UI.keyValue("Páginas", pending.reduce((sum, order) => sum + order.specs.pages, 0))}
          ${UI.keyValue("Configuración", `${tanda.size} · ${modeShort(tanda.mode)} · ${PAPER_LABELS[tanda.paper]} ${tanda.grammage}g`)}
          <div class="soft-box is-compact">Cada estudiante ve su pedido como “Listo” para retirar.</div>
        </div>`,
      footer: UI.button({ label: "Imprimir ahora", icon: "printer", block: true, action: "printTanda" }),
    });
  },

  actions: {
    askPrint() {
      App.openSheet("print");
    },

    printTanda() {
      App.openSheetName = null;
      actions.printTanda(App.params.get("id"));
    },

    toggleAll() {
      view.showAll = !view.showAll;
      App.render();
    },
  },
});
