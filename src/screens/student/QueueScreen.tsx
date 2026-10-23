import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronDown, Clock, MapPin } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { localById, orderById } from "../../demo/selectors";
import { estimateTotal, modeLabel, paperDisplay, specsSummary } from "../../demo/pricing";
import { minutesAgoLabel } from "../../demo/time";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { FileCard } from "../../components/FileCard";
import { KeyValueRow } from "../../components/KeyValueRow";
import { LocalLogo } from "../../components/LocalLogo";
import { QueueVisualization, SegmentedProgress } from "../../components/QueueVisualization";
import { ReportQueueSheet } from "../../components/ReportQueueSheet";
import { cn } from "../../lib/cn";

// Nombres de los pedidos vecinos al tuyo, según la distancia en la cola.
const neighbourNames: Record<number, string> = {
  [-3]: "Ailén",
  [-2]: "Sofía",
  [-1]: "Camila",
  1: "Martín",
  2: "Tomás",
  3: "Juli",
};

// Borde troquelado del ticket: línea recta con muescas semicirculares hacia adentro.
// Afuera del ticket es surface; adentro, el color de papel de la pantalla.
function TicketEdge({ position }: { position: "top" | "bottom" }) {
  const notches = 9;
  return (
    <div
      aria-hidden
      // Sangra hacia los bordes para cubrir el ancho completo, por fuera del margen de la pantalla.
      className={cn("-mx-gutter flex flex-col", position === "top" ? "-mt-6" : "-mb-8 mt-6 flex-col-reverse")}
    >
      <div className="h-4 bg-surface" />
      <div className={cn("flex", position === "bottom" && "-scale-y-100")}>
        {Array.from({ length: notches }).map((_, index) => (
          <svg key={index} viewBox="0 0 44 20" preserveAspectRatio="none" className="h-5 flex-1">
            <path d="M0 0 H44 V3 H35 A13 13 0 0 1 9 3 H0 Z" className="fill-surface" />
            <path d="M0 3 H9 A13 13 0 0 0 35 3 H44" className="fill-none stroke-disabled" strokeWidth={1} />
          </svg>
        ))}
      </div>
    </div>
  );
}

