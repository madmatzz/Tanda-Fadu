import { Chip } from "../components/Chip";
import { Divider } from "../components/Divider";
import { FileCard } from "../components/FileCard";
import { KeyValueRow } from "../components/KeyValueRow";
import { LinkText } from "../components/LinkText";
import { ProgressBar } from "../components/ProgressBar";
import { SummaryBox } from "../components/SummaryBox";
import { ValidationItem } from "../components/ValidationItem";
import { ValidationList } from "../components/ValidationList";
import { DocSection } from "./DocSection";
import { DocGroup } from "./DocGroup";
import { DocNote } from "./DocNote";

const noop = () => undefined;

export function DatosSection() {
  return (
    <DocSection
      id="datos"
      kicker="Datos y feedback"
      title="Archivos, colas y progreso"
      description="La información sigue siendo la misma, pero se agrupa en tarjetas flotantes con jerarquía suave: tinta para lo importante, mandarina para el avance y estados con color semántico."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <DocGroup label="KeyValueRow · default / strong">
          <KeyValueRow label="Papel" value="A4 · Obra · 80 g/m²" />
          <KeyValueRow label="Total" value="$800" emphasis="strong" />
        </DocGroup>

        <DocGroup label="SummaryBox · con nota">
          <SummaryBox>
            <KeyValueRow label="Local" value="El Poli" />
            <KeyValueRow label="Pedido" value="8 páginas · 1 copia" />
            <KeyValueRow label="Total" value="$800" emphasis="strong" />
          </SummaryBox>
          <SummaryBox note="El precio final depende del local seleccionado.">
            <KeyValueRow label="Cantidad de archivos" value="1" />
            <KeyValueRow label="Total estimado" value="$800" emphasis="strong" />
          </SummaryBox>
        </DocGroup>

        <DocGroup label="FileCard · ready / detalle / loading / error / disabled" className="lg:col-span-2">
          <FileCard name="entrega_final.pdf" meta="8 páginas · 4,2 MB · Archivo cargado" />
          <FileCard
            name="entrega_final.pdf"
            meta="8 páginas · 3,8 MB · 1 copia"
            showIcon
            onRemove={noop}
          >
            <Divider />
            <KeyValueRow label="Papel" value="A4 · Obra · 80 g/m²" />
            <KeyValueRow label="Impresión" value="Blanco y negro" />
            <KeyValueRow label="Subtotal estimado" value="$800" />
            <LinkText size="small">Editar especificaciones</LinkText>
          </FileCard>
          <FileCard name="entrega_final.docx" meta="Subiendo archivo…" state="loading" />
          <FileCard
            name="entrega_final.docx"
            meta="8 páginas · 4,2 MB"
            state="error"
            errorMessage="Formato no compatible. Usá PDF, Word o JPG."
            onRemove={noop}
          />
          <FileCard name="entrega_final.pdf" meta="8 páginas · 4,2 MB" disabled onRemove={noop} />
        </DocGroup>

        <DocGroup label="ValidationList · conversión en curso">
          <ValidationList>
            <ValidationItem status="ok" label="Conversión a PDF completada" />
            <ValidationItem status="running" label="Ajustando color a blanco y negro" />
            <ValidationItem status="pending" label="Nueva validación pendiente" />
          </ValidationList>
        </DocGroup>

        <DocGroup label="ValidationList · convertido / óptimo">
          <ValidationList>
            <ValidationItem status="ok" label="Formato" value="PDF compatible" />
            <ValidationItem status="ok" label="Tamaño de archivo" value="3,8 MB / máx. 25 MB" />
            <ValidationItem status="ok" label="Resolución" value="300 ppp" />
            <ValidationItem status="ok" label="Color / impresión" value="Escala de grises / B&N" />
          </ValidationList>
        </DocGroup>

        <DocGroup label="ValidationList · rechazado">
          <ValidationList>
            <ValidationItem status="ok" label="Tamaño de archivo" value="4,2 MB / máx. 25 MB" />
            <ValidationItem status="error" label="Formato" detail="Word: convertir a PDF" />
            <ValidationItem status="error" label="Resolución" detail="150 ppp: mínimo 300 ppp" />
            <ValidationItem status="error" label="Color / impresión" detail="RGB: se solicitó B&N" />
          </ValidationList>
        </DocGroup>

        <DocGroup label="ProgressBar · 0 / en curso / tanda / success">
          <ProgressBar value={0} />
          <ProgressBar value={65} tone="accent" label="Procesando archivo" valueLabel="65 %" />
          <ProgressBar value={83} tone="accent" label="Pedidos agrupados" valueLabel="25/30" />
          <ProgressBar value={80} tone="success" label="Calidad" valueLabel="4,8 / 5" />
        </DocGroup>

        <DocGroup label="Chip · estados de pedido">
          <div className="flex flex-wrap gap-2">
            <Chip tone="info">En cola</Chip>
            <Chip tone="success">Impreso</Chip>
            <Chip tone="ink">Imprimiendo</Chip>
            <Chip tone="warning">12 min</Chip>
            <Chip tone="success" variant="outline">
              Vos
            </Chip>
            <Chip tone="neutral">Entregado</Chip>
          </div>
          <DocNote>El estado nunca depende solo del color: siempre lleva una etiqueta de texto.</DocNote>
        </DocGroup>
      </div>

      <DocNote>
        ProgressBar y ValidationItem no tienen loading ni disabled: son estados de progreso o resultado. FileCard
        loading muestra spinner en lugar del botón quitar.
      </DocNote>
    </DocSection>
  );
}
