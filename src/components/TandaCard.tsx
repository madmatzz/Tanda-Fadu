import { Clock, Files, Printer, Users } from "lucide-react";
import type { Local, Tanda } from "../demo/types";
import { modeShort, paperLabels } from "../demo/pricing";
import { cn } from "../lib/cn";
import { Button } from "./Button";
import { Chip } from "./Chip";
import { KeyValueRow } from "./KeyValueRow";
import { ProgressBar } from "./ProgressBar";

interface TandaCardProps {
  tanda: Tanda;
  local?: Local;
  variant?: "student" | "shop";
  selected?: boolean;
  compatible?: boolean;
  onClick?: () => void;
  onCta?: () => void;
}

export function TandaCard({
  tanda,
  local,
  variant = "student",
  selected = false,
  compatible = false,
  onClick,
  onCta,
}: TandaCardProps) {
  if (variant === "shop") {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-border-soft bg-surface p-card shadow-soft">
        <p className="text-label-caps uppercase text-text-muted">{tanda.label}</p>
        <div className="flex items-center gap-3">
          <span className="flex size-logo shrink-0 items-center justify-center rounded-md border border-border-soft bg-fill text-ink">
            <Printer aria-hidden className="size-icon-lg" />
          </span>
          <p className="text-h3 text-ink">{tanda.shopTitle}</p>
        </div>
        <div className="flex items-center justify-between gap-2 text-small text-text-secondary">
          <span className="flex items-center gap-1">
            <Users aria-hidden className="size-icon" />
            <span className="font-semibold text-ink">{tanda.shopStat.people}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock aria-hidden className="size-icon" />
            <span className="font-semibold text-ink">{tanda.shopStat.minutes} min</span>
          </span>
          <span className="flex items-center gap-1">
            <Files aria-hidden className="size-icon" />
            <span className="font-semibold text-ink">{tanda.shopStat.files}</span>
          </span>
        </div>
        <Button variant="primary" size="md" fullWidth onClick={onCta}>
          Detalle de pedidos
        </Button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex w-full flex-col gap-3 rounded-lg border p-card text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px",
        selected
          ? "border-ink bg-surface-soft ring-2 ring-ink shadow-soft"
          : "border-border-soft bg-surface shadow-soft hover:border-accent-border hover:shadow-float",
        !compatible && !selected && "opacity-80",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-h3 text-ink">{tanda.userTitle}</span>
        {tanda.participants >= tanda.capacity ? (
          <Chip tone="warning">Completa</Chip>
        ) : compatible ? (
          <Chip tone="success">Compatible</Chip>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <KeyValueRow label="Local" value={local?.name ?? "Local"} />
        <p className="text-small text-text-secondary">
          {modeShort(tanda.mode)} · {paperLabels[tanda.paper]} · {tanda.grammage} g/m²
        </p>
        <KeyValueRow label="Pedidos agrupados" value={`${tanda.participants}/${tanda.capacity}`} />
        <ProgressBar
          value={(tanda.participants / tanda.capacity) * 100}
          tone="default"
          label={undefined}
          valueLabel={undefined}
        />
        <KeyValueRow label="Espera estimada" value={`${tanda.waitMin} min`} />
      </div>
      {tanda.participants >= tanda.capacity ? (
        <p className="text-small font-semibold text-warning">Esta tanda ya completó su cupo.</p>
      ) : compatible ? (
        <p className="text-small font-semibold text-success">Tu archivo coincide con esta tanda.</p>
      ) : (
        <p className="text-small text-text-muted">
          {modeShort(tanda.mode)} · {paperLabels[tanda.paper]} · {tanda.size} · no compatible
        </p>
      )}
    </button>
  );
}
