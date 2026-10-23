import { Layers } from "lucide-react";
import {
  tokens,
  type BlurToken,
  type ColorToken,
  type GradientToken,
  type RadiusToken,
  type ShadowToken,
  type SpacingToken,
  type TextToken,
} from "../theme/tokens";
import { cn } from "../lib/cn";
import { DocGroup } from "./DocGroup";
import { DocSection } from "./DocSection";
import { DocNote } from "./DocNote";
import { formatPx } from "../theme/format";
import {
  blurClass,
  colorClass,
  gradientClass,
  radiusClass,
  shadowClass,
  spacingClass,
  textClass,
} from "./tokenClasses";

const textSamples = {
  ticket: "#36",
  display: "Tanda",
  hero: "Papel cálido",
  "big-number": "23",
  h1: "Nueva impresión",
  h2: "Tanda 1 · A4 color",
  h3: "Últimos pedidos",
  body: "Preparás tus archivos y elegís dónde imprimir.",
  "body-strong": "Subir archivo",
  small: "Impresión A4 color · 1 a 10 páginas",
  caption: "Actualizado hace 2 minutos",
  "label-caps": "Tandas disponibles",
} as const satisfies Record<TextToken, string>;

export function TokensSection() {
  const colors = Object.entries(tokens.color) as [ColorToken, string][];
  const texts = Object.entries(tokens.text) as [TextToken, (typeof tokens.text)[TextToken]][];
  const radii = Object.entries(tokens.radius) as [RadiusToken, number][];
  const spacing = Object.entries(tokens.spacing) as [SpacingToken, number][];
  const shadows = Object.entries(tokens.shadow) as [ShadowToken, string][];
  const gradients = Object.entries(tokens.gradient) as [GradientToken, string][];
  const blurs = Object.entries(tokens.blur) as [BlurToken, number][];

  return (
    <DocSection
      id="fundamentos"
      kicker="Fundamentos"
      title="Tokens"
      description="Una paleta de papel, tinta y mandarina. Superficies cálidas, capas de vidrio y sombras largas toman la suavidad de la referencia sin perder la legibilidad de una app de impresión."
    >
      <DocGroup label="Paleta · papel, tinta y mandarina">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {colors.map(([name, hex]) => (
            <div key={name} className="overflow-hidden rounded-md border border-border-soft bg-surface">
              <span className={cn("block h-14", colorClass[name])} />
              <span className="block px-3 py-2">
                <span className="block text-small font-semibold text-ink">{name}</span>
                <span className="block break-words text-caption text-text-muted">{hex}</span>
              </span>
            </div>
          ))}
        </div>
        <DocNote>
          La mandarina toma acciones, selección y energía de marca. El verde anterior queda como estado{" "}
          <strong className="font-semibold text-ink">success</strong>; la terracota reemplaza al rojo en errores.
        </DocNote>
      </DocGroup>

      <DocGroup label="Tipografía · fuente del sistema">
        <div className="flex flex-col">
          {texts.map(([name, style]) => (
            <div key={name} className="flex flex-col gap-1 border-b border-border-soft py-3 last:border-b-0">
              <span className={cn("text-ink", textClass[name])}>{textSamples[name]}</span>
              <span className="text-caption text-text-muted">
                {`${name} · ${formatPx(style.size)} · peso ${style.weight} · interlínea ${style.lineHeight}`}
                {"letterSpacing" in style ? ` · tracking ${style.letterSpacing}` : ""}
              </span>
            </div>
          ))}
        </div>
        <DocNote>
          Los títulos usan tracking negativo para acercarse al gesto de la referencia. El cuerpo mantiene Inter
          Variable a 16 / 1.5 para lectura cómoda.
        </DocNote>
      </DocGroup>

      <div className="grid gap-4 lg:grid-cols-2">
        <DocGroup label="Radios · de control a teléfono">
          <div className="flex flex-wrap gap-4">
            {radii.map(([name, value]) => (
              <div key={name} className="flex flex-col items-start gap-2">
                <span
                  className={cn(
                    "size-16 border border-accent-border bg-sunrise shadow-soft",
                    radiusClass[name],
                  )}
                />
                <span className="text-small font-semibold text-ink">{name}</span>
                <span className="text-caption text-text-muted">{formatPx(value)}</span>
              </div>
            ))}
          </div>
        </DocGroup>

        <DocGroup label="Blur · capas de vidrio">
          <div className="flex flex-col gap-3">
            {blurs.map(([name, value]) => (
              <div key={name} className="flex items-center justify-between gap-3 rounded-md border border-border-soft bg-surface-soft px-3 py-2">
                <span className="text-small font-semibold text-ink">{blurClass[name]}</span>
                <span className="text-caption text-text-muted">{formatPx(value)}</span>
              </div>
            ))}
          </div>
          <div className="relative overflow-hidden rounded-lg bg-sunset p-card">
            <span className="absolute -top-6 -right-6 size-16 rounded-pill bg-surface/30 blur-glass" />
            <div className="relative flex items-center gap-3 rounded-md border border-glass-border bg-glass p-card shadow-soft backdrop-blur-glass">
              <span className="flex size-control items-center justify-center rounded-pill bg-ink text-surface">
                <Layers aria-hidden className="size-icon" />
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="text-small font-semibold text-ink">Capa de vidrio</span>
                <span className="text-caption text-text-secondary">bg-glass + backdrop-blur-glass</span>
              </div>
            </div>
          </div>
        </DocGroup>
      </div>

      <DocGroup label="Sombras · elevación suave">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {shadows.map(([name]) => (
            <div
              key={name}
              className={cn(
                "flex h-16 items-center justify-center rounded-lg border border-border-soft bg-surface",
                shadowClass[name],
              )}
            >
              <span className="text-small font-semibold text-ink">{`shadow-${name}`}</span>
            </div>
          ))}
        </div>
      </DocGroup>

      <DocGroup label="Gradientes · atmósfera">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {gradients.map(([name]) => (
            <div key={name} className="overflow-hidden rounded-lg border border-border-soft bg-surface shadow-soft">
              <span className={cn("block h-16", gradientClass[name])} />
              <span className="block px-3 py-2 text-small font-semibold text-ink">{`bg-${name}`}</span>
            </div>
          ))}
        </div>
      </DocGroup>

      <DocGroup label="Espaciado · escala base 4">
        <div className="grid gap-3 sm:grid-cols-2">
          {spacing.map(([name, value]) => (
            <div key={name} className="flex flex-col gap-1">
              <span className="flex items-baseline justify-between gap-2 text-caption">
                <span className="font-semibold text-ink">{name}</span>
                <span className="text-text-muted">{formatPx(value)}</span>
              </span>
              <span className={cn("h-2 rounded-pill bg-ink", spacingClass[name])} />
            </div>
          ))}
        </div>
      </DocGroup>
    </DocSection>
  );
}
