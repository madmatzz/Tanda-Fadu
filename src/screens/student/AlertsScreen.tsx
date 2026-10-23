import { useState } from "react";
import { useNavigate } from "react-router";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { useToast } from "../../shell/ToastProvider";
import { activeAlerts, localById, unreadAlerts } from "../../demo/selectors";
import type { AlertKind } from "../../demo/types";
import { AlertCard } from "../../components/AlertCard";
import { Button } from "../../components/Button";
import { Chip } from "../../components/Chip";
import { EmptyState } from "../../components/EmptyState";
import { LinkText } from "../../components/LinkText";
import { PageTitle } from "../../components/PageTitle";
import { SectionLabel } from "../../components/SectionLabel";

const filters: Array<{ value: AlertKind | "all"; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "stock", label: "Stock" },
  { value: "tecnico", label: "Técnicas" },
  { value: "descuento", label: "Descuentos" },
  { value: "info", label: "Info" },
];

export function AlertsScreen() {
  const navigate = useNavigate();
  const { state, dispatch } = useDemo();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<AlertKind | "all">("all");
  const alerts = activeAlerts(state);
  const unread = unreadAlerts(state);
  const filtered = alerts.filter((alert) => filter === "all" || alert.kind === filter);

  const markAllRead = () => {
    dispatch({ type: "MARK_ALERTS_READ" });
    showToast("Todos los avisos quedaron marcados como leídos.");
  };

  return (
    <Screen
      title="Avisos"
      leading="back"
      backTo="/"
      trailing="Alertas"
      actions={
        unread > 0 ? (
          <button
            type="button"
            onClick={markAllRead}
            className="flex items-center gap-1 rounded-pill px-2 py-1 text-small font-semibold text-accent-ink transition hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-accent"
          >
            <CheckCheck aria-hidden className="size-icon" />
            Leídos
          </button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-5">
        <PageTitle
          title="Avisos"
          subtitle="Stock, novedades técnicas y promos de los locales de la FADU."
        />

        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={filter === item.value}
              onClick={() => setFilter(item.value)}
            >
              <Chip tone={filter === item.value ? "ink" : "neutral"}>{item.label}</Chip>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <SectionLabel>{filtered.length} avisos activos</SectionLabel>
            <LinkText size="small" onClick={() => navigate("/locales")}>
              Ver locales
            </LinkText>
          </div>
          {filtered.length > 0 ? (
            filtered.map((alert) => {
              const local = alert.localId ? localById(state, alert.localId) : undefined;
              return (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  local={local}
                  onOpen={local ? () => navigate(`/locales/${local.slug}`) : undefined}
                />
              );
            })
          ) : (
            <EmptyState
              icon={<Inbox aria-hidden className="size-icon" />}
              title="No hay avisos con este filtro"
              description="Probá con otra categoría o volvé más tarde."
              action={
                <Button variant="outline" size="md" onClick={() => setFilter("all")}>
                  Ver todos
                </Button>
              }
            />
          )}
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-border-soft bg-surface-soft p-4 text-small text-text-secondary">
          <Bell aria-hidden className="mt-0.5 size-icon shrink-0 text-text-muted" />
          <p>Los avisos los publican los locales. La campana de Home muestra cuántos no leíste.</p>
        </div>
      </div>
    </Screen>
  );
}
