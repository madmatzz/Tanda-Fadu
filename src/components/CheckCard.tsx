import { Check } from "lucide-react";
import { cn } from "../lib/cn";

export interface CheckCardProps {
  value: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description?: string;
  /** Texto chico al pie, ej. un precio adicional. */
  note?: string;
}

// Versión de selección múltiple de RadioCard (tamaño compacto, tono acento).
export function CheckCard({ value, checked, onChange, title, description, note }: CheckCardProps) {
  return (
    <label
      className={cn(
        "block cursor-pointer rounded-md p-3 transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent",
        checked
          ? "border border-accent bg-sunrise shadow-soft ring-2 ring-accent"
          : "border border-accent-border bg-surface shadow-soft hover:border-accent hover:shadow-float",
      )}
    >
      <input
        type="checkbox"
        value={value}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span className="flex flex-col items-start gap-2">
        <span
          className={cn(
            "flex size-icon shrink-0 items-center justify-center rounded-xs border-2",
            checked ? "border-accent bg-accent text-surface" : "border-accent-border",
          )}
        >
          {checked && <Check aria-hidden className="size-3" />}
        </span>
        <span className="flex min-w-0 flex-col gap-1">
          <span className="text-small font-semibold text-ink">{title}</span>
          {description && <span className="text-caption text-text-secondary">{description}</span>}
          {note && <span className="text-caption font-semibold text-accent-ink">{note}</span>}
        </span>
      </span>
    </label>
  );
}
