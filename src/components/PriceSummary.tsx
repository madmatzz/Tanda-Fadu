import { specialsCost } from "../demo/pricing";
import type { PrintSpecs } from "../demo/types";

interface PriceSummaryProps {
  total: number;
  /** De dónde sale el precio, ej. "Promedio entre locales" o "En El Poli". */
  source: string;
  perPage: number;
  specs: Pick<PrintSpecs, "pages" | "copies" | "specials" | "mountMaterial">;
}

// Total para el pie de las pantallas de impresión: origen del precio en la primera línea y detalle en la segunda.
export function PriceSummary({ total, source, perPage, specs }: PriceSummaryProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-baseline justify-between gap-2">
        <span className="min-w-0 text-small text-text-secondary">
          Total estimado <span className="text-caption text-text-muted">· {source}</span>
        </span>
        <span className="shrink-0 text-h2 text-ink">${total}</span>
      </div>
      <span className="text-caption text-text-muted">
        ${perPage} por página · {specs.pages} {specs.pages === 1 ? "página" : "páginas"} · {specs.copies}{" "}
        {specs.copies === 1 ? "copia" : "copias"}
        {specialsCost(specs) > 0 && " · + especiales"}
      </span>
    </div>
  );
}
