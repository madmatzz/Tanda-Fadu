import type { PaperId, StockLevel } from "../demo/types";
import { paperNames } from "../demo/pricing";
import { cn } from "../lib/cn";
import { Chip } from "./Chip";

const levels: Array<{ value: StockLevel; label: string; tone: "success" | "warning" | "danger" }> = [
  { value: "ok", label: "OK", tone: "success" },
  { value: "low", label: "Bajo", tone: "warning" },
  { value: "out", label: "Sin stock", tone: "danger" },
];

interface StockRowProps {
  paperId: PaperId;
  level: StockLevel;
  onChange: (level: StockLevel) => void;
}

export function StockRow({ paperId, level, onChange }: StockRowProps) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border-soft bg-surface p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-body-strong text-ink">{paperNames[paperId]}</span>
        <Chip tone={levels.find((item) => item.value === level)?.tone ?? "neutral"}>
          {levels.find((item) => item.value === level)?.label ?? level}
        </Chip>
      </div>
      <div className="flex gap-2">
        {levels.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={level === item.value}
            aria-label={`${paperNames[paperId]}: ${item.label}`}
            onClick={() => onChange(item.value)}
            className={cn(
              "flex-1 rounded-pill border px-2 py-1 text-caption font-semibold transition focus-visible:outline-2 focus-visible:outline-accent",
              level === item.value
                ? "border-ink bg-ink text-surface"
                : "border-border-soft bg-surface-soft text-text-secondary hover:border-accent-border",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
