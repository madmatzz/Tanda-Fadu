// Perfil de un local: cola en vivo, reseñas, mejor momento, stock y datos de contacto.

const FULL_RATINGS = { quality: 5, price: 5, speed: 5 };
const view = { writing: false, ratings: { ...FULL_RATINGS }, text: "", error: "" };

function backHref() {
  if (App.params.get("desde") === "comparar") {
    return Store.state.draft.file ? "comparar.html?desde=validacion" : "comparar.html";
  }
  return "locales.html";
}

const hourLabel = (index) => `${String(OCCUPANCY_HOURS[index]).padStart(2, "0")} h`;

/**
 * Concurrencia de hoy por hora. Las horas que ya pasaron quedan tenues; de las que quedan,
 * verde es la más tranquila y naranja la más llena. Las horas con el local cerrado van como una rayita.
 */
function busyChart(local, busy) {
  const bars = local.occupancy.map((value, index) => {
    const x = 16 + index * 36;
    const label = `<text class="${cx("bar-label", index === busy.now && "is-now")}" x="${x + 13}" y="128" text-anchor="middle">${OCCUPANCY_HOURS[index]}</text>`;
    if (value === null) return `<rect class="bar is-closed" x="${x}" y="104" width="26" height="4" rx="2"/>${label}`;
    const height = Math.max(6, (value / 10) * 84);
    const y = 108 - height;
    const tone = index < busy.now ? "is-past" : index === busy.best ? "is-best" : index === busy.peak ? "is-peak" : "";
    const now = index === busy.now ? `<text class="bar-now" x="${x + 13}" y="${y - 7}" text-anchor="middle">Ahora</text>` : "";
    return `<rect class="${cx("bar", tone)}" x="${x}" y="${y}" width="26" height="${height}" rx="6"/>${now}${label}`;
  }).join("");
  return `<svg class="bar-chart" viewBox="0 0 320 136" role="img" aria-label="Concurrencia de hoy por hora">${bars}</svg>`;
}

/** Recomendación del gráfico de concurrencia, en una frase. */
function busyAdvice(busy) {
  if (busy.best === null) return "El local ya cerró por hoy.";
  const avoid = busy.peak !== busy.best ? ` Evitá las ${hourLabel(busy.peak)}, cuando más se llena.` : "";
  if (busy.best === busy.now) return `Ahora es un buen momento: es lo más tranquilo que queda hoy.${avoid}`;
  return `Lo más tranquilo que queda hoy es a las ${hourLabel(busy.best)}.${avoid}`;
}

/** Encabezado de las tarjetas de cola: igual que en el seguimiento del pedido. */
function queueHeader(title, caption, people) {
  return `
    <div class="row is-top between gap-2">
      <div class="stack">
        <span class="t-strong">${title}</span>
        <span class="t-caption c-secondary">${caption}</span>
      </div>
      <span class="t-body c-muted nowrap shrink-0"><span class="fw-semibold c-ink">${people}</span> ${people === 1 ? "persona" : "personas"}</span>
    </div>`;
}

function reviewCard(review) {
  const reply = review.reply
    ? `
      <div class="divider"></div>
      <div class="soft-box is-compact row is-top gap-2">
        <span class="c-secondary">${icon("store")}</span>
        <div class="stack gap-1">
          <p class="t-small fw-semibold c-ink">Respuesta del local</p>
          <p class="t-small">${esc(review.reply)}</p>
        </div>
      </div>`
    : "";
  return UI.card(`
    <div class="stack gap-3">
      <div class="row is-top between gap-3">
        ${UI.stars(review.rating, { showValue: true, valueLabel: `${ratingLabel(review.rating)}/5` })}
        <span class="t-caption c-muted">${minutesAgoLabel(review.createdAt, DEMO_CLOCK)}</span>
      </div>
      <p class="t-body">“${esc(review.text)}”</p>
      <p class="t-small fw-semibold c-secondary">${esc(review.author)}</p>
      ${reply}
    </div>`);
}

function ratingSummary(local, compact = false) {
  return `
    <div class="${cx("rating-summary", compact && "is-compact")}">
      <span class="t-big">${ratingLabel(local.rating)}</span>
      <div class="stack gap-1">
        ${UI.stars(local.rating)}
        <span class="t-small c-secondary">${local.reviewCount} reseñas</span>
      </div>
    </div>`;
}

