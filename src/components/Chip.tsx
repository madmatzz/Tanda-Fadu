import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type ChipTone =
  | "neutral"
  | "accent"
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "ink"
  | "glass"
  | "tanda";
export type ChipVariant = "soft" | "outline";
export type ChipSize = "sm" | "md";

export interface ChipProps {
  children: ReactNode;
  tone?: ChipTone;
  variant?: ChipVariant;
  size?: ChipSize;
  icon?: ReactNode;
}

const softClass: Record<ChipTone, string> = {
  neutral: "border-border-soft bg-surface-soft text-text-secondary",
  accent: "border-accent-border bg-accent-soft text-accent-ink",
  success: "border-success-border bg-success-soft text-success",
  info: "border-info-border bg-info-soft text-info",
  warning: "border-warning-border bg-warning-bg text-warning",
  danger: "border-danger-border bg-danger-soft text-danger",
  ink: "border-transparent bg-ink text-surface",
  glass: "border-border-soft bg-glass-strong text-ink backdrop-blur-glass",
  tanda: "border-tanda-border bg-tanda-soft text-tanda",
};

const outlineClass: Record<ChipTone, string> = {
  neutral: "border-border bg-transparent text-text-secondary",
  accent: "border-accent-border bg-glass text-accent-ink",
  success: "border-success-border bg-glass text-success",
  info: "border-info-border bg-glass text-info",
  warning: "border-warning-border bg-glass text-warning",
  danger: "border-danger-border bg-glass text-danger",
  ink: "border-ink bg-transparent text-ink",
  glass: "border-border-soft bg-transparent text-ink backdrop-blur-glass",
  tanda: "border-tanda-border bg-glass text-tanda",
};

const sizeClass: Record<ChipSize, string> = {
  sm: "px-3 py-1 text-caption",
  md: "px-4 py-2 text-small",
};

export function Chip({ children, tone = "neutral", variant = "soft", size = "sm", icon }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-pill border font-semibold",
        sizeClass[size],
        variant === "soft" ? softClass[tone] : outlineClass[tone],
      )}
    >
      {icon}
      {children}
    </span>
  );
}
