// Mi perfil: datos del estudiante, locales guardados, preferencias y controles de la demo.

App.start({
  render() {
    const state = Store.state;
    const savedLocals = state.savedLocalIds.map((id) => localById(state, id)).filter(Boolean);
    const orders = userOrders(state);
    const reviews = state.reviews.filter((review) => review.author === USER_NAME);

    const stat = (value, label) => `
      <div class="profile-stat">
        <span class="t-h2">${value}</span>
        <span class="t-caption c-secondary">${label}</span>
      </div>`;

    const saved = savedLocals.length
      ? `<div class="stack gap-2">
          ${savedLocals.map((local) => `
            <div class="card saved-local">
              ${UI.localLogo(local)}
              <a class="stack gap-05 grow" href="local.html?local=${local.slug}">
                <span class="t-strong truncate">${local.name}</span>
                <span class="t-caption c-secondary">${local.floorLabel} · ${local.tagline}</span>
              </a>
              <button type="button" class="ghost-btn is-heart" aria-label="Quitar ${local.name} de guardados" ${on("removeSaved", { id: local.id })}>
                ${icon("heart", "icon heart-on")}
              </button>
            </div>`).join("")}
        </div>`
      : UI.emptyState({
          icon: "heart",
          title: "No guardaste locales todavía",
          description: "Tocá el corazón en un local para tenerlo a mano.",
          action: UI.button({ label: "Ver locales", variant: "outline", size: "md", href: "locales.html" }),
        });

    const preference = (iconName, label, value) => `
      <div class="row between gap-3">
        <span class="row gap-2 t-body c-secondary">${icon(iconName)}${label}</span>
        <span class="t-strong">${value}</span>
      </div>`;

    return UI.screen({
      title: "Mi perfil",
      back: "index.html",
      trailing: "Perfil",
      content: `
        <div class="stack gap-6">
          ${UI.pageTitle("Mi perfil", "Tus datos demo, locales guardados y preferencias.")}

          ${UI.card(`
            <div class="row gap-4">
              <span class="avatar t-h2">LP</span>
              <div class="stack gap-1 grow">
                <div class="row gap-2">
                  <p class="t-h2 truncate">${USER_NAME}</p>
                  ${UI.chip("Estudiante", { tone: "accent" })}
                </div>
                <p class="t-small c-secondary">lucia.perez@fadu.uba.ar</p>
                <p class="t-caption c-muted">Legajo 108.245 · Diseño Gráfico</p>
              </div>
            </div>`)}

          <div class="grid-3 gap-2">
            ${stat(orders.length, "Pedidos")}
            ${stat(savedLocals.length, "Guardados")}
            ${stat(reviews.length, "Reseñas")}
          </div>

          <section class="stack gap-3">
            ${UI.sectionHeader("Locales guardados", "Buscar más", "locales.html")}
            ${saved}
          </section>

          <section class="stack gap-3">
            <h2 class="t-h2">Preferencias</h2>
            ${UI.card(`
              <div class="stack gap-3">
                ${preference("book-open", "Papel preferido", "Obra 80g")}
                <div class="divider"></div>
                ${preference("user-round", "Pago preferido", "MercadoPago")}
              </div>`)}
          </section>

          <section class="stack gap-3">
            ${UI.sectionLabel("Controles de demo")}
            <div class="stack gap-2">
              ${UI.button({ label: "Abrir menú demo", variant: "outline", size: "md", block: true, action: "openDemoMenu" })}
              ${UI.button({ label: "Reiniciar demo", variant: "soft", size: "md", icon: "rotate-ccw", block: true, action: "demoReset" })}
            </div>
          </section>
        </div>`,
    });
  },

  sheet(name) {
    if (name === "demo") return DemoMenu.sheet();
    return "";
  },

  actions: {
    ...DemoMenu.actions,

    removeSaved(button) {
      actions.toggleSavedLocal(button.dataset.id);
    },
  },
});
