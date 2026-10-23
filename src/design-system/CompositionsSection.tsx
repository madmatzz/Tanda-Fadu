import type { ReactNode } from "react";
import { ArrowLeft, Bell, Check, Layers, MapPin, Printer, Upload } from "lucide-react";
import { AccentButton } from "../components/AccentButton";
import { Card } from "../components/Card";
import { Chip } from "../components/Chip";
import { Divider } from "../components/Divider";
import { FileCard } from "../components/FileCard";
import { IconButton } from "../components/IconButton";
import { KeyValueRow } from "../components/KeyValueRow";
import { LinkText } from "../components/LinkText";
import { PrimaryButton } from "../components/PrimaryButton";
import { ProgressBar } from "../components/ProgressBar";
import { SectionLabel } from "../components/SectionLabel";
import { DocSection } from "./DocSection";
import { DocNote } from "./DocNote";

function PhoneFrame({
  label,
  caption,
  children,
}: {
  label: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <figure className="flex flex-col gap-3">
      <div className="rounded-phone border border-glass-border bg-surface p-2 shadow-float">
        <div className="overflow-hidden rounded-xl border border-border-soft bg-bg">{children}</div>
      </div>
      <figcaption className="flex flex-col gap-1 px-1">
        <span className="text-small font-semibold text-ink">{label}</span>
        <span className="text-caption text-text-secondary">{caption}</span>
      </figcaption>
    </figure>
  );
}

function HomeComposition() {
  return (
    <div className="relative flex flex-col gap-4 overflow-hidden bg-paper p-card">
      <span className="pointer-events-none absolute -top-6 -right-6 size-16 rounded-pill bg-sun-2/40 blur-glass" />

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-caption text-text-secondary">Buen día, Lucía</span>
          <span className="text-h3 text-ink">¿Qué imprimimos hoy?</span>
        </div>
        <IconButton label="Notificaciones" icon={<Bell aria-hidden className="size-icon" />} />
      </div>

      <div className="relative overflow-hidden rounded-lg bg-sunset p-card text-surface shadow-glow">
        <span className="absolute -right-6 -top-6 size-16 rounded-pill bg-surface/20 blur-glass" />
        <div className="relative flex flex-col gap-3">
          <span className="text-label-caps uppercase text-surface/80">Tanda en curso</span>
          <p className="text-h2 text-surface">8 páginas listas a las 14:30.</p>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Chip tone="glass">El Poli · A4</Chip>
            <PrimaryButton size="md">Ver pedido</PrimaryButton>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-2 rounded-md border border-border-soft bg-surface p-3 shadow-soft">
          <span className="flex size-control-sm items-center justify-center rounded-pill bg-accent-soft text-accent-ink">
            <Upload aria-hidden className="size-icon" />
          </span>
          <span className="text-caption font-semibold text-ink">Subir</span>
        </div>
        <div className="flex flex-col gap-2 rounded-md border border-border-soft bg-surface p-3 shadow-soft">
          <span className="flex size-control-sm items-center justify-center rounded-pill bg-accent-soft text-accent-ink">
            <Layers aria-hidden className="size-icon" />
          </span>
          <span className="text-caption font-semibold text-ink">Tandas</span>
        </div>
        <div className="flex flex-col gap-2 rounded-md border border-border-soft bg-surface p-3 shadow-soft">
          <span className="flex size-control-sm items-center justify-center rounded-pill bg-accent-soft text-accent-ink">
            <MapPin aria-hidden className="size-icon" />
          </span>
          <span className="text-caption font-semibold text-ink">Locales</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <SectionLabel>Últimos pedidos</SectionLabel>
        <LinkText size="small">Ver todos</LinkText>
      </div>

      <Card>
        <div className="flex items-center gap-3">
          <span className="flex size-logo items-center justify-center rounded-md bg-fill text-caption font-semibold text-ink">
            EP
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-small font-semibold text-ink">El Poli</span>
            <span className="text-caption text-text-secondary">4 archivos · color</span>
          </span>
          <Chip tone="success">Listo</Chip>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3">
          <span className="flex size-logo items-center justify-center rounded-md bg-fill text-caption font-semibold text-ink">
            DS
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-small font-semibold text-ink">Desalvo</span>
            <span className="text-caption text-text-secondary">2 archivos · b&n</span>
          </span>
          <Chip tone="neutral">Entregado</Chip>
        </div>
      </Card>
    </div>
  );
}

