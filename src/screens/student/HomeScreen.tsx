import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Bell,
  ChevronRight,
  Layers,
  MapPin,
  Printer,
  Store,
  UserRound,
} from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { activeAlerts, activeUserOrder, localById, unreadAlerts, userOrders } from "../../demo/selectors";
import { ActionCard } from "../../components/ActionCard";
import { AlertCard } from "../../components/AlertCard";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { FloatingOrderPill } from "../../components/FloatingOrderPill";
import { IconButton } from "../../components/IconButton";
import { LinkText } from "../../components/LinkText";
import { OrderRow } from "../../components/OrderRow";
import { SectionLabel } from "../../components/SectionLabel";
import { DemoMenu } from "../../components/DemoMenu";
import { modeShort } from "../../demo/pricing";

function closesIn(closesAt: string, nowIso: string): string {
  const now = new Date(nowIso);
  const [hours, minutes] = closesAt.split(":").map(Number);
  const close = new Date(now);
  close.setHours(hours, minutes, 0, 0);
  const diff = Math.max(0, Math.round((close.getTime() - now.getTime()) / 60_000));
  if (diff < 60) return `${diff} min`;
  return `${Math.round(diff / 60)} h`;
}

export function HomeScreen() {
  const navigate = useNavigate();
  const { state } = useDemo();
  const [demoOpen, setDemoOpen] = useState(false);
  const orders = userOrders(state);
  const active = activeUserOrder(state);
  const pendingAlerts = unreadAlerts(state);
  const banner = activeAlerts(state)[0];
  const hotTandas = state.tandas.slice(0, 3);

  return (
    <>
      <Screen
        title="Fadu Print"
        trailing="Inicio"
        actions={
          <span className="relative">
            <IconButton
              label="Ver alertas"
              icon={<Bell aria-hidden className="size-icon-lg" />}
              onClick={() => navigate("/alertas")}
            />
            {pendingAlerts > 0 && (
              <span className="absolute right-0 top-0 size-2 rounded-pill bg-accent ring-2 ring-bg" />
            )}
          </span>
        }
        backTo="/"
        footer={
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2 text-caption text-text-muted">
              <span>Locales en FADU · Ciudad Universitaria</span>
              <button
                type="button"
                onClick={() => setDemoOpen(true)}
                className="rounded-xs font-semibold text-text-secondary underline decoration-accent-border underline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
              >
                Menú demo
              </button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="md"
                fullWidth
                icon={<UserRound aria-hidden className="size-icon" />}
                onClick={() => navigate("/perfil")}
              >
                Mi perfil
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                icon={<Store aria-hidden className="size-icon" />}
                onClick={() => navigate("/imprenta")}
              >
                Soy imprenta
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <SectionLabel>¿Qué querés hacer?</SectionLabel>
            <ActionCard
              icon={<Printer aria-hidden className="size-icon-lg" />}
              label="Imprimir"
              tone="ink"
              onClick={() => navigate("/imprimir")}
            />
            <div className="grid grid-cols-2 gap-3">
              <ActionCard
                icon={<MapPin aria-hidden className="size-icon-lg" />}
                label="Buscar locales"
                tone="surface"
                onClick={() => navigate("/locales")}
              />
              <ActionCard
                icon={<Layers aria-hidden className="size-icon-lg" />}
                label="Tandas disponibles"
                tone="accent"
                onClick={() => navigate("/tandas")}
              />
            </div>
          </div>

          {banner && (
            <AlertCard
              alert={banner}
              local={banner.localId ? localById(state, banner.localId) : undefined}
              compact
              onOpen={
                banner.localId
                  ? () => {
                      const local = localById(state, banner.localId!);
                      if (local) navigate(`/locales/${local.slug}`);
                    }
                  : undefined
              }
            />
          )}

          <section className="flex flex-col gap-3">
            <div className="flex items-end justify-between gap-2">
              <h2 className="text-h2 text-ink">Últimos pedidos</h2>
              <LinkText size="small" onClick={() => navigate("/pedidos")}>
                Ver todos
              </LinkText>
            </div>
            {orders.length > 0 ? (
              <div className="flex flex-col gap-2">
                {orders.slice(0, 2).map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    local={localById(state, order.localId)}
                    variant="history"
                    onOpen={() =>
                      navigate(order.status === "entregado" ? `/pedido/${order.id}` : `/pedido/${order.id}/cola`)
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Printer aria-hidden className="size-icon" />}
                title="Todavía no hiciste pedidos"
                description="Cuando imprimas, vas a poder seguir la cola desde acá."
                action={
                  <Button variant="soft" size="md" onClick={() => navigate("/imprimir")}>
                    Empezar
                  </Button>
                }
              />
            )}
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-end justify-between gap-2">
              <h2 className="text-h2 text-ink">Tandas hot!</h2>
              <LinkText size="small" onClick={() => navigate("/tandas")}>
                Ver todas
              </LinkText>
            </div>
            <div className="flex flex-col gap-2">
              {hotTandas.map((tanda) => {
                const local = localById(state, tanda.localId);
                return (
                  <button
                    key={tanda.id}
                    type="button"
                    onClick={() => navigate(`/tandas?tanda=${tanda.id}`)}
                    className="flex items-center gap-3 rounded-lg border border-border-soft bg-surface p-4 text-left shadow-soft transition hover:border-accent-border hover:shadow-float focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px"
                  >
                    <span className="flex size-logo shrink-0 items-center justify-center rounded-md border border-accent-border bg-accent-soft text-accent-ink">
                      <Layers aria-hidden className="size-icon-lg" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-h3 text-ink">
                        {local?.name ?? "Local"} · {modeShort(tanda.mode)} {tanda.mode === "color" ? "doble faz" : "simple faz"}
                      </span>
                      <span className="text-small text-text-secondary">
                        {tanda.participants} pedidos · cierra en {closesIn(tanda.closesAt, state.demoClock)}
                      </span>
                    </span>
                    <span className="flex size-control shrink-0 items-center justify-center rounded-pill border border-accent-border bg-accent-soft text-small font-semibold text-accent-ink">
                      +{tanda.participants}
                    </span>
                    <ChevronRight aria-hidden className="size-icon shrink-0 text-text-muted" />
                  </button>
                );
              })}
            </div>
          </section>

          {active && (
            <div className="sticky bottom-3 z-20">
              <FloatingOrderPill order={active} onOpen={() => navigate(`/pedido/${active.id}/cola`)} />
            </div>
          )}

          <div className="flex items-center justify-between gap-2 border-t border-border-soft pt-3 text-caption text-text-muted">
            <span>Demo · miércoles 11:20</span>
            <span>Datos ficticios</span>
          </div>
        </div>
      </Screen>
      <DemoMenu open={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  );
}
