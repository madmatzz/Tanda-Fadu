import { Clock, Printer } from "lucide-react";
import type { Order } from "../demo/types";
import { Button } from "./Button";
import { Card } from "./Card";

export function FloatingOrderPill({
  order,
  onOpen,
}: {
  order: Order;
  onOpen: () => void;
}) {
  return (
    <Card tone="ink" padding="none">
      <div className="flex items-center gap-3 p-3">
        <span className="flex size-control shrink-0 items-center justify-center rounded-pill bg-surface/10 text-surface">
          <Printer aria-hidden className="size-icon" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-small font-semibold text-surface">Pedido #{order.ticket} en curso</span>
          <span className="flex items-center gap-1 text-caption text-surface/70">
            <Clock aria-hidden className="size-3" />
            Listo en unos minutos
          </span>
        </div>
        <Button variant="accent" size="md" onClick={onOpen}>
          Mi pedido
        </Button>
      </div>
    </Card>
  );
}
