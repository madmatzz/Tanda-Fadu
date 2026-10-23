import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Chip } from "./Chip";
import { IconButton } from "./IconButton";

interface AppHeaderProps {
  title: string;
  leading?: "none" | "back" | "logo";
  logoSrc?: string;
  onBack?: () => void;
  trailing?: string;
  actions?: ReactNode;
}

export function AppHeader({
  title,
  leading = "none",
  logoSrc,
  onBack,
  trailing,
  actions,
}: AppHeaderProps) {
  return (
    <header className="flex h-header items-center justify-between gap-3 border-b border-border-soft bg-glass px-gutter backdrop-blur-glass">
      <div className="flex min-w-0 items-center gap-3">
        {leading === "back" && (
          <IconButton
            label="Volver"
            onClick={onBack}
            icon={<ArrowLeft aria-hidden className="size-icon-lg" />}
          />
        )}
        {leading === "logo" && (
          <span className="flex size-logo shrink-0 items-center justify-center rounded-md border border-glass-border bg-surface p-1 shadow-soft">
            {logoSrc && <img src={logoSrc} alt="" className="size-full object-contain" />}
          </span>
        )}
        <span className="truncate text-h3 text-ink">{title}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {actions}
        {trailing && <Chip tone="neutral">{trailing}</Chip>}
      </div>
    </header>
  );
}
