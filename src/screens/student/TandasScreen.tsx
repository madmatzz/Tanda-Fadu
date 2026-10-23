import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Layers, Users } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { localById, tandaCompatible } from "../../demo/selectors";
import type { Tanda } from "../../demo/types";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { InfoCard } from "../../components/InfoCard";
import { PageTitle } from "../../components/PageTitle";
import { SectionLabel } from "../../components/SectionLabel";
import { TandaCard } from "../../components/TandaCard";

export function TandasScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, dispatch } = useDemo();
  const requested = searchParams.get("tanda");
  const initial =
    state.tandas.find((tanda) => tanda.id === requested) ??
    state.tandas.find((tanda) => tanda.id === state.draft.tandaId) ??
    state.tandas[0];
  const [selectedId, setSelectedId] = useState(initial?.id ?? "");
  const selected = state.tandas.find((tanda) => tanda.id === selectedId) ?? state.tandas[0];
  const openTandas = state.tandas.filter((tanda) => tanda.participants < tanda.capacity);
  const full = selected ? selected.participants >= selected.capacity : false;

  const join = (tanda: Tanda) => {
    dispatch({ type: "SELECT_TANDA", tandaId: tanda.id });
    navigate(`/imprimir/archivo?flujo=tanda&tanda=${tanda.id}`);
  };

  return (
    <Screen
      title="Tandas disponibles"
      leading="back"
      backTo="/"
      trailing="Tandas"
      footer={
        <Button
          variant="accent"
          size="lg"
          fullWidth
          icon={<Layers aria-hidden className="size-icon" />}
          disabled={!selected || full}
          onClick={() => {
            if (selected) join(selected);
          }}
        >
          {full ? "Tanda completa" : `Sumarme a ${selected?.label ?? "una tanda"}`}
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <PageTitle
          title="Tandas disponibles"
          subtitle="Compartí la impresión con otros estudiantes y pagá menos espera."
        />

        <Card tone="sunrise">
          <div className="flex items-start gap-3">
            <span className="flex size-control shrink-0 items-center justify-center rounded-pill border border-accent-border bg-surface/60 text-accent-ink">
              <Users aria-hidden className="size-icon" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-h3 text-ink">Impresión en tandas</p>
              <p className="text-small text-text-secondary">
                Varios pedidos con la misma configuración se imprimen juntos. El local avisa cuando
                la tanda está completa y retirás en el horario estimado.
              </p>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between gap-2">
          <SectionLabel>Tandas activas</SectionLabel>
          <span className="text-caption text-text-muted">{openTandas.length} disponibles</span>
        </div>

        {state.tandas.length > 0 ? (
          <div className="flex flex-col gap-3">
            {state.tandas.map((tanda) => {
              const local = localById(state, tanda.localId);
              const isCompatible = tandaCompatible(tanda, state.draft.specs);
              return (
                <TandaCard
                  key={tanda.id}
                  tanda={tanda}
                  local={local}
                  variant="student"
                  selected={tanda.id === selectedId}
                  compatible={isCompatible}
                  onClick={() => setSelectedId(tanda.id)}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Layers aria-hidden className="size-icon" />}
            title="No hay tandas abiertas"
            description="Volvé más tarde o elegí un local para imprimir suelto."
            action={
              <Button variant="outline" size="md" onClick={() => navigate("/locales")}>
                Ver locales
              </Button>
            }
          />
        )}

        <InfoCard
          title="Cómo funciona"
          steps={[
            "Subí tu archivo y configurá la impresión",
            "Comprobá que coincida con la tanda",
            "Pagás y el local imprime el grupo completo",
          ]}
        />

        {state.draft.tandaId && (
          <p className="text-caption text-text-muted">
            Tanda elegida en esta sesión: {state.tandas.find((tanda) => tanda.id === state.draft.tandaId)?.label}
          </p>
        )}
      </div>
    </Screen>
  );
}
