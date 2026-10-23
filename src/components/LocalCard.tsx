import { Star } from "lucide-react";
import type { Local } from "../demo/types";
import { cn } from "../lib/cn";
import { Chip } from "./Chip";
import { LocalLogo } from "./LocalLogo";

interface LocalCardProps {
  local: Local;
  selected?: boolean;
  onClick?: () => void;
}

function stockSummary(local: Local): { label: string; tone: "success" | "warning" | "danger" } {
  const levels = Object.values(local.stock);
  if (levels.includes("out")) return { label: "Stock crítico", tone: "danger" };
  if (levels.includes("low")) return { label: "Stock bajo", tone: "warning" };
  return { label: "Stock OK", tone: "success" };
}

export function LocalCard({ local, selected = false, onClick }: LocalCardProps) {
  const stock = stockSummary(local);
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-3 rounded-lg border p-card text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px",
        selected
          ? "border-accent bg-sunrise ring-2 ring-accent shadow-soft"
          : "border-border-soft bg-surface shadow-soft hover:border-accent-border hover:shadow-float",
      )}
    >
      <div className="flex items-start gap-3">
        <LocalLogo local={local} size="md" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-start justify-between gap-2">
            <span className="truncate text-h3 text-ink">{local.name}</span>
            <span className="flex shrink-0 items-center gap-1 text-small font-semibold text-ink">
              <Star aria-hidden className="size-3 fill-accent text-accent" />
              {local.rating.toFixed(1).replace(".", ",")}
            </span>
          </span>
          <span className="text-small font-semibold text-text-secondary">{local.tagline}</span>
          <span className="text-caption text-text-muted">{local.hours}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 border-t border-border-soft pt-2">
          <span className="text-caption text-text-secondary">Cola virtual</span>
          <span className="text-body-strong text-ink">{local.queue.waitVirtual} min</span>
        </div>
        <div className="flex flex-col gap-1 border-t border-border-soft pt-2">
          <span className="text-caption text-text-secondary">Cola presencial</span>
          <span className="text-body-strong text-ink">{local.queue.waitInPerson} min</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-caption text-text-muted">
          {local.floorLabel} · actualizado hace {Math.max(1, local.queue.inPerson)} min
        </span>
        <Chip tone={stock.tone}>{stock.label}</Chip>
      </div>
    </button>
  );
}
