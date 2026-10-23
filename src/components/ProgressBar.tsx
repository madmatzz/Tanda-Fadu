import { cn } from "../lib/cn";

interface ProgressBarProps {
  value: number;
  tone?: "default" | "accent" | "success";
  label?: string;
  valueLabel?: string;
}

const fillClass: Record<NonNullable<ProgressBarProps["tone"]>, string> = {
  default: "bg-ink",
  accent: "bg-sunset",
  success: "bg-success",
};

export function ProgressBar({ value, tone = "default", label, valueLabel }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="flex flex-col gap-2">
      {(label || valueLabel) && (
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-body text-text-secondary">{label}</span>
          <span className="text-body text-ink">{valueLabel ?? `${clamped}%`}</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label ?? "Progreso"}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        className="h-2 w-full overflow-hidden rounded-pill bg-fill-deep shadow-rim"
      >
        {/* eslint-disable-next-line tokens/no-raw-design-values -- el ancho depende del valor en runtime (%), no es un token */}
        <div className={cn("h-full rounded-pill", fillClass[tone])} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
