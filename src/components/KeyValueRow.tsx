import type { ReactNode } from "react";
import { cn } from "../lib/cn";

interface KeyValueRowProps {
  label: string;
  value: ReactNode;
  emphasis?: "default" | "strong";
}

export function KeyValueRow({ label, value, emphasis = "default" }: KeyValueRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-body text-text-secondary">{label}</span>
      <span className={cn("text-right text-ink", emphasis === "strong" ? "text-body-strong" : "text-body")}>
        {value}
      </span>
    </div>
  );
}
