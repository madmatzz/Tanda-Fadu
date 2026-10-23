import { BatteryFull, SignalHigh, Wifi } from "lucide-react";
import { useLocation } from "react-router";
import { cn } from "../lib/cn";

export function StatusBar() {
  // En el seguimiento del pedido la pantalla es un ticket: afuera del ticket va surface.
  const onTicket = useLocation().pathname.endsWith("/cola");
  return (
    <div
      className={cn(
        "sticky top-0 z-40 hidden h-14 shrink-0 items-center justify-between px-gutter sm:flex",
        onTicket ? "bg-surface" : "bg-bg",
      )}
    >
      <span className="text-body-strong text-ink">9:41</span>
      <span
        aria-hidden
        className="absolute left-1/2 top-2 h-island-h w-island-w -translate-x-1/2 rounded-pill bg-ink"
      />
      <div className="flex items-center gap-2 text-ink">
        <SignalHigh aria-hidden className="size-icon" />
        <Wifi aria-hidden className="size-icon" />
        <BatteryFull aria-hidden className="size-icon-lg" />
      </div>
    </div>
  );
}
