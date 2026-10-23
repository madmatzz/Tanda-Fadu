import { useNavigate, useParams } from "react-router";
import { CheckCircle2, Clock, ReceiptText } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { localById, orderById } from "../../demo/selectors";
import { modeLabel, paperDisplay, paymentLabels, specsSummary } from "../../demo/pricing";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Chip } from "../../components/Chip";
import { EmptyState } from "../../components/EmptyState";
import { IconBox } from "../../components/IconBox";
import { KeyValueRow } from "../../components/KeyValueRow";
import { PageTitle } from "../../components/PageTitle";
import { ReceiptTicket } from "../../components/ReceiptTicket";
import { OrderStatusStepper } from "../../components/QueueVisualization";

const barcodeHeights = [
  "h-2",
  "h-4",
  "h-3",
  "h-5",
  "h-3",
  "h-4",
  "h-2",
  "h-4",
  "h-3",
  "h-5",
  "h-2",
  "h-4",
  "h-2",
  "h-4",
  "h-3",
  "h-5",
  "h-3",
  "h-4",
  "h-2",
  "h-4",
  "h-3",
  "h-5",
  "h-2",
  "h-4",
];

export function ConfirmationScreen() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { state } = useDemo();
  const order = orderById(state, id);
  const local = order ? localById(state, order.localId) : undefined;

  if (!order) {
    return (
      <Screen title="Pedido confirmado" trailing="Confirmación">
        <EmptyState
          icon={<ReceiptText aria-hidden className="size-icon" />}
          title="No encontramos ese pedido"
          description="El pedido puede haber expirado en esta demo."
          action={
            <Button variant="outline" size="md" onClick={() => navigate("/pedidos")}>
              Ver mis pedidos
            </Button>
          }
        />
      </Screen>
    );
  }

  return (
    <Screen
      title="Pedido confirmado"
      trailing="Confirmación"
      footer={
        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate(`/pedido/${order.id}/cola`)}
          >
            Seguir el pedido
          </Button>
          <Button variant="outline" size="md" fullWidth onClick={() => navigate("/")}>
            Volver al inicio
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <IconBox status="success" label="Pedido confirmado" />
          <PageTitle
            title="Pedido confirmado"
            subtitle="Imprimí sin vueltas. Ya estamos preparando tu pedido."
          />
          <Chip tone="success" icon={<CheckCircle2 aria-hidden className="size-3" />}>
            #{order.ticket} · {local?.name ?? "Local"}
          </Chip>
        </div>

        <OrderStatusStepper completed={1} />

        <ReceiptTicket>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-label-caps uppercase text-text-muted">Ticket digital</span>
              <Chip tone="accent">{paymentLabels[order.payment]}</Chip>
            </div>
            <div className="flex items-end justify-between gap-2">
              <span className="text-big-number text-ink">#{order.ticket}</span>
              <span className="text-small text-text-secondary">{order.code}</span>
            </div>
            <div className="flex flex-col gap-2 border-t border-dashed border-border pt-3">
              <KeyValueRow label="Local" value={local?.name ?? "Local"} />
              <KeyValueRow label="Archivo" value={order.file.name} />
              <KeyValueRow label="Impresión" value={specsSummary(order.specs)} />
              <KeyValueRow label="Papel" value={paperDisplay(order.specs)} />
              <KeyValueRow label="Color" value={modeLabel(order.specs.mode)} />
              <KeyValueRow label="Total" value={`$${order.total}`} emphasis="strong" />
            </div>
            <div
              aria-hidden
              className="flex h-8 items-end justify-center gap-0.5 border-t border-border-soft pt-2"
            >
              {barcodeHeights.map((heightClass, index) => (
                <span key={index} className={`w-1 bg-ink ${heightClass}`} />
              ))}
            </div>
          </div>
        </ReceiptTicket>

        <Card tone="sunrise">
          <div className="flex items-start gap-3">
            <Clock aria-hidden className="mt-0.5 size-icon shrink-0 text-accent-ink" />
            <div className="flex flex-col gap-1">
              <p className="text-body-strong text-ink">Ya estás en la cola virtual</p>
              <p className="text-small text-text-secondary">
                Retirás en {local?.name ?? "el local"} cuando el pedido esté listo. Podés seguir el
                estado desde Mis pedidos.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Screen>
  );
}
