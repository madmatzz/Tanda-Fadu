import { useNavigate, useSearchParams } from "react-router";
import { AlertTriangle, ShieldCheck, Sparkles, Upload } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { localById, specsStock } from "../../demo/selectors";
import { countPages, fileMeta, fullRange, validationOutcome } from "../../demo/files";
import {
  averagePricePerPage,
  averageTotal,
  estimateTotal,
  grammageOptions,
  mountOptions,
  paperDisplay,
  paperOptions,
  pricePerPage,
  specialOptions,
} from "../../demo/pricing";
import type { Grammage, PaperKind, SpecialId } from "../../demo/types";
import { Button } from "../../components/Button";
import { CheckCard } from "../../components/CheckCard";
import { EmptyState } from "../../components/EmptyState";
import { FileCard } from "../../components/FileCard";
import { PageTitle } from "../../components/PageTitle";
import { PriceSummary } from "../../components/PriceSummary";
import { RadioCard } from "../../components/RadioCard";
import { Select } from "../../components/Select";
import { SegmentedControl } from "../../components/SegmentedControl";
import { Stepper } from "../../components/Stepper";
import { TextInput } from "../../components/TextInput";
import { Textarea } from "../../components/Textarea";

export function SpecsScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, dispatch } = useDemo();
  const flow = searchParams.get("flujo") === "tanda" ? "tanda" : "print";
  const suffix = flow === "tanda" ? "?flujo=tanda" : "";
  const file = state.draft.file;
  const specs = state.draft.specs;
  // El aviso de stock solo tiene sentido si el local ya está elegido (tanda o perfil de local).
  const chosenLocal = state.draft.localId ? localById(state, state.draft.localId) : undefined;
  // Precio: en tanda el local ya está fijo; si no, promedio entre locales.
  const tandaLocal = flow === "tanda" ? chosenLocal : undefined;
  const stock = chosenLocal ? specsStock(chosenLocal, specs) : "ok";

  if (!file) {
    return (
      <Screen
        title="Imprimir FADU"
        leading="back"
        backTo="/imprimir"
        trailing="Configuración"
      >
        <EmptyState
          title="Falta tu archivo"
          description="Subí un archivo para configurar la impresión."
          action={
            <Button variant="outline" size="md" onClick={() => navigate(`/imprimir${suffix}`)}>
              Subir archivo
            </Button>
          }
        />
      </Screen>
    );
  }

  const range = specs.range ?? fullRange(file.pages);
  const rangeValid = countPages(range, file.pages) !== null;
  const total = tandaLocal ? estimateTotal(specs, tandaLocal) : averageTotal(specs, state.locals);
  const specials = specs.specials ?? [];
  const missingLabel = specials.includes("rotulado") && !specs.labelFile;

  const toggleSpecial = (id: SpecialId, checked: boolean) => {
    const next = checked ? [...specials, id] : specials.filter((item) => item !== id);
    dispatch({
      type: "SET_SPECS",
      patch: {
        specials: next,
        ...(id === "montaje" && checked && !specs.mountMaterial ? { mountMaterial: "carton" as const } : {}),
        ...(id === "rotulado" && !checked ? { labelFile: null } : {}),
      },
    });
  };

  const choosePaper = (paper: PaperKind) => {
    dispatch({
      type: "SET_SPECS",
      patch: { paper, grammage: grammageOptions[paper][0] },
    });
  };

  const changeRange = (value: string) => {
    const pages = countPages(value, file.pages);
    dispatch({ type: "SET_SPECS", patch: pages === null ? { range: value } : { range: value, pages } });
  };

  const validate = () => {
    const outcome = validationOutcome(file, specs);
    dispatch({ type: "SET_VALIDATION", state: outcome });
    navigate(`/imprimir/validacion${suffix}`);
  };

  const removeFile = () => {
    dispatch({ type: "SET_FILE", file: null });
    navigate(`/imprimir${suffix}`, { replace: true });
  };

  return (
    <Screen
      title={flow === "tanda" ? "Tandas" : "Imprimir FADU"}
      leading="back"
      backTo={`/imprimir${suffix}`}
      trailing="Configuración"
      footer={
        <div className="flex flex-col gap-2">
          <PriceSummary
            total={total}
            source={tandaLocal ? `En ${tandaLocal.name}` : "Promedio entre locales"}
            perPage={tandaLocal ? pricePerPage(specs, tandaLocal) : averagePricePerPage(specs, state.locals)}
            specs={specs}
          />
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!rangeValid || missingLabel}
            icon={<ShieldCheck aria-hidden className="size-icon" />}
            onClick={validate}
          >
            Validar archivo
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <FileCard name={file.name} meta={fileMeta(file)} showIcon onRemove={removeFile} />

        <PageTitle
          title="Especificaciones"
          subtitle="Elegí cómo imprimirlo. Después validamos que el archivo sirva para eso."
        />

        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="Páginas"
            value={range}
            onChange={(event) => changeRange(event.target.value)}
            inputMode="numeric"
            error={rangeValid ? undefined : `Usá un rango entre 1 y ${file.pages}`}
            hint={rangeValid ? `De ${file.pages} en total` : undefined}
          />
          <div className="flex flex-col gap-2">
            <span className="text-small font-semibold text-ink">Copias</span>
            <Stepper
              label="Cantidad de copias"
              value={specs.copies}
              min={1}
              max={20}
              onChange={(copies) => dispatch({ type: "SET_SPECS", patch: { copies } })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Tamaño de papel"
            value={specs.size}
            onChange={(event) =>
              dispatch({
                type: "SET_SPECS",
                patch: { size: event.target.value as typeof specs.size },
              })
            }
          >
            <option value="A4">A4</option>
            <option value="A3">A3</option>
          </Select>
          <Select
            label="Gramaje"
            value={specs.grammage}
            onChange={(event) =>
              dispatch({
                type: "SET_SPECS",
                patch: { grammage: event.target.value as Grammage },
              })
            }
          >
            {grammageOptions[specs.paper].map((grammage) => (
              <option key={grammage} value={grammage}>
                {grammage} g/m²
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-small font-semibold text-ink">Tipo de impresión</span>
          <SegmentedControl
            label="Tipo de impresión"
            value={specs.mode}
            onChange={(value) =>
              dispatch({ type: "SET_SPECS", patch: { mode: value as typeof specs.mode } })
            }
            options={[
              { value: "bn", label: "Blanco y negro" },
              { value: "color", label: "Color" },
            ]}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-small font-semibold text-ink">Tipo de papel</span>
          <div className="grid grid-cols-3 gap-2">
            {paperOptions.map((paper) => (
              <RadioCard
                key={paper.value}
                name="paper"
                value={paper.value}
                checked={specs.paper === paper.value}
                onChange={() => choosePaper(paper.value)}
                title={paper.label}
                description={paper.description}
                size="sm"
              />
            ))}
          </div>
        </div>

        <section className="flex flex-col gap-3 rounded-lg border border-accent-border bg-accent-soft p-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Sparkles aria-hidden className="size-icon text-accent-ink" />
            <span className="text-small font-semibold text-accent-ink">Pedidos especiales</span>
            <span className="text-caption text-text-muted">Opcional · podés elegir varios</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {specialOptions.map((option) => (
              <CheckCard
                key={option.value}
                value={option.value}
                checked={specials.includes(option.value)}
                onChange={(checked) => toggleSpecial(option.value, checked)}
                title={option.label}
                description={option.description}
                note={option.price ? `+$${option.price}` : "Según material"}
              />
            ))}
          </div>

          {specials.includes("montaje") && (
            <div className="flex flex-col gap-2 border-t border-accent-border pt-3">
              <span className="text-small font-semibold text-ink">Material de montado</span>
              <div className="grid grid-cols-3 gap-2">
                {mountOptions.map((option) => (
                  <RadioCard
                    key={option.value}
                    name="mount"
                    value={option.value}
                    checked={specs.mountMaterial === option.value}
                    onChange={() => dispatch({ type: "SET_SPECS", patch: { mountMaterial: option.value } })}
                    title={option.label}
                    description={`+$${option.price}`}
                    tone="accent"
                    size="sm"
                  />
                ))}
              </div>
            </div>
          )}

          {specials.includes("rotulado") && (
            <div className="flex flex-col gap-2 border-t border-accent-border pt-3">
              <span className="text-small font-semibold text-ink">Archivo de rótulo</span>
              {specs.labelFile ? (
                <FileCard
                  name={specs.labelFile}
                  meta="Rótulo cargado"
                  showIcon
                  onRemove={() => dispatch({ type: "SET_SPECS", patch: { labelFile: null } })}
                />
              ) : (
                <>
                  <label className="inline-flex h-field w-full cursor-pointer items-center justify-center gap-2 rounded-pill border border-border bg-surface px-card text-small font-semibold text-ink shadow-soft transition hover:bg-surface-soft focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="sr-only"
                      onChange={(event) => {
                        const selected = event.target.files?.[0];
                        if (selected) dispatch({ type: "SET_SPECS", patch: { labelFile: selected.name } });
                        event.target.value = "";
                      }}
                    />
                    <Upload aria-hidden className="size-icon" />
                    Subir rótulo
                  </label>
                  <span className="text-caption text-text-secondary">
                    PDF o JPG con tus datos. Lo necesitamos para validar el pedido.
                  </span>
                </>
              )}
            </div>
          )}
        </section>

        {chosenLocal && stock !== "ok" && (
          <div className="flex items-start gap-2 rounded-md border border-warning-border bg-warning-bg p-3 text-small text-warning">
            <AlertTriangle aria-hidden className="mt-0.5 size-icon shrink-0" />
            <span>
              {stock === "out"
                ? `Sin stock de ${paperDisplay(specs)} en ${chosenLocal.name}. Podés elegir otro papel o local.`
                : `Stock bajo de ${paperDisplay(specs)} en ${chosenLocal.name}. Confirmá antes de retirar.`}
            </span>
          </div>
        )}

        <Textarea
          label="Observaciones"
          value={specs.notes}
          onChange={(event) => dispatch({ type: "SET_SPECS", patch: { notes: event.target.value } })}
          placeholder="Sin abrochar. Retiro por mostrador."
          maxLength={180}
        />
      </div>
    </Screen>
  );
}
