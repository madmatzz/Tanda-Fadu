import { ArrowDown, Images, Layers, SlidersHorizontal } from "lucide-react";
import { Button } from "../components/Button";
import { Chip } from "../components/Chip";
import { IconButton } from "../components/IconButton";
import { DatosSection } from "../design-system/DatosSection";
import { NucleoSection } from "../design-system/NucleoSection";
import { TokensSection } from "../design-system/TokensSection";
import { CompositionsSection } from "../design-system/CompositionsSection";
import { ReferenciasSection } from "../design-system/ReferenciasSection";

const navItems = [
  { id: "fundamentos", label: "Fundamentos" },
  { id: "componentes", label: "Componentes" },
  { id: "datos", label: "Datos" },
  { id: "composiciones", label: "Composiciones" },
  { id: "referencias", label: "PNG originales" },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <span className="absolute -top-16 -left-16 size-orb rounded-pill bg-sun-1/40 blur-orb" />
        <span className="absolute top-1/3 -right-16 size-orb rounded-pill bg-accent/20 blur-orb" />
        <span className="absolute -bottom-16 left-1/3 size-orb rounded-pill bg-warning-border/40 blur-orb" />
      </div>

      <div className="relative mx-auto flex max-w-doc flex-col gap-section px-gutter py-6">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-logo shrink-0 items-center justify-center rounded-md bg-ink text-surface shadow-float">
              <Layers aria-hidden className="size-icon-lg" />
            </span>
            <div className="flex flex-col">
              <span className="text-small font-semibold text-ink">Tanda</span>
              <span className="text-caption text-text-secondary">Fadu Print · Design system</span>
            </div>
          </div>
          <div className="hidden sm:flex">
            <Chip tone="accent">v2 · Papel & mandarina</Chip>
          </div>
        </header>

        <main className="flex flex-col gap-section">
          <section className="relative overflow-hidden rounded-xl border border-glass-border bg-sunset p-6 shadow-glow sm:p-10">
            <span className="pointer-events-none absolute -top-16 -right-16 size-orb rounded-pill bg-surface/20 blur-orb" />
            <span className="pointer-events-none absolute -bottom-16 left-1/3 size-orb rounded-pill bg-warning-border/30 blur-orb" />

            <div className="relative grid items-end gap-8 lg:grid-cols-2">
              <div className="flex flex-col items-start gap-5">
                <Chip tone="glass">Design system 2.0</Chip>
                <h1 className="text-hero text-surface sm:text-display">
                  Papel cálido.
                  <br />
                  Tinta mandarina.
                </h1>
                <p className="max-w-phone text-body text-surface/90">
                  Una versión más suave y táctil de Fadu Print: superficies de papel, capas de vidrio, mandarina de
                  riso y la misma lógica de impresión por tandas.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="primary"
                    icon={<ArrowDown aria-hidden className="size-icon" />}
                    onClick={() => scrollTo("fundamentos")}
                  >
                    Explorar tokens
                  </Button>
                  <Button
                    variant="glass"
                    icon={<Images aria-hidden className="size-icon" />}
                    onClick={() => scrollTo("referencias")}
                  >
                    Ver PNG originales
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Chip tone="glass">29 pantallas</Chip>
                  <Chip tone="glass">2 roles</Chip>
                  <Chip tone="glass">1 sistema</Chip>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-phone">
                <div className="rounded-lg border border-glass-border bg-glass p-2 shadow-float backdrop-blur-glass">
                  <div className="flex flex-col gap-3 rounded-md bg-paper p-card">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex size-control-sm items-center justify-center rounded-pill bg-ink text-surface">
                          <Layers aria-hidden className="size-icon" />
                        </span>
                        <div className="flex flex-col">
                          <span className="text-small font-semibold text-ink">El Poli</span>
                          <span className="text-caption text-text-secondary">Tanda 1 · A4 color</span>
                        </div>
                      </div>
                      <IconButton
                        label="Opciones de la tanda"
                        icon={<SlidersHorizontal aria-hidden className="size-icon" />}
                        size="sm"
                      />
                    </div>

                    <div className="relative overflow-hidden rounded-md bg-sunrise p-card text-ink shadow-soft">
                      <span className="absolute -right-6 -top-6 size-16 rounded-pill bg-accent/20 blur-glass" />
                      <div className="relative flex flex-col gap-2">
                        <span className="text-label-caps uppercase text-accent-ink">Tu pedido</span>
                        <span className="text-h2 text-ink">#36 · 8 páginas</span>
                        <div className="flex items-center justify-between gap-2">
                          <Chip tone="accent">Retiro 14:30</Chip>
                          <span className="text-caption text-text-secondary">En cola</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col gap-1 rounded-md border border-border-soft bg-surface p-3 shadow-soft">
                        <span className="text-caption text-text-secondary">Cola</span>
                        <span className="text-h3 text-ink">23</span>
                      </div>
                      <div className="flex flex-col gap-1 rounded-md border border-border-soft bg-surface p-3 shadow-soft">
                        <span className="text-caption text-text-secondary">Tandas</span>
                        <span className="text-h3 text-ink">5</span>
                      </div>
                      <div className="flex flex-col gap-1 rounded-md border border-accent-border bg-accent-soft p-3 shadow-soft">
                        <span className="text-caption text-accent-ink">Listo</span>
                        <span className="text-h3 text-accent-ink">3</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 hidden sm:block">
                  <Chip tone="glass">Riso sobre papel</Chip>
                </div>
              </div>
            </div>
          </section>

          <nav className="sticky top-3 z-30 flex gap-1 overflow-x-auto rounded-pill border border-glass-border bg-glass-strong p-1 shadow-soft backdrop-blur-glass">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="whitespace-nowrap rounded-pill px-4 py-2 text-small text-text-secondary transition hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <TokensSection />
          <NucleoSection />
          <DatosSection />
          <CompositionsSection />
          <ReferenciasSection />

          <footer className="flex flex-col gap-2 border-t border-border-soft pt-6 text-caption text-text-secondary sm:flex-row sm:items-center sm:justify-between">
            <span>Tanda · Fadu Print — design system v2</span>
            <span>Hecho con tokens, sin valores sueltos.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
