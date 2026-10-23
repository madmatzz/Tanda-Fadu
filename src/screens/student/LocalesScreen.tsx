import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { MapPin, Navigation, SlidersHorizontal } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { serviceLabels } from "../../demo/pricing";
import { minutesAgoLabel } from "../../demo/time";
import type { Local } from "../../demo/types";
import { Button } from "../../components/Button";
import { Chip } from "../../components/Chip";
import { EmptyState } from "../../components/EmptyState";
import { FilterSheet, defaultFilters, type LocalFilters } from "../../components/FilterSheet";
import { IconButton } from "../../components/IconButton";
import { LocalCard } from "../../components/LocalCard";
import { MapSchematic } from "../../components/MapSchematic";
import { PageTitle } from "../../components/PageTitle";
import { ReportQueueSheet } from "../../components/ReportQueueSheet";
import { SearchField } from "../../components/SearchField";
import { SectionLabel } from "../../components/SectionLabel";

function matchesFilters(local: Local, filters: LocalFilters, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  const serviceMatch = local.services.some((service) =>
    serviceLabels[service].toLowerCase().includes(normalized),
  );
  const textMatch =
    normalized.length === 0 ||
    local.name.toLowerCase().includes(normalized) ||
    local.tagline.toLowerCase().includes(normalized) ||
    local.floorLabel.toLowerCase().includes(normalized) ||
    serviceMatch;

  if (!textMatch) return false;
  if (filters.service !== "all" && !local.services.includes(filters.service)) return false;
  if (filters.mode !== "all" && !local.services.includes(filters.mode)) return false;
  if (filters.paper !== "all" && (!local.papers.includes(filters.paper) || local.stock[filters.paper] === "out")) {
    return false;
  }
  if (filters.maxWait !== "all" && local.queue.waitVirtual > Number(filters.maxWait)) return false;
  if (filters.minRating !== "all" && local.rating < Number(filters.minRating)) return false;
  return true;
}

export function LocalesScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state } = useDemo();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<LocalFilters>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [activeFloor, setActiveFloor] = useState(0);
  const desde = searchParams.get("desde") ?? "home";
  const backTo = desde === "imprimir" ? "/imprimir" : desde === "carrito" ? "/imprimir/carrito" : "/";
  const filtered = useMemo(
    () => state.locals.filter((local) => matchesFilters(local, filters, query)),
    [state.locals, filters, query],
  );
  const selected =
    filtered.find((local) => local.id === state.draft.localId) ?? filtered[0] ?? state.locals[0];
  const activeFilterCount = [
    filters.service !== "all",
    filters.mode !== "all",
    filters.paper !== "all",
    filters.maxWait !== "all",
    filters.minRating !== "all",
  ].filter(Boolean).length;

  const openLocal = (local: Local) => {
    navigate(`/locales/${local.slug}`);
  };

  return (
    <>
      <Screen
        title="Buscar local"
        leading="back"
        backTo={backTo}
        trailing="Locales"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="md" fullWidth onClick={() => setFiltersOpen(true)}>
              Filtros
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              disabled={filtered.length === 0}
              onClick={() => navigate("/comparar?desde=locales")}
            >
              Comparar
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <PageTitle
            title="¿Dónde imprimir?"
            subtitle="Elegí un local de la FADU y mirá la cola antes de salir."
          />

          <div className="flex gap-2">
            <div className="min-w-0 flex-1">
              <SearchField value={query} onChange={setQuery} />
            </div>
            <div className="relative">
              <IconButton
                label="Abrir filtros"
                icon={<SlidersHorizontal aria-hidden className="size-icon-lg" />}
                onClick={() => setFiltersOpen(true)}
              />
              {activeFilterCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-control-sm items-center justify-center rounded-pill bg-accent text-caption font-semibold text-ink">
                  {activeFilterCount}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-caption text-text-muted">Piso</span>
            {[0, 1, 2].map((floor) => (
              <button
                key={floor}
                type="button"
                aria-pressed={activeFloor === floor}
                onClick={() => setActiveFloor(floor)}
              >
                <Chip tone={activeFloor === floor ? "ink" : "neutral"}>
                  {floor === 0 ? "Planta baja" : `Piso ${floor}`}
                </Chip>
              </button>
            ))}
            <button type="button" onClick={() => setActiveFloor(-1)}>
              <Chip tone={activeFloor === -1 ? "ink" : "neutral"}>Todos</Chip>
            </button>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-border-soft bg-surface p-4 shadow-soft">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-small font-semibold text-ink">
                <MapPin aria-hidden className="size-icon text-accent" />
                Mapa de locales
              </span>
              <Chip tone="glass">
                {activeFloor === -1 ? "Todos los pisos" : activeFloor === 0 ? "Planta baja" : `Piso ${activeFloor}`}
              </Chip>
            </div>
            <MapSchematic
              locals={filtered}
              selectedSlug={selected?.slug}
              activeFloor={activeFloor === -1 ? selected?.map.floor ?? 0 : activeFloor}
            />
            <div className="flex items-center justify-between gap-2 text-caption text-text-muted">
              <span className="flex items-center gap-1">
                <Navigation aria-hidden className="size-3 text-accent" />
                Estás acá · {selected?.floorLabel ?? "FADU"}
              </span>
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="font-semibold text-accent-ink underline decoration-accent-border underline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
              >
                Reportar cola
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <SectionLabel>
              {filtered.length} {filtered.length === 1 ? "local" : "locales"}
            </SectionLabel>
            <span className="text-caption text-text-muted">
              Actualizado {minutesAgoLabel(selected?.queue.updatedAt ?? state.demoClock, state.demoClock)}
            </span>
          </div>

          {filtered.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filtered.map((local) => (
                <LocalCard
                  key={local.id}
                  local={local}
                  selected={selected?.id === local.id}
                  onClick={() => openLocal(local)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<MapPin aria-hidden className="size-icon" />}
              title="No encontramos locales"
              description="Probá con otro servicio, papel o espera máxima."
              action={
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setFilters(defaultFilters);
                    setQuery("");
                  }}
                >
                  Limpiar búsqueda
                </Button>
              }
            />
          )}

          <p className="text-caption text-text-muted">
            Las colas son reportadas por estudiantes y se actualizan cada 30 minutos.
          </p>
        </div>
      </Screen>

      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters(defaultFilters)}
      />

      {selected && (
        <ReportQueueSheet open={reportOpen} onClose={() => setReportOpen(false)} local={selected} />
      )}
    </>
  );
}
