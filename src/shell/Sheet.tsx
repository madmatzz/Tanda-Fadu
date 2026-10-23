import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { IconButton } from "../components/IconButton";
import { cn } from "../lib/cn";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Sheet({ open, onClose, title, description, children, footer, className }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const scroll = document.querySelector<HTMLElement>("[data-app-scroll]");
    const previousOverflow = scroll?.style.overflowY;
    if (scroll) scroll.style.overflowY = "hidden";
    panelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (scroll) scroll.style.overflowY = previousOverflow || "";
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  const host = document.getElementById("sheet-root");
  if (!host) return null;

  return createPortal(
    <div className="pointer-events-none absolute inset-0 z-50 flex items-end">
      <button
        type="button"
        aria-label="Cerrar panel"
        onClick={onClose}
        className="pointer-events-auto absolute inset-0 bg-overlay"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(
          "sheet-panel pointer-events-auto relative flex w-full flex-col overflow-hidden rounded-t-xl border-t border-glass-border bg-surface shadow-float focus:outline-none",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border-soft px-card py-4">
          <div className="flex min-w-0 flex-col gap-1">
            {title && (
              <h2 id={titleId} className="text-h2 text-ink">
                {title}
              </h2>
            )}
            {description && <p className="text-small text-text-secondary">{description}</p>}
          </div>
          <IconButton
            label="Cerrar"
            icon={<X aria-hidden className="size-icon-lg" />}
            onClick={onClose}
            size="sm"
          />
        </div>
        <div className="hide-scrollbar flex-1 overflow-y-auto px-card py-5">{children}</div>
        {footer && <div className="border-t border-border-soft px-card pt-3 safe-bottom">{footer}</div>}
      </div>
    </div>,
    host,
  );
}
