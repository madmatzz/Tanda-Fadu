import type { ReactNode } from "react";
import { Card } from "./Card";

export function InfoCard({
  title,
  children,
  steps,
}: {
  title?: string;
  children?: ReactNode;
  steps?: string[];
}) {
  return (
    <Card>
      <div className="flex flex-col gap-4">
        {title && <p className="text-h2 text-ink">{title}</p>}
        {children && <div className="text-body text-text-secondary">{children}</div>}
        {steps && steps.length > 0 && (
          <ol className="flex flex-col gap-3">
            {steps.map((step, index) => (
              <li key={step} className="flex items-center gap-3">
                <span className="flex size-control-sm shrink-0 items-center justify-center rounded-sm border border-border-soft bg-fill text-small font-semibold text-ink">
                  {index + 1}
                </span>
                <span className="text-body text-text-secondary">{step}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Card>
  );
}
