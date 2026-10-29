// Tu pedido: seguimiento con forma de ticket, cola virtual y cola presencial.

const view = { listOpen: false };

// Nombres de los pedidos vecinos al tuyo, según la distancia en la cola.
const NEIGHBOUR_NAMES = { "-3": "Ailén", "-2": "Sofía", "-1": "Camila", 1: "Martín", 2: "Tomás", 3: "Juli" };

/** Borde troquelado del ticket: línea recta con muescas semicirculares hacia adentro. */
function ticketEdge(position) {
  const notch = `
    <svg viewBox="0 0 44 20" preserveAspectRatio="none">
      <path class="ticket-edge-outside" d="M0 0 H44 V3 H35 A13 13 0 0 1 9 3 H0 Z"/>
      <path class="ticket-edge-line" d="M0 3 H9 A13 13 0 0 0 35 3 H44"/>
    </svg>`;
  return `
    <div class="ticket-edge is-${position}" aria-hidden="true">
      <div class="ticket-edge-band"></div>
      <div class="ticket-edge-notches">${notch.repeat(9)}</div>
    </div>`;
}

App.start({
  statusBar: "surface",

  render() {
    const state = Store.state;
    const order = orderById(state, App.params.get("id"));
    const local = order && localById(state, order.localId);

    if (!order) {
      return UI.screen({
        title: "Tu pedido",
        back: "pedidos.html",
        trailing: "En cola",
        content: UI.emptyState({
          title: "No encontramos ese pedido",
          description: "Puede que ya no esté activo en la demo.",
          action: UI.button({ label: "Ver mis pedidos", variant: "outline", size: "md", href: "pedidos.html" }),
        }),
      });
    }

    const ready = order.status === "listo" || order.status === "entregado";
    const stage = ready ? 2 : order.status === "confirmado" ? 0 : 1;
    const wait = local.queue.waitVirtual;
    // Minutos por pedido: el tuyo está a dos lugares del que se imprime.
    const perOrder = Math.max(1, Math.round(wait / 2));
    const printing = order.ticket - 2;

    const queueRows = [-3, -2, -1, 0, 1, 2, 3].map((offset) => {
      const number = order.ticket + offset;
      const status = number < printing ? "Impreso" : number === printing ? "Imprimiendo" : `${(number - printing) * perOrder} minutos`;
      const statusClass = status === "Impreso" ? "c-muted" : status === "Imprimiendo" ? "c-success" : "";
      const self = offset === 0;
      return `
        <li class="${cx("queue-row", self && "is-self")}">
          <span class="t-strong queue-row-number">#${number}</span>
          <span class="${cx("t-small grow", self ? "fw-semibold" : "c-secondary")}">${self ? "Vos" : NEIGHBOUR_NAMES[offset]}</span>
          <span class="t-label ${statusClass}">${status}</span>
        </li>`;
    }).join("");

    return UI.screen({
      title: "Tu pedido",
      hideHeader: true,
      footer: UI.button({ label: "Volver al inicio", block: true, href: "index.html" }),
      content: `
        ${ticketEdge("top")}

        <div class="stack gap-5 ticket-body">
          <section class="stack gap-6">
            <div class="stack gap-5">
              <span class="t-h3 fw-regular">Tu pedido</span>
              <!-- Grilla de 3 columnas como la barra de progreso: el número ocupa 2 y los datos
                   arrancan donde arranca "Listo". -->
              <div class="grid-3 gap-2">
                <span class="t-ticket ticket-number">#${order.ticket}</span>
                <div class="stack between ticket-info">
                  <span class="t-h3 fw-regular leading-none truncate">${esc(order.file.name)}</span>
                  <span class="t-small fw-semibold leading-none">${local.name}</span>
                  <span class="row gap-1 t-small fw-semibold leading-none c-muted">${icon("clock")}${ready ? "Listo" : `${wait} minutos`}</span>
                </div>
              </div>
            </div>
            ${UI.stageProgress(stage)}
          </section>

          ${UI.card(`
            <div class="stack gap-4">
              <div class="row is-top between gap-2">
                <div class="stack">
                  <span class="t-strong">Cola virtual</span>
                  <span class="t-caption c-secondary">Pedidos cargados en la app</span>
                </div>
                <span class="t-body c-muted nowrap shrink-0"><span class="fw-semibold c-ink">${local.queue.virtual}</span> personas</span>
              </div>
              ${UI.virtualQueue(order.ticket)}
              <button type="button" class="btn btn-outline btn-md btn-block" aria-expanded="${view.listOpen}" ${on("toggleList")}>
                ${icon("chevron-down", cx("icon", view.listOpen && "is-flipped"))}
                ${view.listOpen ? "Ocultar pedidos" : "Ver pedidos"}
              </button>
              ${view.listOpen ? `<ul class="queue-list">${queueRows}</ul>` : ""}
            </div>`)}

          ${UI.card(`
            <div class="stack gap-4">
              <div class="row is-top between gap-2">
                <div class="stack">
                  <span class="t-strong">Cola presencial</span>
                  <span class="t-caption c-secondary">Actualizado ${minutesAgoLabel(local.queue.updatedAt, state.demoClock)}</span>
                </div>
                <span class="t-body c-muted nowrap shrink-0"><span class="fw-semibold c-ink">${local.queue.inPerson}</span> personas</span>
              </div>
              ${UI.inPersonQueue({ count: local.queue.inPerson, self: true })}
              ${UI.button({ label: "Informar cola", variant: "outline", size: "md", block: true, action: "openReport", data: { id: local.id } })}
            </div>`)}

          ${UI.card(`
            <div class="stack gap-3">
              <p class="t-h3">Detalle del pedido</p>
              ${UI.fileCard({ name: order.file.name, meta: `${plural(order.file.pages, "página", "páginas")} · ${order.file.sizeLabel}` })}
              ${UI.keyValue("Impresión", specsSummary(order.specs))}
              ${UI.keyValue("Papel", paperDisplay(order.specs))}
              ${UI.keyValue("Color", modeLabel(order.specs.mode))}
              ${UI.keyValue("Total", `$${estimateTotal(order.specs, local)}`, true)}
              ${order.specs.notes ? `<p class="t-small c-secondary"><span class="fw-semibold c-ink">Observaciones:</span> ${esc(order.specs.notes)}</p>` : ""}
            </div>`)}

          ${UI.localRow(local, `local.html?local=${local.slug}`)}
        </div>

        ${ticketEdge("bottom")}`,
    });
  },

  sheet(name) {
    if (name === "report") return ReportSheet.sheet();
    return "";
  },

  actions: {
    ...ReportSheet.actions,

    toggleList() {
      view.listOpen = !view.listOpen;
      App.render();
    },
  },
});
