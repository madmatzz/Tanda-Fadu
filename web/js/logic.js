// Lógica de la demo: tiempo, precios, validación de archivos y búsquedas sobre el estado.
// Son funciones puras: reciben datos y devuelven resultados, sin tocar la pantalla.

// ---------- Tiempo ----------

function addMinutes(iso, minutes) {
  return new Date(new Date(iso).getTime() + minutes * 60000).toISOString();
}

function minutesBetween(fromIso, toIso) {
  return Math.max(0, Math.round((new Date(toIso) - new Date(fromIso)) / 60000));
}

function minutesAgoLabel(fromIso, nowIso) {
  const minutes = minutesBetween(fromIso, nowIso);
  if (minutes <= 1) return "hace un momento";
  if (minutes < 60) return `hace ${minutes} min`;
  return `hace ${Math.round(minutes / 60)} h`;
}

function clockLabel(iso) {
  return new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}

function dateLabel(iso) {
  return new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short" }).format(new Date(iso));
}

/** Minutos que faltan para una hora "HH:MM" de hoy, como texto corto. */
function closesIn(closesAt, nowIso) {
  const now = new Date(nowIso);
  const [hours, minutes] = closesAt.split(":").map(Number);
  const close = new Date(now);
  close.setHours(hours, minutes, 0, 0);
  const diff = Math.max(0, Math.round((close - now) / 60000));
  return diff < 60 ? `${diff} min` : `${Math.round(diff / 60)} h`;
}

// ---------- Textos ----------

function plural(count, singular, pluralForm) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function ratingLabel(rating) {
  return rating.toFixed(1).replace(".", ",");
}

function modeLabel(mode) {
  return mode === "bn" ? "Blanco y negro" : "Color";
}

function modeShort(mode) {
  return mode === "bn" ? "B&N" : "Color";
}

function paperDisplay(specs) {
  if (specs.paper === "ilustracion") return "Ilustración 150 g/m²";
  if (specs.paper === "reciclado") return `Reciclado ${specs.grammage} g/m²`;
  return `Obra ${specs.grammage} g/m²`;
}

function specsSummary(specs) {
  return `${plural(specs.pages, "página", "páginas")} · ${plural(specs.copies, "copia", "copias")} · ${specs.size} · ${modeShort(specs.mode)}`;
}

function specialsLabel(specs) {
  return (specs.specials || [])
    .map((id) => {
      if (id === "montaje") {
        const material = MOUNT_OPTIONS.find((option) => option.value === specs.mountMaterial);
        return material ? `Montaje: ${material.label}` : "Montaje";
      }
      return SPECIAL_OPTIONS.find((option) => option.value === id).label;
    })
    .join(" · ");
}

