import type { ReactNode } from "react";

export function DocNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-border-soft bg-surface-soft p-4 text-small text-text-secondary">
      {children}
    </p>
  );
}
