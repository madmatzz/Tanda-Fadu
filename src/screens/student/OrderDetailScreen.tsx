import { useNavigate, useParams } from "react-router";
import { Clock, MapPin, ReceiptText } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { localById, orderById } from "../../demo/selectors";
import {
  modeLabel,
  paperDisplay,
  paymentLabels,
  specsSummary,
  statusLabels,
} from "../../demo/pricing";
import { dateLabel } from "../../demo/time";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Chip } from "../../components/Chip";
import { EmptyState } from "../../components/EmptyState";
import { KeyValueRow } from "../../components/KeyValueRow";
import { LocalLogo } from "../../components/LocalLogo";
import { OrderStatusBadge } from "../../components/OrderStatusBadge";
import { PageTitle } from "../../components/PageTitle";
import { ReceiptTicket } from "../../components/ReceiptTicket";
import { OrderStatusStepper } from "../../components/QueueVisualization";

export function OrderDetailScreen() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { state } = useDemo();
  const order = orderById(state, id);
  const local = order ? localById(state, order.localId) : undefined;

  if (!order) {
    return (
      <Screen title="Detalle del pedido" leading="back" backTo="/pedidos" trailing="Pedido">
        <EmptyState
          icon={<ReceiptText aria-hidden className="size-icon" />}
          title="No encontramos ese pedido"
          description="Revisá el historial de pedidos o volvé al inicio."
          action={
            <Button variant="outline" size="md" onClick={() => navigate("/pedidos")}>
              Ver mis pedidos
            </Button>
          }
        />
      </Screen>
    );
  }

  const delivered = order.status === "entregado";
  const step: 1 | 2 | 3 =
    order.status === "entregado" ? 3 : order.status === "listo" ? 2 : 1;

  return (
    <Screen
      title="Detalle del pedido"
      leading="back"
      backTo="/pedidos"
      trailing="Pedido"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" size="md" fullWidth onClick={() => navigate("/pedidos")}>
            Mis pedidos
          </Button>
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={() =>
              delivered ? navigate("/imprimir") : navigate(`/pedido/${order.id}/cola`)
            }
          >
            {delivered ? "Volver a pedir" : "Ver cola"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <PageTitle
          title={`Pedido #${order.ticket}`}
          subtitle={`${local?.name ?? "Local"} · ${dateLabel(order.createdAt)}`}
        />
        <div className="flex items-center justify-between gap-2">
          <OrderStatusBadge status={order.status} />
          <Chip tone="neutral" icon={<Clock aria-hidden className="size-3" />}>
            {statusLabels[order.status]}
          </Chip>
        </div>

        <OrderStatusStepper completed={step} />

        <ReceiptTicket>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-label-caps uppercase text-text-muted">Comprobante demo</span>
              <Chip tone="neutral">{paymentLabels[order.payment]}</Chip>
            </div>
            <div className="flex items-end justify-between gap-2">
              <span className="text-big-number text-ink">#{order.ticket}</span>
              <span className="text-small text-text-secondary">{order.code}</span>
            </div>
            <div className="flex flex-col gap-2 border-t border-dashed border-border pt-3">
              <KeyValueRow label="Archivo" value={order.file.name} />
              <KeyValueRow label="Impresión" value={specsSummary(order.specs)} />
              <KeyValueRow label="Papel" value={paperDisplay(order.specs)} />
              <KeyValueRow label="Color" value={modeLabel(order.specs.mode)} />
              <KeyValueRow label="Total" value={`$${order.total}`} emphasis="strong" />
            </div>
          </div>
        </ReceiptTicket>

        <Card>
          <div className="flex items-center gap-3">
            {local && <LocalLogo local={local} size="md" />}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-h3 text-ink">{local?.name ?? "Local"}</span>
              <span className="flex items-center gap-1 text-small text-text-secondary">
                <MapPin aria-hidden className="size-icon" />
                {local?.floorLabel} · {local?.hours}
              </span>
            </div>
            <Button variant="soft" size="md" onClick={() => navigate(`/locales/${local?.slug ?? ""}`)}>
              Ver local
            </Button>
          </div>
        </Card>

        <p className="text-caption text-text-muted">
          {delivered
            ? "Este pedido ya fue retirado. Podés volver a imprimir con la misma configuración."
            : "El pedido sigue activo. Seguí la cola para ver el estado actualizado."}
        </p>
      </div>
    </Screen>
  );
}
