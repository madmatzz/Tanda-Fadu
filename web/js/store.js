// Estado de la demo. Se guarda en el navegador (localStorage) para que se mantenga
// al pasar de una página a otra. Las pantallas lo cambian solo a través de `actions`.

const STORAGE_KEY = "tanda-demo-web";

const Store = {
  state: loadState(),
  listeners: [],

  /** Registra una función que se llama cada vez que cambia el estado. */
  subscribe(listener) {
    this.listeners.push(listener);
  },

  /** Guarda el estado y avisa a las pantallas para que se vuelvan a dibujar. */
  commit() {
    saveState(this.state);
    this.listeners.forEach((listener) => listener());
  },
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.version === createInitialState().version) return saved;
  } catch (error) {
    // Si lo guardado no se puede leer, arranca de cero.
  }
  return createInitialState();
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // La demo funciona igual sin guardar (por ejemplo, en una ventana privada).
  }
}

const actions = {
  /** Empieza una impresión nueva desde cero (descarta el archivo y las opciones anteriores). */
  resetDraft() {
    Store.state.draft = emptyDraft();
    Store.commit();
  },

  setFlow(flow) {
    const draft = Store.state.draft;
    draft.flow = flow;
    if (flow === "print") draft.tandaId = null;
    Store.commit();
  },

  setFile(file) {
    const draft = Store.state.draft;
    draft.file = file;
    if (file) {
      draft.specs.pages = file.pages;
      draft.specs.range = fullRange(file.pages);
    }
    Store.commit();
  },

  setValidation(validationState, progress) {
    const file = Store.state.draft.file;
    if (!file) return;
    file.state = validationState;
    if (progress !== undefined) file.progress = progress;
    Store.commit();
  },

  setSpecs(patch) {
    Object.assign(Store.state.draft.specs, patch);
    Store.commit();
  },

  selectLocal(localId) {
    Store.state.draft.localId = localId;
    Store.commit();
  },

  selectTanda(tandaId) {
    const draft = Store.state.draft;
    draft.tandaId = tandaId;
    const tanda = tandaId ? tandaById(Store.state, tandaId) : null;
    if (tanda) draft.localId = tanda.localId;
    Store.commit();
  },

  setPayment(payment) {
    Store.state.draft.payment = payment;
    Store.commit();
  },

  /** Recuerda la tarjeta para el próximo pedido. Solo marca, tipo y últimos 4 dígitos. */
  saveCard(card) {
    Store.state.savedCard = card;
    Store.commit();
  },

  /** Crea el pedido con lo cargado en el borrador y deja el borrador vacío. */
  confirmOrder(orderId) {
    const state = Store.state;
    const draft = state.draft;
    if (!draft.file) return;
    const local = localById(state, draft.localId) || state.locals[0];
    const ticket = state.nextTicket;

    state.orders.unshift({
      id: orderId,
      code: `FADU-${String(212 + ticket).padStart(4, "0")}`,
      ticket,
      localId: local.id,
      owner: USER_NAME,
      file: draft.file,
      specs: draft.specs,
      total: estimateTotal(draft.specs, local),
      status: "en-cola",
      createdAt: state.demoClock,
      readyAt: addMinutes(state.demoClock, local.queue.waitVirtual),
      payment: draft.payment || "efectivo",
      filesCount: 1,
      tandaId: draft.tandaId || undefined,
    });

    const tanda = draft.tandaId ? tandaById(state, draft.tandaId) : null;
    if (tanda) tanda.participants = Math.min(tanda.capacity, tanda.participants + 1);
    else syncQueue(state, local.id);

    state.nextTicket = ticket + 1;
    state.draft = emptyDraft();
    Store.commit();
  },

  /** Un estudiante (o el local) informa cuántas personas hay en la cola presencial. */
  reportQueue(localId, people) {
    const state = Store.state;
    const queue = localById(state, localId).queue;
    queue.inPerson = people;
    queue.waitInPerson = Math.round(people * MINUTES_PER_PERSON);
    queue.updatedAt = state.demoClock;
    Store.commit();
  },

  markAlertsRead() {
    Store.state.alerts.forEach((alert) => {
      alert.read = true;
    });
    Store.commit();
  },

  /** Suma una reseña con su puntaje en cada aspecto (calidad, precio y velocidad). */
  addReview(localId, ratings, text) {
    const state = Store.state;
    state.reviews.unshift({
      id: `review-${Date.now()}`,
      localId,
      author: USER_NAME,
      rating: averageRating(ratings),
      ratings: { ...ratings },
      text,
      createdAt: state.demoClock,
    });
    // Cada aspecto del local se promedia con el nuevo puntaje; la valoración general, con los aspectos.
    const local = localById(state, localId);
    const count = local.reviewCount + 1;
    RATING_ASPECTS.forEach(({ key }) => {
      local.ratings[key] = Math.round(((local.ratings[key] * local.reviewCount + ratings[key]) / count) * 10) / 10;
    });
    local.rating = averageRating(local.ratings);
    local.reviewCount = count;
    Store.commit();
  },

  toggleSavedLocal(localId) {
    const saved = Store.state.savedLocalIds;
    Store.state.savedLocalIds = saved.includes(localId) ? saved.filter((id) => id !== localId) : [...saved, localId];
    Store.commit();
  },

  resetDemo() {
    Store.state = createInitialState();
    Store.commit();
  },

  // ---------- Imprenta ----------

  /** El pedido que se estaba imprimiendo queda listo para retirar y arranca el siguiente de la cola. */
  finishPrinting(orderId) {
    const state = Store.state;
    const order = orderById(state, orderId);
    order.status = "listo";
    order.readyAt = state.demoClock;
    startNextInQueue(state, order.localId);
    Store.commit();
  },

  /** Imprime ya un pedido de la cola (si no hay otro imprimiéndose). */
  startPrinting(orderId) {
    const state = Store.state;
    const order = orderById(state, orderId);
    const busy = queueOrders(state, order.localId).some((item) => item.status === "imprimiendo");
    if (busy) return;
    order.status = "imprimiendo";
    syncQueue(state, order.localId);
    Store.commit();
  },

  /** El estudiante retiró su pedido. */
  deliverOrder(orderId) {
    orderById(Store.state, orderId).status = "entregado";
    Store.commit();
  },

  /** Cierra la tanda e imprime todos sus pedidos juntos: quedan listos para retirar. */
  printTanda(tandaId) {
    const state = Store.state;
    const tanda = tandaById(state, tandaId);
    tanda.printed = true;
    tandaOrders(state, tandaId).forEach((order) => {
      if (order.status === "en-cola" || order.status === "imprimiendo") {
        order.status = "listo";
        order.readyAt = state.demoClock;
      }
    });
    Store.commit();
  },

  setStock(localId, paper, level) {
    localById(Store.state, localId).stock[paper] = level;
    Store.commit();
  },

  replyReview(reviewId, reply) {
    const review = Store.state.reviews.find((item) => item.id === reviewId);
    review.reply = reply;
    Store.commit();
  },

  /**
   * Cambia los datos públicos del local (nombre, descripción, horario, teléfono).
   * Se sacan los signos < > " porque estos textos se muestran en muchas pantallas.
   */
  updateLocal(localId, patch) {
    const local = localById(Store.state, localId);
    Object.entries(patch).forEach(([key, value]) => {
      local[key] = String(value).replace(/[<>"]/g, "").trim();
    });
    Store.commit();
  },

  /** Publica un aviso del local: lo ven los estudiantes en Avisos y en el perfil del local. */
  addAlert(localId, { kind, title, body }) {
    const state = Store.state;
    state.alerts.unshift({ id: `alerta-${Date.now()}`, localId, kind, title, body, createdAt: state.demoClock, read: false });
    Store.commit();
  },

  removeAlert(alertId) {
    Store.state.alerts = Store.state.alerts.filter((alert) => alert.id !== alertId);
    Store.commit();
  },
};

/** Pasa a imprimir el primer pedido que espera en la cola virtual del local. */
function startNextInQueue(state, localId) {
  const next = queueOrders(state, localId).find((order) => order.status === "en-cola");
  if (next) next.status = "imprimiendo";
  syncQueue(state, localId);
}

/**
 * Actualiza los números de la cola virtual que ven los estudiantes (personas, pedido que se
 * imprime y espera) a partir de los pedidos reales. Solo el local de la imprenta tiene pedidos
 * cargados; los demás locales muestran números fijos de la demo.
 */
function syncQueue(state, localId) {
  if (localId !== SHOP_LOCAL_ID) return;
  const queue = localById(state, localId).queue;
  const active = queueOrders(state, localId).filter((order) => order.status === "en-cola" || order.status === "imprimiendo");
  const printing = active.find((order) => order.status === "imprimiendo") || active[0];
  queue.virtual = active.length;
  queue.waitVirtual = Math.round(active.length * MINUTES_PER_ORDER);
  if (printing) queue.printing = printing.ticket;
}
