import { useNavigate, useSearchParams } from "react-router";
import { FileText, Plus, Trash2 } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { localById } from "../../demo/selectors";
import { estimateTotal, modeLabel, paperDisplay } from "../../demo/pricing";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { FileCard } from "../../components/FileCard";
import { KeyValueRow } from "../../components/KeyValueRow";
import { LinkText } from "../../components/LinkText";
import { PageTitle } from "../../components/PageTitle";
import { SummaryBox } from "../../components/SummaryBox";

export function CartScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, dispatch } = useDemo();
  const flow = searchParams.get("flujo") === "tanda" ? "tanda" : "print";
  const suffix = flow === "tanda" ? "?flujo=tanda" : "";
  const file = state.draft.file;
  const specs = state.draft.specs;
  const selectedLocal = localById(state, state.draft.localId ?? "local-el-poli") ?? state.locals[0];
  const total = estimateTotal(specs, selectedLocal);

  if (!file) {
    return (
      <Screen
        title="Imprimir FADU"
        leading="back"
        backTo={`/imprimir/especificaciones${suffix}`}
        trailing="Pedido"
      >
        <EmptyState
          icon={<FileText aria-hidden className="size-icon" />}
          title="Tu carrito está vacío"
          description="Agregá un archivo para empezar el pedido."
          action={
            <Button variant="accent" size="md" onClick={() => navigate(`/imprimir/archivo${suffix}`)}>
              Subir archivo
            </Button>
          }
        />
      </Screen>
    );
  }

  return (
    <Screen
      title={flow === "tanda" ? "Tandas" : "Imprimir FADU"}
      leading="back"
      backTo={`/imprimir/especificaciones${suffix}`}
      trailing="Pedido"
      footer={
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() =>
            navigate(state.draft.tandaId ? `/imprimir/tanda${suffix}` : "/comparar?desde=carrito")
          }
        >
          Ir a imprimir
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <PageTitle title="Carrito" subtitle="Revisá tus archivos antes de elegir un local." />

        <FileCard
          name={file.name}
          meta={`${specs.pages} páginas · ${file.sizeLabel} · ${specs.copies} ${specs.copies === 1 ? "copia" : "copias"}`}
          showIcon
          onRemove={() => dispatch({ type: "SET_FILE", file: null })}
        >
          <div className="flex flex-col gap-2 border-t border-border-soft pt-3">
            <KeyValueRow label="Papel" value={`${specs.size} · ${paperDisplay(specs)}`} />
            <KeyValueRow label="Impresión" value={modeLabel(specs.mode)} />
            <KeyValueRow label="Subtotal estimado" value={`$${total}`} emphasis="strong" />
            <LinkText size="small" onClick={() => navigate(`/imprimir/especificaciones${suffix}`)}>
              Editar especificaciones
            </LinkText>
          </div>
        </FileCard>

        <Button
          variant="outline"
          size="md"
          fullWidth
          icon={<Plus aria-hidden className="size-icon" />}
          onClick={() => navigate(`/imprimir/archivo${suffix}`)}
        >
          Agregar otro archivo
        </Button>

        <SummaryBox note="El precio final depende del local seleccionado.">
          <KeyValueRow label="Cantidad de archivos" value="1" />
          <KeyValueRow label="Total estimado" value={`$${total}`} emphasis="strong" />
        </SummaryBox>

        {specs.notes && (
          <p className="text-small text-text-secondary">
            <span className="font-semibold text-ink">Observaciones:</span> {specs.notes}
          </p>
        )}

        <div className="flex items-center gap-2 text-caption text-text-muted">
          <Trash2 aria-hidden className="size-3" />
          Podés quitar el archivo y volver a empezar cuando quieras.
        </div>
      </div>
    </Screen>
  );
}
