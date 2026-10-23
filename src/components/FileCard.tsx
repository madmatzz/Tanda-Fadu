import type { ReactNode } from "react";
import { FileText, Loader2, Trash2 } from "lucide-react";
import { Card } from "./Card";
import { ErrorNote } from "./ErrorNote";
import { cn } from "../lib/cn";

export interface FileCardProps {
  name: string;
  meta?: string;
  showIcon?: boolean;
  state?: "ready" | "loading" | "error";
  errorMessage?: string;
  onRemove?: () => void;
  disabled?: boolean;
  children?: ReactNode;
}

export function FileCard({
  name,
  meta,
  showIcon = false,
  state = "ready",
  errorMessage,
  onRemove,
  disabled = false,
  children,
}: FileCardProps) {
  const ink = disabled ? "text-text-muted" : "text-ink";

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          {showIcon && (
            <span
              className={cn(
                "flex size-logo shrink-0 items-center justify-center rounded-md",
                disabled ? "bg-fill text-text-muted" : "bg-accent-soft text-accent-ink",
              )}
            >
              <FileText aria-hidden className="size-icon-lg" />
            </span>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className={cn("truncate text-h3", ink)}>{name}</span>
            {meta && <span className="text-small text-text-secondary">{meta}</span>}
          </div>
          {state === "loading" && (
            <Loader2 aria-label="Subiendo archivo" className="mt-1 size-icon shrink-0 animate-spin text-accent" />
          )}
          {state !== "loading" && onRemove && (
            <button
              type="button"
              aria-label="Quitar archivo"
              onClick={onRemove}
              disabled={disabled}
              className="-my-3 -mr-card flex size-field shrink-0 items-center justify-center rounded-pill text-ink transition hover:bg-fill focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:text-disabled"
            >
              <Trash2 aria-hidden className="size-icon-lg" />
            </button>
          )}
        </div>
        {state === "error" && <ErrorNote>{errorMessage}</ErrorNote>}
        {children}
      </div>
    </Card>
  );
}
