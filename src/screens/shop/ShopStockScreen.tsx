import { useState } from "react";
import { useNavigate } from "react-router";
import { Megaphone } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { useToast } from "../../shell/ToastProvider";
import { localAlerts, localById } from "../../demo/selectors";
import type { Alert } from "../../demo/types";
import { AlertCard } from "../../components/AlertCard";
import { AlertComposerSheet } from "../../components/AlertComposerSheet";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { CatalogChips } from "../../components/CatalogChips";
import { PageTitle } from "../../components/PageTitle";
import { SectionLabel } from "../../components/SectionLabel";
import { StockRow } from "../../components/StockRow";

const PANEL_LOCAL_ID = "local-el-poli";

export function ShopStockScreen() {
  const navigate = useNavigate();
  const { state, dispatch } = useDemo();
  const { showToast } = useToast();
  const [composerOpen, setComposerOpen] = useState(false);
  const [editing, setEditing] = useState<Alert | undefined>(undefined);
  const local = localById(state, PANEL_LOCAL_ID) ?? state.locals[0];
  const alerts = localAlerts(state, local.id);

  const openComposer = (alert?: Alert) => {
    setEditing(alert);
    setComposerOpen(true);
  };

  return (
    <>
      <Screen
        title="Stock y avisos"
        leading="logo"
        logoSrc="/logo-elpoli.png"
        backTo="/imprenta"
        trailing="Stock"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="md" fullWidth onClick={() => navigate("/imprenta")}>
              Volver al panel
            </Button>
            <Button
              variant="warning"
              size="md"
              fullWidth
              icon={<Megaphone aria-hidden className="size-icon" />}
              onClick={() => openComposer()}
            >
              Cargar aviso
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <PageTitle
            title="Stock y avisos"
            subtitle="Actualizá la disponibilidad de papel y comunicá novedades."
          />

          <div className="flex flex-col gap-3">
            <div className="flex items-end justify-between gap-2">
              <SectionLabel>Papeles del local</SectionLabel>
              <span className="text-caption text-text-muted">{local.name}</span>
            </div>
            <div className="flex flex-col gap-2">
              {local.papers.map((paperId) => (
                <StockRow
                  key={paperId}
                  paperId={paperId}
                  level={local.stock[paperId]}
                  onChange={(level) => {
                    dispatch({ type: "SHOP_SET_STOCK", localId: local.id, paperId, level });
                    showToast(`${paperId} actualizado. Ya se ve en la búsqueda de estudiantes.`);
                  }}
                />
              ))}
            </div>
            <Card tone="sunrise">
              <div className="flex flex-col gap-2">
                <p className="text-small font-semibold text-ink">Vista previa del catálogo</p>
                <CatalogChips local={local} />
                <p className="text-caption text-text-secondary">
                  Los estudiantes ven el stock actualizado en el perfil del local y al comparar.
                </p>
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-end justify-between gap-2">
              <SectionLabel>Avisos publicados</SectionLabel>
              <span className="text-caption text-text-muted">{alerts.length} activos</span>
            </div>
            {alerts.length > 0 ? (
              <div className="flex flex-col gap-2">
                {alerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    local={local}
                    onEdit={() => openComposer(alert)}
                    onDeactivate={() => {
                      dispatch({ type: "SHOP_DEACTIVATE_ALERT", alertId: alert.id });
                      showToast("Aviso eliminado del perfil del local.");
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-border bg-surface-soft p-4 text-small text-text-secondary">
                No hay avisos activos. Cargá uno para avisar por stock, cambios técnicos o promos.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-border-soft bg-surface-soft p-4 text-small text-text-secondary">
            Los cambios de stock y avisos se guardan en este navegador. Podés reiniciar la demo desde
            el menú de inicio.
          </div>
        </div>
      </Screen>

      <AlertComposerSheet
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        localId={local.id}
        alert={editing}
      />
    </>
  );
}
