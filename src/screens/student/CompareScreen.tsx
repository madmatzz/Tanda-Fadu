import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Clock } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { specsStock, tandaCompatible } from "../../demo/selectors";
import {
  estimateTotal,
  paperDisplay,
  stockLabels,
  stockTone,
  specsSummary,
} from "../../demo/pricing";
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
    desde === "validacion"
      ? "/imprimir/validacion"
      : desde === "carrito"
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
          hasTanda: state.tandas.some((tanda) => tanda.localId === local.id && tandaCompatible(tanda, specs)),
        }))
        .sort((a, b) =>
          sort === "price"
            ? a.total - b.total || a.local.queue.waitVirtual - b.local.queue.waitVirtual
            : a.local.queue.waitVirtual - b.local.queue.waitVirtual || a.total - b.total,
        ),
    [state.locals, state.tandas, specs, sort],
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
          title="¿Dónde imprimir?"
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
          {rows.map(({ local, total, stock, hasTanda }) => {
            const isSelected = local.id === selectedId;
            const unavailable = stock === "out";
            const select = () => {
              if (!unavailable) setSelectedId(local.id);
            };
            return (
              // div con rol radio (y no <button>) porque adentro va el botón "Ver local".
              <div
                key={local.id}
                role="radio"
                aria-checked={isSelected}
                aria-disabled={unavailable}
                aria-label={`${local.name}, $${total}, espera ${local.queue.waitVirtual} min`}
                tabIndex={unavailable ? -1 : 0}
                onClick={select}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    select();
                  }
                }}
                className={`flex w-full flex-col gap-3 rounded-lg border p-card text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  isSelected
                    ? "border-accent bg-sunrise ring-2 ring-accent shadow-soft"
                    : "border-border-soft bg-surface shadow-soft hover:border-accent-border hover:shadow-float"
                } ${unavailable ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
              >
                {hasTanda && (
                  <span className="text-caption font-semibold text-tanda">Una tanda coincide con tu pedido</span>
                )}
                <div className="flex items-center gap-3">
                  <LocalLogo local={local} size="md" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-h3 text-ink">{local.name}</span>
                    <RatingStars rating={local.rating} showValue />
                  </div>
                  <Button
                    variant="soft"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/locales/${local.slug}`);
                    }}
                  >
                    Ver local
                  </Button>
                </div>
                {(hasTanda || total === cheapest || local.queue.waitVirtual === fastest || stock !== "ok") && (
                  <div className="flex flex-wrap gap-2">
                    {hasTanda && <Chip tone="tanda">¡Tanda!</Chip>}
                    {total === cheapest && <Chip tone="accent">Mejor precio</Chip>}
                    {local.queue.waitVirtual === fastest && <Chip tone="success">Menos espera</Chip>}
                    {stock !== "ok" && <Chip tone={stockTone(stock)}>{stockLabels[stock]}</Chip>}
                  </div>
                )}
                <div className="flex items-end justify-between gap-3 border-t border-border-soft pt-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-caption text-text-secondary">Espera virtual</span>
                    <span className="flex items-center gap-1 text-body-strong text-ink">
                      <Clock aria-hidden className="size-icon" />
                      {local.queue.waitVirtual} min
                    </span>
                  </div>
                  <span className="text-h1 text-ink">${total}</span>
                </div>
              </div>
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
