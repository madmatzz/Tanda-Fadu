// Imprenta · Cola virtual: el pedido que se imprime, los que esperan y los que hay que entregar.
// Al terminar uno, arranca solo el siguiente; los estudiantes ven la cola actualizada.

/** Pedidos de cada lista que se muestran antes de "Ver todos". */
const PREVIEW = 5;
const QUEUE_PREVIEW = 7;
const view = { open: { waiting: false, ready: false }, downloading: null };

/** Botón para desplegar o plegar una lista larga. */
function toggleButton(list, count, limit = PREVIEW, label = "") {
  if (count <= limit) return "";
  return UI.button({ label: view.open[list] ? "Ver menos" : label || `Ver los ${count} pedidos`, icon: "chevron-down", variant: "outline", size: "md", block: true, action: "toggleList", data: { list } });
}

function visible(list, items, limit = PREVIEW) {
  return view.open[list] ? items : items.slice(0, limit);
}

/** Mezcla pedidos y tandas y los ordena por número de pedido. */
function queueEntries(waiting, tandas) {
  return [
    ...waiting.map((order) => ({ type: "order", order, ticket: order.ticket })),
    ...tandas.map((entry) => ({ type: "tanda", ...entry })),
  ].sort((a, b) => a.ticket - b.ticket);
}

/** El pedido que está en la impresora, con todo lo que hace falta para imprimirlo. */
function printingCard(order) {
  const specs = order.specs;
  const downloaded = Boolean(order.filesDownloaded);
  const downloading = view.downloading === order.id;
  return `
    <div class="shop-printing">
      <div class="row between gap-2">
        <span class="row gap-2 t-label">${icon("printer", "icon-sm")}Próximo pedido</span>
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
      ${UI.button({
        label: downloading ? "Cargando…" : downloaded ? "Listo para retirar" : "Descargar archivo",
        icon: downloaded ? "check" : "download",
        variant: "accent",
        block: true,
        loading: downloading,
        action: downloaded ? "finishPrinting" : "downloadOrder",
        data: { id: order.id },
      })}
    </div>`;
}

