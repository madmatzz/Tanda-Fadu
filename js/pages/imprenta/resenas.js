// Imprenta · Reseñas: la valoración del local y las reseñas, con la opción de responderlas.

const view = { filter: "all", replyingId: null, text: "", error: "" };

function shopReviewCard(review) {
  const reply = review.reply
    ? `
      <div class="soft-box is-compact stack gap-1">
        <p class="t-small fw-semibold c-ink">Tu respuesta</p>
        <p class="t-small">${esc(review.reply)}</p>
      </div>`
    : UI.button({ label: "Responder", icon: "message-square", variant: "soft", size: "sm", action: "openReply", data: { id: review.id } });
  return UI.card(`
    <div class="stack gap-3">
      <div class="row is-top between gap-3">
        ${UI.stars(review.rating, { showValue: true, valueLabel: `${ratingLabel(review.rating)}/5` })}
        <span class="t-caption c-muted">${minutesAgoLabel(review.createdAt, DEMO_CLOCK)}</span>
      </div>
      <p class="t-body">“${esc(review.text)}”</p>
      <p class="t-small fw-semibold c-secondary">${esc(review.author)}</p>
      <div class="row">${reply}</div>
    </div>`);
}

App.start({
  render() {
    const state = Store.state;
    const local = shopLocal(state);
    const reviews = localReviews(state, local.id);
    const unanswered = reviews.filter((review) => !review.reply);
    const shown = view.filter === "all" ? reviews : unanswered;

    return ShopUI.screen({
      title: "Reseñas",
      back: "imprenta/local.html",
      content: `
        <div class="stack gap-5">
          ${UI.pageTitle("Reseñas", `Lo que dicen los estudiantes de ${local.name}.`)}

          ${UI.card(`
            <div class="stack gap-4">
              <div class="row gap-4">
                <span class="t-big">${ratingLabel(local.rating)}</span>
                <div class="stack gap-1">
                  ${UI.stars(local.rating)}
                  <span class="t-small c-secondary">${local.reviewCount} reseñas</span>
                </div>
              </div>
              ${ratingBreakdown(local).map((item) => UI.progress({ value: item.value * 20, tone: "success", label: item.label, valueLabel: `${ratingLabel(item.value)}/5` })).join("")}
            </div>`)}

          ${UI.segmented({
            name: "filter",
            label: "Filtrar reseñas",
            value: view.filter,
            change: "setFilter",
            options: [
              { value: "all", label: `Todas (${reviews.length})` },
              { value: "pending", label: `Sin responder (${unanswered.length})` },
            ],
          })}

          ${shown.length
            ? `<div class="stack gap-3">${shown.map(shopReviewCard).join("")}</div>`
            : UI.emptyState({ icon: "check-check", title: "Respondiste todas", description: "Cuando un estudiante deje una reseña nueva, la vas a ver acá." })}
        </div>`,
    });
  },

  sheet(name) {
    if (name !== "reply") return "";
    const review = Store.state.reviews.find((item) => item.id === view.replyingId);
    return UI.sheet({
      title: "Responder reseña",
      description: `Reseña de ${esc(review.author)}`,
      content: `
        <div class="stack gap-4">
          <div class="soft-box is-compact stack gap-2">
            ${UI.stars(review.rating, { showValue: true, valueLabel: `${ratingLabel(review.rating)}/5` })}
            <p class="t-body c-ink">“${esc(review.text)}”</p>
          </div>
          ${UI.textareaField({ id: "reply-text", label: "Tu respuesta", value: view.text, placeholder: "¡Gracias por la reseña! Te esperamos en la próxima entrega.", maxlength: 220, hint: `${view.text.length}/220 caracteres`, input: "setReplyText" })}
          ${view.error ? UI.note({ text: view.error }) : ""}
          <p class="t-caption c-muted">La respuesta se ve en el perfil del local, debajo de la reseña.</p>
        </div>`,
      footer: UI.button({ label: "Publicar respuesta", block: true, action: "publishReply" }),
    });
  },

  actions: {
    setFilter(input) {
      view.filter = input.value;
      App.render();
    },

    openReply(button) {
      Object.assign(view, { replyingId: button.dataset.id, text: "", error: "" });
      App.openSheet("reply");
    },

    setReplyText(textarea) {
      view.text = textarea.value;
      App.render();
    },

    publishReply() {
      if (view.text.trim().length < 4) {
        view.error = "Escribí una respuesta breve antes de publicar.";
        App.render();
        return;
      }
      App.openSheetName = null;
      actions.replyReview(view.replyingId, view.text.trim());
    },
  },
});