function humanFileSize(bytes) {
  if (bytes <= 0) return "0 MB";
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

// ---------- Precios ----------

function pricePerPage(specs, local) {
  const modeFactor = specs.mode === "color" ? 1.6 : 1;
  const sizeFactor = specs.size === "A3" ? 1.8 : 1;
  const paperFactor = specs.paper === "ilustracion" ? 1.35 : specs.paper === "reciclado" ? 1.15 : 1;
  return Math.round(100 * modeFactor * sizeFactor * paperFactor * local.priceMultiplier);
}

/** Costo de los pedidos especiales (recorte, montaje, rotulado). */
function specialsCost(specs) {
  return (specs.specials || []).reduce((sum, id) => {
    if (id === "montaje") {
      const material = MOUNT_OPTIONS.find((option) => option.value === specs.mountMaterial);
      return sum + (material ? material.price : 0);
    }
    return sum + (SPECIAL_OPTIONS.find((option) => option.value === id).price || 0);
  }, 0);
}

function estimateTotal(specs, local) {
  const total = pricePerPage(specs, local) * specs.pages * specs.copies + specialsCost(specs) * local.priceMultiplier;
  return Math.max(100, Math.round(total / 10) * 10);
}

/** Precio de referencia antes de elegir local: promedio entre todos los locales. */
function averageTotal(specs, locals) {
  const sum = locals.reduce((acc, local) => acc + estimateTotal(specs, local), 0);
  return Math.round(sum / locals.length / 10) * 10;
}

function averagePricePerPage(specs, locals) {
  const sum = locals.reduce((acc, local) => acc + pricePerPage(specs, local), 0);
  return Math.round(sum / locals.length);
}

// ---------- Stock ----------

function paperStockId(specs) {
  if (specs.paper === "obra") return specs.grammage === "120" ? "obra-120" : "obra-80";
  if (specs.paper === "ilustracion") return "ilustracion-150";
  return "reciclado-90";
}

function specsStock(local, specs) {
  return local.stock[paperStockId(specs)] || "out";
}

function stockTone(level) {
  if (level === "ok") return "success";
  if (level === "low") return "warning";
  return "danger";
}

// ---------- Archivos ----------

function fileFromUpload(file) {
  const extension = file.name.split(".").pop().toLowerCase();
  const kind = ["doc", "docx"].includes(extension) ? "docx" : ["jpg", "jpeg", "png"].includes(extension) ? "jpg" : "pdf";
  return {
    name: file.name,
    sizeLabel: humanFileSize(file.size),
    pages: kind === "jpg" ? 1 : 8,
    kind,
    state: "pendiente",
    pageSize: "A4",
    ppi: kind === "jpg" ? 150 : 300,
    color: kind === "pdf" ? "gris" : "rgb",
  };
}

function fileMeta(file) {
  return `${plural(file.pages, "página", "páginas")} · ${file.pageSize || "A4"} · ${file.ppi || 300} ppp · ${file.sizeLabel}`;
}

function fullRange(pages) {
  return pages === 1 ? "1" : `1-${pages}`;
}

/** Cuenta las páginas de un rango tipo "1-3, 6". Devuelve null si el rango no es válido. */
function countPages(range, max) {
  const parts = range.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  const pages = new Set();
  for (const part of parts) {
    const match = /^(\d+)\s*(?:-\s*(\d+))?$/.exec(part);
    if (!match) return null;
    const from = Number(match[1]);
    const to = match[2] ? Number(match[2]) : from;
    if (from < 1 || to > max || from > to) return null;
    for (let page = from; page <= to; page += 1) pages.add(page);
  }
  return pages.size;
}

/**
 * Compara el archivo con lo que se pidió imprimir.
 * status: "ok" cumple · "ajuste" la app lo corrige · "error" hay que cambiar el archivo.
 */
function fileChecks(file, specs) {
  const ppi = file.ppi || 300;
  const pageSize = file.pageSize || "A4";
  const color = file.color || "gris";
  const checks = [];

  checks.push(
    file.kind === "docx"
      ? { label: "Formato", status: "ajuste", value: "Word: se convierte a PDF", fix: "Convirtiendo a PDF", done: "Convertido a PDF" }
      : { label: "Formato", status: "ok", value: file.kind === "pdf" ? "PDF compatible" : "Imagen compatible" },
  );

  checks.push({ label: "Peso", status: "ok", value: `${file.sizeLabel} / máx. 25 MB` });

  checks.push(
    ppi >= 300
      ? { label: "Resolución", status: "ok", value: `${ppi} ppp` }
      : { label: "Resolución", status: "error", value: `${ppi} ppp: el mínimo es 300 ppp` },
  );

  checks.push(
    pageSize === specs.size
      ? { label: "Tamaño", status: "ok", value: pageSize }
      : { label: "Tamaño", status: "ajuste", value: `Archivo ${pageSize}: se escala a ${specs.size}`, fix: `Escalando a ${specs.size}`, done: `Escalado a ${specs.size}` },
  );

  if (specs.mode === "bn") {
    checks.push(
      color === "rgb"
        ? { label: "Color", status: "ajuste", value: "Archivo a color: se pasa a escala de grises", fix: "Pasando a escala de grises", done: "Pasado a escala de grises" }
        : { label: "Color", status: "ok", value: "Escala de grises" },
    );
  } else {
    checks.push({ label: "Color", status: "ok", value: color === "rgb" ? "Color" : "Archivo en grises: sale sin color" });
  }

  return checks;
}

/** "rechazado", "ajustable" u "optimo" según los chequeos. */
function validationOutcome(file, specs) {
  const checks = fileChecks(file, specs);
  if (checks.some((check) => check.status === "error")) return "rechazado";
  if (checks.some((check) => check.status === "ajuste")) return "ajustable";
  return "optimo";
}

/** Texto del botón que corrige el archivo según qué haya que ajustar. */
function fixActionLabel(checks) {
  const fixes = checks.filter((check) => check.status === "ajuste");
  if (fixes.some((check) => check.label === "Formato")) {
    return fixes.length > 1 ? "Convertir y ajustar" : "Convertir a PDF";
  }
  return "Ajustar archivo";
}

// ---------- Búsquedas sobre el estado ----------

function localById(state, id) {
  return state.locals.find((local) => local.id === id || local.slug === id);
}

function tandaById(state, id) {
  return state.tandas.find((tanda) => tanda.id === id);
}

/** Local ya elegido para el pedido en curso (desde el perfil, una tanda o la comparación), o null. */
function chosenLocal(state) {
  return state.draft.localId ? localById(state, state.draft.localId) : null;
}

function orderById(state, id) {
  return state.orders.find((order) => order.id === id);
}

function userOrders(state) {
  return state.orders
    .filter((order) => order.owner === USER_NAME)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function activeUserOrder(state) {
  return userOrders(state).find((order) => order.status !== "entregado");
}

// ---------- Imprenta ----------

/** Pedidos de la cola virtual de un local (sin los que van en tandas), por número de pedido. */
function queueOrders(state, localId) {
  return state.orders
    .filter((order) => order.localId === localId && !order.tandaId)
    .sort((a, b) => a.ticket - b.ticket);
}

/** Pedidos sumados a una tanda, por número de pedido. */
function tandaOrders(state, tandaId) {
  return state.orders
    .filter((order) => order.tandaId === tandaId)
    .sort((a, b) => a.ticket - b.ticket);
}

/** Pedidos del local con un estado dado, de la cola o de tandas (por ejemplo, los listos para retirar). */
function localOrdersByStatus(state, localId, status) {
  return state.orders
    .filter((order) => order.localId === localId && order.status === status)
    .sort((a, b) => a.ticket - b.ticket);
}

function localTandas(state, localId) {
  return state.tandas.filter((tanda) => tanda.localId === localId);
}

/** Una tanda está cerrada cuando el local ya la imprimió o se completó el cupo. */
function tandaClosed(tanda) {
  return Boolean(tanda.printed) || tanda.participants >= tanda.capacity;
}

function unreadAlerts(state) {
  return state.alerts.filter((alert) => !alert.read).length;
}

function localReviews(state, localId) {
  return state.reviews
    .filter((review) => review.localId === localId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/** Aspectos que se puntúan en cada reseña. La valoración general es el promedio de los tres. */
const RATING_ASPECTS = [
  { key: "quality", label: "Calidad" },
  { key: "price", label: "Precio" },
  { key: "speed", label: "Velocidad" },
];

function ratingBreakdown(local) {
  return RATING_ASPECTS.map(({ key, label }) => ({ label, value: local.ratings[key] }));
}

/** Promedio de los aspectos, con un decimal. */
function averageRating(ratings) {
  const values = RATING_ASPECTS.map(({ key }) => ratings[key]);
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

/**
 * Concurrencia de hoy en un local, de ahora hasta el cierre.
 * Devuelve el índice de la hora actual en OCCUPANCY_HOURS y las horas más tranquila y más llena
 * que quedan (null si ya cerró).
 */
function busyHours(local, clock) {
  const [hours, minutes] = clock.slice(11, 16).split(":").map(Number);
  const now = Math.round((hours + minutes / 60 - OCCUPANCY_HOURS[0]) / 2);
  const upcoming = local.occupancy
    .map((value, index) => ({ value, index }))
    .filter((item) => item.index >= now && item.value !== null);
  if (!upcoming.length) return { now, best: null, peak: null };
  const best = upcoming.reduce((low, item) => (item.value < low.value ? item : low)).index;
  const peak = upcoming.reduce((high, item) => (item.value > high.value ? item : high)).index;
  return { now, best, peak };
}

function tandaCompatible(tanda, specs) {
  return (
    tanda.size === specs.size &&
    tanda.mode === specs.mode &&
    tanda.paper === specs.paper &&
    tanda.minPages <= specs.pages &&
    tanda.maxPages >= specs.pages &&
    !tandaClosed(tanda)
  );
}

function findCompatibleTanda(state, specs, localId) {
  return state.tandas.find((tanda) => (!localId || tanda.localId === localId) && tandaCompatible(tanda, specs));
}

function alertTone(kind) {
  return { stock: "warning", tecnico: "danger", descuento: "accent", info: "info" }[kind];
}
