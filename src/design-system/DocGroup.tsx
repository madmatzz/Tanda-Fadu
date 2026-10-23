import type { ReactNode } from "react";
import { SectionLabel } from "../components/SectionLabel";
import { cn } from "../lib/cn";

interface DocGroupProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function DocGroup({ label, children, className }: DocGroupProps) {
  return (
    <div className={cn("rounded-lg border border-border-soft bg-surface p-card shadow-soft", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <SectionLabel>{label}</SectionLabel>
        <span className="size-2 rounded-pill bg-accent" />
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}
