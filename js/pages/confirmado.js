// Pedido confirmado: ticket digital con código de barras.

/** Anchos de barras y espacios, derivados del código: el mismo código dibuja siempre lo mismo. */
function barWidths(value) {
  let seed = 0;
  for (const char of value) seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed;
  };
  const guard = [2, 1, 1, 1, 2, 1];
  const body = [];
  for (let index = 0; index < 54; index += 1) {
    const roll = next() % 10;
    // Barras: mayoría finas con algunas gruesas. Espacios: más parejos.
    body.push(index % 2 === 0 ? (roll < 5 ? 1 : roll < 8 ? 2 : 3) : roll < 6 ? 1 : 2);
  }
  return [...guard, ...body, ...guard.slice().reverse()];
}

/** Código de barras decorativo (no se puede escanear). */
function barcode(value) {
  const widths = barWidths(value);
  let x = 0;
  const bars = widths.map((width, index) => {
    const bar = index % 2 === 0 ? `<rect x="${x}" y="0" width="${width}" height="40"/>` : "";
    x += width;
    return bar;
  });
  return `<svg class="barcode" viewBox="0 0 ${x} 40" preserveAspectRatio="none" role="img" aria-label="Código ${value}">${bars.join("")}</svg>`;
}

App.start({
  render() {
    const state = Store.state;
    const order = orderById(state, App.params.get("id"));

    if (!order) {
      return UI.screen({
        title: "Pedido confirmado",
        trailing: "Confirmación",
        content: UI.emptyState({
          icon: "receipt-text",
          title: "No encontramos ese pedido",
          description: "El pedido puede haber expirado en esta demo.",
          action: UI.button({ label: "Ver mis pedidos", variant: "outline", size: "md", href: "pedidos.html" }),
        }),
      });
    }

    const local = localById(state, order.localId);
    const tanda = order.tandaId ? tandaById(state, order.tandaId) : null;

    const tandaBox = tanda
      ? `
        <div class="tanda-box">
          <span class="t-label">${tanda.size} · ${modeLabel(tanda.mode)} · ${PAPER_LABELS[tanda.paper]}</span>
          <span class="t-h2">¡Ingresaste en una tanda!</span>
          <span class="t-small">Tu pedido saldrá más rápido.</span>
          <span class="t-caption is-faded">${tanda.label} · ${tanda.participants} pedidos · cierra a las ${tanda.closesAt} h</span>
        </div>`
      : "";

    return UI.screen({
      title: "Pedido confirmado",
      trailing: "Confirmación",
      footer: `
        <div class="stack gap-2">
          ${UI.button({ label: "Seguir el pedido", block: true, href: `pedido.html?id=${order.id}` })}
          ${UI.button({ label: "Volver al inicio", variant: "outline", size: "md", block: true, href: "index.html" })}
        </div>`,
      content: `
        <div class="stack gap-5">
          <div class="stack items-center gap-3 text-center">
            ${UI.statusBox("success", "Pedido confirmado")}
            ${UI.pageTitle("Pedido confirmado", "Imprimí sin vueltas. Ya estamos preparando tu pedido.")}
            ${UI.chip(`#${order.ticket} · ${local.name}`, { tone: "success", icon: "check-circle-2" })}
          </div>

          ${tandaBox}

          <div class="receipt">
            <div class="receipt-holes" aria-hidden="true">${"<span></span>".repeat(18)}</div>
            <div class="stack gap-3">
              <span class="t-label c-muted">Ticket digital</span>
              <div class="row between gap-2">
                <span class="t-big">#${order.ticket}</span>
                ${UI.chip(PAYMENT_LABELS[order.payment], { tone: "accent" })}
              </div>
              <div class="stack gap-2 receipt-rows">
                ${UI.keyValue("Local", local.name)}
                ${UI.keyValue("Archivo", esc(order.file.name))}
                ${UI.keyValue("Impresión", specsSummary(order.specs))}
                ${UI.keyValue("Papel", paperDisplay(order.specs))}
                ${UI.keyValue("Color", modeLabel(order.specs.mode))}
                ${UI.keyValue("Total", `$${order.total}`, true)}
              </div>
              <div class="stack items-center gap-2 divided receipt-barcode">
                ${barcode(order.code)}
                <span class="t-caption c-secondary">${order.code}</span>
              </div>
            </div>
          </div>

          ${UI.card(`
            <div class="row is-top gap-3">
              <span class="c-accent-ink icon-offset">${icon("clock")}</span>
              <div class="stack gap-1">
                <p class="t-strong">Ya estás en la cola virtual</p>
                <p class="t-small c-secondary">Retirás en ${local.name} cuando el pedido esté listo. Podés seguir el estado desde Mis pedidos.</p>
              </div>
            </div>`, { tone: "sunrise" })}
        </div>`,
    });
  },
});
