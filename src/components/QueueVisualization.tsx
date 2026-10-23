import { Check, Printer, UserRound } from "lucide-react";
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
      <div className="flex gap-2">
        {fill.map((className, index) => (
          <span key={labels[index]} className={cn("h-2 flex-1 rounded-pill", className)} />
        ))}
      </div>
      <div className="flex justify-between gap-2">
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

function PersonFigure({
  color,
  highlight = false,
}: {
  color: "muted" | "ink" | "accent";
  highlight?: boolean;
}) {
  const colorClass = color === "muted" ? "bg-fill-deep" : color === "accent" ? "bg-accent" : "bg-ink";
  return (
    <span className={cn("flex flex-col items-center gap-1", highlight && "scale-110")}>
      <span className={cn("size-3 rounded-pill", colorClass)} />
      <span className={cn("h-6 w-8 rounded-t-pill rounded-b-sm", colorClass)} />
    </span>
  );
}

export function QueueVisualization({
  variant,
  highlight = true,
  ticket = 36,
}: {
  variant: "virtual" | "in-person";
  highlight?: boolean;
  ticket?: number;
}) {
  if (variant === "in-person") {
    return (
      <div className="flex items-end justify-between gap-1" role="img" aria-label="Cola presencial: tres personas antes, vos y tres personas después">
        <PersonFigure color="muted" />
        <PersonFigure color="muted" />
        <PersonFigure color="muted" />
        <PersonFigure color={highlight ? "accent" : "ink"} highlight={highlight} />
        <PersonFigure color="ink" />
        <PersonFigure color="ink" />
        <PersonFigure color="ink" />
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-1" role="img" aria-label="Cola virtual: siete personas antes de tu pedido y dos pedidos después">
      <div className="flex flex-col items-center gap-1">
        <span className="flex size-control items-center justify-center rounded-pill bg-fill text-text-muted">
          <UserRound aria-hidden className="size-icon" />
        </span>
        <span className="text-small font-semibold text-text-muted">+7</span>
        <span className="text-caption text-text-muted">En cola</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <PersonFigure color="muted" />
        <span className="text-small font-semibold text-ink">{ticket + 1}</span>
        <span className="text-caption text-text-secondary">Martín</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <PersonFigure color="accent" highlight />
        <span className="text-small font-semibold text-accent-ink">{ticket}</span>
        <span className="text-caption font-semibold text-ink">Vos</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <PersonFigure color="ink" />
        <span className="text-small font-semibold text-ink">{ticket - 1}</span>
        <span className="text-caption text-text-secondary">Camila</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="flex size-control items-center justify-center rounded-pill bg-ink text-surface">
          <Printer aria-hidden className="size-icon" />
        </span>
        <span className="text-small font-semibold text-ink">{ticket - 2}</span>
        <span className="text-caption text-text-secondary">Imprimiendo</span>
      </div>
    </div>
  );
}
