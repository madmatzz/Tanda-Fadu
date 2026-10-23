import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type ActionCardTone = "ink" | "accent" | "surface" | "sunrise";

interface ActionCardProps {
  icon: ReactNode;
  label: string;
  value?: string;
  description?: string;
  tone?: ActionCardTone;
  onClick?: () => void;
}

const toneClass: Record<ActionCardTone, string> = {
  ink: "border-ink bg-ink-fade text-surface shadow-float hover:border-ink-soft",
  accent: "border-accent bg-sunset text-ink shadow-glow hover:brightness-105",
  surface: "border-border bg-surface text-ink shadow-soft hover:border-accent-border hover:shadow-float",
  sunrise: "border-accent-border bg-sunrise text-ink shadow-soft hover:border-accent hover:shadow-float",
};

const iconClass: Record<ActionCardTone, string> = {
  ink: "border-glass-border/30 bg-surface/10 text-surface",
  accent: "border-ink/10 bg-ink/10 text-ink",
  surface: "border-border-soft bg-fill text-ink",
  sunrise: "border-accent-border bg-surface/60 text-accent-ink",
};

export function ActionCard({
  icon,
  label,
  value,
  description,
  tone = "surface",
  onClick,
}: ActionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col items-center justify-center gap-3 rounded-lg border px-card py-7 text-center transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px",
        toneClass[tone],
      )}
    >
      <span className={cn("flex size-control items-center justify-center rounded-pill border", iconClass[tone])}>
        {icon}
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-h3">{label}</span>
        {value && <span className="text-big-number">{value}</span>}
        {description && <span className="text-caption opacity-80">{description}</span>}
      </span>
    </button>
  );
}
