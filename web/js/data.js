// Datos ficticios de la demo: locales, tandas, pedidos, avisos y reseñas.
// La demo usa un reloj fijo: miércoles 21/10/2026 a las 11:20.

const DEMO_CLOCK = "2026-10-21T11:20:00-03:00";
const USER_NAME = "Lucía Pérez";

/** Foto provisoria para los locales que todavía no tienen la suya (es la de El Poli). */
const PHOTO_PLACEHOLDER = "img/locales/el-poli-foto.png";

/** Local que maneja la vista de imprenta de la demo. */
const SHOP_LOCAL_ID = "local-el-poli";

/** Minutos de espera que suma cada persona en la cola presencial. */
const MINUTES_PER_PERSON = 1.7;

/** Minutos de espera que suma cada pedido en la cola virtual. */
const MINUTES_PER_ORDER = 0.35;

/** Horas del gráfico de concurrencia: cada local trae un valor (0 a 10) por hora, o null si está cerrado. */
const OCCUPANCY_HOURS = [8, 10, 12, 14, 16, 18, 20, 22];

/** Fecha ISO de hace `minutes` minutos según el reloj de la demo. */
function ago(minutes) {
  return addMinutes(DEMO_CLOCK, -minutes);
}

const DEFAULT_SPECS = {
  pages: 8,
  copies: 1,
  size: "A4",
  mode: "bn",
  paper: "obra",
  grammage: "80",
  notes: "Sin abrochar. Retiro por mostrador.",
};

/** Borrador vacío: un pedido nuevo sin archivo ni local elegido. */
function emptyDraft() {
  return { flow: "print", file: null, specs: { ...DEFAULT_SPECS }, localId: null, tandaId: null, tandaPreselected: false, payment: null };
}

// ---------- Opciones de impresión ----------

const PAPER_OPTIONS = [
  { value: "obra", label: "Obra", description: "Uso diario" },
  { value: "ilustracion", label: "Ilustración", description: "Acabado liso" },
  { value: "reciclado", label: "Reciclado", description: "Tono natural" },
];

const GRAMMAGE_OPTIONS = {
  obra: ["80", "120"],
  ilustracion: ["150"],
  reciclado: ["80", "120"],
};

// Precios de referencia por pedido (no por página).
const SPECIAL_OPTIONS = [
  { value: "recorte", label: "Recorte de bordes", description: "Corte al ras", price: 400 },
  { value: "montaje", label: "Montar entrega", description: "Sobre placa rígida" },
  { value: "rotulado", label: "Rotulado", description: "Con tus datos", price: 300 },
];

const MOUNT_OPTIONS = [
  { value: "carton", label: "Cartón montado", description: "Liviano", price: 1500 },
  { value: "foamboard", label: "Foamboard 2 mm", description: "Rígido y prolijo", price: 2500 },
  { value: "telgopor", label: "Telgopor", description: "Más grueso", price: 2000 },
];

const PAPER_LABELS = { obra: "Obra", ilustracion: "Ilustración", reciclado: "Reciclado" };

const PAPER_NAMES = {
  "obra-80": "Papel 80g",
  "obra-120": "Papel 120g",
  "ilustracion-150": "Ilustración 150g",
  "reciclado-90": "Reciclado 90g",
  "foamboard-3": "Foamboard 3mm",
};

const SERVICE_LABELS = {
  bn: "Blanco y negro",
  color: "Color",
  a3: "A3",
  anillado: "Anillado",
  plastificado: "Plastificado",
  escaneo: "Escaneo",
  "gran-formato": "Gran formato",
};

const PAYMENT_LABELS = { "mercado-pago": "MercadoPago", efectivo: "Efectivo", tarjeta: "Tarjeta" };

const STATUS_LABELS = {
  confirmado: "Recibido",
  "en-cola": "En cola",
  imprimiendo: "Imprimiendo",
  listo: "Listo",
  entregado: "Entregado",
};

const STOCK_LABELS = { ok: "Stock OK", low: "Stock bajo", out: "Sin stock" };

// ---------- Archivos de ejemplo ----------

const DEMO_FILES = [
  { name: "entrega_final.pdf", sizeLabel: "4,2 MB", pages: 8, kind: "pdf", state: "pendiente", pageSize: "A4", ppi: 300, color: "gris" },
  { name: "monografia.docx", sizeLabel: "4,2 MB", pages: 8, kind: "docx", state: "pendiente", pageSize: "A4", ppi: 300, color: "rgb" },
  { name: "foto-baja-res.jpg", sizeLabel: "3,1 MB", pages: 1, kind: "jpg", state: "pendiente", pageSize: "A4", ppi: 150, color: "rgb" },
];

// ---------- Estado inicial ----------

