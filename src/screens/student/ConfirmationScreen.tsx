import { useNavigate, useParams } from "react-router";
import { CheckCircle2, Clock, ReceiptText } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { localById, orderById, tandaById } from "../../demo/selectors";
import { modeLabel, paperDisplay, paperLabels, paymentLabels, specsSummary } from "../../demo/pricing";
import { Barcode } from "../../components/Barcode";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Chip } from "../../components/Chip";
import { EmptyState } from "../../components/EmptyState";
import { IconBox } from "../../components/IconBox";
import { KeyValueRow } from "../../components/KeyValueRow";
import { PageTitle } from "../../components/PageTitle";
import { ReceiptTicket } from "../../components/ReceiptTicket";

export function ConfirmationScreen() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { state } = useDemo();
  const order = orderById(state, id);
  const local = order ? localById(state, order.localId) : undefined;
  const tanda = order?.tandaId ? tandaById(state, order.tandaId) : undefined;

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

        {tanda && (
          <div className="flex flex-col items-center gap-1 rounded-lg border border-tanda bg-tanda p-card text-center text-surface shadow-soft">
            <span className="text-label-caps uppercase opacity-90">
              {tanda.size} · {modeLabel(tanda.mode)} · {paperLabels[tanda.paper]}
            </span>
            <span className="text-h2">¡Ingresaste en una tanda!</span>
            <span className="text-small opacity-90">Tu pedido saldrá más rápido.</span>
            <span className="text-caption opacity-80">
              {tanda.label} · {tanda.participants} pedidos · cierra a las {tanda.closesAt} h
            </span>
          </div>
        )}


        <ReceiptTicket>
          <div className="flex flex-col gap-3">
            <span className="text-label-caps uppercase text-text-muted">Ticket digital</span>
            <div className="flex items-center justify-between gap-2">
              <span className="text-big-number text-ink">#{order.ticket}</span>
              <Chip tone="accent">{paymentLabels[order.payment]}</Chip>
            </div>
            <div className="flex flex-col gap-2 border-t border-dashed border-border pt-3">
              <KeyValueRow label="Local" value={local?.name ?? "Local"} />
              <KeyValueRow label="Archivo" value={order.file.name} />
              <KeyValueRow label="Impresión" value={specsSummary(order.specs)} />
              <KeyValueRow label="Papel" value={paperDisplay(order.specs)} />
              <KeyValueRow label="Color" value={modeLabel(order.specs.mode)} />
              <KeyValueRow label="Total" value={`$${order.total}`} emphasis="strong" />
            </div>
            <div className="flex items-start gap-3 border-t border-border-soft pt-3">
              <div className="min-w-0 flex-1">
                <Barcode value={order.code} />
              </div>
              <span className="shrink-0 text-small text-text-secondary">{order.code}</span>
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
