// Imprenta · Cola virtual: el pedido que se imprime, los que esperan y los que hay que entregar.
// Al terminar uno, arranca solo el siguiente; los estudiantes ven la cola actualizada.

/** Pedidos de cada lista que se muestran antes de "Ver todos". */
const PREVIEW = 5;
const view = { open: { waiting: false, ready: false } };

/** Botón para desplegar o plegar una lista larga. */
function toggleButton(list, count) {
  if (count <= PREVIEW) return "";
  return UI.button({ label: view.open[list] ? "Ver menos" : `Ver los ${count} pedidos`, icon: "chevron-down", variant: "outline", size: "md", block: true, action: "toggleList", data: { list } });
}

function visible(list, items) {
  return view.open[list] ? items : items.slice(0, PREVIEW);
}

/** El pedido que está en la impresora, con todo lo que hace falta para imprimirlo. */
function printingCard(order) {
  const specs = order.specs;
  return `
    <div class="shop-printing">
      <div class="row between gap-2">
        <span class="row gap-2 t-label">${icon("printer", "icon-sm")}Imprimiendo ahora</span>
        <span class="t-caption">Pedido de ${esc(order.owner)}</span>
      </div>
      <div class="row is-bottom gap-4">
        <span class="shop-printing-ticket">#${order.ticket}</span>
        <div class="stack gap-05 grow">
          <span class="t-strong truncate">${esc(order.file.name)}</span>
          <span class="t-small">${plural(specs.pages, "página", "páginas")} · ${plural(specs.copies, "copia", "copias")}</span>
          <span class="t-small">${specs.size} · ${modeLabel(specs.mode)} · ${paperDisplay(specs)}</span>
        </div>
      </div>
      ${specs.notes ? `<p class="t-small shop-printing-note"><span class="fw-semibold">Observaciones:</span> ${esc(specs.notes)}</p>` : ""}
      ${UI.button({ label: "Listo para retirar", icon: "check", variant: "accent", block: true, action: "finishPrinting", data: { id: order.id } })}
    </div>`;
}

App.start({
  init() {
    // Desde el panel se puede llegar directo a "Para retirar".
    if (window.location.hash === "#retirar") {
      requestAnimationFrame(() => document.getElementById("retirar")?.scrollIntoView());
    }
  },

  render() {
    const state = Store.state;
    const local = shopLocal(state);
    const queue = queueOrders(state, local.id);
    const printing = queue.find((order) => order.status === "imprimiendo");
    const waiting = queue.filter((order) => order.status === "en-cola");
    // Para retirar van todos los pedidos impresos del local, también los de las tandas.
    const ready = localOrdersByStatus(state, local.id, "listo");
    const delivered = localOrdersByStatus(state, local.id, "entregado");
    const active = waiting.length + (printing ? 1 : 0);
    // Minutos aproximados hasta que le toca a cada pedido, según su lugar en la cola.
    const minutesUntil = (index) => Math.max(1, Math.round((index + 1) * MINUTES_PER_ORDER));

    const idle = printing
      ? printingCard(printing)
      : waiting.length
        ? UI.card(`
            <div class="stack gap-3">
              <span class="row gap-2 t-strong">${icon("printer")}La impresora está libre</span>
              ${UI.button({ label: `Imprimir el #${waiting[0].ticket}`, block: true, action: "startPrinting", data: { id: waiting[0].id } })}
            </div>`)
        : UI.emptyState({ icon: "check-check", title: "No hay pedidos en la cola", description: "Cuando un estudiante haga un pedido, aparece acá." });

    const waitingList = waiting.length
      ? `
        <div class="stack gap-2">
          ${visible("waiting", waiting).map((order, index) => ShopUI.orderRow(order, index === 0 && !printing
            ? ""
            : index === 0 ? UI.chip("Siguiente", { tone: "info" }) : `<span class="t-caption c-muted nowrap">en ${minutesUntil(index)} min</span>`)).join("")}
        </div>
        ${toggleButton("waiting", waiting.length)}`
      : '<div class="soft-box is-compact">No hay pedidos esperando.</div>';

    return ShopUI.screen({
      tab: "cola",
      content: `
        <div class="stack gap-5">
          ${UI.pageTitle("Cola virtual", `${plural(active, "pedido", "pedidos")} · espera estimada ${local.queue.waitVirtual} min`)}

          ${idle}

          <section class="stack gap-3">
            <div class="row between gap-2">
              ${UI.sectionLabel(`En cola (${waiting.length})`)}
              <span class="t-caption c-muted">Por orden de llegada</span>
            </div>
            ${waitingList}
          </section>

          <section class="stack gap-3" id="retirar">
            <div class="row between gap-2">
              ${UI.sectionLabel(`Para retirar (${ready.length})`)}
              <span class="t-caption c-muted">${plural(delivered.length, "entregado", "entregados")} hoy</span>
            </div>
            ${ready.length
              ? `
                <div class="stack gap-2">
                  ${visible("ready", ready).map((order) => ShopUI.orderRow(
                    order,
                    UI.button({ label: "Entregado", variant: "soft", size: "sm", action: "deliverOrder", data: { id: order.id } }),
                    order.tandaId && tandaById(state, order.tandaId),
                  )).join("")}
                </div>
                ${toggleButton("ready", ready.length)}`
              : '<div class="soft-box is-compact">No hay pedidos esperando en el mostrador.</div>'}
          </section>

          <p class="t-caption c-muted">Los pedidos de las tandas se imprimen juntos desde Tandas y, ya impresos, se entregan acá.</p>
        </div>`,
    });
  },

  actions: {
    finishPrinting(button) {
      actions.finishPrinting(button.dataset.id);
    },

    startPrinting(button) {
      actions.startPrinting(button.dataset.id);
    },

    deliverOrder(button) {
      actions.deliverOrder(button.dataset.id);
    },

    toggleList(button) {
      const list = button.dataset.list;
      view.open[list] = !view.open[list];
      App.render();
    },
  },
});
