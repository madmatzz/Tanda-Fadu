import type { ReactNode } from "react";
import { cn } from "../lib/cn";

interface LinkTextProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  size?: "body" | "small";
  disabled?: boolean;
}

export function LinkText({ children, href, onClick, size = "body", disabled = false }: LinkTextProps) {
  const className = cn(
    "rounded-xs text-ink underline decoration-accent-border underline-offset-4 transition hover:text-accent-ink hover:decoration-accent focus-visible:outline-2 focus-visible:outline-accent",
    size === "body" ? "text-body" : "text-small",
    disabled && "text-disabled no-underline hover:text-disabled",
  );

  if (href && !disabled) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cn(className, "text-left")}>
      {children}
    </button>
  );
}
