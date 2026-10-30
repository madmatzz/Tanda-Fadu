// Inicio: accesos principales, últimos pedidos y tandas destacadas.

/** Cada cuánto pasa sola a la tanda siguiente el carrusel de "Tandas ya!". */
const PROMO_INTERVAL = 3500;

/** Tarjeta de una tanda dentro del bloque violeta. */
function tandaPromoCard(tanda, local, clock) {
  const fill = Math.round((tanda.participants / tanda.capacity) * 100);
  return `
    <a class="tanda-promo-card" href="tandas.html?tanda=${tanda.id}">
      <span class="row between gap-2">
        <span class="t-label">${tanda.label}</span>
        <span class="row gap-1 t-caption fw-semibold">${icon("clock", "icon-sm")}Cierra en ${closesIn(tanda.closesAt, clock)}</span>
      </span>
      <span class="stack gap-05">
        <span class="t-h3">${tanda.size} · ${modeShort(tanda.mode)}</span>
        <span class="t-small is-faded">${tanda.minPages} a ${tanda.maxPages} páginas · ${PAPER_LABELS[tanda.paper]} ${tanda.grammage}g</span>
      </span>
      <span class="tanda-promo-bar" aria-hidden="true"><span style="width: ${fill}%"></span></span>
      <span class="row between gap-2 t-small">
        <span class="fw-semibold">${local.name}</span>
        <span class="is-faded">${tanda.participants}/${tanda.capacity} pedidos</span>
      </span>
    </a>`;
}

/** Puntitos debajo del carrusel: marcan qué tanda se está viendo. */
function markPromoDot(track) {
  const cards = [...track.children];
  const index = cards.findIndex((card) => card.offsetLeft - track.offsetLeft + card.offsetWidth / 2 > track.scrollLeft);
  document.querySelectorAll(".tandas-promo-dots span").forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === Math.max(0, index));
  });
}

/**
 * El carrusel avanza solo hacia la derecha y, al llegar a la última, vuelve a la primera.
 * Se frena mientras el usuario lo toca o tiene el mouse encima.
 */
function startPromoCarousel() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let paused = false;
  document.addEventListener("pointerover", (event) => {
    paused = Boolean(event.target.closest(".tandas-track"));
  });
  document.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".tandas-track")) paused = true;
  });

  setInterval(() => {
    const track = document.getElementById("tandas-track");
    if (!track || paused || document.hidden) return;
    const step = track.firstElementChild.offsetWidth + parseFloat(getComputedStyle(track).columnGap || 0);
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + step, behavior: "smooth" });
  }, PROMO_INTERVAL);
}

App.start({
  init() {
    startPromoCarousel();
    document.addEventListener("scroll", (event) => {
      if (event.target.id === "tandas-track") markPromoDot(event.target);
    }, true);
  },

  render() {
    const state = Store.state;
    const orders = userOrders(state);
    const active = activeUserOrder(state);
    const hasUnread = unreadAlerts(state) > 0;

    const headerActions = `
      <span class="badge-wrap">
        ${UI.iconButton({ label: "Ver avisos", icon: "bell", href: "avisos.html" })}
        ${hasUnread ? '<span class="badge-dot"></span>' : ""}
      </span>
      ${UI.chip("Inicio")}
      <a class="chip-button" href="perfil.html" aria-label="Mi perfil">${UI.chip("Mi perfil", { tone: "accent" })}</a>`;

    const recentOrders = orders.length
      ? `<div class="stack gap-2">${orders.slice(0, 2).map((order) => UI.orderRow(order, localById(state, order.localId))).join("")}</div>`
      : UI.emptyState({
          icon: "printer",
          title: "Todavía no hiciste pedidos",
          description: "Cuando imprimas, vas a poder seguir la cola desde acá.",
          action: UI.button({ label: "Empezar", variant: "soft", size: "md", href: "imprimir.html?nuevo=1" }),
        });

    // Las tres tandas que cierran más pronto: la idea es sumarse antes de que desaparezcan.
    const promoTandas = state.tandas.filter((tanda) => !tandaClosed(tanda)).sort((a, b) => a.closesAt.localeCompare(b.closesAt)).slice(0, 3);
    const promoCards = promoTandas
      .map((tanda) => tandaPromoCard(tanda, localById(state, tanda.localId), state.demoClock))
      .join("");

    const floatingOrder = active
      ? `
        <div class="floating-order">
          <div class="card card-ink card-flush">
            <div class="row gap-3 floating-order-body">
              <span class="round-icon is-sm is-on-ink">${icon("printer")}</span>
              <div class="stack grow">
                <span class="t-small fw-semibold">Pedido #${active.ticket} en curso</span>
                <span class="row gap-1 t-caption is-faded">${icon("clock", "icon-sm")}Listo en unos minutos</span>
              </div>
              ${UI.button({ label: "Mi pedido", variant: "accent", size: "md", href: `pedido.html?id=${active.id}` })}
            </div>
          </div>
        </div>`
      : "";

    return UI.screen({
      title: '<img class="brand-mark" src="img/logo-tanda.svg" alt="Tanda">',
      actions: headerActions,
      content: `
        <div class="stack gap-6">
          <div class="stack gap-3">
            ${UI.sectionLabel("¿Qué querés hacer?")}
            <a class="action-card is-ink" href="imprimir.html?nuevo=1">
              <span class="action-card-icon">${icon("printer", "icon-lg")}</span>
              <span class="t-h3">Imprimir</span>
            </a>
            <div class="grid-2 gap-3">
              <a class="action-card is-compact" href="locales.html">
                <span class="action-card-icon">${icon("map-pin", "icon-lg")}</span>
                <span class="t-h3">Buscar locales</span>
              </a>
              <a class="action-card is-compact is-tanda" href="tandas.html">
                <span class="action-card-icon">${icon("layers", "icon-lg")}</span>
                <span class="t-h3">Tandas disponibles</span>
              </a>
            </div>
          </div>

          <section class="stack gap-3">
            ${UI.sectionHeader("Últimos pedidos", "Ver todos", "pedidos.html", "h3")}
            ${recentOrders}
          </section>

          ${floatingOrder}

          <section class="tandas-promo">
            <div class="row is-bottom between gap-2">
              <h2 class="t-h2">Tandas ya!</h2>
              <a class="tandas-promo-link t-small fw-semibold" href="tandas.html">Ver todas</a>
            </div>
            <div class="tandas-track" id="tandas-track" data-scroll-x>${promoCards}</div>
            <div class="tandas-promo-dots" aria-hidden="true">
              ${promoTandas.map((tanda, index) => `<span class="${index === 0 ? "is-active" : ""}"></span>`).join("")}
            </div>
            <div class="stack gap-1 tandas-promo-footer t-caption">
              <div class="row between gap-2">
                <span>Locales en FADU · Ciudad Universitaria</span>
                <button type="button" class="link fw-semibold" ${on("openDemoMenu")}>Menú demo</button>
              </div>
              <span>Demo · miércoles 11:20</span>
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
  },
});
