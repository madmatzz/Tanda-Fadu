import type { ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-label-caps uppercase text-text-muted">{children}</p>;
}
