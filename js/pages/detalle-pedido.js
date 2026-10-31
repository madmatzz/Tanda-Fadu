// Detalle de un pedido ya hecho, con su comprobante.

/** Pasos del pedido: Recibido · Listo para retirar · Entregado. */
function orderStepper(completed) {
  const labels = ["Recibido", "Listo para retirar", "Entregado"];
  const current = Math.min(completed, labels.length - 1);
  const steps = labels.map((label, index) => {
    const done = index < completed;
    const marker = done ? icon("check") : `<span class="${cx("stepper-dot", index === current && "is-current")}"></span>`;
    const line = index < labels.length - 1 ? `<span class="${cx("order-steps-line", index < completed - 1 && "is-done")}"></span>` : "";
    return `<div class="order-steps-item"><span class="${cx("order-steps-marker", done && "is-done")}">${marker}</span>${line}</div>`;
  }).join("");
  return `
    <div class="stack gap-2" role="img" aria-label="Estado: ${labels[current]}">
      <div class="order-steps">${steps}</div>
      <div class="row between gap-2">
        ${labels.map((label, index) => `<span class="${cx("t-caption", index === current ? "fw-semibold" : "c-secondary")}">${label}</span>`).join("")}
      </div>
    </div>`;
}

App.start({
  render() {
    const state = Store.state;
    const order = orderById(state, App.params.get("id"));

    if (!order) {
      return UI.screen({
        title: "Detalle del pedido",
        back: "pedidos.html",
        trailing: "Pedido",
        content: UI.emptyState({
          icon: "receipt-text",
          title: "No encontramos ese pedido",
          description: "Revisá el historial de pedidos o volvé al inicio.",
          action: UI.button({ label: "Ver mis pedidos", variant: "outline", size: "md", href: "pedidos.html" }),
        }),
      });
    }

    const local = localById(state, order.localId);
    const delivered = order.status === "entregado";
    const step = delivered ? 3 : order.status === "listo" ? 2 : 1;

    return UI.screen({
      title: "Detalle del pedido",
      back: "pedidos.html",
      trailing: "Pedido",
      footer: `
        <div class="row gap-2">
          ${UI.button({ label: "Mis pedidos", variant: "outline", size: "md", block: true, href: "pedidos.html" })}
          ${UI.button({ label: delivered ? "Volver a pedir" : "Ver cola", size: "md", block: true, href: delivered ? "imprimir.html?nuevo=1" : `pedido.html?id=${order.id}` })}
        </div>`,
      content: `
        <div class="stack gap-5">
          ${UI.pageTitle(`Pedido #${order.ticket}`, `${local.name} · ${dateLabel(order.createdAt)}`)}
          <div class="row between gap-2">
            ${UI.statusChip(order.status)}
            ${UI.chip(STATUS_LABELS[order.status], { icon: "clock" })}
          </div>

          ${orderStepper(step)}

          <div class="receipt">
            <div class="receipt-holes" aria-hidden="true">${"<span></span>".repeat(18)}</div>
            <div class="stack gap-3">
              <div class="row between gap-2">
                <span class="t-label c-muted">Comprobante demo</span>
                ${UI.chip(PAYMENT_LABELS[order.payment])}
              </div>
              <div class="row is-bottom between gap-2">
                <span class="t-big">#${order.ticket}</span>
                <span class="t-small c-secondary">${order.code}</span>
              </div>
              <div class="stack gap-2 receipt-rows">
                ${UI.keyValue("Archivo", esc(order.file.name))}
                ${UI.keyValue("Impresión", specsSummary(order.specs))}
                ${UI.keyValue("Papel", paperDisplay(order.specs))}
                ${UI.keyValue("Color", modeLabel(order.specs.mode))}
                ${UI.keyValue("Total", `$${order.total}`, true)}
              </div>
            </div>
          </div>

          ${UI.localRow(local, `local.html?local=${local.slug}`)}

          <p class="t-caption c-muted">
            ${delivered
              ? "Este pedido ya fue retirado. Podés volver a imprimir con la misma configuración."
              : "El pedido sigue activo. Seguí la cola para ver el estado actualizado."}
          </p>
        </div>`,
    });
  },
});
