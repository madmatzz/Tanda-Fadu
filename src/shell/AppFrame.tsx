import type { ReactNode } from "react";
import { RoleSwitch } from "./RoleSwitch";
import { StatusBar } from "./StatusBar";

export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-bg p-0 sm:p-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block">
        <div className="absolute -left-24 top-10 size-orb rounded-pill bg-sun-1 opacity-30 blur-orb" />
        <div className="absolute -right-24 bottom-0 size-orb rounded-pill bg-accent opacity-20 blur-orb" />
      </div>

      <div className="relative z-10 flex w-full min-w-0 flex-col items-center gap-3 sm:w-auto">
        <RoleSwitch />

        <div className="device-shell relative">
          <div className="device-screen" data-app-scroll>
            <StatusBar />
            {children}
          </div>

          <div id="sheet-root" className="pointer-events-none absolute inset-0 z-50" />

          <div
            aria-hidden
            className="pointer-events-none absolute bottom-2 left-1/2 hidden h-1 w-32 -translate-x-1/2 rounded-pill bg-ink opacity-30 sm:block"
          />
        </div>
      </div>
    </div>
  );
}
