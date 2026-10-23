import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Info } from "lucide-react";

interface ToastMessage {
  id: number;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string) => void;
  toast: ToastMessage | null;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = (message: string) => {
    setToast({ id: Date.now(), message });
  };

  return <ToastContext.Provider value={{ showToast, toast }}>{children}</ToastContext.Provider>;
}

export function ToastViewport() {
  const { toast } = useToast();
  if (!toast) return null;
  return (
    <div className="pointer-events-none absolute bottom-8 left-gutter right-gutter z-40 flex justify-center">
      <div
        key={toast.id}
        role="status"
        aria-live="polite"
        className="toast-enter flex max-w-prose items-start gap-2 rounded-lg border border-glass-border bg-ink px-card py-3 text-small text-surface shadow-float"
      >
        <Info aria-hidden className="mt-0.5 size-icon shrink-0 text-accent" />
        <span>{toast.message}</span>
      </div>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de ToastProvider");
  }
  return context;
}
