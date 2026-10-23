import type { ReactNode } from "react";
import { Card } from "./Card";

interface SummaryBoxProps {
  children: ReactNode;
  note?: string;
}

export function SummaryBox({ children, note }: SummaryBoxProps) {
  return (
    <Card>
      <div className="flex flex-col gap-3">
        {children}
        {note && <p className="text-small text-text-secondary">{note}</p>}
      </div>
    </Card>
  );
}
