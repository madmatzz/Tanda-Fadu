import { useNavigate } from "react-router";
import { Layers } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { localById } from "../../demo/selectors";
import { Button } from "../../components/Button";
import { Chip } from "../../components/Chip";
import { PageTitle } from "../../components/PageTitle";
import { TandaCard } from "../../components/TandaCard";

const PANEL_LOCAL_ID = "local-el-poli";

export function ShopTandasScreen() {
  const navigate = useNavigate();
  const { state } = useDemo();
  const local = localById(state, PANEL_LOCAL_ID) ?? state.locals[0];

  return (
    <Screen
      title="Tandas"
      leading="logo"
      logoSrc="/logo-elpoli.png"
      backTo="/imprenta"
      trailing="Imprenta"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" size="md" fullWidth onClick={() => navigate("/imprenta")}>
            Panel
          </Button>
          <Button variant="primary" size="md" fullWidth onClick={() => navigate("/imprenta/perfil")}>
            Editar perfil
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <PageTitle
          title="Tandas disponibles"
          subtitle="Revisá los grupos abiertos y confirmá cuando estén completos."
        />

        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="accent" icon={<Layers aria-hidden className="size-icon" />}>
            {state.tandas.filter((tanda) => tanda.participants < tanda.capacity).length} abiertas
          </Chip>
          <Chip tone="neutral">{local.name}</Chip>
        </div>

        <div className="flex flex-col gap-3">
          {state.tandas.map((tanda) => (
            <TandaCard
              key={tanda.id}
              tanda={tanda}
              local={localById(state, tanda.localId)}
              variant="shop"
              onCta={() => navigate(`/imprenta/tandas/${tanda.id}`)}
            />
          ))}
        </div>

        <p className="rounded-lg border border-border-soft bg-surface-soft p-4 text-small text-text-secondary">
          Las tandas se cierran cuando se completa el cupo o llega el horario límite. Los pedidos
          agrupados se imprimen juntos para ahorrar tiempo y papel.
        </p>
      </div>
    </Screen>
  );
}
