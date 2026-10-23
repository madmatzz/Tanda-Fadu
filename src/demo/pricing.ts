import type {
  Grammage,
  Local,
  MountMaterial,
  SpecialId,
  PaperId,
  PaperKind,
  PaperSize,
  PrintMode,
  PrintSpecs,
  ServiceId,
  PaymentMethod,
  OrderStatus,
  StockLevel,
} from "./types";

export const paperOptions: Array<{ value: PaperKind; label: string; description: string }> = [
  { value: "obra", label: "Obra", description: "Uso diario" },
  { value: "ilustracion", label: "Ilustración", description: "Acabado liso" },
  { value: "reciclado", label: "Reciclado", description: "Tono natural" },
];

// Precios de referencia de la demo, por pedido (no por página).
export const specialOptions: Array<{ value: SpecialId; label: string; description: string; price?: number }> = [
  { value: "recorte", label: "Recorte de bordes", description: "Corte al ras", price: 400 },
  { value: "montaje", label: "Montar entrega", description: "Sobre placa rígida" },
  { value: "rotulado", label: "Rotulado", description: "Con tus datos", price: 300 },
];

export const mountOptions: Array<{ value: MountMaterial; label: string; description: string; price: number }> = [
  { value: "carton", label: "Cartón montado", description: "Liviano", price: 1500 },
  { value: "foamboard", label: "Foamboard 2 mm", description: "Rígido y prolijo", price: 2500 },
  { value: "telgopor", label: "Telgopor", description: "Más grueso", price: 2000 },
];

export function specialsCost(specs: Pick<PrintSpecs, "specials" | "mountMaterial">): number {
  return (specs.specials ?? []).reduce((acc, id) => {
    if (id === "montaje") {
      return acc + (mountOptions.find((option) => option.value === specs.mountMaterial)?.price ?? 0);
    }
    return acc + (specialOptions.find((option) => option.value === id)?.price ?? 0);
  }, 0);
}

export function specialsLabel(specs: Pick<PrintSpecs, "specials" | "mountMaterial">): string {
  return (specs.specials ?? [])
    .map((id) => {
      if (id === "montaje") {
        const material = mountOptions.find((option) => option.value === specs.mountMaterial);
        return material ? `Montaje: ${material.label}` : "Montaje";
      }
      return specialOptions.find((option) => option.value === id)?.label ?? id;
    })
    .join(" · ");
}

export const grammageOptions: Record<PaperKind, Grammage[]> = {
  obra: ["80", "120"],
  ilustracion: ["150"],
  reciclado: ["80", "120"],
};

export const paperLabels: Record<PaperKind, string> = {
  obra: "Obra",
  ilustracion: "Ilustración",
  reciclado: "Reciclado",
};

export const paperNames: Record<string, string> = {
  "obra-80": "Papel 80g",
  "obra-120": "Papel 120g",
  "ilustracion-150": "Ilustración 150g",
  "reciclado-90": "Reciclado 90g",
  "foamboard-3": "Foamboard 3mm",
};

export const serviceLabels: Record<ServiceId, string> = {
  bn: "Blanco y negro",
  color: "Color",
  a3: "A3",
  anillado: "Anillado",
  plastificado: "Plastificado",
  escaneo: "Escaneo",
  "gran-formato": "Gran formato",
};

export const paymentLabels: Record<PaymentMethod, string> = {
  "mercado-pago": "MercadoPago",
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
};

export const statusLabels: Record<OrderStatus, string> = {
  confirmado: "Recibido",
  "en-cola": "En cola",
  imprimiendo: "Imprimiendo",
  listo: "Listo",
  entregado: "Entregado",
};

export const stockLabels: Record<StockLevel, string> = {
  ok: "Stock OK",
  low: "Stock bajo",
  out: "Sin stock",
};

export function stockTone(level: StockLevel): "success" | "warning" | "danger" {
  if (level === "ok") return "success";
  if (level === "low") return "warning";
  return "danger";
}

export function paperStockId(specs: Pick<PrintSpecs, "paper" | "grammage">): PaperId {
  if (specs.paper === "obra") return specs.grammage === "120" ? "obra-120" : "obra-80";
  if (specs.paper === "ilustracion") return "ilustracion-150";
  return "reciclado-90";
}

export function paperDisplay(specs: Pick<PrintSpecs, "paper" | "grammage">): string {
  if (specs.paper === "ilustracion") return "Ilustración 150 g/m²";
  if (specs.paper === "reciclado") return `Reciclado ${specs.grammage} g/m²`;
  return `Obra ${specs.grammage} g/m²`;
}

export function modeLabel(mode: PrintMode): string {
  return mode === "bn" ? "Blanco y negro" : "Color";
}

export function modeShort(mode: PrintMode): string {
  return mode === "bn" ? "B&N" : "Color";
}

export function sizeLabel(size: PaperSize): string {
  return size;
}

export function specsSummary(specs: PrintSpecs): string {
  return `${specs.pages} ${specs.pages === 1 ? "página" : "páginas"} · ${specs.copies} ${
    specs.copies === 1 ? "copia" : "copias"
  } · ${specs.size} · ${modeShort(specs.mode)}`;
}

export function specsLong(specs: PrintSpecs): string {
  return `${specs.size} · ${paperLabels[specs.paper]} · ${specs.grammage} g/m²`;
}

export function pricePerPage(specs: PrintSpecs, local: Local): number {
  const modeFactor = specs.mode === "color" ? 1.6 : 1;
  const sizeFactor = specs.size === "A3" ? 1.8 : 1;
  const paperFactor = specs.paper === "ilustracion" ? 1.35 : specs.paper === "reciclado" ? 1.15 : 1;
  return Math.round(100 * modeFactor * sizeFactor * paperFactor * local.priceMultiplier);
}

export function estimateTotal(specs: PrintSpecs, local: Local): number {
  const total =
    pricePerPage(specs, local) * specs.pages * specs.copies +
    specialsCost(specs) * local.priceMultiplier;
  return Math.max(100, Math.round(total / 10) * 10);
}

/** Precio de referencia antes de elegir local: promedio entre todos los locales. */
export function averageTotal(specs: PrintSpecs, locals: Local[]): number {
  if (locals.length === 0) return 0;
  const sum = locals.reduce((acc, local) => acc + estimateTotal(specs, local), 0);
  return Math.round(sum / locals.length / 10) * 10;
}

export function averagePricePerPage(specs: PrintSpecs, locals: Local[]): number {
  if (locals.length === 0) return 0;
  const sum = locals.reduce((acc, local) => acc + pricePerPage(specs, local), 0);
  return Math.round(sum / locals.length);
}

export function estimateFromValue(specs: PrintSpecs, multiplier: number): number {
  const modeFactor = specs.mode === "color" ? 1.6 : 1;
  const sizeFactor = specs.size === "A3" ? 1.8 : 1;
  const paperFactor = specs.paper === "ilustracion" ? 1.35 : specs.paper === "reciclado" ? 1.15 : 1;
  const total = 100 * modeFactor * sizeFactor * paperFactor * multiplier * specs.pages * specs.copies;
  return Math.max(100, Math.round(total / 10) * 10);
}

export function humanFileSize(bytes: number): string {
  if (bytes <= 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1).replace(".", ",")} MB`;
}