/** La tanda que está en la impresora, con sus nombres y el CTA para cerrarla. */
function printingTandaCard(tanda, orders) {
  const pending = orders.filter((order) => order.status === "en-cola" || order.status === "imprimiendo");
  const names = [...new Set(pending.map((order) => order.owner))];
  const shown = names.slice(0, 3).join(", ");
  const extra = names.length - 3;
  const pages = pending.reduce((sum, order) => sum + order.specs.pages, 0);
  const downloaded = Boolean(tanda.filesDownloaded);
  const downloading = view.downloading === tanda.id;
  return `
    <div class="shop-printing is-tanda">
      <a class="shop-printing-detail" href="imprenta/tanda.html?id=${tanda.id}">
        <div class="row between gap-2">
          <span class="row gap-2 t-label">${icon("printer", "icon-sm")}Próximo pedido</span>
          <span class="t-caption">${tanda.label}</span>
        </div>
        <div class="row is-bottom gap-4">
          <span class="shop-printing-ticket">#${pending[0]?.ticket ?? "—"}</span>
          <div class="stack gap-05 grow">
            <span class="t-strong truncate">${plural(pending.length, "pedido", "pedidos")} en tanda</span>
            <span class="t-small">${plural(pages, "página", "páginas")} · ${tanda.size} ${modeShort(tanda.mode)}</span>
            <span class="t-small">${PAPER_LABELS[tanda.paper]} ${tanda.grammage}g</span>
          </div>
        </div>
        <p class="t-small shop-printing-note"><span class="fw-semibold">Nombres:</span> ${shown ? esc(shown) : "Sin pedidos"}${extra > 0 ? ` +${extra}` : ""}</p>
      </a>
      ${UI.button({
        label: downloading ? "Cargando…" : downloaded ? "Listo para retirar" : "Descargar archivos",
        icon: downloaded ? "check" : "download",
        variant: "tanda",
        block: true,
        loading: downloading,
        action: downloaded ? "finishTanda" : "downloadTanda",
        data: { id: tanda.id },
      })}
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
    const current = printingEntry(state, local.id);
    const printingOrder = current?.type === "order" ? current.order : null;
    const printingTanda = current?.type === "tanda" ? current.tanda : null;
    const waiting = queue.filter((order) => order.status === "en-cola");
    // Las tandas se mezclan con los pedidos individuales y se ordenan por número de pedido.
    const tandas = pendingTandas(state, local.id);
    const entries = queueEntries(waiting, tandas);
    // Para retirar van todos los pedidos impresos del local, también los de las tandas.
    const ready = localOrdersByStatus(state, local.id, "listo");
    const delivered = localOrdersByStatus(state, local.id, "entregado");
    const active = waiting.length + (current ? 1 : 0);
    const tandaCount = tandas.length + (printingTanda ? 1 : 0);
    // Minutos aproximados hasta que le toca a cada pedido, según su lugar en la cola.
    const minutesUntil = (index) => Math.max(1, Math.round((index + 1) * MINUTES_PER_ORDER));

    const idle = printingOrder
      ? printingCard(printingOrder)
      : printingTanda
        ? printingTandaCard(printingTanda, tandaOrders(state, printingTanda.id))
        : waiting.length
          ? UI.card(`
              <div class="stack gap-3">
                <span class="row gap-2 t-strong">${icon("printer")}La impresora está libre</span>
                ${UI.button({ label: `Imprimir el #${waiting[0].ticket}`, block: true, action: "startPrinting", data: { id: waiting[0].id } })}
              </div>`)
          : tandas.length
            ? UI.card(`
                <div class="stack gap-3">
                  <span class="row gap-2 t-strong">${icon("printer")}La impresora está libre</span>
                  <p class="t-small c-secondary">Hay tandas esperando. Abrí una para imprimir todos sus pedidos juntos.</p>
                </div>`)
            : UI.emptyState({ icon: "check-check", title: "No hay pedidos en la cola", description: "Cuando un estudiante haga un pedido, aparece acá." });

    const waitingList = entries.length
      ? `
        <div class="stack gap-2">
          ${visible("waiting", entries, QUEUE_PREVIEW).map((entry, index) => entry.type === "tanda"
            ? ShopUI.tandaRow(entry.tanda, entry.orders)
            : ShopUI.orderRow(entry.order, index === 0 && !current
              ? ""
              : index === 0 ? UI.chip("Siguiente", { tone: "info" }) : `<span class="t-caption c-muted nowrap">en ${minutesUntil(index)} min</span>`)).join("")}
        </div>
        ${toggleButton("waiting", entries.length, QUEUE_PREVIEW, "Ver toda la cola")}`
      : '<div class="soft-box is-compact">No hay pedidos esperando.</div>';

    return ShopUI.screen({
      tab: "cola",
      content: `
        <div class="stack gap-5">
          ${UI.pageTitle("Cola virtual", `${plural(active, "pedido", "pedidos")}${tandaCount ? ` y ${plural(tandaCount, "tanda", "tandas")}` : ""} · espera estimada ${local.queue.waitVirtual} min`)}

          ${idle}

          <section class="stack gap-3">
            <div class="row between gap-2">
              ${UI.sectionLabel(`En cola (${entries.length})`)}
              <span class="t-caption c-muted">${waiting.length} pedidos${tandas.length ? ` + ${tandas.length} ${tandas.length === 1 ? "tanda" : "tandas"}` : ""}</span>
            </div>
            ${waitingList}
          </section>

          <section class="stack gap-3" id="retirar">
            <div class="row between gap-2">
              ${UI.sectionLabel(`Entregados (${ready.length})`)}
              <span class="t-caption c-muted">${plural(delivered.length, "entregado", "entregados")} hoy</span>
            </div>
            ${ready.length
              ? `
                <div class="stack gap-2">
                  ${visible("ready", ready).map((order) => ShopUI.orderRow(
                    order,
                    UI.button({ label: "Rehacer", variant: "soft", size: "sm", action: "redoOrder", data: { id: order.id } }),
                    order.tandaId && tandaById(state, order.tandaId),
                  )).join("")}
                </div>
                ${toggleButton("ready", ready.length)}`
              : '<div class="soft-box is-compact">No hay pedidos esperando en el mostrador.</div>'}
          </section>

          <p class="t-caption c-muted">Las tandas se mezclan con los pedidos individuales. Al abrir una, se imprimen todos sus pedidos juntos y pasan a “Para retirar”.</p>
        </div>`,
    });
  },

  actions: {
    finishPrinting(button) {
      actions.finishPrinting(button.dataset.id);
    },

    finishTanda(button) {
      actions.printTanda(button.dataset.id);
    },

    downloadOrder(button) {
      const id = button.dataset.id;
      if (view.downloading) return;
      view.downloading = id;
      App.render();
      window.setTimeout(() => {
        if (view.downloading !== id) return;
        view.downloading = null;
        actions.downloadOrder(id);
      }, 900);
    },

    downloadTanda(button) {
      const id = button.dataset.id;
      if (view.downloading) return;
      view.downloading = id;
      App.render();
      window.setTimeout(() => {
        if (view.downloading !== id) return;
        view.downloading = null;
        actions.downloadTanda(id);
      }, 900);
    },

    startPrinting(button) {
      actions.startPrinting(button.dataset.id);
    },

    redoOrder(button) {
      actions.redoOrder(button.dataset.id);
    },

    toggleList(button) {
      const list = button.dataset.list;
      view.open[list] = !view.open[list];
      App.render();
    },
  },
});