/** Reseña nueva: un puntaje de 1 a 5 para cada aspecto (de ahí sale la valoración del local). */
function reviewComposer() {
  const aspectRow = ({ key, label }) => {
    const current = view.ratings[key];
    const stars = [1, 2, 3, 4, 5].map((value) => `
      <button type="button" class="star-button" id="star-${key}-${value}" aria-label="${label}: ${plural(value, "estrella", "estrellas")}"
        aria-pressed="${current === value}" ${on("setRating", { aspect: key, value })}>
        ${icon("star", cx("icon-lg", value <= current ? "star-on" : "star-off"))}
      </button>`).join("");
    return `
      <div class="row between gap-3">
        <span class="t-body">${label}</span>
        <div class="row" role="group" aria-label="${label}, de 1 a 5">${stars}</div>
      </div>`;
  };

  return `
    <div class="stack gap-4">
      <div class="stack gap-2">
        <div class="row between gap-2">
          <span class="form-label">Tu puntaje</span>
          <span class="row gap-1 t-strong">${icon("star", "icon-sm star-on")}${ratingLabel(averageRating(view.ratings))}/5</span>
        </div>
        <div class="stack gap-1">${RATING_ASPECTS.map(aspectRow).join("")}</div>
      </div>
      ${UI.textareaField({
        id: "review-text",
        label: "Tu reseña",
        value: view.text,
        placeholder: "¿Cómo fue la atención, la calidad y la espera?",
        maxlength: 280,
        hint: `${view.text.length}/280 caracteres`,
        input: "changeReviewText",
      })}
      ${view.error ? UI.note({ text: view.error }) : ""}
      <div class="stack gap-2">
        ${UI.button({ label: "Publicar reseña", size: "md", block: true, action: "submitReview" })}
        ${UI.button({ label: "Cancelar", variant: "outline", size: "md", block: true, action: "cancelReview" })}
      </div>
    </div>`;
}

