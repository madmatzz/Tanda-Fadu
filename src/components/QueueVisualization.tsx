import type { ReactNode } from "react";
import { Check, Printer } from "lucide-react";
import { cn } from "../lib/cn";

export function SegmentedProgress({
  stage,
  labels = ["Recibido", "En cola", "Listo"],
}: {
  stage: 0 | 1 | 2;
  labels?: [string, string, string];
}) {
  const fill = [
    "bg-ink",
    stage >= 1 ? "bg-accent" : "bg-fill-deep",
    stage >= 2 ? "bg-success" : "bg-fill-deep",
  ];
  return (
    <div className="flex flex-col gap-2" role="img" aria-label={`Estado: ${labels[stage]}`}>
      <div className="grid grid-cols-3 gap-2">
        {fill.map((className, index) => (
          <span key={labels[index]} className={cn("h-2 rounded-pill", className)} />
        ))}
      </div>
      {/* Misma grilla que las barras: cada etiqueta arranca donde arranca su barra. */}
      <div className="grid grid-cols-3 gap-2">
        {labels.map((label, index) => (
          <span
            key={label}
            className={cn(
              "text-small",
              index === stage ? "font-semibold text-ink" : "text-text-secondary",
            )}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function OrderStatusStepper({ completed = 1 }: { completed?: 0 | 1 | 2 | 3 }) {
  const labels = ["Recibido", "Listo para retirar", "Entregado"];
  const current = Math.min(completed, labels.length - 1);
  return (
    <div className="flex flex-col gap-2" role="img" aria-label={`Estado: ${labels[current]}`}>
      <div className="flex items-center">
        {labels.map((label, index) => (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <span
              className={cn(
                "flex size-control shrink-0 items-center justify-center rounded-sm border",
                index < completed
                  ? "border-ink bg-ink text-surface"
                  : "border-border bg-surface text-text-muted",
              )}
            >
              {index < completed ? (
                <Check aria-hidden className="size-icon" />
              ) : (
                <span className={cn("size-2 rounded-pill", index === current ? "bg-ink" : "border border-text-muted")} />
              )}
            </span>
            {index < labels.length - 1 && (
              <span className={cn("h-px flex-1", index < completed - 1 ? "bg-ink" : "bg-border")} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between gap-2">
        {labels.map((label, index) => (
          <span
            key={label}
            className={cn(
              "text-caption",
              index === current ? "font-semibold text-ink" : "text-text-secondary",
            )}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

type FigureColor = "muted" | "ink" | "accent";

const figureColor: Record<FigureColor, string> = {
  muted: "bg-fill-deep",
  ink: "bg-ink",
  accent: "bg-accent",
};

// Persona simple de la cola virtual: cabeza redonda y torso con hombros redondeados.
function PersonFigure({ color, large = false }: { color: FigureColor; large?: boolean }) {
  return (
    <span aria-hidden className="flex h-16 flex-col items-center justify-end gap-1">
      <span className={cn("rounded-pill", large ? "size-7" : "size-5", figureColor[color])} />
      <span
        className={cn(
          "rounded-b-md rounded-t-pill",
          large ? "h-9 w-12" : "h-6 w-9",
          figureColor[color],
        )}
      />
    </span>
  );
}

// Persona de cuerpo entero para la cola presencial.
function StandingFigure({ color }: { color: FigureColor }) {
  return (
    <span aria-hidden className="flex flex-1 flex-col items-center gap-1">
      <span className={cn("size-8 rounded-pill", figureColor[color])} />
      <span className="flex flex-col items-center">
        <span className={cn("h-figure-torso w-8 rounded-pill", figureColor[color])} />
        <span className={cn("-mt-6 h-figure-legs w-6 rounded-b-pill", figureColor[color])} />
      </span>
    </span>
  );
}

function QueueSlot({ figure, number, label, tone = "default" }: {
  figure: ReactNode;
  number: string;
  label: string;
  tone?: "default" | "muted" | "self";
}) {
  return (
    <div className="relative z-10 flex flex-1 flex-col items-center gap-1">
      {figure}
      <span
        className={cn(
          "text-body-strong",
          tone === "self" ? "text-accent" : tone === "muted" ? "text-text-muted" : "text-ink",
        )}
      >
        {number}
      </span>
      <span
        className={cn(
          "whitespace-nowrap text-caption",
          tone === "self" ? "font-semibold text-ink" : tone === "muted" ? "text-text-muted" : "text-text-secondary",
        )}
      >
        {label}
      </span>
    </div>
  );
}

export function QueueVisualization({
  variant,
  ticket = 36,
}: {
  variant: "virtual" | "in-person";
  ticket?: number;
}) {
  if (variant === "in-person") {
    return (
      <div
        className="flex items-end justify-between gap-2"
        role="img"
        aria-label="Cola presencial: tres personas adelante de vos y tres detrás"
      >
        <StandingFigure color="muted" />
        <StandingFigure color="muted" />
        <StandingFigure color="muted" />
        <StandingFigure color="accent" />
        <StandingFigure color="ink" />
        <StandingFigure color="ink" />
        <StandingFigure color="ink" />
      </div>
    );
  }

  return (
    <div
      className="relative flex items-start justify-between gap-1"
      role="img"
      aria-label={`Cola virtual: tu pedido es el ${ticket}, hay uno adelante y otro imprimiéndose`}
    >
      {/* Línea que une la fila, detrás de las figuras */}
      <span aria-hidden className="absolute left-6 right-6 top-10 h-px bg-border" />
      <QueueSlot figure={<PersonFigure color="muted" />} number="+7" label="En cola" tone="muted" />
      <QueueSlot figure={<PersonFigure color="muted" />} number={String(ticket + 1)} label="Martín" />
      <QueueSlot figure={<PersonFigure color="accent" large />} number={String(ticket)} label="Vos" tone="self" />
      <QueueSlot figure={<PersonFigure color="ink" />} number={String(ticket - 1)} label="Camila" />
      <QueueSlot
        figure={
          <span aria-hidden className="flex h-16 items-end">
            <span className="mb-3 flex size-control items-center justify-center rounded-pill bg-ink text-surface">
              <Printer aria-hidden className="size-icon" />
            </span>
          </span>
        }
        number={String(ticket - 2)}
        label="Imprimiendo"
      />
    </div>
  );
}
