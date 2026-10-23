import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Bell,
  ClipboardList,
  FlaskConical,
  Layers,
  MapPin,
  Megaphone,
  Star,
  Users,
} from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { useToast } from "../../shell/ToastProvider";
import {
  activeAlerts,
  localById,
  localReviews,
  shopOrders,
  tandaById,
  tandaOrders,
} from "../../demo/selectors";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { CatalogChips } from "../../components/CatalogChips";
import { DemoMenu } from "../../components/DemoMenu";
import { LinkText } from "../../components/LinkText";
import { MetricCard } from "../../components/MetricCard";
import { PageTitle } from "../../components/PageTitle";
import { ProgressBar } from "../../components/ProgressBar";
import { ReviewCard } from "../../components/ReviewCard";
import { SectionLabel } from "../../components/SectionLabel";
import { AlertCard } from "../../components/AlertCard";
import { AlertComposerSheet } from "../../components/AlertComposerSheet";
import { IconButton } from "../../components/IconButton";

const PANEL_LOCAL_ID = "local-el-poli";

export function ShopHomeScreen() {
  const navigate = useNavigate();
  const { state, dispatch } = useDemo();
  const { showToast } = useToast();
  const [demoOpen, setDemoOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const local = localById(state, PANEL_LOCAL_ID) ?? state.locals[0];
  const orders = shopOrders(state, local.id);
  const pending = orders.filter((order) => order.status !== "entregado" && order.status !== "listo");
  const tanda = tandaById(state, "tanda-1") ?? state.tandas[0];
  const currentTandaOrders = tanda ? tandaOrders(state, tanda.id) : [];
  const pendingTanda = currentTandaOrders.filter((order) => order.status !== "entregado" && order.status !== "listo");
  const reviews = localReviews(state, local.id);
  const alerts = activeAlerts(state, local.id).slice(0, 2);

  return (
    <>
      <Screen
        title="El Poli"
        leading="logo"
        logoSrc="/logo-elpoli.png"
        backTo="/imprenta"
        trailing="Imprenta"
        actions={
          <IconButton
            label="Abrir menú demo"
            icon={<FlaskConical aria-hidden className="size-icon-lg" />}
            onClick={() => setDemoOpen(true)}
          />
        }
        footer={
          <Button variant="primary" size="lg" fullWidth onClick={() => navigate("/imprenta/perfil")}>
            Mi perfil
          </Button>
        }
      >
        <div className="flex flex-col gap-5">
          <PageTitle
            title="Hola, El Poli"
            subtitle="Miércoles 11:20 · resumen de hoy"
          />

          <Button
            variant="warning"
            size="md"
            fullWidth
            icon={<Megaphone aria-hidden className="size-icon" />}
            onClick={() => setAlertOpen(true)}
          >
            Cargar aviso
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <MetricCard
              icon={<Users aria-hidden className="size-icon" />}
              label="Cola virtual"
              value={`${local.queue.virtual}`}
              meta="personas"
              onClick={() => navigate(`/imprenta/tandas/${tanda?.id ?? "tanda-1"}`)}
            />
            <MetricCard
              icon={<MapPin aria-hidden className="size-icon" />}
              label="En el local"
              value={`${local.queue.inPerson}`}
              meta="personas"
              onClick={() => navigate(`/imprenta/tandas/${tanda?.id ?? "tanda-1"}`)}
            />
            <div className="col-span-2">
              <div className="grid grid-cols-1">
                <MetricCard
                  icon={<ClipboardList aria-hidden className="size-icon" />}
                  label="Pedidos pendientes"
                  value={`${pending.length}`}
                  meta={`${pendingTanda.length} en la tanda en curso`}
                  tone="sunrise"
                  onClick={() => navigate(`/imprenta/tandas/${tanda?.id ?? "tanda-1"}`)}
                />
              </div>
            </div>
            <MetricCard
              icon={<Layers aria-hidden className="size-icon" />}
              label="Tandas activas"
              value={`${state.tandas.filter((item) => item.participants < item.capacity).length}`}
              meta="abiertas"
              onClick={() => navigate("/imprenta/tandas")}
            />
            <MetricCard
              icon={<Star aria-hidden className="size-icon" />}
              label="Reseñas"
              value={local.rating.toFixed(1).replace(".", ",")}
              meta={`${local.reviewCount} en total`}
              onClick={() => navigate("/imprenta/resenas")}
            />
          </div>

          {tanda && (
            <Card>
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <SectionLabel>Tanda en curso</SectionLabel>
                    <p className="text-h2 text-ink">{tanda.label}</p>
                    <p className="text-small text-text-secondary">{tanda.shopTitle}</p>
                  </div>
                  <span className="flex size-control shrink-0 items-center justify-center rounded-pill border border-accent-border bg-accent-soft text-accent-ink">
                    <Layers aria-hidden className="size-icon" />
                  </span>
                </div>
                <ProgressBar
                  value={(tanda.participants / tanda.capacity) * 100}
                  tone="accent"
                  label="Cupo de la tanda"
                  valueLabel={`${tanda.participants}/${tanda.capacity}`}
                />
                <div className="flex items-center justify-between gap-2 text-small text-text-secondary">
                  <span>{pendingTanda.length} pedidos esperando</span>
                  <span>Espera {tanda.waitMin} min</span>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => navigate(`/imprenta/tandas/${tanda.id}`)}
                >
                  Ver cola de la tanda
                </Button>
              </div>
            </Card>
          )}

          <section className="flex flex-col gap-3">
            <div className="flex items-end justify-between gap-2">
              <h2 className="text-h2 text-ink">Stock de papel</h2>
              <LinkText size="small" onClick={() => navigate("/imprenta/stock")}>
                Gestionar
              </LinkText>
            </div>
            <CatalogChips local={local} />
            <p className="text-caption text-text-muted">
              El stock se refleja en el perfil del local y en la búsqueda de estudiantes.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-end justify-between gap-2">
              <h2 className="text-h2 text-ink">Avisos activos</h2>
              <LinkText size="small" onClick={() => setAlertOpen(true)}>
                Nuevo aviso
              </LinkText>
            </div>
            {alerts.length > 0 ? (
              <div className="flex flex-col gap-2">
                {alerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    local={local}
                    compact
                    onDeactivate={() => {
                      dispatch({ type: "SHOP_DEACTIVATE_ALERT", alertId: alert.id });
                      showToast("Aviso eliminado del perfil del local.");
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-border bg-surface-soft p-4 text-small text-text-secondary">
                No hay avisos para El Poli. Cargá uno para avisar por stock o novedades.
              </p>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-end justify-between gap-2">
              <h2 className="text-h2 text-ink">Última reseña</h2>
              <LinkText size="small" onClick={() => navigate("/imprenta/resenas")}>
                Ver reseñas
              </LinkText>
            </div>
            {reviews[0] ? (
              <ReviewCard review={reviews[0]} />
            ) : (
              <p className="rounded-lg border border-dashed border-border bg-surface-soft p-4 text-small text-text-secondary">
                Todavía no hay reseñas.
              </p>
            )}
          </section>

          <div className="flex items-center gap-2 rounded-lg border border-border-soft bg-surface-soft p-3 text-caption text-text-muted">
            <Bell aria-hidden className="size-icon shrink-0" />
            Los avisos y cambios de stock se publican al instante en la vista de estudiantes.
          </div>
        </div>
      </Screen>

      <DemoMenu open={demoOpen} onClose={() => setDemoOpen(false)} />
      <AlertComposerSheet
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        localId={local.id}
      />
    </>
  );
}
