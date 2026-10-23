import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type CardTone = "surface" | "glass" | "ink" | "sunrise";

interface CardProps {
  children: ReactNode;
  selected?: "none" | "ink" | "accent" | "success";
  tone?: CardTone;
  padding?: "card" | "none";
}

const toneClass: Record<CardTone, string> = {
  surface: "border-border-soft bg-surface shadow-soft",
  glass: "border-border-soft bg-glass-strong shadow-soft backdrop-blur-glass",
  ink: "border-ink bg-ink text-surface shadow-float",
  sunrise: "border-accent-border bg-sunrise shadow-soft",
};

// La selección usa ring para no mover el contenido al cambiar de estado.
const selectedClass: Record<NonNullable<CardProps["selected"]>, string> = {
  none: "",
  ink: "ring-2 ring-ink",
  accent: "ring-2 ring-accent",
  success: "ring-2 ring-success",
};

export function Card({ children, selected = "none", tone = "surface", padding = "card" }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border",
        toneClass[tone],
        selectedClass[selected],
        padding === "card" && "p-card",
      )}
    >
      {children}
    </div>
  );
}
