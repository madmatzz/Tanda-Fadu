// Componentes de interfaz. Cada función devuelve el HTML de un componente como texto,
// y las pantallas los combinan. Los estilos de cada uno están en css/components.css.
//
// Importante: todo texto que escribe el usuario (nombres de archivo, observaciones,
// reseñas) tiene que pasar por esc() antes de ponerse en el HTML.

/** Escapa caracteres especiales para mostrar texto del usuario sin riesgo. */
function esc(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Une clases CSS, salteando las vacías: cx("btn", active && "is-active"). */
function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Atributos para conectar un elemento con una acción de la pantalla.
 * on("removeFile") → data-action="removeFile"
 * on("selectLocal", { id: "el-poli" }) → data-action="selectLocal" data-id="el-poli"
 */
function on(action, data = {}) {
  const extra = Object.entries(data).map(([key, value]) => ` data-${key}="${esc(value)}"`).join("");
  return `data-action="${action}"${extra}`;
}

const UI = {
  // ---------- Estructura de pantalla ----------

  statusBar(tone = "bg") {
    return `
      <div class="${cx("status-bar", tone === "surface" && "is-surface")}" aria-hidden="true">
        <span class="t-strong">9:41</span>
        <span class="status-bar-island"></span>
        <span class="row gap-2">${icon("signal-high")}${icon("wifi")}${icon("battery-full", "icon-lg")}</span>
      </div>`;
  },

  /**
   * Pantalla completa: encabezado, contenido y pie fijo opcional.
   * back: link del botón volver · trailing: etiqueta gris a la derecha · actions: HTML extra del encabezado.
   */
  screen({ title, back, trailing, actions = "", content, footer, hideHeader = false }) {
    const header = hideHeader
      ? ""
      : `
        <header class="header">
          <div class="header-left">
            ${back ? `<a class="icon-btn" href="${back}" aria-label="Volver">${icon("arrow-left", "icon-lg")}</a>` : ""}
            <span class="header-title t-h3">${title}</span>
          </div>
          <div class="row gap-2 shrink-0">
            ${actions}
            ${trailing ? UI.chip(trailing) : ""}
          </div>
        </header>`;
    return `
      <div class="screen">
        ${header}
        <main class="content">${content}</main>
        ${footer ? `<div class="footer">${footer}</div>` : ""}
      </div>`;
  },

  /** Panel que sube desde abajo. Se cierra con la acción "closeSheet". */
  sheet({ title, description, content, footer }) {
    return `
      <div class="sheet">
        <button type="button" class="sheet-backdrop" aria-label="Cerrar panel" ${on("closeSheet")}></button>
        <div class="sheet-panel" role="dialog" aria-modal="true" aria-label="${esc(title)}" tabindex="-1">
          <div class="sheet-header">
            <div class="stack gap-1 grow">
              <h2 class="t-h2">${title}</h2>
              ${description ? `<p class="t-small c-secondary">${description}</p>` : ""}
            </div>
            <button type="button" class="icon-btn is-sm" aria-label="Cerrar" ${on("closeSheet")}>${icon("x", "icon-lg")}</button>
          </div>
          <div class="sheet-body">${content}</div>
          ${footer ? `<div class="sheet-footer">${footer}</div>` : ""}
        </div>
      </div>`;
  },

  pageTitle(title, subtitle, eyebrow) {
    return `
      <div class="page-title">
        ${eyebrow ? `<p class="t-label c-muted">${eyebrow}</p>` : ""}
        <h1 class="t-h1">${title}</h1>
        ${subtitle ? `<p class="t-body c-secondary">${subtitle}</p>` : ""}
      </div>`;
  },

  sectionLabel(text) {
    return `<p class="t-label c-muted">${text}</p>`;
  },

  /** Título de sección con un link a la derecha ("Ver todos"). */
  sectionHeader(title, linkLabel, linkHref, size = "h2") {
    return `
      <div class="row is-bottom between gap-2">
        <h2 class="t-${size}">${title}</h2>
        ${linkLabel ? `<a class="link t-small" href="${linkHref}">${linkLabel}</a>` : ""}
      </div>`;
  },

  // ---------- Botones ----------

  /**
   * Botón. Con `href` es un link; con `action` ejecuta una acción de la pantalla.
   * variant: primary | accent | outline | soft · size: sm | md | lg
   */
  button({ label, variant = "primary", size = "lg", icon: iconName, block = false, disabled = false, loading = false, href, action, data, id }) {
    const className = cx("btn", `btn-${variant}`, `btn-${size}`, block && "btn-block", loading && "is-loading");
    const inner = `${loading ? icon("loader-2", "icon spin") : iconName ? icon(iconName) : ""}${label}`;
    if (href && !disabled) return `<a class="${className}" href="${href}">${inner}</a>`;
    return `<button type="button" class="${className}"${id ? ` id="${id}"` : ""} ${action ? on(action, data) : ""}${disabled || loading ? " disabled" : ""}${loading ? ' aria-busy="true"' : ""}>${inner}</button>`;
  },

  iconButton({ label, icon: iconName, href, action, data, size = "md" }) {
    const className = cx("icon-btn", size === "sm" && "is-sm");
    const iconHtml = icon(iconName, size === "sm" ? "icon" : "icon-lg");
    if (href) return `<a class="${className}" href="${href}" aria-label="${label}">${iconHtml}</a>`;
    return `<button type="button" class="${className}" aria-label="${label}" ${on(action, data)}>${iconHtml}</button>`;
  },

  link(label, { href, action, data, size = "small" } = {}) {
    const className = cx("link", size === "small" ? "t-small" : "t-body");
    if (href) return `<a class="${className}" href="${href}">${label}</a>`;
    return `<button type="button" class="${className}" ${on(action, data)}>${label}</button>`;
  },

  // ---------- Etiquetas y tarjetas ----------

  /** tone: neutral | accent | success | info | warning | danger | ink | glass | tanda */
  chip(text, { tone = "neutral", size = "sm", icon: iconName, outline = false } = {}) {
    const className = cx("chip", tone !== "neutral" && `chip-${tone}`, size === "md" && "chip-md", outline && "chip-outline");
    return `<span class="${className}">${iconName ? icon(iconName, "icon-sm") : ""}${text}</span>`;
  },

  /** tone: surface | glass | sunrise | ink */
  card(content, { tone = "surface", className = "" } = {}) {
    return `<div class="${cx("card", tone !== "surface" && `card-${tone}`, className)}">${content}</div>`;
  },

  keyValue(label, value, strong = false) {
    return `
      <div class="kv-row">
        <span class="t-body c-secondary">${label}</span>
        <span class="${strong ? "t-strong" : "t-body"}">${value}</span>
      </div>`;
  },

  infoCard({ title, text, steps = [] }) {
    const list = steps.length
      ? `<ol class="steps-list">
          ${steps.map((step, index) => `
            <li class="row gap-3">
              <span class="step-number">${index + 1}</span>
              <span class="t-body c-secondary">${step}</span>
            </li>`).join("")}
        </ol>`
      : "";
    return UI.card(`
      <div class="stack gap-4">
        ${title ? `<p class="t-h2">${title}</p>` : ""}
        ${text ? `<div class="t-body c-secondary">${text}</div>` : ""}
        ${list}
      </div>`);
  },

  emptyState({ icon: iconName, title, description, action = "" }) {
    return `
      <div class="empty-state">
        ${iconName ? `<span class="round-icon">${icon(iconName)}</span>` : ""}
        <div class="stack gap-1">
          <p class="t-h3">${title}</p>
          ${description ? `<p class="t-small c-secondary">${description}</p>` : ""}
        </div>
        ${action}
      </div>`;
  },

  /** Aviso de error (danger) o de algo que la app puede corregir (warning). */
  note({ title, text, tone = "danger", small = false }) {
    const iconName = tone === "warning" ? "alert-triangle" : "x";
    return `
      <div class="${cx("note", tone === "warning" && "is-warning", small ? "is-small" : "t-body")}">
        ${icon(iconName)}
        <div class="stack gap-1 grow">
          ${title ? `<span class="t-strong">${title}</span>` : ""}
          ${text ? `<span>${text}</span>` : ""}
        </div>
      </div>`;
  },

  /** Caja grande de estado: success | warning | danger. */
  statusBox(status, label) {
    const iconName = { success: "check", warning: "alert-triangle", danger: "x" }[status];
    return `<span class="status-box is-${status}" role="img" aria-label="${label}">${icon(iconName, "icon-lg")}</span>`;
  },

  checkDot() {
    return `<span class="check-dot">${icon("check", "icon-sm")}</span>`;
  },

  // ---------- Archivos ----------

  /** Tarjeta de archivo. removeAction: acción del tacho (opcional). */
  fileCard({ name, meta, removeAction }) {
    return UI.card(`
      <div class="row is-top gap-3">
        <span class="tile-icon">${icon("file-text", "icon-lg")}</span>
        <div class="stack gap-1 grow">
          <span class="t-h3 truncate">${esc(name)}</span>
          ${meta ? `<span class="t-small c-secondary">${esc(meta)}</span>` : ""}
        </div>
        ${removeAction ? `<button type="button" class="ghost-btn file-card-remove" aria-label="Quitar archivo" ${on(removeAction)}>${icon("trash-2", "icon-lg")}</button>` : ""}
      </div>`);
  },

  dropzone({ label, hint, change, accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png" }) {
    return `
      <label class="dropzone">
        <input type="file" class="sr-only" accept="${accept}" data-change="${change}">
        <span class="round-icon is-accent">${icon("upload", "icon-lg")}</span>
        <span class="stack gap-1">
          <span class="t-h3">${label}</span>
          <span class="t-small c-secondary">${hint}</span>
        </span>
      </label>`;
  },

  // ---------- Campos de formulario ----------

  field(label, control, { id, hint, error } = {}) {
    const below = error ? UI.note({ text: error }) : hint ? `<p class="form-hint">${hint}</p>` : "";
    return `
      <div class="form-field">
        <label class="form-label"${id ? ` for="${id}"` : ""}>${label}</label>
        ${control}
        ${below}
      </div>`;
  },

  textField({ id, label, value = "", placeholder = "", hint, error, input, inputmode, autocomplete, maxlength }) {
    const control = `<input id="${id}" class="${cx("input", error && "is-invalid")}" type="text" value="${esc(value)}" placeholder="${esc(placeholder)}"${inputmode ? ` inputmode="${inputmode}"` : ""}${autocomplete ? ` autocomplete="${autocomplete}"` : ""}${maxlength ? ` maxlength="${maxlength}"` : ""}${error ? ' aria-invalid="true"' : ""} data-input="${input}">`;
    return UI.field(label, control, { id, hint, error });
  },

  textareaField({ id, label, value = "", placeholder = "", hint, input, maxlength }) {
    const control = `<textarea id="${id}" class="input" placeholder="${esc(placeholder)}"${maxlength ? ` maxlength="${maxlength}"` : ""} data-input="${input}">${esc(value)}</textarea>`;
    return UI.field(label, control, { id, hint });
  },

  selectField({ id, label, value, options, change }) {
    const control = `
      <div class="select-wrap">
        <select id="${id}" class="input" data-change="${change}">
          ${options.map((option) => `<option value="${option.value}"${option.value === value ? " selected" : ""}>${option.label}</option>`).join("")}
        </select>
        ${icon("chevron-down")}
      </div>`;
    return UI.field(label, control, { id });
  },

  /** Opciones excluyentes en una píldora. */
  segmented({ name, label, options, value, change }) {
    return `
      <div class="segmented" role="radiogroup" aria-label="${label}">
        ${options.map((option) => `
          <label class="${cx("segmented-option", option.value === value && "is-checked")}">
            <input type="radio" class="sr-only" id="${name}-${option.value}" name="${name}" value="${option.value}"${option.value === value ? " checked" : ""} data-change="${change}">
            ${option.label}
          </label>`).join("")}
      </div>`;
  },

  /** Contador con − y +. La acción recibe data-step="-1" o "1". */
  stepper({ id, label, value, min = 1, max = 99, action }) {
    return `
      <div class="stepper" role="group" aria-label="${label}">
        <button type="button" class="stepper-btn" id="${id}-minus" aria-label="Restar" ${on(action, { step: -1 })}${value <= min ? " disabled" : ""}>${icon("minus")}</button>
        <output class="t-strong" aria-live="polite">${value}</output>
        <button type="button" class="stepper-btn" id="${id}-plus" aria-label="Sumar" ${on(action, { step: 1 })}${value >= max ? " disabled" : ""}>${icon("plus")}</button>
      </div>`;
  },

  /** Opción con círculo. tone: ink | accent · size: md | sm (compacta). */
  radioCard({ name, value, checked, title, description, aside = "", tone = "ink", size = "md", change }) {
    return `
      <label class="${cx("radio-card", size === "sm" && "is-sm", tone === "accent" && "is-accent", checked && "is-checked")}">
        <input type="radio" class="sr-only" id="${name}-${value}" name="${name}" value="${value}"${checked ? " checked" : ""} data-change="${change}">
        <span class="radio-card-body">
          <span class="radio-dot"></span>
          <span class="stack gap-1 grow">
            <span class="row between gap-3">
              <span class="radio-card-title">${title}</span>
              ${aside}
            </span>
            ${description ? `<span class="radio-card-text">${description}</span>` : ""}
          </span>
        </span>
      </label>`;
  },

  /** Opción con casilla (se pueden elegir varias). */
  checkCard({ name, value, checked, title, description, note, change }) {
    return `
      <label class="${cx("check-card", checked && "is-checked")}">
        <input type="checkbox" class="sr-only" id="${name}-${value}" value="${value}"${checked ? " checked" : ""} data-change="${change}">
        <span class="radio-card-body">
          <span class="check-box">${checked ? icon("check", "icon-sm") : ""}</span>
          <span class="stack gap-1">
            <span class="radio-card-title">${title}</span>
            ${description ? `<span class="radio-card-text">${description}</span>` : ""}
            ${note ? `<span class="check-note">${note}</span>` : ""}
          </span>
        </span>
      </label>`;
  },

  // ---------- Locales y valoraciones ----------

  /** size: sm | md | lg */
  localLogo(local, size = "md") {
    const sizeStyle = { sm: "is-sm", md: "", lg: "is-lg" }[size];
    if (local.logo) {
      return `<span class="${cx("local-logo has-image", sizeStyle)}"><img src="${local.logo}" alt=""></span>`;
    }
    const tone = { sunset: "is-sunset", ink: "is-ink", sunrise: "" }[local.tone];
    return `<span class="${cx("local-logo", tone, sizeStyle)}">${local.initials}</span>`;
  },

  stars(rating, { showValue = false, valueLabel, size = "sm" } = {}) {
    const rounded = Math.round(rating);
    const iconClass = size === "md" ? "icon" : "icon-sm";
    const stars = [1, 2, 3, 4, 5].map((star) => icon("star", cx(iconClass, star <= rounded && "is-on"))).join("");
    return `
      <span class="stars" role="img" aria-label="${rating} de 5">
        <span class="stars-row">${stars}</span>
        ${showValue ? `<span class="t-small fw-semibold">${valueLabel || ratingLabel(rating)}</span>` : ""}
      </span>`;
  },

  progress({ value, tone = "default", label, valueLabel }) {
    const clamped = Math.min(100, Math.max(0, value));
    const top = label || valueLabel
      ? `<div class="row is-baseline between gap-3">
          <span class="t-body c-secondary">${label || ""}</span>
          <span class="t-body">${valueLabel || `${clamped}%`}</span>
        </div>`
      : "";
    return `
      <div class="stack gap-2">
        ${top}
        <div class="progress" role="progressbar" aria-label="${label || "Progreso"}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${clamped}">
          <div class="${cx("progress-fill", tone === "success" && "is-success")}" style="width: ${clamped}%"></div>
        </div>
      </div>`;
  },

  /** Barra de 3 etapas del pedido. stage: 0 Recibido · 1 En cola · 2 Listo */
  stageProgress(stage) {
    const labels = ["Recibido", "En cola", "Listo"];
    const fills = ["is-ink", stage >= 1 ? "is-accent" : "", stage >= 2 ? "is-success" : ""];
    return `
      <div class="stack gap-2" role="img" aria-label="Estado: ${labels[stage]}">
        <div class="stage-progress-bars">${fills.map((fill) => `<span class="${fill}"></span>`).join("")}</div>
        <div class="stage-progress-labels">
          ${labels.map((label, index) => `<span class="${cx("t-small", index === stage ? "fw-semibold" : "c-secondary")}">${label}</span>`).join("")}
        </div>
      </div>`;
  },

  /** Total del pie en las pantallas de impresión. source: "Promedio entre locales" o "En El Poli". */
  priceSummary({ total, source, perPage, specs }) {
    return `
      <div class="price-summary">
        <div class="row is-baseline between gap-2">
          <span class="t-small c-secondary">Total estimado <span class="t-caption c-muted">· ${source}</span></span>
          <span class="t-h2 shrink-0">$${total}</span>
        </div>
        <span class="t-caption c-muted">
          $${perPage} por página · ${plural(specs.pages, "página", "páginas")} · ${plural(specs.copies, "copia", "copias")}${specialsCost(specs) > 0 ? " · + especiales" : ""}
        </span>
      </div>`;
  },

  /** Fila de la cola virtual: los que siguen, vos, el de adelante y el que se imprime. */
  /**
   * Cola virtual: pedidos en fila hacia la impresora.
   * Con `self` (seguimiento de un pedido) `ticket` es tu pedido, resaltado entre los vecinos.
   * Sin `self` (perfil del local) `ticket` es el que se está imprimiendo y se ven los próximos.
   */
  virtualQueue(ticket, { self = true, waiting = 7 } = {}) {
    const person = (color, large = false) => `
      <span class="${cx("person", `is-${color}`, large && "is-large")}" aria-hidden="true">
        <span class="person-head"></span>
        <span class="person-body"></span>
      </span>`;
    const slot = (figure, number, label, tone = "default") => `
      <div class="${cx("queue-slot", `is-${tone}`)}">
        ${figure}
        <span class="t-strong queue-slot-number">${number}</span>
        <span class="t-caption nowrap queue-slot-label">${label}</span>
      </div>`;
    const printer = `<span class="queue-printer" aria-hidden="true"><span>${icon("printer")}</span></span>`;

    if (!self) {
      return `
        <div class="virtual-queue" role="img" aria-label="Cola virtual: se imprime el pedido ${ticket} y hay ${waiting} más esperando">
          <span class="virtual-queue-line" aria-hidden="true"></span>
          ${slot(person("muted"), `+${Math.max(0, waiting - 3)}`, "En cola", "muted")}
          ${slot(person("muted"), ticket + 3, "3.º")}
          ${slot(person("ink"), ticket + 2, "2.º")}
          ${slot(person("ink"), ticket + 1, "Próximo")}
          ${slot(printer, ticket, "Imprimiendo")}
        </div>`;
    }

    return `
      <div class="virtual-queue" role="img" aria-label="Cola virtual: tu pedido es el ${ticket}, hay uno adelante y otro imprimiéndose">
        <span class="virtual-queue-line" aria-hidden="true"></span>
        ${slot(person("muted"), `+${waiting}`, "En cola", "muted")}
        ${slot(person("muted"), ticket + 1, "Martín")}
        ${slot(person("accent", true), ticket, "Vos", "self")}
        ${slot(person("ink"), ticket - 1, "Camila")}
        ${slot(printer, ticket - 2, "Imprimiendo")}
      </div>`;
  },

  /**
   * Cola presencial: personas de cuerpo entero paradas en fila.
   * Con `self` sos la del medio (naranja), con tres adelante y tres atrás.
   * Sin `self` se dibuja la gente que hay en el local (hasta 7, después "+N").
   */
  inPersonQueue({ count, self = false }) {
    const figure = (color) => `
      <span class="${cx("standing", `is-${color}`)}" aria-hidden="true">
        <span class="standing-head"></span>
        <span class="standing-torso"></span>
        <span class="standing-legs"></span>
      </span>`;

    if (self) {
      const colors = ["muted", "muted", "muted", "accent", "ink", "ink", "ink"];
      return `
        <div class="standing-queue" role="img" aria-label="Cola presencial: tres personas adelante de vos y tres detrás">
          ${colors.map(figure).join("")}
        </div>`;
    }

    if (!count) {
      return '<div class="standing-queue is-empty"><span class="t-small c-secondary">No hay nadie en la fila</span></div>';
    }
    // Entran 7 lugares: si hay más gente, el último lugar muestra cuántos faltan.
    const shown = count > 7 ? 6 : count;
    return `
      <div class="standing-queue is-start" role="img" aria-label="Cola presencial: ${plural(count, "persona", "personas")} en la fila">
        ${Array.from({ length: shown }, () => figure("ink")).join("")}
        ${count > shown ? `<span class="t-strong c-muted standing-more">+${count - shown}</span>` : ""}
      </div>`;
  },

  /**
   * Aviso de un local (stock, problema técnico, descuento o info).
   * openHref agrega el link "Ver local"; actions, otros botones al pie (por ejemplo, en la imprenta).
   */
  alertCard(alert, local, openHref, actions = "") {
    const tone = alertTone(alert.kind);
    const iconName = { stock: "alert-triangle", tecnico: "wrench", descuento: "tag", info: "info" }[alert.kind];
    return `
      <div class="${cx("alert-card", `is-${tone}`)}">
        <div class="row is-top gap-3">
          <span class="alert-card-icon">${icon(iconName)}</span>
          <div class="stack gap-1 grow">
            <div class="row is-top between gap-2">
              <p class="t-strong">${esc(alert.title)}</p>
              ${alert.read || actions ? "" : UI.chip("Nuevo", { tone: "accent" })}
            </div>
            <p class="t-small c-secondary">${esc(alert.body)}</p>
            <div class="row wrap gap-2 t-caption c-muted">
              ${local ? `<span>${local.name}</span><span aria-hidden="true">·</span>` : ""}
              <span>${minutesAgoLabel(alert.createdAt, DEMO_CLOCK)}</span>
            </div>
          </div>
        </div>
        ${openHref || actions ? `<div class="alert-card-actions">${openHref ? UI.link("Ver local", { href: openHref }) : ""}${actions}</div>` : ""}
      </div>`;
  },

  /** Tarjeta de una tanda que se puede seleccionar. */
  tandaCard(tanda, local, { selected, compatible, action }) {
    const full = tandaClosed(tanda);
    const tag = full ? UI.chip(tanda.printed ? "Impresa" : "Completa", { tone: "warning" }) : compatible ? UI.chip("Compatible", { tone: "success" }) : "";
    const details = `${modeShort(tanda.mode)} · ${PAPER_LABELS[tanda.paper]} · ${tanda.grammage} g/m²`;
    const message = full
      ? `<p class="t-small fw-semibold c-warning">${tanda.printed ? "El local ya imprimió esta tanda." : "Esta tanda ya completó su cupo."}</p>`
      : compatible
        ? '<p class="t-small fw-semibold c-success">Tu archivo coincide con esta tanda.</p>'
        : `<p class="t-small c-muted">${modeShort(tanda.mode)} · ${PAPER_LABELS[tanda.paper]} · ${tanda.size} · no compatible</p>`;
    return `
      <div class="${cx("card card-button tanda-card", selected && "is-selected-ink", !compatible && !selected && "is-dimmed")}" role="button" tabindex="0" aria-pressed="${Boolean(selected)}" ${on(action, { id: tanda.id })}>
        <span class="row is-top between gap-2">
          <span class="t-h3">${tanda.userTitle}</span>
          ${tag}
        </span>
        <span class="stack gap-2">
          ${UI.keyValue("Local", local.name)}
          <span class="t-small c-secondary">${details}</span>
          ${UI.keyValue("Pedidos agrupados", `${tanda.participants}/${tanda.capacity}`)}
          ${UI.progress({ value: (tanda.participants / tanda.capacity) * 100 })}
          ${UI.keyValue("Espera estimada", `${tanda.waitMin} min`)}
        </span>
        ${message}
      </div>`;
  },

  statusChip(status) {
    const tone = { confirmado: "neutral", "en-cola": "info", imprimiendo: "ink", listo: "success", entregado: "neutral" }[status];
    return UI.chip(STATUS_LABELS[status], { tone });
  },

  /** Fila de un pedido del historial. Lleva al seguimiento o al detalle si ya se entregó. */
  orderRow(order, local) {
    const href = order.status === "entregado" ? `detalle-pedido.html?id=${order.id}` : `pedido.html?id=${order.id}`;
    return `
      <a class="card card-button order-row" href="${href}">
        ${UI.localLogo(local)}
        <span class="stack gap-05 grow">
          <span class="t-h3 truncate">${local.name}</span>
          <span class="t-small c-secondary">${plural(order.filesCount, "archivo", "archivos")} · simple faz · ${modeShort(order.specs.mode)}</span>
        </span>
        ${UI.statusChip(order.status)}
      </a>`;
  },

  /** Tarjeta del local con logo, ubicación y botón "Ver local". */
  localRow(local, href) {
    return UI.card(`
      <div class="row gap-3">
        ${UI.localLogo(local)}
        <div class="stack gap-05 grow">
          <span class="t-h3">${local.name}</span>
          <span class="row gap-1 t-small c-secondary">${icon("map-pin")}${local.floorLabel} · ${local.hours}</span>
        </div>
        ${UI.button({ label: "Ver local", variant: "soft", size: "md", href })}
      </div>`);
  },
};
