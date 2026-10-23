import type { ReactNode } from "react";

export function ReceiptTicket({ children }: { children: ReactNode }) {
  return (
    <div className="relative mt-3 rounded-lg border border-border bg-surface-soft">
      <div aria-hidden className="absolute -top-1.5 left-0 right-0 flex justify-between px-2">
        {Array.from({ length: 18 }).map((_, index) => (
          <span key={index} className="size-3 rounded-pill border border-border bg-bg" />
        ))}
      </div>
      <div className="px-card pb-card pt-5">{children}</div>
    </div>
  );
}
