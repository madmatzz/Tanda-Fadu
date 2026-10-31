// Imprenta · Mi local: cómo lo ven los estudiantes y los datos que se pueden editar.

const local0 = shopLocal(Store.state);
// Lo que se está escribiendo; se guarda en el local recién con "Guardar cambios".
const form = { name: local0.name, tagline: local0.tagline, hours: local0.hours, phone: local0.phone };
const view = { saved: false, error: "" };

function hasChanges(local) {
  return Object.keys(form).some((key) => form[key].trim() !== local[key]);
}

App.start({
  render() {
    const state = Store.state;
    const local = shopLocal(state);
    const changed = hasChanges(local);

    const linkRow = (iconName, title, text, href) => `
      <a class="card card-button shop-link-row" href="${href}">
        <span class="round-icon">${icon(iconName)}</span>
        <span class="stack gap-05 grow">
          <span class="t-strong">${title}</span>
          <span class="t-caption c-secondary">${text}</span>
        </span>
        <span class="c-muted">${icon("chevron-right")}</span>
      </a>`;
    const lowStock = local.papers.filter((paper) => local.stock[paper] !== "ok").length;
    const unanswered = localReviews(state, local.id).filter((review) => !review.reply).length;

    return ShopUI.screen({
      tab: "local",
      content: `
        <div class="stack gap-5">
          ${UI.pageTitle("Mi local", "Así te ven los estudiantes en Tanda.")}

          <section class="shop-preview">
            ${local.photo ? `<img class="shop-preview-photo" src="${local.photo}" alt="Frente de ${local.name}">` : ""}
            <div class="row gap-3 shop-preview-body">
              ${UI.localLogo(local)}
              <div class="stack gap-05 grow">
                <span class="t-h3 truncate">${local.name}</span>
                <span class="row gap-1 t-small c-secondary">${icon("star", "icon-sm star-on")}${ratingLabel(local.rating)} · ${local.reviewCount} reseñas · ${local.floorLabel}</span>
              </div>
              ${UI.button({ label: "Ver", icon: "eye", variant: "soft", size: "sm", href: `local.html?local=${local.slug}` })}
            </div>
          </section>

          ${UI.card(`
            <div class="stack gap-4">
              <p class="t-h3">Datos del local</p>
              ${UI.textField({ id: "local-name", label: "Nombre", value: form.name, maxlength: 40, input: "setField" })}
              ${UI.textField({ id: "local-tagline", label: "Descripción corta", value: form.tagline, maxlength: 40, hint: "Aparece en la lista de locales.", input: "setField" })}
              ${UI.textField({ id: "local-hours", label: "Horario", value: form.hours, maxlength: 60, input: "setField" })}
              ${UI.textField({ id: "local-phone", label: "Teléfono", value: form.phone, maxlength: 20, inputmode: "tel", input: "setField" })}
              ${view.error ? UI.note({ text: view.error }) : ""}
              ${UI.button({ label: view.saved && !changed ? "Cambios guardados" : "Guardar cambios", icon: view.saved && !changed ? "check" : "", size: "md", block: true, disabled: !changed, action: "save" })}
            </div>`)}

          <section class="stack gap-2">
            ${UI.sectionLabel("Administrar")}
            ${linkRow("package", "Stock de papel", lowStock ? `${plural(lowStock, "papel con poco o sin stock", "papeles con poco o sin stock")}` : "Todo disponible", "imprenta/stock.html")}
            ${linkRow("message-square", "Reseñas", unanswered ? `${plural(unanswered, "sin responder", "sin responder")}` : "Todas respondidas", "imprenta/resenas.html")}
          </section>

          <div class="row between gap-2 divided t-caption c-muted">
            <span>Demo · ${local.floorLabel} · FADU</span>
            <button type="button" class="link fw-semibold c-secondary" ${on("openDemoMenu")}>Menú demo</button>
          </div>
        </div>`,
    });
  },

  sheet(name) {
    if (name === "demo") return DemoMenu.sheet();
    return "";
  },

  actions: {
    ...DemoMenu.actions,

    /** Los campos se llaman local-name, local-tagline…: lo que sigue al guion es el dato. */
    setField(input) {
      form[input.id.replace("local-", "")] = input.value;
      view.saved = false;
      view.error = "";
      App.render();
    },

    save() {
      if (form.name.trim().length < 2) {
        view.error = "El local necesita un nombre.";
        App.render();
        return;
      }
      view.saved = true;
      actions.updateLocal(SHOP_LOCAL_ID, form);
    },
  },
});
