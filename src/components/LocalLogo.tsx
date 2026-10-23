import type { Local } from "../demo/types";
import { cn } from "../lib/cn";

interface LocalLogoProps {
  local: Local;
  size?: "sm" | "md" | "lg";
}

const sizeClass = {
  sm: "size-control-sm rounded-sm text-small",
  md: "size-logo rounded-md text-h3",
  lg: "size-thumb rounded-lg text-h2",
};

const toneClass = {
  sunset: "border-accent-border bg-sunrise text-accent-ink",
  ink: "border-ink bg-ink text-surface",
  sunrise: "border-border-soft bg-fill text-ink",
};

export function LocalLogo({ local, size = "md" }: LocalLogoProps) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden border font-semibold",
        sizeClass[size],
        local.hasLogo ? "border-border-soft bg-surface p-1" : toneClass[local.tone],
      )}
    >
      {local.hasLogo ? (
        <img src="/logo-elpoli.png" alt="" className="size-full object-contain" />
      ) : (
        local.initials
      )}
    </span>
  );
}
