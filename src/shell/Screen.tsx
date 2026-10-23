import { useEffect, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import { AppHeader } from "../components/AppHeader";
import { cn } from "../lib/cn";

interface ScreenProps {
  title: string;
  leading?: "none" | "back" | "logo";
  logoSrc?: string;
  trailing?: string;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  backTo?: string;
  contentClassName?: string;
  hideHeader?: boolean;
}

export function Screen({
  title,
  leading = "none",
  logoSrc,
  trailing,
  actions,
  children,
  footer,
  backTo,
  contentClassName,
  hideHeader = false,
}: ScreenProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname) {
      const scroll = document.querySelector<HTMLElement>("[data-app-scroll]");
      scroll?.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [location.pathname]);

  const handleBack = () => {
    const historyIndex = (window.history.state?.idx as number | undefined) ?? 0;
    if (historyIndex > 0) {
      navigate(-1);
      return;
    }
    if (backTo) navigate(backTo, { replace: true });
    else navigate(-1);
  };

  return (
    <div className="flex min-h-full flex-col bg-bg">
      {!hideHeader && (
        <div className="sticky top-0 z-30 sm:top-14">
          <AppHeader
            title={title}
            leading={leading}
            logoSrc={logoSrc}
            onBack={leading === "back" ? handleBack : undefined}
            trailing={trailing}
            actions={actions}
          />
        </div>
      )}
      <main className={cn("flex-1 px-gutter pb-8 pt-6", contentClassName)}>{children}</main>
      {footer && (
        <div className="sticky bottom-0 z-30 border-t border-border-soft bg-glass-strong px-gutter pt-3 backdrop-blur-glass safe-bottom">
          {footer}
        </div>
      )}
    </div>
  );
}
