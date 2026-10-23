import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Check, Clock, Files, Layers, Users } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { tandaById, tandaOrders, localById } from "../../demo/selectors";
import { clockLabel } from "../../demo/time";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Chip } from "../../components/Chip";
import { EmptyState } from "../../components/EmptyState";
import { OrderRow } from "../../components/OrderRow";
import { PageTitle } from "../../components/PageTitle";
import { PrinterTrayIllustration } from "../../components/PrinterTrayIllustration";
import { ProgressBar } from "../../components/ProgressBar";
import { SectionLabel } from "../../components/SectionLabel";
import { elPoliLogoUrl } from "../../lib/assets";

export function ShopTandaDetailScreen() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useDemo();
  const [showAll, setShowAll] = useState(false);
  const tanda = tandaById(state, id);
  const local = tanda ? localById(state, tanda.localId) : undefined;
  const orders = tanda ? tandaOrders(state, tanda.id) : [];

  if (!tanda) {
    return (
      <Screen title="Tanda" leading="logo" logoSrc={elPoliLogoUrl} backTo="/imprenta/tandas" trailing="Imprenta">
        <EmptyState
          icon={<Layers aria-hidden className="size-icon" />}
          title="No encontramos esa tanda"
          description="Volvé a la lista de tandas disponibles."
          action={
            <Button variant="outline" size="md" onClick={() => navigate("/imprenta/tandas")}>
              Ver tandas
            </Button>
          }
        />
      </Screen>
    );
  }

  const pending = orders.filter((order) => order.status !== "listo" && order.status !== "entregado");
  const completed = orders.filter((order) => order.status === "listo" || order.status === "entregado");
  const confirmed = tanda.participants >= tanda.capacity;
  const visiblePending = showAll ? pending : pending.slice(0, 2);
  const visibleCompleted = completed.slice(0, 3);

  const confirmTanda = () => {
    dispatch({ type: "SHOP_CONFIRM_TANDA", tandaId: tanda.id });
  };

  return (
    <Screen
      title={tanda.label}
      leading="logo"
      logoSrc={elPoliLogoUrl}
      backTo="/imprenta/tandas"
      trailing="Cola"
      footer={
        confirmed ? (
          <Button variant="soft" size="lg" fullWidth icon={<Check aria-hidden className="size-icon" />} disabled>
            Tanda confirmada
          </Button>
        ) : (
          <Button variant="primary" size="lg" fullWidth onClick={confirmTanda}>
            Confirmar tanda
          </Button>
        )
      }
    >
      <div className="flex flex-col gap-5">
        <PageTitle title={tanda.shopTitle} subtitle={`${tanda.label} · ${local?.name ?? "El Poli"}`} />

        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="accent" icon={<Layers aria-hidden className="size-icon" />}>
            {tanda.participants}/{tanda.capacity} cupos
          </Chip>
          <Chip tone="neutral" icon={<Clock aria-hidden className="size-icon" />}>
            {tanda.waitMin} min
          </Chip>
          <Chip tone="success">{pending.length} pendientes</Chip>
        </div>

        <Card>
          <div className="flex flex-col gap-4">
            <ProgressBar
              value={(tanda.participants / tanda.capacity) * 100}
              tone="accent"
              label="Cupo de la tanda"
              valueLabel={`${tanda.participants}/${tanda.capacity}`}
            />
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center gap-1 rounded-md border border-border-soft bg-surface-soft p-2">
                <Users aria-hidden className="size-icon text-accent" />
                <span className="text-h3 text-ink">{tanda.shopStat.people}</span>
                <span className="text-caption text-text-secondary">personas</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-md border border-border-soft bg-surface-soft p-2">
                <Clock aria-hidden className="size-icon text-accent" />
                <span className="text-h3 text-ink">{tanda.shopStat.minutes}</span>
                <span className="text-caption text-text-secondary">minutos</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-md border border-border-soft bg-surface-soft p-2">
                <Files aria-hidden className="size-icon text-accent" />
                <span className="text-h3 text-ink">{tanda.shopStat.files}</span>
                <span className="text-caption text-text-secondary">archivos</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-3">
          <PrinterTrayIllustration
            topCount={Math.min(pending.length, 9)}
            bottomCount={Math.min(completed.length, 9)}
          />
          <div className="flex items-center justify-between gap-2">
            <p className="text-small font-semibold text-ink">
              {confirmed
                ? "Tanda confirmada: todos los pedidos pasaron a impresos."
                : `${pending.length} ${pending.length === 1 ? "documento esperando" : "documentos esperando"} la confirmación`}
            </p>
            {!confirmed && <Chip tone="accent">Estás en 2º lugar</Chip>}
          </div>
          {!confirmed && (
            <p className="text-caption text-text-muted">
              La confirmación imprime todos los pedidos pendientes de esta tanda. Después podés
              marcarlos como retirados desde la cola del local.
            </p>
          )}
        </div>

        <section className="flex flex-col gap-3">
          <div className="flex items-end justify-between gap-2">
            <SectionLabel>Pendientes ({pending.length})</SectionLabel>
            {pending.length > 2 && (
              <button
                type="button"
                onClick={() => setShowAll((value) => !value)}
                className="text-small font-semibold text-accent-ink underline decoration-accent-border underline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
              >
                {showAll ? "Ver menos" : `Ver los ${pending.length}`}
              </button>
            )}
          </div>
          {pending.length > 0 ? (
            <div className="flex flex-col gap-2">
              {visiblePending.map((order) => (
                <OrderRow key={order.id} order={order} variant="queue" shop />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Check aria-hidden className="size-icon" />}
              title="No quedan pendientes"
              description="Todos los pedidos de esta tanda están impresos."
            />
          )}
        </section>

        <section className="flex flex-col gap-3">
          <SectionLabel>Completados ({completed.length})</SectionLabel>
          {visibleCompleted.length > 0 ? (
            <div className="flex flex-col gap-2">
              {visibleCompleted.map((order) => (
                <OrderRow key={order.id} order={order} variant="queue" shop />
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-border bg-surface-soft p-4 text-small text-text-secondary">
              Todavía no hay pedidos completados en esta tanda.
            </p>
          )}
        </section>

        <p className="text-caption text-text-muted">
          Actualizado {clockLabel(state.demoClock)} h.
        </p>
      </div>
    </Screen>
  );
}
