import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export function MetricCard({
  icon,
  label,
  value,
  meta,
  tone = "surface",
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  meta?: string;
  tone?: "surface" | "sunrise" | "ink";
  onClick?: () => void;
}) {
  const toneClass = {
    surface: "border-border-soft bg-surface text-ink shadow-soft",
    sunrise: "border-accent-border bg-sunrise text-ink shadow-soft",
    ink: "border-ink bg-ink-fade text-surface shadow-float",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col gap-2 rounded-lg border p-3 text-left transition hover:border-accent-border hover:shadow-float focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px",
        toneClass[tone],
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-caption opacity-80">{label}</span>
        <span className={tone === "ink" ? "text-accent" : "text-accent-ink"}>{icon}</span>
      </span>
      <span className="text-h1 leading-none">{value}</span>
      {meta && <span className="text-caption opacity-75">{meta}</span>}
    </button>
  );
}
