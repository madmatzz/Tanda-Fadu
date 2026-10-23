import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export interface RadioCardProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: string;
  description?: string;
  aside?: ReactNode;
  children?: ReactNode;
  tone?: "ink" | "accent";
  disabled?: boolean;
  /** sm: versión compacta para usar varias en una fila. */
  size?: "md" | "sm";
}

// Clases completas (no interpoladas) para que Tailwind las detecte.
const selectedCardClass: Record<NonNullable<RadioCardProps["tone"]>, string> = {
  ink: "border-ink bg-surface-soft ring-2 ring-ink cursor-pointer shadow-soft",
  accent: "border-accent bg-sunrise ring-2 ring-accent cursor-pointer shadow-soft",
};

const indicatorBorderClass: Record<NonNullable<RadioCardProps["tone"]>, string> = {
  ink: "border-ink",
  accent: "border-accent",
};

const indicatorDotClass: Record<NonNullable<RadioCardProps["tone"]>, string> = {
  ink: "bg-ink",
  accent: "bg-accent",
};

export function RadioCard({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  aside,
  children,
  tone = "ink",
  disabled = false,
  size = "md",
}: RadioCardProps) {
  const compact = size === "sm";
  const cardClass = disabled
    ? "border border-border-soft bg-surface-soft cursor-not-allowed"
    : checked
      ? selectedCardClass[tone]
      : "border border-border-soft bg-surface shadow-soft hover:border-accent-border hover:shadow-float cursor-pointer";

  const indicatorBorder = disabled ? "border-disabled" : checked ? indicatorBorderClass[tone] : "border-text-muted";
  const indicatorDot = disabled ? "bg-disabled" : indicatorDotClass[tone];

  return (
    <label
      className={cn(
        "block transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent",
        compact ? "rounded-md p-3" : "rounded-lg p-card",
        cardClass,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <span className={cn("flex items-start", compact ? "flex-col gap-2" : "gap-3")}>
        <span
          className={cn(
            "flex size-icon shrink-0 items-center justify-center rounded-pill border-2",
            !compact && "mt-1",
            indicatorBorder,
          )}
        >
          {checked && <span className={cn("size-2 rounded-pill", indicatorDot)} />}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-center justify-between gap-3">
            <span
              className={cn(
                compact ? "text-small font-semibold" : "text-h3",
                disabled ? "text-text-muted" : "text-ink",
              )}
            >
              {title}
            </span>
            {aside}
          </span>
          {description && (
            <span className={cn(compact ? "text-caption" : "text-small", "text-text-secondary")}>
              {description}
            </span>
          )}
          {children}
        </span>
      </span>
    </label>
  );
}