App.start({
  init() {
    const local = localById(Store.state, App.params.get("local") || "");
    if (local) document.title = `${local.name} · Tanda`;
  },

  render() {
    const state = Store.state;
    const local = localById(state, App.params.get("local") || "");

    if (!local) {
      return UI.screen({
        title: "Local",
        back: "locales.html",
        trailing: "Locales",
        content: UI.emptyState({
          icon: "map-pin",
          title: "No encontramos este local",
          description: "Puede que ya no esté disponible en la demo.",
          action: UI.button({ label: "Ver locales", variant: "outline", size: "md", href: "locales.html" }),
        }),
      });
    }

    const saved = state.savedLocalIds.includes(local.id);
    const alerts = state.alerts.filter((alert) => alert.localId === local.id);
    const reviews = localReviews(state, local.id);
    const busy = busyHours(local, state.demoClock);
    // Desde la comparación (con un pedido en curso) se elige este local y se sigue al pago.
    // Desde el mapa o cualquier otro lado, "Imprimir acá" arranca un pedido nuevo en este local.
    const choosing = App.params.get("desde") === "comparar" && Boolean(state.draft.file);

    // Encabezado: foto del frente (si hay) con el estado encima, y una caja con nombre y valoración.
    // Sin foto, el estado va dentro de la caja.
    const openChip = UI.chip("Abierto", { tone: "success" });
    const hero = `
      <section class="${cx("local-hero", local.photo && "has-photo")}">
        ${local.photo ? `
          <div class="local-photo">
            <img src="${local.photo}" alt="Frente de ${local.name}">
            <span class="local-photo-status">${openChip}</span>
          </div>` : ""}
        <div class="${cx("local-hero-card", `is-${local.tone}`)}">
          <div class="local-hero-orb" aria-hidden="true"></div>
          <div class="row gap-3 local-hero-content">
            <span class="${cx("local-hero-logo", local.logo && "has-image")}">
              ${local.logo ? `<img src="${local.logo}" alt="">` : `<span class="t-h3">${local.initials}</span>`}
            </span>
            <div class="stack gap-1 grow">
              <h1 class="t-h2">${local.name}</h1>
              <p class="row wrap gap-2 t-small local-hero-meta">
                <span class="row gap-1 fw-semibold">${icon("star", "icon-sm")}${ratingLabel(local.rating)}</span>
                <span class="is-faded">${local.reviewCount} reseñas · ${local.floorLabel}</span>
              </p>
              ${local.photo ? "" : `<span class="row">${openChip}</span>`}
            </div>
            <button type="button" class="icon-btn is-sm" aria-label="${saved ? "Quitar de guardados" : "Guardar local"}" ${on("toggleSaved")}>
              ${icon("heart", cx("icon", saved && "heart-on"))}
            </button>
          </div>
        </div>
      </section>`;

    const contactRow = (iconName, title, text) => `
      <div class="row is-top gap-3">
        <span class="c-accent icon-offset">${icon(iconName)}</span>
        <div class="stack gap-05">
          <span class="t-strong">${title}</span>
          <span class="t-small c-secondary">${text}</span>
        </div>
      </div>`;

    return UI.screen({
      title: local.name,
      back: backHref(),
      trailing: "Local",
      footer: choosing
        ? `
          <div class="row gap-2">
            ${UI.button({ label: "Volver", variant: "outline", size: "md", block: true, href: backHref() })}
            ${UI.button({ label: "Elegir este local", size: "md", block: true, action: "chooseLocal" })}
          </div>`
        : UI.button({ label: "Imprimir acá", icon: "printer", block: true, action: "printHere" }),
      content: `
        <div class="stack gap-5">
          ${hero}

          ${alerts.length ? `<div class="stack gap-2">${alerts.map((alert) => UI.alertCard(alert, local)).join("")}</div>` : ""}

          <section class="stack gap-3">
            <div class="row between gap-2">
              <h2 class="t-h2">Cola en vivo</h2>
              ${UI.chip("En vivo", { tone: "info" })}
            </div>
            ${UI.card(`
              <div class="stack gap-4">
                ${queueHeader("Cola virtual", "Pedidos cargados en la app", local.queue.virtual)}
                ${UI.virtualQueue(local.queue.printing, { self: false, waiting: local.queue.virtual })}
                ${UI.keyValue("Espera estimada", `${local.queue.waitVirtual} min`, true)}
              </div>`)}
            ${UI.card(`
              <div class="stack gap-4">
                ${queueHeader("Cola presencial", `Actualizado ${minutesAgoLabel(local.queue.updatedAt, state.demoClock)}`, local.queue.inPerson)}
                ${UI.inPersonQueue({ count: local.queue.inPerson })}
                ${UI.keyValue("Espera estimada", `${local.queue.waitInPerson} min`, true)}
                ${UI.button({ label: "Informar cola", variant: "outline", size: "md", block: true, action: "openReport", data: { id: local.id } })}
              </div>`)}
          </section>

          <section class="stack gap-3">
            <div class="row is-bottom between gap-2">
              <h2 class="t-h2">Reseñas</h2>
              ${UI.link("Ver todas", { action: "openReviews" })}
            </div>
            ${ratingSummary(local)}
            ${reviews.slice(0, 2).map(reviewCard).join("")}
            ${UI.button({ label: "Escribir una reseña", variant: "soft", size: "md", block: true, action: "writeReview" })}
          </section>

          ${UI.card(`
            <div class="stack gap-3">
              <div class="stack gap-05">
                ${UI.sectionLabel("Valoración del local")}
                <span class="t-caption c-muted">Promedio de lo que puntúan los estudiantes en cada reseña.</span>
              </div>
              ${ratingBreakdown(local).map((item) => UI.progress({
                value: item.value * 20,
                tone: "success",
                label: item.label,
                valueLabel: `${ratingLabel(item.value)}/5`,
              })).join("")}
            </div>`)}

          ${UI.card(`
            <div class="stack gap-3">
              <div class="row is-top between gap-2">
                <div class="stack gap-1">
                  ${UI.sectionLabel("Concurrencia de hoy")}
                  <h2 class="t-h2">¿Cuándo conviene ir?</h2>
                </div>
                ${busy.best === null ? "" : UI.chip(busy.best === busy.now ? "Ahora" : hourLabel(busy.best), { tone: "success", icon: "clock" })}
              </div>
              ${busyChart(local, busy)}
              <div class="row gap-4 t-caption c-secondary">
                <span class="row gap-1"><span class="legend-dot is-best"></span>Más tranquilo</span>
                <span class="row gap-1"><span class="legend-dot is-peak"></span>Más lleno</span>
              </div>
              <p class="t-small c-secondary">${busyAdvice(busy)}</p>
            </div>`)}

          ${UI.card(`
            <div class="stack gap-3">
              ${UI.sectionLabel("Papel y stock")}
              <div class="row wrap gap-2">
                ${local.papers.map((paper) => UI.chip(PAPER_NAMES[paper], { tone: stockTone(local.stock[paper]) })).join("")}
              </div>
              <div class="row wrap gap-2 t-caption c-muted">
                <span>B&N y color</span><span aria-hidden="true">·</span><span>A3 disponible</span><span aria-hidden="true">·</span><span>Actualizado hace poco</span>
              </div>
            </div>`)}

          ${UI.card(`
            <div class="stack gap-3">
              ${UI.sectionLabel("Dónde y cuándo")}
              ${contactRow("map-pin", local.floorLabel, "FADU · Ciudad Universitaria")}
              <div class="divider"></div>
              ${contactRow("clock", "Horario", local.hours)}
              <div class="divider"></div>
              ${contactRow("phone", "Teléfono", local.phone)}
              <div class="divider"></div>
              ${UI.button({ label: "Ver en el mapa", icon: "map", variant: "outline", size: "md", block: true, href: `locales.html?local=${local.slug}` })}
            </div>`)}

          <p class="t-caption c-muted">${local.reviewCount} estudiantes ya reseñaron este local. Los datos son ficticios para la demo.</p>
        </div>`,
    });
  },

  sheet(name) {
    const local = localById(Store.state, App.params.get("local") || "");
    if (name === "report") return ReportSheet.sheet();
    if (name !== "reviews") return "";
    if (view.writing) {
      return UI.sheet({
        title: `Reseñar ${local.name}`,
        description: "Contá cómo fue tu experiencia.",
        content: reviewComposer(),
      });
    }
    return UI.sheet({
      title: `Reseñas de ${local.name}`,
      description: `${ratingLabel(local.rating)} de 5 · ${local.reviewCount} reseñas`,
      content: `
        <div class="stack gap-3">
          ${ratingSummary(local, true)}
          ${localReviews(Store.state, local.id).map(reviewCard).join("")}
          ${UI.button({ label: "Escribir una reseña", size: "md", block: true, action: "writeReview" })}
        </div>`,
    });
  },

  actions: {
    ...ReportSheet.actions,

    toggleSaved() {
      actions.toggleSavedLocal(localById(Store.state, App.params.get("local")).id);
    },

    /** Pedido nuevo con este local ya elegido: se salta la comparación y va directo al pago. */
    printHere() {
      App.go(`imprimir.html?nuevo=1&local=${App.params.get("local")}`);
    },

    /** Elige este local para el pedido en curso y vuelve al pago. */
    chooseLocal() {
      App.go("pago.html?desde=comparar");
      actions.selectLocal(localById(Store.state, App.params.get("local")).id);
    },

    openReviews() {
      view.writing = false;
      App.openSheet("reviews");
    },

    writeReview() {
      view.writing = true;
      view.error = "";
      App.openSheet("reviews");
    },

    cancelReview() {
      view.writing = false;
      App.render();
    },

    setRating(button) {
      view.ratings[button.dataset.aspect] = Number(button.dataset.value);
      App.render();
    },

    changeReviewText(textarea) {
      view.text = textarea.value;
      App.render();
    },

    submitReview() {
      if (view.text.trim().length < 4) {
        view.error = "Escribí al menos unas palabras sobre tu experiencia.";
        App.render();
        return;
      }
      const local = localById(Store.state, App.params.get("local"));
      App.openSheetName = null;
      actions.addReview(local.id, view.ratings, view.text.trim());
      Object.assign(view, { writing: false, ratings: { ...FULL_RATINGS }, text: "", error: "" });
      App.render();
    },
  },
});
