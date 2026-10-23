import { ChevronRight, UserRound } from "lucide-react";
import type { Local, Order } from "../demo/types";
import { modeShort } from "../demo/pricing";
import { cn } from "../lib/cn";
import { LocalLogo } from "./LocalLogo";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderRowProps {
  order: Order;
  local?: Local;
  variant?: "history" | "queue";
  shop?: boolean;
  onOpen?: () => void;
  highlight?: boolean;
  action?: React.ReactNode;
}

export function OrderRow({
  order,
  local,
  variant = "queue",
  shop = false,
  onOpen,
  highlight = false,
  action,
}: OrderRowProps) {
  const content =
    variant === "history" ? (
      <>
        {local && <LocalLogo local={local} size="md" />}
        <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
          <span className="truncate text-h3 text-ink">{local?.name ?? "Local"}</span>
          <span className="text-small text-text-secondary">
            {order.filesCount} {order.filesCount === 1 ? "archivo" : "archivos"} · simple faz · {modeShort(order.specs.mode)}
          </span>
        </span>
        <OrderStatusBadge status={order.status} />
      </>
    ) : (
      <>
        <span className="w-9 shrink-0 text-body-strong text-ink">#{order.ticket}</span>
        <UserRound aria-hidden className="size-icon shrink-0 text-ink" />
        <span className="min-w-0 flex-1 truncate text-body text-ink">{order.owner}</span>
        <span className="shrink-0 text-small text-text-secondary">
          {order.specs.pages} {order.specs.pages === 1 ? "página" : "páginas"}
        </span>
        <OrderStatusBadge status={order.status} shop={shop} />
        {action}
        {onOpen && <ChevronRight aria-hidden className="size-icon shrink-0 text-text-muted" />}
      </>
    );

  const className = cn(
    "flex w-full items-center gap-3 rounded-lg border bg-surface px-4 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    highlight ? "border-accent ring-2 ring-accent" : "border-border-soft shadow-soft",
    onOpen && "hover:border-accent-border hover:shadow-float active:translate-y-px",
  );

  if (onOpen) {
    return (
      <button type="button" onClick={onOpen} className={className}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
