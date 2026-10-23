export type Role = "student" | "shop";

export type PaperSize = "A4" | "A3";
export type PrintMode = "bn" | "color";
export type PaperKind = "obra" | "ilustracion" | "reciclado";
export type Grammage = "80" | "120" | "150";

export type PaperId = "obra-80" | "obra-120" | "ilustracion-150" | "reciclado-90" | "foamboard-3";
export type StockLevel = "ok" | "low" | "out";

export type ServiceId =
  | "bn"
  | "color"
  | "a3"
  | "anillado"
  | "plastificado"
  | "escaneo"
  | "gran-formato";

export type PaymentMethod = "mercado-pago" | "efectivo" | "tarjeta";

/** Tarjeta recordada para el próximo pedido. Solo se guardan datos no sensibles. */
export interface SavedCard {
  brand: "visa" | "mastercard" | "otra";
  kind: "Débito" | "Crédito";
  last4: string;
}

export type FileKind = "pdf" | "docx" | "jpg";
/** ajustable: tiene problemas que la app corrige si el usuario toca "Ajustar". */
export type ValidationState =
  | "pendiente"
  | "optimo"
  | "ajustable"
  | "conversion"
  | "convertido"
  | "rechazado";
export type FileColor = "rgb" | "gris";

export interface DemoFile {
  name: string;
  sizeLabel: string;
  pages: number;
  kind: FileKind;
  state: ValidationState;
  progress?: number;
  convertedFrom?: string;
  /** Datos que la app "lee" del archivo al subirlo. */
  pageSize?: PaperSize;
  ppi?: number;
  color?: FileColor;
}

export type SpecialId = "recorte" | "montaje" | "rotulado";
export type MountMaterial = "carton" | "foamboard" | "telgopor";

export interface PrintSpecs {
  /** Pedidos especiales (selección múltiple). */
  specials?: SpecialId[];
  mountMaterial?: MountMaterial;
  /** Nombre del archivo de rótulo subido. */
  labelFile?: string | null;
  pages: number;
  /** Rango escrito por el usuario, ej. "1-8" o "1-3, 6". `pages` guarda la cantidad resultante. */
  range?: string;
  copies: number;
  size: PaperSize;
  mode: PrintMode;
  paper: PaperKind;
  grammage: Grammage;
  notes: string;
}

export type LocalTone = "sunset" | "ink" | "sunrise";

export interface LocalQueue {
  virtual: number;
  inPerson: number;
  waitVirtual: number;
  waitInPerson: number;
  updatedAt: string;
}

export interface Local {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  initials: string;
  floor: string;
  floorLabel: string;
  hours: string;
  phone: string;
  rating: number;
  reviewCount: number;
  priceMultiplier: number;
  services: ServiceId[];
  papers: PaperId[];
  stock: Record<PaperId, StockLevel>;
  queue: LocalQueue;
  occupancy: number[];
  bestTime: string;
  map: { floor: number; x: number; y: number };
  tone: LocalTone;
  hasLogo?: boolean;
}

export type AlertKind = "stock" | "tecnico" | "descuento" | "info";

export interface Alert {
  id: string;
  localId?: string;
  kind: AlertKind;
  title: string;
  body: string;
  createdAt: string;
  active: boolean;
  read: boolean;
}

export interface Review {
  id: string;
  localId: string;
  author: string;
  rating: number;
  text: string;
  createdAt: string;
  reply?: string;
  replyAt?: string;
}

export type OrderStatus = "confirmado" | "en-cola" | "imprimiendo" | "listo" | "entregado";

export interface Order {
  id: string;
  code: string;
  ticket: number;
  localId: string;
  owner: string;
  file: DemoFile;
  specs: PrintSpecs;
  total: number;
  status: OrderStatus;
  createdAt: string;
  readyAt: string;
  payment: PaymentMethod;
  filesCount: number;
  tandaId?: string;
}

export interface Tanda {
  id: string;
  label: string;
  localId: string;
  userTitle: string;
  shopTitle: string;
  size: PaperSize;
  mode: PrintMode;
  paper: PaperKind;
  grammage: Grammage;
  minPages: number;
  maxPages: number;
  participants: number;
  capacity: number;
  waitMin: number;
  closesAt: string;
  shopStat: { people: number; minutes: number; files: number };
  featured: boolean;
}

export interface Draft {
  flow: "print" | "tanda";
  file: DemoFile | null;
  specs: PrintSpecs;
  localId: string | null;
  tandaId: string | null;
  payment: PaymentMethod | null;
}

export interface DemoState {
  version: number;
  role: Role;
  demoClock: string;
  draft: Draft;
  locals: Local[];
  alerts: Alert[];
  reviews: Review[];
  orders: Order[];
  tandas: Tanda[];
  lastQueueReport: Record<string, string>;
  savedLocalIds: string[];
  savedCard?: SavedCard | null;
  nextTicket: number;
}

export type QueueCrowd = "low" | "medium" | "high";
