import type { ReactNode } from "react";
import { Card } from "./Card";

export function ValidationList({ children }: { children: ReactNode }) {
  return (
    <Card>
      <div className="flex flex-col gap-3">{children}</div>
    </Card>
  );
}
