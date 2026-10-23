import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Clock, MapPin, RefreshCw } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { useToast } from "../../shell/ToastProvider";
import { localById, orderById } from "../../demo/selectors";
import { estimateTotal, modeLabel, paperDisplay, specsSummary, statusLabels } from "../../demo/pricing";
import { clockLabel, minutesAgoLabel } from "../../demo/time";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Chip } from "../../components/Chip";
import { EmptyState } from "../../components/EmptyState";
import { FileCard } from "../../components/FileCard";
import { KeyValueRow } from "../../components/KeyValueRow";
import { LocalLogo } from "../../components/LocalLogo";
import { OrderStatusBadge } from "../../components/OrderStatusBadge";
import { PageTitle } from "../../components/PageTitle";
import { QueueVisualization, SegmentedProgress } from "../../components/QueueVisualization";
import { ReportQueueSheet } from "../../components/ReportQueueSheet";

export function QueueScreen() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { state } = useDemo();
  const { showToast } = useToast();
  const [reportOpen, setReportOpen] = useState(false);
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

  const stage = order.status === "listo" || order.status === "entregado" ? 2 : order.status === "confirmado" ? 0 : 1;
  const total = estimateTotal(order.specs, local);
  const headline =
    order.status === "listo" || order.status === "entregado"
      ? "Tu pedido está listo"
      : "Tu pedido está en cola";

  return (
    <>
      <Screen
        title="Tu pedido"
        leading="back"
        backTo="/pedidos"
        trailing="En cola"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="md" fullWidth onClick={() => navigate("/pedidos")}>
              Mis pedidos
            </Button>
            <Button variant="primary" size="md" fullWidth onClick={() => navigate("/")}>
              Inicio
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-label-caps uppercase text-text-muted">Pedido #{order.ticket}</span>
            <PageTitle
              title={headline}
              subtitle={`${local.name} · ${local.floorLabel}`}
            />
          </div>

          <Card tone="glass">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <OrderStatusBadge status={order.status} />
                <Chip tone="neutral" icon={<Clock aria-hidden className="size-3" />}>
                  Retiro {clockLabel(order.readyAt)} h
                </Chip>
              </div>
              <div className="flex items-end justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-caption text-text-secondary">Espera estimada</span>
                  <span className="text-big-number text-ink">{local.queue.waitVirtual} min</span>
                </div>
                <span className="text-small text-text-secondary">
                  {local.queue.virtual} personas en cola virtual
                </span>
              </div>
              <SegmentedProgress stage={stage as 0 | 1 | 2} />
              <QueueVisualization variant="virtual" ticket={order.ticket} />
              <Button variant="outline" size="md" fullWidth onClick={() => setReportOpen(true)}>
                Reportar cola
              </Button>
            </div>
          </Card>

          <div className="flex items-center justify-between gap-2 text-caption text-text-muted">
            <span>Actualizado {minutesAgoLabel(local.queue.updatedAt, state.demoClock)}</span>
            <button
              type="button"
              onClick={() => showToast("La cola se actualizó con los últimos datos de la demo.")}
              className="flex items-center gap-1 font-semibold text-accent-ink underline decoration-accent-border underline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
            >
              <RefreshCw aria-hidden className="size-3" />
              Actualizar
            </button>
          </div>

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

          <p className="text-caption text-text-muted">
            Estado actual: {statusLabels[order.status]}. Si la cola cambia, la imprenta actualiza el
            tiempo estimado.
          </p>
        </div>
      </Screen>

      <ReportQueueSheet open={reportOpen} onClose={() => setReportOpen(false)} local={local} />
    </>
  );
}
