import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/cn";

export type ButtonVariant = "primary" | "accent" | "outline" | "warning" | "glass" | "soft";
export type ButtonSize = "md" | "lg";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "className"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  type?: "button" | "submit";
}

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px";

const sizeClass: Record<ButtonSize, string> = {
  md: "h-field px-card text-small font-semibold",
  lg: "h-cta px-6 text-body-strong",
};

const variantClass: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-ink text-surface shadow-float",
  accent: "border-transparent bg-accent text-ink shadow-glow",
  outline: "border-border bg-surface text-ink shadow-soft",
  warning: "border-warning-border bg-warning-bg text-warning shadow-soft",
  glass: "border-glass-border bg-glass text-ink shadow-soft backdrop-blur-glass",
  soft: "border-accent-border bg-accent-soft text-accent-ink shadow-soft",
};

const hoverClass: Record<ButtonVariant, string> = {
  primary: "hover:bg-ink-soft",
  accent: "hover:bg-accent-dark hover:text-surface",
  outline: "hover:bg-surface-soft",
  warning: "hover:bg-warning-border",
  glass: "hover:bg-glass-strong",
  soft: "hover:bg-accent-border",
};

const disabledClass = "border-border-soft bg-fill text-disabled shadow-none";

export function Button({
  variant = "primary",
  size = "lg",
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  const inactive = disabled || loading;

  return (
    <button
      {...rest}
      type={type}
      disabled={inactive}
      aria-busy={loading || undefined}
      className={cn(
        base,
        sizeClass[size],
        disabled ? disabledClass : variantClass[variant],
        !inactive && hoverClass[variant],
        fullWidth && "w-full",
        inactive && "cursor-not-allowed",
      )}
    >
      {loading ? <Loader2 aria-hidden className="size-icon animate-spin" /> : icon}
      {children}
    </button>
  );
}
