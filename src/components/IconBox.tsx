import type { ReactNode } from "react";
import { AlertTriangle, Check, X } from "lucide-react";
import { cn } from "../lib/cn";

interface IconBoxProps {
  status: "success" | "warning" | "danger";
  label?: string;
}

const statusClass = {
  success: "border-success-border bg-success-soft text-success",
  warning: "border-warning-border bg-warning-bg text-warning",
  danger: "border-danger-border bg-danger-soft text-danger",
};

const statusIcon = {
  success: Check,
  warning: AlertTriangle,
  danger: X,
};

export function IconBox({ status, label }: IconBoxProps): ReactNode {
  const Icon = statusIcon[status];
  return (
    <span
      className={cn(
        "flex size-thumb shrink-0 items-center justify-center rounded-md border",
        statusClass[status],
      )}
      aria-label={label}
    >
      <Icon aria-hidden className="size-icon-lg" />
    </span>
  );
}
