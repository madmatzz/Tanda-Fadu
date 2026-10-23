import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Upload } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { useToast } from "../../shell/ToastProvider";
import type { ValidationState } from "../../demo/types";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { FileCard } from "../../components/FileCard";
import { IconBox } from "../../components/IconBox";
import { LinkText } from "../../components/LinkText";
import { PageTitle } from "../../components/PageTitle";
import { ProgressBar } from "../../components/ProgressBar";
import { ValidationItem } from "../../components/ValidationItem";
import { ValidationList } from "../../components/ValidationList";

export function ValidationScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, dispatch } = useDemo();
  const { showToast } = useToast();
  const flow = searchParams.get("flujo") === "tanda" ? "tanda" : "print";
  const suffix = flow === "tanda" ? "?flujo=tanda" : "";
  const file = state.draft.file;

  useEffect(() => {
    if (file?.state !== "conversion") return;
    const timer = window.setTimeout(() => {
      dispatch({ type: "SET_VALIDATION", state: "convertido", progress: 100 });
    }, 2400);
    return () => window.clearTimeout(timer);
  }, [file?.state, dispatch]);

  if (!file) {
    return (
      <Screen
        title={flow === "tanda" ? "Tandas" : "Imprimir FADU"}
        leading="back"
        backTo={flow === "tanda" ? "/tandas" : "/imprimir"}
        trailing="Validación"
        footer={
          <Button
            variant="accent"
            size="lg"
            fullWidth
            icon={<Upload aria-hidden className="size-icon" />}
            onClick={() => navigate(`/imprimir/archivo${suffix}`)}
          >
            Subir archivo
          </Button>
        }
      >
        <EmptyState
          icon={<Upload aria-hidden className="size-icon" />}
          title="Primero subí un archivo"
          description="Necesitamos un PDF, Word o JPG para validar la impresión."
        />
      </Screen>
    );
  }

  const setValidation = (nextState: ValidationState) => {
    dispatch({
      type: "SET_VALIDATION",
      state: nextState,
      progress: nextState === "conversion" ? 65 : undefined,
    });
  };

  const guide = () => {
    showToast("Guía demo: PDF de 300 ppp, A4/A3 y fuentes incrustadas.");
  };

  const convertedName = file.name.replace(/\.docx?$/i, ".pdf");

  const footer =
    file.state === "conversion" ? (
      <Button variant="primary" size="lg" fullWidth loading>
        Convirtiendo…
      </Button>
    ) : file.state === "rechazado" ? (
      <Button variant="primary" size="lg" fullWidth onClick={() => setValidation("conversion")}>
        Convertir
      </Button>
    ) : (
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={() => navigate(`/imprimir/especificaciones${suffix}`)}
      >
        Continuar
      </Button>
    );

  const title =
    file.state === "optimo"
      ? "Archivo óptimo"
      : file.state === "conversion"
        ? "Conversión de archivo"
        : file.state === "convertido"
          ? "Archivo listo para imprimir"
          : "Archivo rechazado";

  const subtitle =
    file.state === "optimo"
      ? "El archivo cumple con los requisitos de impresión."
      : file.state === "conversion"
        ? "Estamos preparando tu documento."
        : file.state === "convertido"
          ? "La conversión terminó correctamente."
          : `Encontramos problemas en ${file.name}.`;

  return (
    <Screen
      title={flow === "tanda" ? "Tandas" : "Imprimir FADU"}
      leading="back"
      backTo={`/imprimir/archivo${suffix}`}
      trailing={file.state === "conversion" || file.state === "convertido" ? "Conversión" : "Validación"}
      footer={footer}
    >
      <div className="flex flex-col gap-5">
        <PageTitle title={title} subtitle={subtitle} />

        <IconBox
          status={file.state === "rechazado" ? "danger" : "success"}
          label={file.state === "rechazado" ? "Archivo rechazado" : "Archivo validado"}
        />

        {file.state === "conversion" ? (
          <>
            <FileCard
              name={file.name}
              meta={`${file.pages} páginas · ${file.sizeLabel}`}
              showIcon={false}
            />
            <ProgressBar value={file.progress ?? 65} tone="default" label="Procesando archivo" valueLabel={`${file.progress ?? 65} %`} />
            <p className="text-body text-text-secondary">
              Esto puede tardar unos segundos. No cierres esta pantalla.
            </p>
            <ValidationList>
              <ValidationItem status="ok" label="Conversión a PDF completada" />
              <ValidationItem status="running" label="Ajustando color a blanco y negro" />
              <ValidationItem status="pending" label="Nueva validación pendiente" />
            </ValidationList>
            <p className="text-small text-text-muted">
              La conversión no mejora la resolución original de las imágenes.
            </p>
            <LinkText size="small" onClick={() => dispatch({ type: "SET_FILE", file: null })}>
              Cancelar conversión
            </LinkText>
            <LinkText size="small" onClick={guide}>
              Guía para enviar archivos óptimos
            </LinkText>
          </>
        ) : file.state === "rechazado" ? (
          <>
            <ValidationList>
              <ValidationItem status="ok" label="Tamaño de archivo" value={`${file.sizeLabel} / máx. 25 MB`} />
              <ValidationItem status="error" label="Formato" detail="Word: convertir a PDF" />
              <ValidationItem status="error" label="Resolución" detail="150 ppp: mínimo 300 ppp" />
              <ValidationItem status="error" label="Color / impresión" detail="RGB: se solicitó B&N" />
            </ValidationList>
            <p className="text-body text-text-secondary">
              Convertiremos a PDF y escala de grises. La baja resolución requiere reemplazar las
              imágenes del original.
            </p>
            <LinkText size="small" onClick={() => navigate(`/imprimir/archivo${suffix}`)}>
              Subir un archivo corregido
            </LinkText>
            <LinkText size="small" onClick={guide}>
              Guía para enviar archivos óptimos
            </LinkText>
          </>
        ) : (
          <>
            <FileCard
              name={file.state === "convertido" ? convertedName : file.name}
              meta={
                file.state === "convertido"
                  ? `${file.pages} páginas · ${file.sizeLabel} · Versión convertida`
                  : `${file.pages} páginas · ${state.draft.specs.copies} copia · ${state.draft.specs.size}`
              }
              showIcon={false}
            />
            <ValidationList>
              <ValidationItem status="ok" label="Formato" value="PDF compatible" />
              <ValidationItem status="ok" label="Tamaño de archivo" value={`${file.sizeLabel} / máx. 25 MB`} />
              <ValidationItem status="ok" label="Resolución" value="300 ppp" />
              <ValidationItem status="ok" label="Color / impresión" value="Escala de grises / B&N" />
            </ValidationList>
            <p className="text-body text-text-secondary">
              {file.state === "convertido"
                ? "Se volvió a validar el archivo después de reemplazar las imágenes de baja resolución."
                : "Texto e imágenes listos para imprimir. Ahora podés elegir el papel y la terminación."}
            </p>
            <LinkText size="small" onClick={guide}>
              Guía para enviar archivos óptimos
            </LinkText>
          </>
        )}
      </div>
    </Screen>
  );
}
