import type { ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "../lib/cn";

interface ErrorNoteProps {
  title?: string;
  children?: ReactNode;
  /** warning: problema que la app puede corregir. */
  tone?: "danger" | "warning";
}

const toneClass = {
  danger: "border-danger-border bg-danger-soft text-danger",
  warning: "border-warning-border bg-warning-bg text-warning",
};

// Error en terracota: visible y accesible sin salir de la paleta cálida.
export function ErrorNote({ title, children, tone = "danger" }: ErrorNoteProps) {
  const Icon = tone === "warning" ? AlertTriangle : X;
  return (
    <div className={cn("flex items-start gap-2 rounded-md border p-3 text-body", toneClass[tone])}>
      <Icon aria-hidden className="mt-1 size-icon shrink-0" />
      <div className="flex min-w-0 flex-col gap-1">
        {title && <span className="text-body-strong">{title}</span>}
        {children && <span>{children}</span>}
      </div>
    </div>
  );
}
