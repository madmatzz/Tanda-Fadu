import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { FileText, Layers } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { useToast } from "../../shell/ToastProvider";
import { demoFiles, fileFromUpload } from "../../demo/files";
import { tandaById } from "../../demo/selectors";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Chip } from "../../components/Chip";
import { Dropzone } from "../../components/Dropzone";
import { FileCard } from "../../components/FileCard";
import { LinkText } from "../../components/LinkText";
import { PageTitle } from "../../components/PageTitle";
import { Stepper } from "../../components/Stepper";
import { SectionLabel } from "../../components/SectionLabel";

export function UploadScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, dispatch } = useDemo();
  const { showToast } = useToast();
  const [guideOpen, setGuideOpen] = useState(false);
  const flow = searchParams.get("flujo") === "tanda" ? "tanda" : "print";
  const tandaId = searchParams.get("tanda");
  const tanda = tandaId ? tandaById(state, tandaId) : flow === "tanda" ? state.tandas[0] : undefined;
  const suffix = flow === "tanda" ? "?flujo=tanda" : "";
  const file = state.draft.file;

  useEffect(() => {
    dispatch({ type: "SET_FLOW", flow });
    if (flow === "tanda" && tanda) {
      dispatch({ type: "SELECT_TANDA", tandaId: tanda.id });
    }
  }, [flow, tanda, dispatch]);

  const chooseFile = (nextFile: typeof demoFiles[number]) => {
    dispatch({ type: "SET_FILE", file: structuredClone(nextFile) });
    showToast(`${nextFile.name} cargado. Podés verificar el archivo.`);
  };

  return (
    <>
      <Screen
        title={flow === "tanda" ? "Tandas" : "Imprimir FADU"}
        leading="back"
        backTo={flow === "tanda" ? "/tandas" : "/imprimir"}
        trailing="Archivo"
        footer={
          <Button
            variant="accent"
            size="lg"
            fullWidth
            disabled={!file}
            onClick={() => navigate(`/imprimir/validacion${suffix}`)}
          >
            Verificar
          </Button>
        }
      >
        <div className="flex flex-col gap-5">
          <PageTitle title="Subir archivo" subtitle="Elegí un archivo para empezar." />

          {tanda && (
            <Chip tone="accent" icon={<Layers aria-hidden className="size-icon" />}>
              {tanda.label} · {tanda.userTitle} · {tanda.localId === "local-el-poli" ? "El Poli" : "Tanda FADU"}
            </Chip>
          )}

          <div className="flex flex-col gap-2">
            <span className="text-small font-semibold text-ink">Cantidad de copias</span>
            <Stepper
              label="Cantidad de copias"
              value={state.draft.specs.copies}
              min={1}
              max={20}
              onChange={(copies) => dispatch({ type: "SET_SPECS", patch: { copies } })}
            />
          </div>

          <Dropzone onFile={(uploaded) => dispatch({ type: "SET_FILE", file: fileFromUpload(uploaded) })} />

          {file && (
            <FileCard
              name={file.name}
              meta={`${file.pages} ${file.pages === 1 ? "página" : "páginas"} · ${file.sizeLabel} · Archivo cargado`}
              showIcon
              onRemove={() => dispatch({ type: "SET_FILE", file: null })}
            />
          )}

          <Card>
            <div className="flex flex-col gap-3">
              <SectionLabel>Usar archivo demo</SectionLabel>
              <div className="flex flex-col gap-2">
                {demoFiles.map((demo) => (
                  <button
                    key={demo.name}
                    type="button"
                    onClick={() => chooseFile(demo)}
                    className="flex items-center gap-2 rounded-md border border-border-soft bg-surface-soft px-3 py-2 text-left transition hover:border-accent-border hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <FileText aria-hidden className="size-icon shrink-0 text-accent-ink" />
                    <span className="min-w-0 flex-1 truncate text-small font-semibold text-ink">{demo.name}</span>
                    <Chip tone={demo.state === "optimo" ? "success" : demo.state === "conversion" ? "info" : "danger"}>
                      {demo.state === "optimo" ? "Óptimo" : demo.state === "conversion" ? "Convierte" : "Rechazado"}
                    </Chip>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-2 text-body text-text-secondary">
            <p>Revisaremos formato, tamaño, resolución y compatibilidad de color.</p>
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
        </div>
      </Screen>
    </>
  );
}
