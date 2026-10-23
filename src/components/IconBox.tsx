import type { ReactNode } from "react";
import { Check, X } from "lucide-react";
import { cn } from "../lib/cn";

interface IconBoxProps {
  status: "success" | "danger";
  label?: string;
}

const statusClass = {
  success: "border-success-border bg-success-soft text-success",
  danger: "border-danger-border bg-danger-soft text-danger",
};

export function IconBox({ status, label }: IconBoxProps): ReactNode {
  return (
    <span
      className={cn(
        "flex size-thumb shrink-0 items-center justify-center rounded-md border",
        statusClass[status],
      )}
      aria-label={label}
    >
      {status === "success" ? (
        <Check aria-hidden className="size-icon-lg" />
      ) : (
        <X aria-hidden className="size-icon-lg" />
      )}
    </span>
  );
}
