import type {
  Alert,
  AlertKind,
  DemoState,
  Local,
  Order,
  PrintSpecs,
  Review,
  StockLevel,
  Tanda,
} from "./types";
import { paperStockId } from "./pricing";

export function localByIdOrSlug(state: DemoState, idOrSlug: string): Local | undefined {
  return state.locals.find((local) => local.slug === idOrSlug || local.id === idOrSlug);
}

export function localById(state: DemoState, id: string): Local | undefined {
  return state.locals.find((local) => local.id === id);
}

export function tandaById(state: DemoState, id: string): Tanda | undefined {
  return state.tandas.find((tanda) => tanda.id === id);
}

export function orderById(state: DemoState, id: string): Order | undefined {
  return state.orders.find((order) => order.id === id);
}

export function userOrders(state: DemoState): Order[] {
  return state.orders
    .filter((order) => order.owner === "Lucía Pérez")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function activeUserOrder(state: DemoState): Order | undefined {
  return userOrders(state).find((order) => order.status !== "entregado");
}

export function shopOrders(state: DemoState, localId: string): Order[] {
  return state.orders
    .filter((order) => order.localId === localId)
    .sort((a, b) => b.ticket - a.ticket);
}

export function tandaOrders(state: DemoState, tandaId: string): Order[] {
  return state.orders
    .filter((order) => order.tandaId === tandaId)
    .sort((a, b) => b.ticket - a.ticket);
}

export function activeAlerts(state: DemoState, localId?: string): Alert[] {
  return state.alerts.filter((alert) => alert.active && (!localId || alert.localId === localId));
}

export function unreadAlerts(state: DemoState): number {
  return state.alerts.filter((alert) => alert.active && !alert.read).length;
}

export function localAlerts(state: DemoState, localId: string): Alert[] {
  return activeAlerts(state, localId);
}

export function localReviews(state: DemoState, localId: string): Review[] {
  return state.reviews
    .filter((review) => review.localId === localId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function ratingBreakdown(local: Local): Array<{ label: string; value: number }> {
  return [
    { label: "Calidad", value: local.rating },
    { label: "Precio", value: Math.max(0, Math.min(5, Math.round((local.rating - 0.2) * 10) / 10)) },
    { label: "Velocidad", value: Math.max(0, Math.min(5, Math.round((local.rating + 0.1) * 10) / 10)) },
  ];
}

export function optimalTime(local: Local): string {
  return local.bestTime;
}

export function specsStock(local: Local, specs: PrintSpecs): StockLevel {
  const id = paperStockId(specs);
  return local.stock[id] ?? "out";
}

export function tandaCompatible(tanda: Tanda, specs: PrintSpecs): boolean {
  return (
    tanda.size === specs.size &&
    tanda.mode === specs.mode &&
    tanda.paper === specs.paper &&
    tanda.minPages <= specs.pages &&
    tanda.maxPages >= specs.pages &&
    tanda.participants < tanda.capacity
  );
}

export function findCompatibleTanda(state: DemoState, specs: PrintSpecs, localId?: string): Tanda | undefined {
  return state.tandas.find(
    (tanda) =>
      (!localId || tanda.localId === localId) &&
      tandaCompatible(tanda, specs),
  );
}

export function alertTone(kind: AlertKind): "warning" | "danger" | "accent" | "info" {
  if (kind === "stock") return "warning";
  if (kind === "tecnico") return "danger";
  if (kind === "descuento") return "accent";
  return "info";
}

export function alertIconName(kind: AlertKind): "package" | "wrench" | "tag" | "info" {
  if (kind === "stock") return "package";
  if (kind === "tecnico") return "wrench";
  if (kind === "descuento") return "tag";
  return "info";
}

export function isActiveStatus(status: Order["status"]): boolean {
  return status !== "entregado";
}

export function formatOrderFiles(count: number): string {
  return `${count} ${count === 1 ? "archivo" : "archivos"}`;
}
