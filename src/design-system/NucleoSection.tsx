import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Pencil,
  Plus,
  Printer,
  SlidersHorizontal,
  Sparkles,
  TriangleAlert,
  Upload,
} from "lucide-react";
import { AppHeader } from "../components/AppHeader";
import { PrimaryButton } from "../components/PrimaryButton";
import { AccentButton } from "../components/AccentButton";
import { OutlineButton } from "../components/OutlineButton";
import { WarningOutlineButton } from "../components/WarningOutlineButton";
import { Button } from "../components/Button";
import { IconButton } from "../components/IconButton";
import { Chip } from "../components/Chip";
import { LinkText } from "../components/LinkText";
import { SectionLabel } from "../components/SectionLabel";
import { Card } from "../components/Card";
import { Divider } from "../components/Divider";
import { TextInput } from "../components/TextInput";
import { Select } from "../components/Select";
import { Textarea } from "../components/Textarea";
import { Stepper } from "../components/Stepper";
import { SegmentedControl } from "../components/SegmentedControl";
import { RadioCard } from "../components/RadioCard";
import { ErrorNote } from "../components/ErrorNote";
import { DocSection } from "./DocSection";
import { DocGroup } from "./DocGroup";
import { DocNote } from "./DocNote";

const printOptions = [
  { value: "bw", label: "Blanco y negro" },
  { value: "color", label: "Color" },
];

const paperOptions = [
  { value: "obra", title: "Obra", description: "Uso diario" },
  { value: "ilustracion", title: "Ilustración", description: "Acabado liso" },
  { value: "reciclado", title: "Reciclado", description: "Tono natural" },
];

const noop = () => undefined;

