import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CheckCircle2, Clock, MapPin } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { specsStock } from "../../demo/selectors";
import {
  estimateTotal,
  modeShort,
  paperDisplay,
  stockLabels,
  stockTone,
  specsSummary,
} from "../../demo/pricing";
import type { StockLevel } from "../../demo/types";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Chip } from "../../components/Chip";
import { LinkText } from "../../components/LinkText";
import { LocalLogo } from "../../components/LocalLogo";
import { PageTitle } from "../../components/PageTitle";
import { RatingStars } from "../../components/RatingStars";
import { SegmentedControl } from "../../components/SegmentedControl";

export function CompareScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, dispatch } = useDemo();
  const desde = searchParams.get("desde") ?? "locales";
  const localParam = searchParams.get("local");
  const specs = state.draft.specs;
  const file = state.draft.file;
  const [sort, setSort] = useState<"price" | "wait">("price");
  const [selectedId, setSelectedId] = useState<string>(() => {
    const requested = localParam
      ? state.locals.find((local) => local.slug === localParam || local.id === localParam)
      : undefined;
    return requested?.id ?? state.draft.localId ?? state.locals[0].id;
  });

  const backTo =
    desde === "carrito"
      ? "/imprimir/carrito"
      : desde === "local" && localParam
        ? `/locales/${localParam}`
        : "/locales";

  const rows = useMemo(
    () =>
      state.locals
        .map((local) => ({
          local,
          total: estimateTotal(specs, local),
          stock: specsStock(local, specs),
        }))
        .sort((a, b) =>
          sort === "price"
            ? a.total - b.total || a.local.queue.waitVirtual - b.local.queue.waitVirtual
            : a.local.queue.waitVirtual - b.local.queue.waitVirtual || a.total - b.total,
        ),
    [state.locals, specs, sort],
  );

  const cheapest = Math.min(...rows.map((row) => row.total));
  const fastest = Math.min(...rows.map((row) => row.local.queue.waitVirtual));
  const selected = rows.find((row) => row.local.id === selectedId) ?? rows[0];
  const selectedStock = selected?.stock ?? "out";

  const continueToPayment = () => {
    if (!selected || selectedStock === "out") return;
    dispatch({ type: "SELECT_LOCAL", localId: selected.local.id });
    navigate("/imprimir/pago");
  };

  return (
    <Screen
      title="Comparar locales"
      leading="back"
      backTo={backTo}
      trailing="Comparación"
      footer={
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 text-small text-text-secondary">
            <span>{selected?.local.name ?? "Local"}</span>
            <span className="text-body-strong text-ink">${selected?.total ?? 0}</span>
          </div>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!selected || selectedStock === "out"}
            onClick={continueToPayment}
          >
            {selectedStock === "out" ? "Sin stock en este local" : "Continuar con este local"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <PageTitle
          title="Comparación de locales"
          subtitle="La misma impresión, distinto precio y espera."
        />

        <Card>
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-h3 text-ink">{specsSummary(specs)}</span>
                <span className="text-small text-text-secondary">{paperDisplay(specs)}</span>
              </div>
              {!file && <Chip tone="accent">Demo</Chip>}
            </div>
            <div className="flex items-center justify-between gap-2 text-caption text-text-muted">
              <span>{file ? file.name : "Sin archivo cargado · precio estimado"}</span>
              <LinkText size="small" onClick={() => navigate("/imprimir/especificaciones")}>
                Editar
              </LinkText>
            </div>
          </div>
        </Card>

        <SegmentedControl
          label="Ordenar comparación"
          value={sort}
          onChange={(value) => setSort(value as "price" | "wait")}
          options={[
            { value: "price", label: "Mejor precio" },
            { value: "wait", label: "Menor espera" },
          ]}
        />

        <div className="flex flex-col gap-3">
          {rows.map(({ local, total, stock }) => {
            const isSelected = local.id === selectedId;
            return (
              <button
                key={local.id}
                type="button"
                aria-pressed={isSelected}
                disabled={stock === "out"}
                onClick={() => setSelectedId(local.id)}
                className={`flex w-full flex-col gap-3 rounded-lg border p-card text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px ${
                  isSelected
                    ? "border-accent bg-sunrise ring-2 ring-accent shadow-soft"
                    : "border-border-soft bg-surface shadow-soft hover:border-accent-border hover:shadow-float"
                } ${stock === "out" ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <LocalLogo local={local} size="md" />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="truncate text-h3 text-ink">{local.name}</span>
                      <span className="text-h2 text-ink">${total}</span>
                    </div>
                    <span className="text-small text-text-secondary">{local.tagline}</span>
                    <span className="flex items-center gap-1 text-caption text-text-muted">
                      <MapPin aria-hidden className="size-3" />
                      {local.floorLabel}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {total === cheapest && <Chip tone="accent">Mejor precio</Chip>}
                  {local.queue.waitVirtual === fastest && <Chip tone="success">Menos espera</Chip>}
                  <Chip tone={stockTone(stock as StockLevel)}>
                    {stock === "ok" ? "Papel disponible" : stockLabels[stock as StockLevel]}
                  </Chip>
                  {isSelected && (
                    <Chip tone="ink" icon={<CheckCircle2 aria-hidden className="size-3" />}>
                      Elegido
                    </Chip>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1 border-t border-border-soft pt-2">
                    <span className="text-caption text-text-secondary">Precio estimado</span>
                    <span className="text-body-strong text-ink">${total}</span>
                  </div>
                  <div className="flex flex-col gap-1 border-t border-border-soft pt-2">
                    <span className="text-caption text-text-secondary">Espera virtual</span>
                    <span className="flex items-center gap-1 text-body-strong text-ink">
                      <Clock aria-hidden className="size-icon" />
                      {local.queue.waitVirtual} min
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 text-caption text-text-muted">
                  <RatingStars rating={local.rating} showValue />
                  <span>
                    {modeShort(specs.mode)} · {local.papers.length} papeles
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-lg border border-border-soft bg-surface-soft p-4 text-small text-text-secondary">
          Los precios son estimados y se confirman en el local. La comparación usa la configuración
          del carrito: {specsSummary(specs)}.
        </div>
      </div>
    </Screen>
  );
}
