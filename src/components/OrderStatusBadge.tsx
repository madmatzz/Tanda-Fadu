import { Chip, type ChipTone } from "./Chip";
import type { OrderStatus } from "../demo/types";
import { statusLabels } from "../demo/pricing";

const toneByStatus: Record<OrderStatus, ChipTone> = {
  confirmado: "neutral",
  "en-cola": "info",
  imprimiendo: "ink",
  listo: "success",
  entregado: "neutral",
};

export function OrderStatusBadge({
  status,
  shop = false,
  size = "sm",
}: {
  status: OrderStatus;
  shop?: boolean;
  size?: "sm" | "md";
}) {
  const label = shop && status === "listo" ? "Impreso" : statusLabels[status];
  return (
    <Chip tone={toneByStatus[status]} size={size}>
      {label}
    </Chip>
  );
}
