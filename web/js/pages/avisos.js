// Avisos de los locales: stock, problemas técnicos, descuentos e información.

const FILTERS = [
  { value: "all", label: "Todas" },
  { value: "stock", label: "Stock" },
  { value: "tecnico", label: "Técnicas" },
  { value: "descuento", label: "Descuentos" },
  { value: "info", label: "Info" },
];
const view = { filter: "all" };

App.start({
  render() {
    const state = Store.state;
    const filtered = state.alerts.filter((alert) => view.filter === "all" || alert.kind === view.filter);
    const markRead = unreadAlerts(state) > 0
      ? `<button type="button" class="mark-read" ${on("markAllRead")}>${icon("check-check")}Leídos</button>`
      : "";

    const list = filtered.length
      ? filtered.map((alert) => {
          const local = alert.localId ? localById(state, alert.localId) : null;
          return UI.alertCard(alert, local, local ? `local.html?local=${local.slug}` : "");
        }).join("")
      : UI.emptyState({
          icon: "inbox",
          title: "No hay avisos con este filtro",
          description: "Probá con otra categoría o volvé más tarde.",
          action: UI.button({ label: "Ver todos", variant: "outline", size: "md", action: "setFilter", data: { value: "all" } }),
        });

    return UI.screen({
      title: "Avisos",
      back: "index.html",
      trailing: "Alertas",
      actions: markRead,
      content: `
        <div class="stack gap-5">
          ${UI.pageTitle("Avisos", "Stock, novedades técnicas y promos de los locales de la FADU.")}

          <div class="row wrap gap-2">
            ${FILTERS.map((item) => `
              <button type="button" class="chip-button" aria-pressed="${view.filter === item.value}" ${on("setFilter", { value: item.value })}>
                ${UI.chip(item.label, { tone: view.filter === item.value ? "ink" : "neutral" })}
              </button>`).join("")}
          </div>

          <div class="stack gap-3">
            <div class="row between gap-2">
              ${UI.sectionLabel(`${filtered.length} avisos activos`)}
              ${UI.link("Ver locales", { href: "locales.html" })}
            </div>
            ${list}
          </div>

          <div class="soft-box row is-top gap-2">
            <span class="c-muted icon-offset">${icon("bell")}</span>
            <p>Los avisos los publican los locales. La campana del inicio muestra cuántos no leíste.</p>
          </div>
        </div>`,
    });
  },

  actions: {
    setFilter(button) {
      view.filter = button.dataset.value;
      App.render();
    },

    markAllRead() {
      actions.markAlertsRead();
    },
  },
});
