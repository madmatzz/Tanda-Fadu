import homePng from "../../pov usuario/pov usuario que va a imprimir - homepage - 1.png";
import uploadPng from "../../pov usuario/pov usuario que va a imprimir - nueva impresion - 1.png";
import specsPng from "../../pov usuario/pov usuario que va a imprimir - nueva impresion - especificaciones.png";
import queuePng from "../../pov usuario/pov usuario que va a imprimir - nueva impresion - resumen impresion en cola.png";
import profilePng from "../../pov usuario/pov usuario que va a imprimir - perfil de imprenta.png";
import tandasPng from "../../pov usuario/pov usuario que va a imprimir - TANDAS DISPONIBLES.png";
import printerHomePng from "../../pov imprenta/pov imprenta inicio de flujo.png";
import printerQueuePng from "../../pov imprenta/pov imprenta - cola de tanda - 1.png";
import { Chip } from "../components/Chip";
import { DocSection } from "./DocSection";
import { DocNote } from "./DocNote";

interface Reference {
  src: string;
  title: string;
  area: "Usuario" | "Imprenta";
  note: string;
}

const references: Reference[] = [
  {
    src: homePng,
    title: "Home",
    area: "Usuario",
    note: "Punto de entrada, accesos y pedidos recientes.",
  },
  {
    src: uploadPng,
    title: "Subir archivo",
    area: "Usuario",
    note: "Carga, copias y validación del archivo.",
  },
  {
    src: specsPng,
    title: "Especificaciones",
    area: "Usuario",
    note: "Papel, color y precio antes del carrito.",
  },
  {
    src: queuePng,
    title: "Pedido en cola",
    area: "Usuario",
    note: "Ticket, espera y estado del pedido.",
  },
  {
    src: tandasPng,
    title: "Tandas",
    area: "Usuario",
    note: "Oferta de impresión agrupada.",
  },
  {
    src: profilePng,
    title: "Perfil de imprenta",
    area: "Usuario",
    note: "Catálogo, concurrencia y reseñas.",
  },
  {
    src: printerHomePng,
    title: "Panel",
    area: "Imprenta",
    note: "Cola virtual y tandas del local.",
  },
  {
    src: printerQueuePng,
    title: "Cola de tanda",
    area: "Imprenta",
    note: "Pedidos pendientes y confirmación.",
  },
];

export function ReferenciasSection() {
  return (
    <DocSection
      id="referencias"
      kicker="Fuente original"
      title="Los PNG siguen mandando"
      description="Estas son las pantallas que definieron el producto. El sistema v2 las reinterpreta, no las reemplaza: cada decisión visual se puede comparar contra el mockup original."
    >
      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {references.map((reference) => (
          <a
            key={reference.title}
            href={reference.src}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col gap-2 rounded-lg border border-border-soft bg-surface p-2 shadow-soft transition hover:-translate-y-1 hover:shadow-float focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span className="overflow-hidden rounded-md border border-border-soft bg-fill">
              <img src={reference.src} alt={`Pantalla ${reference.title} del POV ${reference.area}`} className="h-auto w-full" loading="lazy" />
            </span>
            <span className="flex flex-col gap-1 px-1 pb-1">
              <span className="flex items-center justify-between gap-2">
                <span className="text-small font-semibold text-ink">{reference.title}</span>
                <Chip tone={reference.area === "Usuario" ? "accent" : "ink"}>{reference.area}</Chip>
              </span>
              <span className="text-caption text-text-secondary">{reference.note}</span>
            </span>
          </a>
        ))}
      </div>

      <DocNote>
        Los PNG se abren a tamaño completo en una pestaña nueva. El archivo completo de mockups vive en{" "}
        <code className="rounded-xs bg-fill px-1 text-caption text-ink">/pov usuario</code> y{" "}
        <code className="rounded-xs bg-fill px-1 text-caption text-ink">/pov imprenta</code>.
      </DocNote>
    </DocSection>
  );
}
