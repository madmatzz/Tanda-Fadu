import type { ReactNode } from "react";
import { AlertTriangle, Info, Pencil, Tag, Trash2, Wrench } from "lucide-react";
import type { Alert, Local } from "../demo/types";
import { alertTone, alertIconName } from "../demo/selectors";
import { DEMO_CLOCK, minutesAgoLabel } from "../demo/time";
import { cn } from "../lib/cn";
import { Chip } from "./Chip";
import { LinkText } from "./LinkText";

interface AlertCardProps {
  alert: Alert;
  local?: Local;
  onOpen?: () => void;
  onDeactivate?: () => void;
  onEdit?: () => void;
  compact?: boolean;
}

const toneClass = {
  warning: "border-warning-border bg-warning-bg",
  danger: "border-danger-border bg-danger-soft",
  accent: "border-accent-border bg-accent-soft",
  info: "border-info-border bg-info-soft",
};

const iconToneClass = {
  warning: "bg-warning text-surface",
  danger: "bg-danger text-surface",
  accent: "bg-accent text-ink",
  info: "bg-info text-surface",
};

const textToneClass = {
  warning: "text-warning",
  danger: "text-danger",
  accent: "text-accent-ink",
  info: "text-info",
};

function AlertIcon({ kind, tone }: { kind: Alert["kind"]; tone: "warning" | "danger" | "accent" | "info" }): ReactNode {
  const name = alertIconName(kind);
  const icon = name === "package" ? AlertTriangle : name === "wrench" ? Wrench : name === "tag" ? Tag : Info;
  const Icon = icon;
  return (
    <span className={cn("flex size-control-sm shrink-0 items-center justify-center rounded-pill", iconToneClass[tone])}>
      <Icon aria-hidden className="size-icon" />
    </span>
  );
}

export function AlertCard({ alert, local, onOpen, onDeactivate, onEdit, compact = false }: AlertCardProps) {
  const tone = alertTone(alert.kind);
  const hasActions = Boolean(onOpen || onDeactivate || onEdit);
  return (
    <div className={cn("flex flex-col gap-3 rounded-lg border p-card", toneClass[tone], compact && "p-3")}>
      <div className="flex items-start gap-3">
        <AlertIcon kind={alert.kind} tone={tone} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-body-strong text-ink">{alert.title}</p>
            {!alert.read && <Chip tone="accent">Nuevo</Chip>}
          </div>
          <p className="text-small text-text-secondary">{alert.body}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-text-muted">
            {local && <span>{local.name}</span>}
            {local && <span aria-hidden>·</span>}
            <span>{minutesAgoLabel(alert.createdAt, DEMO_CLOCK)}</span>
          </div>
        </div>
      </div>
      {hasActions && (
        <div className="flex flex-wrap items-center justify-between gap-2 pl-9">
          <div>{onOpen ? <LinkText size="small" onClick={onOpen}>Ver local</LinkText> : null}</div>
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className={cn(
                  "inline-flex items-center gap-1 rounded-pill px-2 py-1 text-small font-semibold transition hover:bg-surface/60 focus-visible:outline-2 focus-visible:outline-accent",
                  textToneClass[tone],
                )}
              >
                <Pencil aria-hidden className="size-icon" />
                Editar
              </button>
            )}
            {onDeactivate && (
              <button
                type="button"
                onClick={onDeactivate}
                className={cn(
                  "inline-flex items-center gap-1 rounded-pill px-2 py-1 text-small font-semibold transition hover:bg-surface/60 focus-visible:outline-2 focus-visible:outline-accent",
                  textToneClass[tone],
                )}
              >
                <Trash2 aria-hidden className="size-icon" />
                Eliminar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
