import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ErrorNoteProps {
  title?: string;
  children?: ReactNode;
}

// Error en terracota: visible y accesible sin salir de la paleta cálida.
export function ErrorNote({ title, children }: ErrorNoteProps) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-danger-border bg-danger-soft p-3 text-body text-danger">
      <X aria-hidden className="mt-1 size-icon shrink-0" />
      <div className="flex min-w-0 flex-col gap-1">
        {title && <span className="text-body-strong">{title}</span>}
        {children && <span>{children}</span>}
      </div>
    </div>
  );
}
