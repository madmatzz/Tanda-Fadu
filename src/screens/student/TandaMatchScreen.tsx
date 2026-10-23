import { useState } from "react";
import { useNavigate } from "react-router";
import { Layers, Upload } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { localById, tandaCompatible } from "../../demo/selectors";
import { estimateTotal } from "../../demo/pricing";
import { Button } from "../../components/Button";
import { Chip } from "../../components/Chip";
import { EmptyState } from "../../components/EmptyState";
import { InfoCard } from "../../components/InfoCard";
import { PageTitle } from "../../components/PageTitle";
import { TandaCard } from "../../components/TandaCard";

export function TandaMatchScreen() {
  const navigate = useNavigate();
  const { state, dispatch } = useDemo();
  const file = state.draft.file;
  const compatible = state.tandas.filter((tanda) => tandaCompatible(tanda, state.draft.specs));
  const initial =
    compatible.find((tanda) => tanda.id === state.draft.tandaId) ?? compatible[0] ?? state.tandas[0];
  const [selectedId, setSelectedId] = useState(initial?.id ?? "");
  const selected = state.tandas.find((tanda) => tanda.id === selectedId) ?? initial;
  const selectedLocal = selected ? localById(state, selected.localId) : undefined;
  const total = selected && selectedLocal ? estimateTotal(state.draft.specs, selectedLocal) : 0;
  const visibleTandas = state.tandas.filter(
    (tanda, index) => index < 2 || tanda.id === selectedId,
  );

  if (!file) {
    return (
      <Screen
        title="Tandas"
        leading="back"
        backTo="/tandas"
        trailing="Coincidencia"
        footer={
          <Button
            variant="accent"
            size="lg"
            fullWidth
            icon={<Upload aria-hidden className="size-icon" />}
            onClick={() => navigate("/imprimir?flujo=tanda")}
          >
            Subir archivo
          </Button>
        }
      >
        <EmptyState
          icon={<Layers aria-hidden className="size-icon" />}
          title="Necesitás un archivo para buscar tanda"
          description="Subilo, configurá la impresión y te mostramos la tanda que coincide."
        />
      </Screen>
    );
  }

  const choose = (tandaId: string) => {
    const tanda = state.tandas.find((item) => item.id === tandaId);
    if (!tanda) return;
    if (!tandaCompatible(tanda, state.draft.specs)) {
      return;
    }
    setSelectedId(tanda.id);
    dispatch({ type: "SELECT_TANDA", tandaId: tanda.id });
  };

  return (
    <Screen
      title="Tandas"
      leading="back"
      backTo="/imprimir/validacion?flujo=tanda"
      trailing="Coincidencia"
      footer={
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 text-small text-text-secondary">
            <span>{selected?.label ?? "Tanda"}</span>
            <span className="text-body-strong text-ink">${total}</span>
          </div>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!selected || !compatible.some((tanda) => tanda.id === selected.id)}
            onClick={() => {
              if (!selected) return;
              dispatch({ type: "SELECT_TANDA", tandaId: selected.id });
              navigate("/imprimir/pago?flujo=tanda");
            }}
          >
            Sumarme a {selected?.label ?? "la tanda"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <PageTitle
          title="Tu tanda coincide"
          subtitle="Buscamos tandas con tu misma configuración."
        />

        <div className="flex items-center justify-between gap-2 rounded-md border border-border-soft bg-surface-soft p-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-small font-semibold text-ink">{file.name}</span>
            <span className="text-caption text-text-secondary">
              {state.draft.specs.pages} páginas · {state.draft.specs.size} · {state.draft.specs.mode === "bn" ? "B&N" : "Color"}
            </span>
          </div>
          <Chip tone={compatible.length > 0 ? "success" : "warning"}>
            {compatible.length > 0 ? `${compatible.length} compatible` : "Sin coincidencia"}
          </Chip>
        </div>

        <div className="flex flex-col gap-3">
          {visibleTandas.map((tanda) => {
            const isCompatible = tandaCompatible(tanda, state.draft.specs);
            return (
              <TandaCard
                key={tanda.id}
                tanda={tanda}
                local={localById(state, tanda.localId)}
                variant="student"
                selected={tanda.id === selected?.id}
                compatible={isCompatible}
                onClick={() => choose(tanda.id)}
              />
            );
          })}
        </div>

        {compatible.length === 0 && (
          <InfoCard title="No hay una tanda compatible">
            Podés imprimir suelto, cambiar el tamaño o el color en las especificaciones, o volver
            más tarde cuando se abra otra tanda.
          </InfoCard>
        )}

        <Button
          variant="outline"
          size="md"
          fullWidth
          onClick={() => navigate("/imprimir/especificaciones?flujo=tanda")}
        >
          Ajustar especificaciones
        </Button>

        <p className="text-caption text-text-muted">
          La tanda agrupa pedidos con la misma configuración. El local imprime cuando se completa el
          cupo o al cerrar el horario.
        </p>
      </div>
    </Screen>
  );
}
