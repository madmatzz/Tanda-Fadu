import { Minus, Plus } from "lucide-react";
import { cn } from "../lib/cn";

interface StepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

const stepButtonClass =
  "flex size-control-sm shrink-0 items-center justify-center rounded-pill text-ink transition hover:bg-fill focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:text-disabled disabled:hover:bg-transparent";

export function Stepper({ label, value, onChange, min = 1, max = 99, disabled = false }: StepperProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex h-field items-center justify-between rounded-pill border p-1",
        disabled ? "border-border-soft bg-fill" : "border-border-soft bg-surface shadow-soft",
      )}
    >
      <button
        type="button"
        aria-label="Restar"
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
        className={stepButtonClass}
      >
        <Minus aria-hidden className="size-icon" />
      </button>
      <output aria-live="polite" className={cn("text-body-strong", disabled ? "text-text-muted" : "text-ink")}>
        {value}
      </output>
      <button
        type="button"
        aria-label="Sumar"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
        className={stepButtonClass}
      >
        <Plus aria-hidden className="size-icon" />
      </button>
    </div>
  );
}
