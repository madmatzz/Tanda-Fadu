import { useNavigate } from "react-router";
import { Clock, Inbox, Printer } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { localById, userOrders } from "../../demo/selectors";
import { statusLabels } from "../../demo/pricing";
import { clockLabel } from "../../demo/time";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Chip } from "../../components/Chip";
import { EmptyState } from "../../components/EmptyState";
import { FileCard } from "../../components/FileCard";
import { KeyValueRow } from "../../components/KeyValueRow";
import { OrderRow } from "../../components/OrderRow";
import { PageTitle } from "../../components/PageTitle";
import { SectionLabel } from "../../components/SectionLabel";
import { SummaryBox } from "../../components/SummaryBox";

export function OrdersScreen() {
  const navigate = useNavigate();
  const { state } = useDemo();
  const orders = userOrders(state);
  const active = orders.find((order) => order.status !== "entregado");
  const history = orders.filter((order) => order.status === "entregado");

  return (
    <Screen
      title="Mis pedidos"
      leading="back"
      backTo="/"
      trailing="Pedidos"
      footer={
        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon={<Printer aria-hidden className="size-icon" />}
          onClick={() => navigate("/imprimir")}
        >
          Nuevo pedido
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <PageTitle
          title="Mis pedidos"
          subtitle="Seguí el pedido activo y revisá lo que ya retiraste."
        />

        {active ? (
          <section className="flex flex-col gap-3">
            <SectionLabel>Pedido en curso</SectionLabel>
            <Card>
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-big-number text-ink">#{active.ticket}</span>
                    <span className="text-small text-text-secondary">
                      {localById(state, active.localId)?.name} · {active.file.name}
                    </span>
                  </div>
                  <Chip tone="info">{statusLabels[active.status]}</Chip>
                </div>
                <div className="flex items-center gap-2 text-small text-text-secondary">
                  <Clock aria-hidden className="size-icon" />
                  Retiro estimado hoy a las {clockLabel(active.readyAt)} h
                </div>
                <FileCard
                  name={active.file.name}
                  meta={`${active.specs.pages} páginas · ${active.specs.copies} copia`}
                  showIcon
                />
                <Button variant="primary" size="md" fullWidth onClick={() => navigate(`/pedido/${active.id}/cola`)}>
                  Ver cola
                </Button>
              </div>
            </Card>
          </section>
        ) : (
          <EmptyState
            icon={<Inbox aria-hidden className="size-icon" />}
            title="No tenés un pedido en curso"
            description="Cuando imprimas, vas a poder seguir la cola desde acá."
            action={
              <Button variant="accent" size="md" onClick={() => navigate("/imprimir")}>
                Imprimir ahora
              </Button>
            }
          />
        )}

        <section className="flex flex-col gap-3">
          <div className="flex items-end justify-between gap-2">
            <h2 className="text-h2 text-ink">Historial</h2>
            <span className="text-caption text-text-muted">
              {history.length} {history.length === 1 ? "pedido" : "pedidos"}
            </span>
          </div>
          {history.length > 0 ? (
            <div className="flex flex-col gap-2">
              {history.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  local={localById(state, order.localId)}
                  variant="history"
                  onOpen={() => navigate(`/pedido/${order.id}`)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Inbox aria-hidden className="size-icon" />}
              title="Todavía no hay historial"
              description="Los pedidos entregados van a aparecer en esta lista."
            />
          )}
        </section>

        {active && (
          <SummaryBox note="El tiempo es ilustrativo y puede cambiar si la imprenta actualiza la cola.">
            <p className="text-h3 text-ink">Resumen del pedido activo</p>
            <KeyValueRow label="Archivo" value={active.file.name} />
            <KeyValueRow label="Impresión" value={`${active.specs.pages} páginas · ${active.specs.copies} copia`} />
            <KeyValueRow label="Total" value={`$${active.total}`} emphasis="strong" />
          </SummaryBox>
        )}
      </div>
    </Screen>
  );
}
