import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  AlertTriangle,
  ArrowLeftRight,
  BookOpen,
  ChevronRight,
  FlaskConical,
  GraduationCap,
  ListChecks,
  Map as MapIcon,
  Printer,
  RotateCcw,
  Store,
} from "lucide-react";
import { Sheet } from "../shell/Sheet";
import { useDemo } from "../demo/DemoProvider";
import { demoFiles, validationOutcome } from "../demo/files";
import { SectionLabel } from "../components/SectionLabel";
import { Divider } from "../components/Divider";

interface DemoMenuProps {
  open: boolean;
  onClose: () => void;
}

function MenuRow({
  icon,
  label,
  meta,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  meta?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition hover:bg-fill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <span className="flex size-control items-center justify-center rounded-pill border border-border-soft bg-surface text-ink shadow-soft">
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-body-strong text-ink">{label}</span>
        {meta && <span className="text-caption text-text-secondary">{meta}</span>}
      </span>
      <ChevronRight aria-hidden className="size-icon shrink-0 text-text-muted" />
    </button>
  );
}

export function DemoMenu({ open, onClose }: DemoMenuProps) {
  const navigate = useNavigate();
  const { state, dispatch, resetDemo } = useDemo();

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  const loadValidation = (fileName: string) => {
    const file = structuredClone(demoFiles.find((item) => item.name === fileName) ?? demoFiles[0]);
    const outcome = validationOutcome(file, { ...state.draft.specs, size: "A4", mode: "bn" });
    dispatch({ type: "SET_FILE", file });
    dispatch({ type: "SET_SPECS", patch: { size: "A4", mode: "bn" } });
    // El menú muestra la conversión ya en curso, sin pasar por "Ajustar".
    const validation = outcome === "ajustable" ? "conversion" : outcome;
    dispatch({
      type: "SET_VALIDATION",
      state: validation,
      progress: validation === "conversion" ? 65 : undefined,
      convertedFrom: file.kind === "docx" ? file.name : undefined,
    });
    go("/imprimir/validacion");
  };

  const switchRole = () => {
    const target = state.role === "student" ? "shop" : "student";
    dispatch({ type: "SET_ROLE", role: target });
    go(target === "shop" ? "/imprenta" : "/");
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Menú demo"
      description="Datos ficticios, reloj fijo y estados listos para mostrar."
    >
      <div className="flex flex-col gap-5">
        <div className="rounded-lg border border-accent-border bg-accent-soft p-4">
          <p className="text-label-caps uppercase text-accent-ink">Demo · miércoles 11:20</p>
          <p className="mt-1 text-small text-accent-ink">
            Los cambios se guardan en este navegador. Podés reiniciar cuando quieras.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:hidden">
          <SectionLabel>Cambiar de vista</SectionLabel>
          <MenuRow
            icon={<ArrowLeftRight aria-hidden className="size-icon" />}
            label={state.role === "student" ? "Vista imprenta" : "Vista estudiante"}
            meta={state.role === "student" ? "Panel de El Poli" : "Home de Fadu Print"}
            onClick={switchRole}
          />
        </div>

        <Divider />

        <div className="flex flex-col gap-2">
          <SectionLabel>Estados del estudiante</SectionLabel>
          <MenuRow
            icon={<Printer aria-hidden className="size-icon" />}
            label="Flujo de impresión"
            meta="Nueva impresión desde el inicio"
            onClick={() => go("/imprimir")}
          />
          <MenuRow
            icon={<ListChecks aria-hidden className="size-icon" />}
            label="Archivo óptimo"
            meta="Validación aprobada para A4 · B&N"
            onClick={() => loadValidation("entrega_final.pdf")}
          />
          <MenuRow
            icon={<AlertTriangle aria-hidden className="size-icon" />}
            label="Archivo rechazado"
            meta="Resolución insuficiente"
            onClick={() => loadValidation("foto-baja-res.jpg")}
          />
          <MenuRow
            icon={<FlaskConical aria-hidden className="size-icon" />}
            label="Conversión en curso"
            meta="Procesamiento simulado al 65%"
            onClick={() => loadValidation("monografia.docx")}
          />
          <MenuRow
            icon={<MapIcon aria-hidden className="size-icon" />}
            label="Mapa de locales"
            meta="FADU · Planta baja, piso 1 y piso 2"
            onClick={() => go("/locales")}
          />
          <MenuRow
            icon={<ListChecks aria-hidden className="size-icon" />}
            label="Pedido en cola"
            meta="Ticket #36 en El Poli"
            onClick={() => go("/pedido/order-36/cola")}
          />
        </div>

        <Divider />

        <div className="flex flex-col gap-2">
          <SectionLabel>Estados de la imprenta</SectionLabel>
          <MenuRow
            icon={<Store aria-hidden className="size-icon" />}
            label="Panel de El Poli"
            meta="Cola, tandas y reseñas"
            onClick={() => {
              dispatch({ type: "SET_ROLE", role: "shop" });
              go("/imprenta");
            }}
          />
          <MenuRow
            icon={<ListChecks aria-hidden className="size-icon" />}
            label="Cola de tanda"
            meta="Pendientes y completados"
            onClick={() => {
              dispatch({ type: "SET_ROLE", role: "shop" });
              go("/imprenta/tandas/tanda-1");
            }}
          />
          <MenuRow
            icon={<BookOpen aria-hidden className="size-icon" />}
            label="Stock"
            meta="Niveles de papel"
            onClick={() => {
              dispatch({ type: "SET_ROLE", role: "shop" });
              go("/imprenta/stock");
            }}
          />
        </div>

        <Divider />

        <div className="flex flex-col gap-2">
          <SectionLabel>Sistema</SectionLabel>
          <MenuRow
            icon={<GraduationCap aria-hidden className="size-icon" />}
            label="Ver design system"
            meta="Tokens y componentes de Papel & mandarina"
            onClick={() => go("/design-system")}
          />
          <MenuRow
            icon={<RotateCcw aria-hidden className="size-icon" />}
            label="Reiniciar demo"
            meta="Vuelve a los datos originales"
            onClick={() => {
              resetDemo();
              onClose();
              navigate("/");
            }}
          />
        </div>
      </div>
    </Sheet>
  );
}