function FlowComposition() {
  return (
    <div className="flex flex-col gap-4 bg-paper p-card">
      <div className="flex items-center justify-between gap-2">
        <IconButton label="Volver" icon={<ArrowLeft aria-hidden className="size-icon-lg" />} />
        <span className="text-h3 text-ink">Nueva impresión</span>
        <Chip tone="accent">Paso 2</Chip>
      </div>

      <FileCard name="entrega_final.pdf" meta="8 páginas · 4,2 MB · PDF" showIcon>
        <Divider />
        <KeyValueRow label="Papel" value="A4 · Obra" />
        <KeyValueRow label="Impresión" value="Color" />
      </FileCard>

      <div className="rounded-lg border border-dashed border-accent-border bg-accent-soft p-card text-center">
        <span className="mx-auto flex size-control items-center justify-center rounded-pill bg-surface text-accent-ink shadow-soft">
          <Upload aria-hidden className="size-icon" />
        </span>
        <p className="mt-2 text-small font-semibold text-ink">Seleccionar archivo</p>
        <p className="text-caption text-text-secondary">PDF, Word o JPG · hasta 25 MB</p>
      </div>

      <ProgressBar value={65} tone="accent" label="Validando archivo" valueLabel="65 %" />

      <AccentButton fullWidth icon={<Check aria-hidden className="size-icon" />}>
        Verificar archivo
      </AccentButton>
      <p className="text-center text-caption text-text-muted">Revisamos formato, tamaño y resolución.</p>
    </div>
  );
}

function PrinterComposition() {
  return (
    <div className="flex flex-col gap-4 bg-paper p-card">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-logo items-center justify-center rounded-md border border-glass-border bg-surface p-1 shadow-soft">
            <img src="/logo-elpoli.png" alt="" className="size-full object-contain" />
          </span>
          <div className="flex flex-col">
            <span className="text-small font-semibold text-ink">El Poli</span>
            <span className="text-caption text-text-secondary">Panel de imprenta</span>
          </div>
        </div>
        <Chip tone="success">Abierto</Chip>
      </div>

      <div className="relative overflow-hidden rounded-lg bg-ink-fade p-card text-surface shadow-float">
        <span className="absolute -right-6 -bottom-6 size-16 rounded-pill bg-accent/30 blur-glass" />
        <div className="relative flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-label-caps uppercase text-surface/70">Cola virtual</span>
            <span className="text-big-number text-surface">23</span>
            <span className="text-caption text-surface/70">personas esperando</span>
          </div>
          <Chip tone="accent">En vivo</Chip>
        </div>
      </div>

      <div className="rounded-lg border border-accent-border bg-sunrise p-card shadow-soft">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-label-caps uppercase text-accent-ink">Tandas activas</span>
            <span className="text-big-number text-ink">5</span>
          </div>
          <Chip tone="accent">25/30</Chip>
        </div>
        <div className="mt-3">
          <ProgressBar value={83} tone="accent" label="Tanda 1 · A4 color" valueLabel="83 %" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <SectionLabel>Pendientes</SectionLabel>
        <Chip tone="info">8 pedidos</Chip>
      </div>

      <Card>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-caption font-semibold text-text-muted">#37</span>
            <span className="flex-1 text-small text-ink">Ailén</span>
            <Chip tone="info">En cola</Chip>
          </div>
          <Divider />
          <div className="flex items-center justify-between gap-2">
            <span className="text-caption font-semibold text-text-muted">#36</span>
            <span className="flex-1 text-small text-ink">Vos</span>
            <Chip tone="success">Imprimiendo</Chip>
          </div>
        </div>
      </Card>

      <AccentButton fullWidth icon={<Printer aria-hidden className="size-icon" />}>
        Confirmar tanda
      </AccentButton>
    </div>
  );
}

export function CompositionsSection() {
  return (
    <DocSection
      id="composiciones"
      kicker="Composiciones"
      title="El sistema en contexto"
      description="Tres armados rápidos con los componentes reales. No agregan pantallas al flujo: muestran cómo conviven el papel, la tinta, la mandarina y el vidrio en la app."
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <PhoneFrame label="Usuario · inicio" caption="Hero mandarina, accesos rápidos y pedidos recientes.">
          <HomeComposition />
        </PhoneFrame>
        <PhoneFrame label="Usuario · archivo" caption="Carga, validación y CTA con la jerarquía del sistema.">
          <FlowComposition />
        </PhoneFrame>
        <PhoneFrame label="Imprenta · panel" caption="Cola, tandas y estados con la misma gramática visual.">
          <PrinterComposition />
        </PhoneFrame>
      </div>

      <DocNote>
        Los tres armados usan los mismos componentes documentados arriba. El vidrio aparece solo en capas
        flotantes (header, chips, controles) para no comprometer la lectura.
      </DocNote>
    </DocSection>
  );
}
