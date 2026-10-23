import { useNavigate, useSearchParams } from "react-router";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { localById, specsStock } from "../../demo/selectors";
import {
  estimateTotal,
  grammageOptions,
  modeLabel,
  paperDisplay,
  paperOptions,
  pricePerPage,
} from "../../demo/pricing";
import type { Grammage, PaperKind } from "../../demo/types";
import { Button } from "../../components/Button";
import { Chip } from "../../components/Chip";
import { EmptyState } from "../../components/EmptyState";
import { PageTitle } from "../../components/PageTitle";
import { RadioCard } from "../../components/RadioCard";
import { Select } from "../../components/Select";
import { SegmentedControl } from "../../components/SegmentedControl";
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
  const selectedLocal = localById(state, state.draft.localId ?? "local-el-poli") ?? state.locals[0];
  const stock = specsStock(selectedLocal, specs);
  const total = estimateTotal(specs, selectedLocal);

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
          description="Subí un archivo y validalo antes de configurar la impresión."
          action={
            <Button variant="outline" size="md" onClick={() => navigate("/imprimir/archivo")}>
              Subir archivo
            </Button>
          }
        />
      </Screen>
    );
  }

  const choosePaper = (paper: PaperKind) => {
    dispatch({
      type: "SET_SPECS",
      patch: { paper, grammage: grammageOptions[paper][0] },
    });
  };

  return (
    <Screen
      title={flow === "tanda" ? "Tandas" : "Imprimir FADU"}
      leading="back"
      backTo={`/imprimir/validacion${suffix}`}
      trailing="Configuración"
      footer={
        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon={<ArrowRight aria-hidden className="size-icon" />}
          onClick={() => navigate(`/imprimir/carrito${suffix}`)}
        >
          Agregar al carrito
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <PageTitle
          title="Especificaciones"
          subtitle={`${file.name} · ${file.pages} páginas · ${specs.copies} ${specs.copies === 1 ? "copia" : "copias"}`}
        />

        <TextInput
          label="Páginas a imprimir"
          value={`Todas (1–${file.pages})`}
          readOnly
          hint="En esta demo se imprimen todas las páginas del archivo."
        />

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
          <div className="flex flex-col gap-2">
            {paperOptions.map((paper) => (
              <RadioCard
                key={paper.value}
                name="paper"
                value={paper.value}
                checked={specs.paper === paper.value}
                onChange={() => choosePaper(paper.value)}
                title={paper.label}
                description={paper.description}
              />
            ))}
          </div>
        </div>

        {stock !== "ok" && (
          <div className="flex items-start gap-2 rounded-md border border-warning-border bg-warning-bg p-3 text-small text-warning">
            <AlertTriangle aria-hidden className="mt-0.5 size-icon shrink-0" />
            <span>
              {stock === "out"
                ? `Sin stock de ${paperDisplay(specs)} en ${selectedLocal.name}. Podés elegir otro papel o local.`
                : `Stock bajo de ${paperDisplay(specs)} en ${selectedLocal.name}. Confirmá antes de retirar.`}
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

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border-soft bg-surface-soft p-3 text-small text-text-secondary">
          <span>
            Precio estimado: ${pricePerPage(specs, selectedLocal)} por página · {modeLabel(specs.mode)}
          </span>
          <Chip tone="accent">Total ${total}</Chip>
        </div>
      </div>
    </Screen>
  );
}
