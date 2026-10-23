import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export type IconButtonTone = "glass" | "surface" | "ink" | "accent";
export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> {
  label: string;
  icon: ReactNode;
  tone?: IconButtonTone;
  size?: IconButtonSize;
}

const toneClass: Record<IconButtonTone, string> = {
  glass:
    "border-border-soft bg-glass text-ink shadow-soft backdrop-blur-glass hover:bg-glass-strong",
  surface: "border-border-soft bg-surface text-ink shadow-soft hover:bg-surface-soft",
  ink: "border-transparent bg-ink text-surface shadow-float hover:bg-ink-soft",
  accent: "border-transparent bg-accent text-ink shadow-glow hover:bg-accent-dark hover:text-surface",
};

const sizeClass: Record<IconButtonSize, string> = {
  sm: "size-control-sm",
  md: "size-control",
  lg: "size-field",
};

export function IconButton({
  label,
  icon,
  tone = "glass",
  size = "md",
  disabled = false,
  type = "button",
  ...rest
}: IconButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      aria-label={label}
      disabled={disabled}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-pill border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px",
        sizeClass[size],
        disabled ? "cursor-not-allowed border-border-soft bg-fill text-disabled shadow-none" : toneClass[tone],
      )}
    >
      {icon}
    </button>
  );
}
