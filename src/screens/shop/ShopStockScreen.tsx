import { useNavigate } from "react-router";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { useToast } from "../../shell/ToastProvider";
import { localById } from "../../demo/selectors";
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
  const local = localById(state, PANEL_LOCAL_ID) ?? state.locals[0];

  return (
    <Screen
      title="Stock"
      leading="logo"
      logoSrc="/logo-elpoli.png"
      backTo="/imprenta"
      trailing="Imprenta"
      footer={
        <Button variant="outline" size="md" fullWidth onClick={() => navigate("/imprenta")}>
          Volver al panel
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <PageTitle
          title="Stock de papel"
          subtitle="Actualizá la disponibilidad del local. Los cambios se reflejan al instante."
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

        <div className="rounded-lg border border-border-soft bg-surface-soft p-4 text-small text-text-secondary">
          Los cambios de stock se guardan en este navegador. Podés reiniciar la demo desde el menú
          demo.
        </div>
      </div>
    </Screen>
  );
}