function createInitialState() {
  const fullStock = { "obra-80": "ok", "obra-120": "ok", "ilustracion-150": "ok", "reciclado-90": "ok", "foamboard-3": "ok" };

  const locals = [
    {
      id: "local-el-poli", slug: "el-poli", name: "El Poli", tagline: "Amplio catálogo", initials: "EP",
      floorLabel: "Planta baja", hours: "Lun – Sáb · 08:00 – 22:00", phone: "4787-9412",
      rating: 4.8, reviewCount: 128, priceMultiplier: 1,
      services: ["bn", "color", "a3", "anillado", "plastificado", "escaneo", "gran-formato"],
      papers: ["obra-80", "obra-120", "ilustracion-150", "reciclado-90", "foamboard-3"],
      stock: { ...fullStock, "obra-80": "low", "foamboard-3": "out" },
      queue: { printing: 34, virtual: 23, inPerson: 3, waitVirtual: 8, waitInPerson: 5, updatedAt: ago(7) },
      occupancy: [3, 4, 5, 6, 7, 9, 8, null], ratings: { quality: 4.9, price: 4.6, speed: 4.9 },
      map: { floor: 0, x: 0.41, y: 0.74, color: "red" }, tone: "sunset", logo: "img/locales/el-poli-logo.png", photo: "img/locales/el-poli-foto.png",
    },
    {
      id: "local-desalvo", slug: "desalvo", name: "Desalvo", tagline: "Menor espera", initials: "DS",
      floorLabel: "Piso 1", hours: "Lun – Vie · 09:00 – 21:00", phone: "4787-2201",
      rating: 4.3, reviewCount: 86, priceMultiplier: 1.1,
      services: ["bn", "color", "a3", "anillado"],
      papers: ["obra-80", "obra-120", "ilustracion-150", "reciclado-90"],
      stock: { ...fullStock, "obra-120": "low", "foamboard-3": "out" },
      queue: { printing: 51, virtual: 9, inPerson: 6, waitVirtual: 15, waitInPerson: 12, updatedAt: ago(12) },
      occupancy: [null, 3, 5, 7, 8, 6, 4, null], ratings: { quality: 4.2, price: 4.1, speed: 4.6 },
      map: { floor: 1, x: 0.33, y: 0.5, color: "blue" }, tone: "sunrise", photo: PHOTO_PLACEHOLDER,
    },
    {
      id: "local-quinto-color", slug: "quinto-color", name: "Quinto Color", tagline: "Color y gran formato", initials: "QC",
      floorLabel: "Piso 1", hours: "Lun – Sáb · 08:30 – 21:30", phone: "4787-5580",
      rating: 4.7, reviewCount: 74, priceMultiplier: 1.2,
      services: ["color", "a3", "gran-formato", "plastificado"],
      papers: ["obra-80", "ilustracion-150", "foamboard-3"],
      stock: { ...fullStock, "ilustracion-150": "low", "foamboard-3": "ok" },
      queue: { printing: 12, virtual: 14, inPerson: 4, waitVirtual: 20, waitInPerson: 10, updatedAt: ago(4) },
      occupancy: [null, 5, 6, 7, 9, 8, 6, null], ratings: { quality: 4.9, price: 4.4, speed: 4.8 },
      map: { floor: 1, x: 0.8, y: 0.35, color: "green" }, tone: "ink", photo: PHOTO_PLACEHOLDER,
    },
    {
      id: "local-cefadu", slug: "cefadu", name: "CEFADU", tagline: "Económico y cerca", initials: "CE",
      floorLabel: "Planta baja", hours: "Lun – Vie · 10:00 – 20:00", phone: "4787-1190",
      rating: 4.2, reviewCount: 61, priceMultiplier: 0.9,
      services: ["bn", "color", "a3", "escaneo"],
      papers: ["obra-80", "obra-120", "ilustracion-150", "reciclado-90"],
      stock: { ...fullStock, "ilustracion-150": "low", "reciclado-90": "out", "foamboard-3": "out" },
      queue: { printing: 77, virtual: 18, inPerson: 7, waitVirtual: 25, waitInPerson: 18, updatedAt: ago(18) },
      occupancy: [null, 4, 6, 8, 7, 5, null, null], ratings: { quality: 3.9, price: 4.8, speed: 3.9 },
      map: { floor: 0, x: 0.54, y: 0.29, color: "amber" }, tone: "sunrise", photo: PHOTO_PLACEHOLDER,
    },
    {
      id: "local-la-copia", slug: "la-copia-ciudad", name: "La Copia Ciudad", tagline: "Anillados y copias", initials: "LC",
      floorLabel: "Piso 2", hours: "Lun – Sáb · 09:00 – 21:00", phone: "4787-6674",
      rating: 4.4, reviewCount: 52, priceMultiplier: 1.05,
      services: ["bn", "color", "anillado", "plastificado"],
      papers: ["obra-80", "obra-120", "reciclado-90", "foamboard-3"],
      stock: { ...fullStock, "foamboard-3": "low" },
      queue: { printing: 20, virtual: 6, inPerson: 2, waitVirtual: 12, waitInPerson: 8, updatedAt: ago(3) },
      occupancy: [null, 3, 4, 5, 6, 7, 5, null], ratings: { quality: 4.4, price: 4.3, speed: 4.5 },
      map: { floor: 2, x: 0.64, y: 0.54, color: "pink" }, tone: "sunrise", photo: PHOTO_PLACEHOLDER,
    },
  ];

  const alerts = [
    { id: "alerta-poli-stock", localId: "local-el-poli", kind: "stock", title: "Stock limitado de papel 80g y foamboard", body: "El Poli actualizó su catálogo esta mañana. Confirmá disponibilidad antes de imprimir.", createdAt: ago(35), read: false },
    { id: "alerta-cefadu-tecnica", localId: "local-cefadu", kind: "tecnico", title: "Impresora color fuera de servicio", body: "CEFADU imprime solo B&N hasta nuevo aviso. La atención presencial sigue abierta.", createdAt: ago(90), read: false },
    { id: "alerta-la-copia-descuento", localId: "local-la-copia", kind: "descuento", title: "15% en impresión color", body: "La Copia Ciudad suma un descuento para pedidos de la tarde. Se aplica en el local.", createdAt: ago(180), read: true },
    { id: "alerta-desalvo-stock", localId: "local-desalvo", kind: "stock", title: "Poco stock de Ilustración 150g", body: "Desalvo recomienda confirmar el papel antes de elegir esa opción.", createdAt: ago(240), read: true },
    { id: "alerta-horario-poli", kind: "info", title: "Nuevo horario de El Poli", body: "Lun a Sáb de 08:00 a 22:00. Domingos cerrado.", createdAt: ago(1440), read: true },
  ];

  const reviews = [
    { id: "review-poli-1", localId: "local-el-poli", author: "Agustín Pereyra", rating: 4, text: "Siempre me resuelven si el archivo viene con algún detalle.", createdAt: ago(2880), reply: "¡Gracias, Agustín! Te esperamos en el próximo TP." },
    { id: "review-poli-2", localId: "local-el-poli", author: "Julieta Rossi", rating: 5, text: "Imprimí la maqueta de la entrega final y salió impecable.", createdAt: ago(1440) },
    { id: "review-poli-3", localId: "local-el-poli", author: "Camila Duarte", rating: 5, text: "Siempre rápido y me guardan los archivos si paso más tarde.", createdAt: ago(320) },
    { id: "review-poli-4", localId: "local-el-poli", author: "Martín Sosa", rating: 4, text: "Buena atención. La cola virtual ayuda un montón.", createdAt: ago(500) },
    { id: "review-desalvo-1", localId: "local-desalvo", author: "Lucía Benítez", rating: 4, text: "Muy prolijo con las láminas. Un poco de espera al mediodía.", createdAt: ago(960) },
    { id: "review-quinto-1", localId: "local-quinto-color", author: "Tomás Iriarte", rating: 5, text: "El color de las láminas quedó impecable.", createdAt: ago(1200) },
    { id: "review-cefadu-1", localId: "local-cefadu", author: "Sofía Navarro", rating: 4, text: "Buen precio y cerca de la cátedra. Ojo con el horario de la tarde.", createdAt: ago(800) },
    { id: "review-la-copia-1", localId: "local-la-copia", author: "Pedro Luna", rating: 4, text: "Me anillaron la tesis en el día.", createdAt: ago(1600) },
  ];

  const tandas = [
    { id: "tanda-1", label: "Tanda 1", localId: "local-el-poli", userTitle: "A4, 1-10 páginas", size: "A4", mode: "bn", paper: "obra", grammage: "80", minPages: 1, maxPages: 10, participants: 25, capacity: 30, waitMin: 8, closesAt: "11:50" },
    { id: "tanda-2", label: "Tanda 2", localId: "local-quinto-color", userTitle: "A3, 1-5 páginas", size: "A3", mode: "color", paper: "ilustracion", grammage: "150", minPages: 1, maxPages: 5, participants: 12, capacity: 30, waitMin: 20, closesAt: "13:20" },
    { id: "tanda-3", label: "Tanda 3", localId: "local-desalvo", userTitle: "A3, 1-5 páginas", size: "A3", mode: "bn", paper: "obra", grammage: "80", minPages: 20, maxPages: 80, participants: 6, capacity: 10, waitMin: 10, closesAt: "15:20" },
    { id: "tanda-4", label: "Tanda 4", localId: "local-el-poli", userTitle: "A4 color, 1-10 páginas", size: "A4", mode: "color", paper: "obra", grammage: "120", minPages: 1, maxPages: 10, participants: 9, capacity: 20, waitMin: 15, closesAt: "12:40" },
    { id: "tanda-5", label: "Tanda 5", localId: "local-el-poli", userTitle: "A3, 1-5 páginas", size: "A3", mode: "bn", paper: "obra", grammage: "80", minPages: 1, maxPages: 5, participants: 4, capacity: 15, waitMin: 12, closesAt: "16:00" },
  ];

  const sampleFile = (name, pages, sizeLabel = "4,2 MB") => ({ name, pages, sizeLabel, kind: "pdf", state: "optimo" });
  const order = (data) => ({
    specs: { ...DEFAULT_SPECS, pages: data.file.pages },
    code: `FADU-${String(212 + data.ticket).padStart(4, "0")}`,
    readyAt: addMinutes(data.createdAt, 8),
    filesCount: 1,
    ...data,
  });

  const orders = [
    order({ id: "order-36", ticket: 36, localId: "local-el-poli", owner: "Sofía", file: sampleFile("Entrega.pdf", 8), total: 800, status: "en-cola", createdAt: ago(8), readyAt: addMinutes(DEMO_CLOCK, 5), payment: "tarjeta", filesCount: 4, tandaId: "tanda-1" }),
    order({ id: "order-24", ticket: 24, localId: "local-desalvo", owner: USER_NAME, file: sampleFile("apuntes_final.pdf", 12, "6,1 MB"), specs: { ...DEFAULT_SPECS, pages: 12, notes: "Doble faz." }, total: 880, status: "entregado", createdAt: ago(2880), readyAt: ago(2865), payment: "efectivo", filesCount: 2 }),
  ];

  // Pedidos de otros estudiantes en El Poli, para la vista de la imprenta.
  const names = ["Camila", "Martín", "Tomás", "Juli", "Ailén", "Nico", "Valen", "Lara", "Bruno", "Mica", "Facu", "Delfi", "Santi", "Ema", "Rocío", "Joaco", "Abril", "Lucho", "Pilar", "Gonza", "Male", "Fran", "Agus"];
  const files = ["lamina_final.pdf", "planta_baja.pdf", "TP2_cortes.pdf", "apuntes.pdf", "maqueta_planos.pdf", "entrega_parcial.pdf", "monografia.pdf", "portfolio.pdf"];
  const studentOrder = (ticket, index, status, specs = {}) => {
    const pages = specs.pages || 2 + ((index * 7) % 14);
    const mode = specs.mode || (index % 4 === 3 ? "color" : "bn");
    return order({
      id: `order-${ticket}`, ticket, localId: SHOP_LOCAL_ID, owner: names[index % names.length],
      file: sampleFile(files[index % files.length], pages),
      specs: { ...DEFAULT_SPECS, notes: "", ...specs, pages, mode },
      total: pages * (mode === "color" ? 150 : 50), status, createdAt: ago(60 - (index % 28) * 2),
      payment: index % 3 ? "tarjeta" : "efectivo",
    });
  };

  // Cola virtual de El Poli: el #34 se está imprimiendo y del #35 al #57 esperan (23 en total,
  // como dice el local). El #36 no está: es el pedido de la demo, que va en la Tanda 1.
  // Los #30 a #33 ya se imprimieron: dos esperan que los retiren.
  const queueTickets = [34, 35, ...Array.from({ length: 21 }, (_, i) => 37 + i)];
  orders.push(
    ...[30, 31].map((ticket, i) => studentOrder(ticket, i, "entregado")),
    ...[32, 33].map((ticket, i) => studentOrder(ticket, i + 2, "listo")),
    ...queueTickets.map((ticket, i) => studentOrder(ticket, i + 4, ticket === 34 ? "imprimiendo" : "en-cola")),
  );

  // Pedidos sumados a las tandas de El Poli (la Tanda 1 ya tiene el #36).
  let tandaTicket = 60;
  tandas.filter((tanda) => tanda.localId === SHOP_LOCAL_ID).forEach((tanda) => {
    const already = orders.filter((item) => item.tandaId === tanda.id).length;
    for (let i = already; i < tanda.participants; i += 1) {
      const pages = tanda.minPages + (i % (tanda.maxPages - tanda.minPages + 1));
      orders.push({
        ...studentOrder(tandaTicket, tandaTicket, "en-cola", { pages, size: tanda.size, mode: tanda.mode, paper: tanda.paper, grammage: tanda.grammage }),
        tandaId: tanda.id,
      });
      tandaTicket += 1;
    }
  });

  return {
    version: 6,
    demoClock: DEMO_CLOCK,
    draft: emptyDraft(),
    locals,
    alerts,
    reviews,
    orders,
    tandas,
    savedLocalIds: [],
    savedCard: null,
    nextTicket: tandaTicket,
  };
}
