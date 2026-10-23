import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Check, SlidersHorizontal, Upload, Wand2 } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { localById } from "../../demo/selectors";
import { fileChecks, fixActionLabel } from "../../demo/files";
import {
  averagePricePerPage,
  averageTotal,
  estimateTotal,
  modeLabel,
  paperDisplay,
  pricePerPage,
  specialsLabel,
  specsSummary,
} from "../../demo/pricing";
import { PriceSummary } from "../../components/PriceSummary";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { FileCard } from "../../components/FileCard";
import { FileSummaryCard } from "../../components/FileSummaryCard";
import { IconBox } from "../../components/IconBox";
import { KeyValueRow } from "../../components/KeyValueRow";
import { LinkText } from "../../components/LinkText";
import { PageTitle } from "../../components/PageTitle";
import { ProgressBar } from "../../components/ProgressBar";
import { ValidationItem } from "../../components/ValidationItem";
import { ValidationList } from "../../components/ValidationList";

export function ValidationScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, dispatch } = useDemo();
  const flow = searchParams.get("flujo") === "tanda" ? "tanda" : "print";
  const suffix = flow === "tanda" ? "?flujo=tanda" : "";
  const file = state.draft.file;
  const specs = state.draft.specs;
  const specsPath = `/imprimir/especificaciones${suffix}`;
  const tandaLocal = state.draft.localId ? localById(state, state.draft.localId) : undefined;

  useEffect(() => {
    if (file?.state !== "conversion") return;
    const timer = window.setTimeout(() => {
      dispatch({ type: "SET_VALIDATION", state: "convertido", progress: 100 });
    }, 2400);
    return () => window.clearTimeout(timer);
  }, [file?.state, dispatch]);

  if (!file || file.state === "pendiente") {
    return (
      <Screen
        title={flow === "tanda" ? "Tandas" : "Imprimir FADU"}
        leading="back"
        backTo={file ? specsPath : `/imprimir${suffix}`}
        trailing="Validación"
        footer={
          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon={
              file ? (
                <SlidersHorizontal aria-hidden className="size-icon" />
              ) : (
                <Upload aria-hidden className="size-icon" />
              )
            }
            onClick={() => navigate(file ? specsPath : `/imprimir${suffix}`)}
          >
            {file ? "Elegir especificaciones" : "Subir archivo"}
          </Button>
        }
      >
        <EmptyState
          icon={<Upload aria-hidden className="size-icon" />}
          title={file ? "Falta elegir cómo imprimir" : "Primero subí un archivo"}
          description={
            file
              ? "Validamos el archivo contra el papel, tamaño y color que elijas."
              : "Necesitamos un PDF, Word o JPG para validar la impresión."
          }
        />
      </Screen>
    );
  }

  const checks = fileChecks(file, specs);
  const fixes = checks.filter((check) => check.status === "ajuste");
  const ready = file.state === "optimo" || file.state === "convertido";
  const convertedName = file.kind === "docx" ? file.name.replace(/\.docx?$/i, ".pdf") : file.name;
  // En tanda el local ya está fijo; en impresión suelta todavía no se eligió.
  const fixedLocal = flow === "tanda" ? tandaLocal : undefined;
  const total = fixedLocal ? estimateTotal(specs, fixedLocal) : averageTotal(specs, state.locals);
  const perPage = fixedLocal ? pricePerPage(specs, fixedLocal) : averagePricePerPage(specs, state.locals);
  const priceSource = fixedLocal ? `En ${fixedLocal.name}` : "Promedio entre locales";

  const uploadAnother = () => {
    dispatch({ type: "SET_FILE", file: null });
    navigate(`/imprimir${suffix}`);
  };

  const continueToLocal = () =>
    navigate(flow === "tanda" ? "/imprimir/tanda?flujo=tanda" : "/comparar?desde=validacion");

  const footer =
    file.state === "ajustable" ? (
      <Button
        variant="primary"
        size="lg"
        fullWidth
        icon={<Wand2 aria-hidden className="size-icon" />}
        onClick={() => dispatch({ type: "SET_VALIDATION", state: "conversion", progress: 65 })}
      >
        {fixActionLabel(checks)}
      </Button>
    ) : file.state === "conversion" ? (
      <Button variant="primary" size="lg" fullWidth loading>
        Ajustando archivo…
      </Button>
    ) : file.state === "rechazado" ? (
      <Button
        variant="primary"
        size="lg"
        fullWidth
        icon={<Upload aria-hidden className="size-icon" />}
        onClick={uploadAnother}
      >
        Subir otro archivo
      </Button>
    ) : (
      <div className="flex flex-col gap-2">
        <PriceSummary total={total} source={priceSource} perPage={perPage} specs={specs} />
        <Button variant="primary" size="lg" fullWidth onClick={continueToLocal}>
          {flow === "tanda" ? "Continuar con la tanda" : "Continuar y elegir local"}
        </Button>
      </div>
    );

  const title = {
    optimo: "Archivo óptimo",
    ajustable: "Tu archivo necesita ajustes",
    conversion: "Ajustando tu archivo",
    convertido: "Archivo listo para imprimir",
    rechazado: "Archivo rechazado",
  }[file.state];

  const subtitle = {
    optimo: "Cumple con todo lo que elegiste. Revisá el resumen antes de seguir.",
    ajustable: "No coincide del todo con lo que elegiste, pero podemos corregirlo por vos.",
    conversion: "Esto puede tardar unos segundos. No cierres esta pantalla.",
    convertido: "Ajustamos el archivo. Revisá el resumen antes de seguir.",
    rechazado: "Este archivo no se puede imprimir con buena calidad.",
  }[file.state];

  return (
    <Screen
      title={flow === "tanda" ? "Tandas" : "Imprimir FADU"}
      leading="back"
      backTo={specsPath}
      trailing={ready ? "Resumen" : "Validación"}
      footer={footer}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-start gap-3">
          <IconBox
            status={ready ? "success" : file.state === "rechazado" ? "danger" : "warning"}
            label={title}
          />
          <PageTitle title={title} subtitle={subtitle} />
        </div>

        {ready ? (
          <>
            <FileSummaryCard
              name={file.state === "convertido" ? convertedName : file.name}
              meta={`${specs.pages} ${specs.pages === 1 ? "página" : "páginas"} · ${file.sizeLabel} · ${specs.copies} ${specs.copies === 1 ? "copia" : "copias"}${file.state === "convertido" ? " · ajustado" : ""}`}
              onEditSpecs={() => navigate(specsPath)}
              onReplace={() => navigate(`/imprimir${suffix}`)}
            >
              <div className="flex flex-col gap-2 border-t border-border-soft pt-3">
                <KeyValueRow label="Papel" value={`${specs.size} · ${paperDisplay(specs)}`} />
                <KeyValueRow label="Impresión" value={modeLabel(specs.mode)} />
                {(specs.specials ?? []).length > 0 && (
                  <KeyValueRow
                    label="Especiales"
                    value={`${specialsLabel(specs)}${specs.labelFile ? ` (${specs.labelFile})` : ""}`}
                  />
                )}
                {specs.notes && <KeyValueRow label="Observaciones" value={specs.notes} />}
                <KeyValueRow label="Subtotal estimado" value={`$${total}`} emphasis="strong" />
              </div>
            </FileSummaryCard>

            <div className="flex items-start gap-2 text-small text-text-secondary">
              <span className="mt-0.5 flex size-icon shrink-0 items-center justify-center rounded-pill bg-success-soft text-success">
                <Check aria-hidden className="size-3" />
              </span>
              <span>
                Verificamos formato, peso, resolución, tamaño y color.
                {fixes.length > 0 && ` Ajustes: ${fixes.map((check) => check.done).join(" · ")}.`}
              </span>
            </div>
          </>
        ) : (
          <>
            <FileCard name={file.name} meta={`${specsSummary(specs)} · ${paperDisplay(specs)}`} showIcon />

            {file.state === "conversion" ? (
              <>
                <ProgressBar
                  value={file.progress ?? 65}
                  tone="default"
                  label="Procesando archivo"
                  valueLabel={`${file.progress ?? 65} %`}
                />
                <ValidationList>
                  {fixes.map((check, index) => (
                    <ValidationItem
                      key={check.label}
                      status={index === 0 ? "running" : "pending"}
                      label={check.fix ?? check.label}
                    />
                  ))}
                </ValidationList>
                <LinkText
                  size="small"
                  onClick={() => dispatch({ type: "SET_VALIDATION", state: "ajustable" })}
                >
                  Cancelar ajuste
                </LinkText>
              </>
            ) : (
              <>
                <ValidationList>
                  {checks.map((check) =>
                    check.status === "ok" ? (
                      <ValidationItem key={check.label} status="ok" label={check.label} value={check.value} />
                    ) : (
                      <ValidationItem
                        key={check.label}
                        status={check.status === "error" ? "error" : "warning"}
                        label={check.label}
                        detail={check.value}
                      />
                    ),
                  )}
                </ValidationList>
                <p className="text-body text-text-secondary">
                  {file.state === "rechazado"
                    ? "La resolución es muy baja y no se puede mejorar automáticamente. Exportá el archivo de nuevo a 300 ppp o más y volvé a subirlo."
                    : "Si preferís no ajustarlo, podés cambiar las especificaciones o subir otro archivo."}
                </p>
                {file.state === "ajustable" && (
                  <LinkText size="small" onClick={() => navigate(specsPath)}>
                    Cambiar especificaciones
                  </LinkText>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Screen>
  );
}
