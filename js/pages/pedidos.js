// Mis pedidos: el pedido en curso y el historial.

App.start({
  render() {
    const state = Store.state;
    const orders = userOrders(state);
    const active = orders.find((order) => order.status !== "entregado");
    const history = orders.filter((order) => order.status === "entregado");

    const activeSection = active
      ? `
        <section class="stack gap-3">
          ${UI.sectionLabel("Pedido en curso")}
          ${UI.card(`
            <div class="stack gap-4">
              <div class="row is-top between gap-3">
                <div class="stack gap-1">
                  <span class="t-big">#${active.ticket}</span>
                  <span class="t-small c-secondary">${localById(state, active.localId).name} · ${esc(active.file.name)}</span>
                </div>
                ${UI.chip(STATUS_LABELS[active.status], { tone: "info" })}
              </div>
              <div class="row gap-2 t-small c-secondary">${icon("clock")}Retiro estimado hoy a las ${clockLabel(active.readyAt)} h</div>
              ${UI.fileCard({ name: active.file.name, meta: `${plural(active.specs.pages, "página", "páginas")} · ${plural(active.specs.copies, "copia", "copias")}` })}
              ${UI.button({ label: "Ver cola", size: "md", block: true, href: `pedido.html?id=${active.id}` })}
            </div>`)}
        </section>`
      : UI.emptyState({
          icon: "inbox",
          title: "No tenés un pedido en curso",
          description: "Cuando imprimas, vas a poder seguir la cola desde acá.",
          action: UI.button({ label: "Imprimir ahora", variant: "accent", size: "md", href: "imprimir.html?nuevo=1" }),
        });

    const historyList = history.length
      ? `<div class="stack gap-2">${history.map((order) => UI.orderRow(order, localById(state, order.localId))).join("")}</div>`
      : UI.emptyState({
          icon: "inbox",
          title: "Todavía no hay historial",
          description: "Los pedidos entregados van a aparecer en esta lista.",
        });

    return UI.screen({
      title: "Mis pedidos",
      back: "index.html",
      trailing: "Pedidos",
      footer: UI.button({ label: "Nuevo pedido", icon: "printer", block: true, href: "imprimir.html?nuevo=1" }),
      content: `
        <div class="stack gap-6">
          ${UI.pageTitle("Mis pedidos", "Seguí el pedido activo y revisá lo que ya retiraste.")}
          ${activeSection}
          <section class="stack gap-3">
            <div class="row is-bottom between gap-2">
              <h2 class="t-h2">Historial</h2>
              <span class="t-caption c-muted">${plural(history.length, "pedido", "pedidos")}</span>
            </div>
            ${historyList}
          </section>
          ${active
            ? UI.card(`
                <div class="stack gap-3">
                  <p class="t-h3">Resumen del pedido activo</p>
                  ${UI.keyValue("Archivo", esc(active.file.name))}
                  ${UI.keyValue("Impresión", `${plural(active.specs.pages, "página", "páginas")} · ${plural(active.specs.copies, "copia", "copias")}`)}
                  ${UI.keyValue("Total", `$${active.total}`, true)}
                  <p class="t-small c-secondary">El tiempo es ilustrativo y puede cambiar si la imprenta actualiza la cola.</p>
                </div>`)
            : ""}
        </div>`,
    });
  },
});
