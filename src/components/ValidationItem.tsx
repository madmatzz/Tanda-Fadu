import { Check } from "lucide-react";
import { ErrorNote } from "./ErrorNote";

export interface ValidationItemProps {
  status: "ok" | "error" | "warning" | "running" | "pending";
  label: string;
  value?: string;
  detail?: string;
}

export function ValidationItem({ status, label, value, detail }: ValidationItemProps) {
  if (status === "error" || status === "warning") {
    return (
      <ErrorNote title={label} tone={status === "warning" ? "warning" : "danger"}>
        {detail}
      </ErrorNote>
    );
  }

  if (status === "ok") {
    return (
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-body text-text-secondary">
          <span className="flex size-icon shrink-0 items-center justify-center rounded-pill bg-success-soft text-success">
            <Check aria-hidden className="size-3" />
          </span>
          {label}
        </span>
        {value && <span className="text-right text-body text-ink">{value}</span>}
      </div>
    );
  }

  if (status === "running") {
    return (
      <div className="flex items-center gap-2 text-body text-ink">
        <span className="flex size-icon shrink-0 items-center justify-center rounded-pill border border-accent-border bg-accent-soft">
          <span aria-hidden className="size-2 animate-pulse rounded-pill bg-accent" />
        </span>
        {label}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-body text-text-muted">
      <span aria-hidden className="flex size-icon shrink-0 items-center justify-center rounded-pill border border-dashed border-border">
        —
      </span>
      {label}
    </div>
  );
}