export function NucleoSection() {
  const [copies, setCopies] = useState(1);
  const [printMode, setPrintMode] = useState("bw");
  const [paper, setPaper] = useState("obra");
  const [payment, setPayment] = useState("tarjeta");
  const [local, setLocal] = useState("elpoli");

  return (
    <DocSection
      id="componentes"
      kicker="Componentes"
      title="Núcleo"
      description="Los mismos componentes del flujo real, ahora con radios generosos, vidrio, mandarina y sombras suaves. La funcionalidad y los estados se mantienen intactos."
    >
      <DocGroup label="AppHeader · inicio / volver / logo" className="lg:col-span-2">
        <div className="flex flex-col gap-2">
          <div className="overflow-hidden rounded-md border border-border-soft">
            <AppHeader title="Fadu Print" trailing="Inicio" />
          </div>
          <div className="overflow-hidden rounded-md border border-border-soft">
            <AppHeader title="Imprimir FADU" leading="back" trailing="Locales" />
          </div>
          <div className="overflow-hidden rounded-md border border-border-soft">
            <AppHeader title="El Poli" leading="logo" logoSrc="/logo-elpoli.png" trailing="Tanda 1" />
          </div>
        </div>
      </DocGroup>

      <DocGroup label="Botones · variantes y jerarquía" className="lg:col-span-2">
        <div className="flex flex-wrap items-center gap-2">
          <PrimaryButton size="md" icon={<Printer aria-hidden className="size-icon" />}>
            Imprimir
          </PrimaryButton>
          <AccentButton size="md" icon={<Upload aria-hidden className="size-icon" />}>
            Subir archivo
          </AccentButton>
          <OutlineButton size="md" icon={<MapPin aria-hidden className="size-icon" />}>
            Buscar local
          </OutlineButton>
          <Button variant="glass" size="md" icon={<Sparkles aria-hidden className="size-icon" />}>
            Ver detalle
          </Button>
          <Button variant="soft" size="md" icon={<Check aria-hidden className="size-icon" />}>
            Unirme
          </Button>
          <WarningOutlineButton size="md" icon={<TriangleAlert aria-hidden className="size-icon" />}>
            Cargar aviso
          </WarningOutlineButton>
        </div>
        <Divider />
        <div className="grid gap-2 sm:grid-cols-3">
          <PrimaryButton fullWidth icon={<ArrowRight aria-hidden className="size-icon" />}>
            Continuar
          </PrimaryButton>
          <AccentButton fullWidth>Verificar archivo</AccentButton>
          <PrimaryButton fullWidth loading>
            Convirtiendo…
          </PrimaryButton>
          <OutlineButton fullWidth>Agregar otro archivo</OutlineButton>
          <PrimaryButton fullWidth disabled>
            Continuar
          </PrimaryButton>
          <AccentButton fullWidth disabled>
            Subir archivo
          </AccentButton>
        </div>
      </DocGroup>

      <div className="grid gap-4 lg:grid-cols-2">
        <DocGroup label="IconButton · control circular">
          <div className="flex flex-wrap items-center gap-2">
            <IconButton label="Volver" icon={<ArrowLeft aria-hidden className="size-icon-lg" />} size="sm" />
            <IconButton label="Filtros" icon={<SlidersHorizontal aria-hidden className="size-icon" />} />
            <IconButton label="Imprimir" icon={<Printer aria-hidden className="size-icon-lg" />} tone="ink" size="lg" />
            <IconButton label="Sumar" icon={<Plus aria-hidden className="size-icon" />} tone="accent" />
            <IconButton label="Editar" icon={<Pencil aria-hidden className="size-icon" />} tone="surface" />
          </div>
          <DocNote>Glass es el valor por defecto; ink y accent marcan acciones primarias o destacadas.</DocNote>
        </DocGroup>

        <DocGroup label="Chip · estados y etiquetas">
          <div className="flex flex-wrap gap-2">
            <Chip tone="accent">A4 · 80 g</Chip>
            <Chip tone="success">Listo</Chip>
            <Chip tone="info">En cola</Chip>
            <Chip tone="warning">Alta demanda</Chip>
            <Chip tone="danger">Rechazado</Chip>
            <Chip tone="ink">Tanda 1</Chip>
            <Chip tone="glass">El Poli</Chip>
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip variant="outline" tone="accent">
              Riso
            </Chip>
            <Chip variant="outline" tone="success">
              Abierto
            </Chip>
            <Chip variant="outline" tone="neutral">
              Retiro 14:30
            </Chip>
          </div>
        </DocGroup>

        <DocGroup label="SectionLabel · LinkText · Divider">
          <SectionLabel>¿Qué querés hacer?</SectionLabel>
          <div className="flex flex-col items-start gap-2">
            <LinkText href="#">Guía para enviar archivos óptimos</LinkText>
            <LinkText size="small" href="#">
              Ver detalle
            </LinkText>
            <LinkText disabled>Cancelar conversión</LinkText>
          </div>
          <Divider />
          <Divider tone="strong" />
        </DocGroup>

        <DocGroup label="Card · superficies y selección">
          <Card>
            <span className="text-body text-ink">Superficie de papel</span>
          </Card>
          <Card tone="glass">
            <span className="text-body text-ink">Superficie de vidrio</span>
          </Card>
          <Card tone="sunrise">
            <span className="text-body text-ink">Superficie mandarina</span>
          </Card>
          <Card tone="ink">
            <span className="text-body text-surface">Superficie de tinta</span>
          </Card>
          <Card selected="accent">
            <span className="text-body text-ink">Selección mandarina</span>
          </Card>
        </DocGroup>

        <DocGroup label="TextInput · default / hint / error / disabled">
          <TextInput label="Nombre del titular" defaultValue="LUCÍA PÉREZ" />
          <TextInput label="DNI del titular" placeholder="12.345.678" hint="Sin puntos ni espacios" />
          <TextInput
            label="Número de tarjeta"
            defaultValue="•••• 1234"
            error="Revisá el número: faltan dígitos."
          />
          <TextInput label="Nombre del titular" defaultValue="LUCÍA PÉREZ" disabled />
        </DocGroup>

        <DocGroup label="Select · default / error / disabled">
          <Select label="Tamaño de papel" defaultValue="a4">
            <option value="a4">A4</option>
            <option value="a3">A3</option>
          </Select>
          <Select label="Gramaje" defaultValue="80" error="Elegí un gramaje disponible.">
            <option value="80">80 g/m²</option>
            <option value="120">120 g/m²</option>
          </Select>
          <Select label="Tamaño de papel" defaultValue="a4" disabled>
            <option value="a4">A4</option>
          </Select>
        </DocGroup>

        <DocGroup label="Textarea · default / disabled">
          <Textarea label="Observaciones" placeholder="Sin abrochar. Retiro por mostrador." />
          <Textarea label="Observaciones" defaultValue="Sin abrochar." disabled />
        </DocGroup>

        <DocGroup label="Stepper · interactivo / mínimo / disabled">
          <Stepper label="Cantidad de copias" value={copies} onChange={setCopies} />
          <Stepper label="Cantidad de copias" value={1} onChange={noop} />
          <Stepper label="Cantidad de copias" value={1} onChange={noop} disabled />
        </DocGroup>

        <DocGroup label="SegmentedControl · interactivo / disabled">
          <SegmentedControl label="Tipo de impresión" options={printOptions} value={printMode} onChange={setPrintMode} />
          <SegmentedControl label="Tipo de impresión" options={printOptions} value="bw" onChange={noop} disabled />
        </DocGroup>

        <DocGroup label="RadioCard · pago">
          <RadioCard
            name="pago"
            value="mercadopago"
            checked={payment === "mercadopago"}
            onChange={setPayment}
            title="MercadoPago"
            description="Pago con tu cuenta o billetera"
          />
          <RadioCard
            name="pago"
            value="efectivo"
            checked={payment === "efectivo"}
            onChange={setPayment}
            title="Efectivo"
            description="Pagás al retirar en el local"
          />
          <RadioCard
            name="pago"
            value="tarjeta"
            checked={payment === "tarjeta"}
            onChange={setPayment}
            title="Tarjeta"
            description="Crédito o débito"
          />
          <RadioCard
            name="pago-disabled"
            value="transferencia"
            checked={false}
            onChange={noop}
            title="Transferencia"
            description="No disponible en este local"
            disabled
          />
        </DocGroup>

        <DocGroup label="RadioCard · tipo de papel (3 columnas)">
          <div className="grid gap-2 sm:grid-cols-3">
            {paperOptions.map((option) => (
              <RadioCard
                key={option.value}
                name="papel"
                value={option.value}
                checked={paper === option.value}
                onChange={setPaper}
                title={option.title}
                description={option.description}
              />
            ))}
          </div>
        </DocGroup>

        <DocGroup label="RadioCard · local con selección mandarina">
          <RadioCard
            name="local"
            value="elpoli"
            checked={local === "elpoli"}
            onChange={setLocal}
            tone="accent"
            title="El Poli"
            description="Amplio catálogo"
            aside={<Chip tone="accent">★ 4,5</Chip>}
          />
          <RadioCard
            name="local"
            value="desalvo"
            checked={local === "desalvo"}
            onChange={setLocal}
            tone="accent"
            title="Desalvo"
            description="Menor espera"
            aside={<Chip tone="neutral">★ 4,3</Chip>}
          />
        </DocGroup>

        <DocGroup label="ErrorNote · validación sin rojo">
          <ErrorNote title="Formato">Word: convertir a PDF</ErrorNote>
          <ErrorNote>No pudimos leer el archivo. Probá con otro.</ErrorNote>
        </DocGroup>
      </div>

      <DocNote>
        Focus visible con outline mandarina. Loading no aplica a Card, inputs, Select, Textarea, Stepper,
        SegmentedControl, RadioCard ni ErrorNote: son síncronos.
      </DocNote>
    </DocSection>
  );
}
