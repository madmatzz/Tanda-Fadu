import type { ReactNode } from "react";
import { SectionLabel } from "../components/SectionLabel";

interface DocSectionProps {
  id: string;
  title: string;
  kicker?: string;
  description?: string;
  children: ReactNode;
}

export function DocSection({ id, title, kicker = "Sistema", description, children }: DocSectionProps) {
  return (
    <section id={id} className="flex scroll-mt-header flex-col gap-6">
      <div className="flex flex-col gap-3 border-b border-border-soft pb-5">
        <SectionLabel>{kicker}</SectionLabel>
        <h2 className="text-h1 text-ink">{title}</h2>
        {description && <p className="max-w-prose text-body text-text-secondary">{description}</p>}
      </div>
      {children}
    </section>
  );
}
