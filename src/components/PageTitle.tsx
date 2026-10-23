import type { ReactNode } from "react";

export function PageTitle({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {eyebrow && <p className="text-label-caps uppercase text-text-muted">{eyebrow}</p>}
      <h1 className="text-h1 text-ink">{title}</h1>
      {subtitle && <p className="text-body text-text-secondary">{subtitle}</p>}
    </div>
  );
}
