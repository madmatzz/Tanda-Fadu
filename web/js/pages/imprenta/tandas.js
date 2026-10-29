// Imprenta · Tandas: los grupos de pedidos iguales del local, para imprimirlos juntos.

function shopTandaCard(tanda, orders) {
  const pages = orders.reduce((sum, order) => sum + order.specs.pages, 0);
  const status = tanda.printed
    ? UI.chip("Impresa", { tone: "success", icon: "check" })
    : tandaClosed(tanda) ? UI.chip("Completa", { tone: "warning" }) : UI.chip(`Cierra ${tanda.closesAt} h`, { tone: "tanda", icon: "clock" });
  return `
    <a class="${cx("card card-button shop-tanda", !tanda.printed && "is-open")}" href="imprenta/tanda.html?id=${tanda.id}">
      <span class="row is-top between gap-2">
        <span class="stack gap-05">
          <span class="t-h3">${tanda.label}</span>
          <span class="t-small c-secondary">${tandaShopTitle(tanda)}</span>
        </span>
        ${status}
      </span>
      ${UI.progress({ value: (tanda.participants / tanda.capacity) * 100, label: "Cupo", valueLabel: `${tanda.participants}/${tanda.capacity}` })}
      <span class="row between gap-2 t-caption c-muted">
        <span>${plural(orders.length, "pedido", "pedidos")} · ${plural(pages, "página", "páginas")}</span>
        <span>${PAPER_LABELS[tanda.paper]} ${tanda.grammage}g</span>
      </span>
    </a>`;
}

App.start({
  render() {
    const state = Store.state;
    const tandas = localTandas(state, SHOP_LOCAL_ID).sort((a, b) => Number(Boolean(a.printed)) - Number(Boolean(b.printed)) || a.closesAt.localeCompare(b.closesAt));
    const open = tandas.filter((tanda) => !tandaClosed(tanda));

    return ShopUI.screen({
      tab: "tandas",
      content: `
        <div class="stack gap-5">
          ${UI.pageTitle("Tandas", `${plural(open.length, "tanda abierta", "tandas abiertas")} · se imprimen juntas al cerrar`)}
          <div class="stack gap-3">
            ${tandas.map((tanda) => shopTandaCard(tanda, tandaOrders(state, tanda.id))).join("")}
          </div>
          <div class="soft-box">
            Una tanda junta pedidos con la misma configuración. Se cierra cuando se completa el cupo o llega
            el horario límite, y la imprimís de una sola vez: ahorrás tiempo y papel.
          </div>
        </div>`,
    });
  },
});
