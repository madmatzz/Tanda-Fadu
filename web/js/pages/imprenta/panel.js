// Imprenta · Panel: el resumen del día del local (colas, tandas, stock, reseñas y avisos).

App.start({
  render() {
    const state = Store.state;
    const local = shopLocal(state);
    const queue = queueOrders(state, local.id);
    const printing = queue.find((order) => order.status === "imprimiendo");
    const waiting = queue.filter((order) => order.status === "en-cola");
    const ready = localOrdersByStatus(state, local.id, "listo");
    const openTandas = localTandas(state, local.id).filter((tanda) => !tandaClosed(tanda));
    const nextClose = [...openTandas].sort((a, b) => a.closesAt.localeCompare(b.closesAt))[0];
    const reviews = localReviews(state, local.id);
    const unanswered = reviews.filter((review) => !review.reply).length;
    const alerts = state.alerts.filter((alert) => alert.localId === local.id);
    const lowStock = local.papers.filter((paper) => local.stock[paper] !== "ok");

    return ShopUI.screen({
      tab: "panel",
      content: `
        <div class="stack gap-5">
          <div class="stack gap-4">
            ${UI.pageTitle(`Hola, ${local.name}`, "Miércoles 11:20 · resumen de hoy")}
            <div class="grid-2 gap-2">
              ${UI.button({ label: "Editar perfil", icon: "pencil", variant: "outline", size: "md", block: true, href: "imprenta/local.html" })}
              ${UI.button({ label: "Cargar aviso", icon: "megaphone", variant: "soft", size: "md", block: true, action: "openAlertSheet" })}
            </div>
          </div>

          <div class="stack gap-3">
            ${UI.sectionLabel("Ahora")}
            <a class="shop-hero-card" href="imprenta/cola.html">
              <span class="row between gap-2">
                <span class="row gap-2 t-strong">${icon("users")}Cola virtual</span>
                <span class="row gap-1 t-small fw-semibold">Ver cola ${icon("arrow-right", "icon-sm")}</span>
              </span>
              <span class="row is-bottom between gap-3">
                ${ShopUI.metric(waiting.length + (printing ? 1 : 0), "pedidos en cola")}
                <span class="stack gap-05 text-right">
                  <span class="t-strong">${printing ? `Imprimiendo #${printing.ticket}` : "Impresora libre"}</span>
                  <span class="t-caption">Espera estimada ${local.queue.waitVirtual} min</span>
                </span>
              </span>
            </a>
            <div class="grid-2 gap-3">
              <a class="shop-tile is-tanda" href="imprenta/tandas.html">
                <span class="row gap-2 t-small fw-semibold">${icon("layers")}Tandas</span>
                ${ShopUI.metric(openTandas.length, openTandas.length === 1 ? "abierta" : "abiertas")}
                <span class="t-caption">${nextClose ? `La próxima cierra ${nextClose.closesAt} h` : "Sin tandas abiertas"}</span>
              </a>
              <a class="shop-tile" href="imprenta/cola.html#retirar">
                <span class="row gap-2 t-small fw-semibold">${icon("package")}Para retirar</span>
                ${ShopUI.metric(ready.length, ready.length === 1 ? "pedido listo" : "pedidos listos")}
                <span class="t-caption">Esperan en el mostrador</span>
              </a>
            </div>
          </div>

          ${UI.card(`
            <div class="stack gap-4">
              <div class="row is-top between gap-2">
                <div class="stack">
                  <span class="t-strong">Cola presencial</span>
                  <span class="t-caption c-secondary">Actualizado ${minutesAgoLabel(local.queue.updatedAt, state.demoClock)}</span>
                </div>
                <span class="t-body c-muted nowrap shrink-0"><span class="fw-semibold c-ink">${local.queue.inPerson}</span> ${local.queue.inPerson === 1 ? "persona" : "personas"}</span>
              </div>
              ${UI.inPersonQueue({ count: local.queue.inPerson })}
              ${UI.button({ label: "Actualizar cola presencial", variant: "outline", size: "md", block: true, action: "openPeopleSheet" })}
            </div>`)}

          <section class="stack gap-3">
            ${UI.sectionHeader("Stock de papel", "Gestionar", "imprenta/stock.html", "h3")}
            <div class="row wrap gap-2">
              ${local.papers.map((paper) => UI.chip(PAPER_NAMES[paper], { tone: stockTone(local.stock[paper]) })).join("")}
            </div>
            <p class="t-caption c-muted">${lowStock.length ? `${plural(lowStock.length, "papel necesita", "papeles necesitan")} reposición.` : "Todo el papel está disponible."} Los estudiantes ven el stock al instante.</p>
          </section>

          <a class="card card-button shop-link-row" href="imprenta/resenas.html">
            <span class="round-icon">${icon("message-square")}</span>
            <span class="stack gap-05 grow">
              <span class="t-strong">Reseñas · ${ratingLabel(local.rating)} ${icon("star", "icon-sm star-on")}</span>
              <span class="t-caption c-secondary">${unanswered ? `${plural(unanswered, "reseña sin responder", "reseñas sin responder")}` : "Respondiste todas las reseñas"}</span>
            </span>
            ${unanswered ? UI.chip(String(unanswered), { tone: "accent" }) : ""}
            <span class="c-muted">${icon("chevron-right")}</span>
          </a>

          <section class="stack gap-3">
            ${UI.sectionHeader("Avisos publicados", "", "", "h3")}
            ${alerts.length
              ? alerts.map((alert) => UI.alertCard(alert, null, "", `<button type="button" class="link t-small" ${on("removeAlert", { id: alert.id })}>Quitar aviso</button>`)).join("")
              : `<div class="soft-box is-compact">No tenés avisos publicados. Usá “Cargar aviso” para contarles algo a los estudiantes.</div>`}
          </section>

          <div class="row between gap-2 divided t-caption c-muted">
            <span>Demo · miércoles 11:20</span>
            <button type="button" class="link fw-semibold c-secondary" ${on("openDemoMenu")}>Menú demo</button>
          </div>
        </div>`,
    });
  },

  sheet(name) {
    if (name === "alert") return AlertSheet.sheet();
    if (name === "people") return InPersonSheet.sheet();
    if (name === "demo") return DemoMenu.sheet();
    return "";
  },

  actions: {
    ...AlertSheet.actions,
    ...InPersonSheet.actions,
    ...DemoMenu.actions,
  },
});