export function QueueScreen() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { state } = useDemo();
  const [reportOpen, setReportOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const order = orderById(state, id);
  const local = order ? localById(state, order.localId) : undefined;

  if (!order || !local) {
    return (
      <Screen title="Tu pedido" leading="back" backTo="/pedidos" trailing="En cola">
        <EmptyState
          title="No encontramos ese pedido"
          description="Puede que ya no esté activo en la demo."
          action={
            <Button variant="outline" size="md" onClick={() => navigate("/pedidos")}>
              Ver mis pedidos
            </Button>
          }
        />
      </Screen>
    );
  }

  const ready = order.status === "listo" || order.status === "entregado";
  const stage = ready ? 2 : order.status === "confirmado" ? 0 : 1;
  const total = estimateTotal(order.specs, local);
  const wait = local.queue.waitVirtual;
  // Minutos por pedido: el tuyo está a dos lugares del que se imprime.
  const perOrder = Math.max(1, Math.round(wait / 2));
  const printing = order.ticket - 2;

  const queueRows = [-3, -2, -1, 0, 1, 2, 3].map((offset) => {
    const number = order.ticket + offset;
    const status =
      number < printing ? "Impreso" : number === printing ? "Imprimiendo" : `${(number - printing) * perOrder} minutos`;
    return { number, name: offset === 0 ? "Vos" : neighbourNames[offset], status, self: offset === 0 };
  });

  return (
    <>
      <Screen
        title="Tu pedido"
        hideHeader
        footer={
          <Button variant="primary" size="lg" fullWidth onClick={() => navigate("/")}>
            Volver al inicio
          </Button>
        }
      >
        <TicketEdge position="top" />

        <div className="flex flex-col gap-5 pt-8">
          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-5">
              <span className="text-h3 font-normal text-ink">Tu pedido</span>
              {/* Grilla de 3 columnas como la barra de progreso: el número ocupa 2 y los datos
                  arrancan donde arranca "Listo". La caja del número mide lo mismo que sus dígitos,
                  así el archivo se alinea con su borde superior y el tiempo con su base. */}
              <div className="grid grid-cols-3 gap-2">
                <span className="col-span-2 text-ticket text-ink">#{order.ticket}</span>
                <div className="flex min-w-0 flex-col justify-between">
                  <span className="truncate text-h3 font-normal leading-none text-ink">{order.file.name}</span>
                  <span className="text-small font-semibold leading-none text-ink">{local.name}</span>
                  <span className="flex items-center gap-1 text-small font-semibold leading-none text-text-muted">
                    <Clock aria-hidden className="size-icon" />
                    {ready ? "Listo" : `${wait} minutos`}
                  </span>
                </div>
              </div>
            </div>
            <SegmentedProgress stage={stage as 0 | 1 | 2} />
          </section>

          <Card>
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-body-strong text-ink">Cola virtual</span>
                  <span className="text-caption text-text-secondary">Pedidos cargados en la app</span>
                </div>
                <span className="shrink-0 whitespace-nowrap text-body text-text-muted">
                  <span className="font-semibold text-ink">{local.queue.virtual}</span> personas
                </span>
              </div>

              <QueueVisualization variant="virtual" ticket={order.ticket} />

              <Button
                variant="outline"
                size="md"
                fullWidth
                aria-expanded={listOpen}
                icon={
                  <ChevronDown
                    aria-hidden
                    className={cn("size-icon transition", listOpen && "rotate-180")}
                  />
                }
                onClick={() => setListOpen((open) => !open)}
              >
                {listOpen ? "Ocultar pedidos" : "Ver pedidos"}
              </Button>

              {listOpen && (
                <ul className="flex flex-col divide-y divide-border-soft rounded-md border border-border-soft">
                  {queueRows.map((row) => (
                    <li
                      key={row.number}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2",
                        row.self && "bg-accent-soft",
                      )}
                    >
                      <span className={cn("w-10 text-body-strong", row.self ? "text-accent-ink" : "text-ink")}>
                        #{row.number}
                      </span>
                      <span className={cn("flex-1 text-small", row.self ? "font-semibold text-ink" : "text-text-secondary")}>
                        {row.name}
                      </span>
                      <span
                        className={cn(
                          "text-label-caps uppercase",
                          row.status === "Impreso"
                            ? "text-text-muted"
                            : row.status === "Imprimiendo"
                              ? "text-success"
                              : "text-ink",
                        )}
                      >
                        {row.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-body-strong text-ink">Cola presencial</span>
                  <span className="text-caption text-text-secondary">
                    Actualizado {minutesAgoLabel(local.queue.updatedAt, state.demoClock)}
                  </span>
                </div>
                <span className="shrink-0 whitespace-nowrap text-body text-text-muted">
                  <span className="font-semibold text-ink">{local.queue.inPerson}</span> personas
                </span>
              </div>

              <QueueVisualization variant="in-person" />

              <Button variant="outline" size="md" fullWidth onClick={() => setReportOpen(true)}>
                Reportar cola
              </Button>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-3">
              <p className="text-h3 text-ink">Detalle del pedido</p>
              <FileCard
                name={order.file.name}
                meta={`${order.file.pages} páginas · ${order.file.sizeLabel}`}
                showIcon
              />
              <KeyValueRow label="Impresión" value={specsSummary(order.specs)} />
              <KeyValueRow label="Papel" value={paperDisplay(order.specs)} />
              <KeyValueRow label="Color" value={modeLabel(order.specs.mode)} />
              <KeyValueRow label="Total" value={`$${total}`} emphasis="strong" />
              {order.specs.notes && (
                <p className="text-small text-text-secondary">
                  <span className="font-semibold text-ink">Observaciones:</span> {order.specs.notes}
                </p>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <LocalLogo local={local} size="md" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-h3 text-ink">{local.name}</span>
                <span className="flex items-center gap-1 text-small text-text-secondary">
                  <MapPin aria-hidden className="size-icon" />
                  {local.floorLabel} · {local.hours}
                </span>
              </div>
              <Button variant="soft" size="md" onClick={() => navigate(`/locales/${local.slug}`)}>
                Ver local
              </Button>
            </div>
          </Card>
        </div>

        <TicketEdge position="bottom" />
      </Screen>

      <ReportQueueSheet open={reportOpen} onClose={() => setReportOpen(false)} local={local} />
    </>
  );
}
