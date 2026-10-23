import type { PaperId, ServiceId } from "../demo/types";
import { paperLabels, serviceLabels } from "../demo/pricing";
import { Sheet } from "../shell/Sheet";
import { Button } from "../components/Button";
import { Chip } from "../components/Chip";
import { Select } from "../components/Select";
import { SegmentedControl } from "../components/SegmentedControl";
import { SectionLabel } from "../components/SectionLabel";

export interface LocalFilters {
  service: ServiceId | "all";
  mode: "all" | "bn" | "color";
  paper: PaperId | "all";
  maxWait: "all" | "10" | "20";
  minRating: "all" | "4" | "4.5";
}

export const defaultFilters: LocalFilters = {
  service: "all",
  mode: "all",
  paper: "all",
  maxWait: "all",
  minRating: "all",
};

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  filters: LocalFilters;
  onChange: (filters: LocalFilters) => void;
  onClear: () => void;
}

const serviceFilters: ServiceId[] = ["bn", "color", "a3", "anillado", "escaneo", "gran-formato"];
const paperOptions: Array<{ value: PaperId | "all"; label: string }> = [
  { value: "all", label: "Todos los papeles" },
  { value: "obra-80", label: "Papel Obra 80g" },
  { value: "obra-120", label: "Papel Obra 120g" },
  { value: "ilustracion-150", label: "Ilustración 150g" },
  { value: "foamboard-3", label: "Foamboard 3mm" },
];

export function FilterSheet({ open, onClose, filters, onChange, onClear }: FilterSheetProps) {
  const set = (patch: Partial<LocalFilters>) => onChange({ ...filters, ...patch });

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Filtros"
      description="Ajustá la búsqueda según tu impresión."
      footer={
        <div className="flex gap-2">
          <Button variant="outline" size="md" fullWidth onClick={onClear}>
            Limpiar
          </Button>
          <Button variant="primary" size="md" fullWidth onClick={onClose}>
            Aplicar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <SectionLabel>Servicio</SectionLabel>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => set({ service: "all" })} aria-pressed={filters.service === "all"}>
              <Chip tone={filters.service === "all" ? "ink" : "neutral"}>Todos</Chip>
            </button>
            {serviceFilters.map((service) => (
              <button
                key={service}
                type="button"
                onClick={() => set({ service })}
                aria-pressed={filters.service === service}
              >
                <Chip tone={filters.service === service ? "ink" : "neutral"}>
                  {serviceLabels[service]}
                </Chip>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <SectionLabel>Color</SectionLabel>
          <SegmentedControl
            label="Tipo de impresión"
            value={filters.mode}
            onChange={(value) => set({ mode: value as LocalFilters["mode"] })}
            options={[
              { value: "all", label: "Todos" },
              { value: "bn", label: "B&N" },
              { value: "color", label: "Color" },
            ]}
          />
        </div>

        <div className="flex flex-col gap-2">
          <SectionLabel>Papel disponible</SectionLabel>
          <Select
            label="Papel"
            value={filters.paper}
            onChange={(event) => set({ paper: event.target.value as PaperId | "all" })}
          >
            {paperOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          {filters.paper !== "all" && (
            <p className="text-caption text-text-muted">
              Buscamos locales con {paperLabels[papersToKind(filters.paper)]} disponible.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <SectionLabel>Espera máxima</SectionLabel>
          <SegmentedControl
            label="Espera máxima"
            value={filters.maxWait}
            onChange={(value) => set({ maxWait: value as LocalFilters["maxWait"] })}
            options={[
              { value: "all", label: "Sin límite" },
              { value: "10", label: "10 min" },
              { value: "20", label: "20 min" },
            ]}
          />
        </div>

        <div className="flex flex-col gap-2">
          <SectionLabel>Valoración mínima</SectionLabel>
          <SegmentedControl
            label="Valoración mínima"
            value={filters.minRating}
            onChange={(value) => set({ minRating: value as LocalFilters["minRating"] })}
            options={[
              { value: "all", label: "Todas" },
              { value: "4", label: "4.0+" },
              { value: "4.5", label: "4.5+" },
            ]}
          />
        </div>
      </div>
    </Sheet>
  );
}

function papersToKind(paper: PaperId): "obra" | "ilustracion" | "reciclado" {
  if (paper === "ilustracion-150") return "ilustracion";
  if (paper === "reciclado-90") return "reciclado";
  return "obra";
}
