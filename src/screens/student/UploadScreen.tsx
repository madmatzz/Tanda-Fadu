import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowRight, FileText, Layers, MapPin } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { demoFiles, fileFromUpload, fileInfo, fileMeta } from "../../demo/files";
import { localByIdOrSlug, tandaById } from "../../demo/selectors";
import type { DemoFile } from "../../demo/types";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Chip } from "../../components/Chip";
import { Dropzone } from "../../components/Dropzone";
import { FileCard } from "../../components/FileCard";
import { InfoCard } from "../../components/InfoCard";
import { LinkText } from "../../components/LinkText";
import { PageTitle } from "../../components/PageTitle";
import { SectionLabel } from "../../components/SectionLabel";

export function UploadScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, dispatch } = useDemo();
  const [guideOpen, setGuideOpen] = useState(false);
  const flow = searchParams.get("flujo") === "tanda" ? "tanda" : "print";
  const tandaId = searchParams.get("tanda");
  const tanda = tandaId ? tandaById(state, tandaId) : flow === "tanda" ? state.tandas[0] : undefined;
  const requestedLocal = searchParams.get("local");
  const selectedLocal = requestedLocal ? localByIdOrSlug(state, requestedLocal) : undefined;
  const suffix = flow === "tanda" ? "?flujo=tanda" : "";
  const file = state.draft.file;

  useEffect(() => {
    dispatch({ type: "SET_FLOW", flow });
    if (flow === "tanda" && tanda) {
      dispatch({ type: "SELECT_TANDA", tandaId: tanda.id });
    }
  }, [flow, tanda, dispatch]);

  useEffect(() => {
    if (selectedLocal) {
      dispatch({ type: "SELECT_LOCAL", localId: selectedLocal.id });
    }
  }, [selectedLocal, dispatch]);

  const chooseFile = (nextFile: DemoFile) => {
    dispatch({ type: "SET_FILE", file: nextFile });
  };

  return (
    <Screen
      title={flow === "tanda" ? "Tandas" : "Imprimir FADU"}
      leading="back"
      backTo={flow === "tanda" ? "/tandas" : "/"}
      trailing="Archivo"
      footer={
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!file}
          icon={<ArrowRight aria-hidden className="size-icon" />}
          onClick={() => navigate(`/imprimir/especificaciones${suffix}`)}
        >
          Continuar
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <PageTitle
          title="Nueva impresión"
          subtitle="Subí tu archivo y después elegí cómo imprimirlo."
        />

        {tanda && (
          <Chip tone="accent" icon={<Layers aria-hidden className="size-icon" />}>
            {tanda.label} · {tanda.userTitle}
          </Chip>
        )}

        {selectedLocal && (
          <Chip tone="accent" icon={<MapPin aria-hidden className="size-icon" />}>
            {selectedLocal.name} · {selectedLocal.floorLabel}
          </Chip>
        )}

        <InfoCard
          steps={[
            "Subí un PDF, Word o JPG",
            "Configurá papel y tipo de impresión",
            "Compará precios y tiempos de espera",
          ]}
        />

        {file && (
          <FileCard
            name={file.name}
            meta={fileMeta(file)}
            showIcon
            onRemove={() => dispatch({ type: "SET_FILE", file: null })}
          />
        )}

        <Dropzone
          label={file ? "Subir otro archivo" : "Subir archivo"}
          hint="PDF, Word o JPG · hasta 25 MB"
          onFile={(uploaded) => chooseFile(fileFromUpload(uploaded))}
        />

        <div className="flex flex-col gap-2 text-body text-text-secondary">
          <p>
            Revisaremos formato, tamaño, resolución y compatibilidad de color cuando elijas cómo
            imprimirlo.
          </p>
          <LinkText size="small" onClick={() => setGuideOpen((open) => !open)}>
            Guía para enviar archivos óptimos
          </LinkText>
          {guideOpen && (
            <div className="rounded-md border border-border-soft bg-surface-soft p-3 text-small">
              Usá PDF con 300 ppp, tamaño A4 o A3 y fuentes incrustadas. Si tu archivo es Word, lo
              convertimos antes de imprimir.
            </div>
          )}
        </div>

        <Card>
          <div className="flex flex-col gap-3">
            <SectionLabel>¿Sin archivo a mano? Probá uno de ejemplo</SectionLabel>
            <div className="flex flex-col gap-2">
              {demoFiles.map((demo) => {
                const info = fileInfo(demo);
                return (
                  <button
                    key={demo.name}
                    type="button"
                    onClick={() => chooseFile(structuredClone(demo))}
                    className="flex items-center gap-2 rounded-md border border-border-soft bg-surface-soft px-3 py-2 text-left transition hover:border-accent-border hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <FileText aria-hidden className="size-icon shrink-0 text-accent-ink" />
                    <span className="min-w-0 flex-1 truncate text-small font-semibold text-ink">{demo.name}</span>
                    <span className="shrink-0 text-caption text-text-muted">
                      {info.ppi} ppp · {info.color === "rgb" ? "color" : "grises"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </Screen>
  );
}
