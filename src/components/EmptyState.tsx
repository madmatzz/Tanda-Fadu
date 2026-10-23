import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-surface-soft px-card py-8 text-center">
      {icon && (
        <span className="flex size-field items-center justify-center rounded-pill border border-border-soft bg-surface text-text-secondary">
          {icon}
        </span>
      )}
      <div className="flex flex-col gap-1">
        <p className="text-h3 text-ink">{title}</p>
        {description && <p className="text-small text-text-secondary">{description}</p>}
      </div>
      {action}
    </div>
  );
}
