import { useEffect, useState, type ReactNode } from "react";
import { FileText, Pencil, RotateCw, X } from "lucide-react";
import { Card } from "./Card";

interface FileSummaryCardProps {
  name: string;
  meta?: string;
  children?: ReactNode;
  onEditSpecs: () => void;
  onReplace: () => void;
}

function OverlayAction({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="flex items-center gap-4 rounded-md px-3 py-3 text-left text-body-strong transition hover:bg-surface/15 focus-visible:outline-2 focus-visible:outline-surface"
    >
      {icon}
      {label}
    </button>
  );
}

// Resumen de un archivo listo. El lápiz (o tocar la tarjeta) muestra las acciones encima.
export function FileSummaryCard({ name, meta, children, onEditSpecs, onReplace }: FileSummaryCardProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative">
      <div className="cursor-pointer" onClick={() => setOpen(true)}>
        <Card>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <span className="flex size-logo shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent-ink">
                <FileText aria-hidden className="size-icon-lg" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-h3 text-ink">{name}</span>
                {meta && <span className="text-small text-text-secondary">{meta}</span>}
              </div>
              <button
                type="button"
                aria-label="Editar archivo"
                aria-expanded={open}
                onClick={(event) => {
                  event.stopPropagation();
                  setOpen(true);
                }}
                className="-my-2 -mr-2 flex size-field shrink-0 items-center justify-center rounded-pill text-accent-ink transition hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-accent"
              >
                <Pencil aria-hidden className="size-icon-lg" />
              </button>
            </div>
            {children && (
              <div onClick={(event) => event.stopPropagation()} className="cursor-auto">
                {children}
              </div>
            )}
          </div>
        </Card>
      </div>

      {open && (
        <div
          className="absolute inset-0 z-10 flex flex-col justify-center gap-1 rounded-lg bg-accent-ink/85 p-card text-surface backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            aria-label="Cerrar opciones"
            onClick={(event) => {
              event.stopPropagation();
              setOpen(false);
            }}
            className="absolute right-2 top-2 flex size-field items-center justify-center rounded-pill transition hover:bg-surface/15 focus-visible:outline-2 focus-visible:outline-surface"
          >
            <X aria-hidden className="size-icon-lg" />
          </button>
          <OverlayAction
            icon={<Pencil aria-hidden className="size-icon-lg" />}
            label="Editar especificaciones"
            onClick={onEditSpecs}
          />
          <OverlayAction
            icon={<RotateCw aria-hidden className="size-icon-lg" />}
            label="Reemplazar archivo"
            onClick={onReplace}
          />
        </div>
      )}
    </div>
  );
}
