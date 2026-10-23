export const DEMO_CLOCK = "2026-10-21T11:20:00-03:00";

export function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

export function minutesBetween(fromIso: string, toIso: string): number {
  return Math.max(0, Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 60_000));
}

export function minutesAgoLabel(fromIso: string, nowIso: string): string {
  const minutes = minutesBetween(fromIso, nowIso);
  if (minutes <= 1) return "hace un momento";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  return `hace ${hours} h`;
}

export function clockLabel(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function dateLabel(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

export function formatMoney(value: number): string {
  return `$${Math.round(value).toLocaleString("es-AR")}`;
}

export function plural(count: number, singular: string, pluralForm: string): string {
  return count === 1 ? singular : pluralForm;
}
