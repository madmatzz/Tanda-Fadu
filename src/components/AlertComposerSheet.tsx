import { useState } from "react";
import type { Alert, AlertKind } from "../demo/types";
import { useDemo } from "../demo/DemoProvider";
import { useToast } from "../shell/ToastProvider";
import { Sheet } from "../shell/Sheet";
import { Button } from "../components/Button";
import { Select } from "../components/Select";
import { TextInput } from "../components/TextInput";
import { Textarea } from "../components/Textarea";
import { ErrorNote } from "../components/ErrorNote";

interface AlertComposerSheetProps {
  open: boolean;
  onClose: () => void;
  localId: string;
  alert?: Alert;
}

const kindOptions: Array<{ value: AlertKind; label: string }> = [
  { value: "stock", label: "Stock" },
  { value: "tecnico", label: "Técnico" },
  { value: "descuento", label: "Descuento" },
  { value: "info", label: "Información" },
];

function AlertComposerForm({ onClose, localId, alert }: Omit<AlertComposerSheetProps, "open">) {
  const { state, dispatch } = useDemo();
  const { showToast } = useToast();
  const [kind, setKind] = useState<AlertKind>(alert?.kind ?? "stock");
  const [title, setTitle] = useState(alert?.title ?? "");
  const [body, setBody] = useState(alert?.body ?? "");
  const [error, setError] = useState("");

  const publish = () => {
    if (title.trim().length < 4 || body.trim().length < 8) {
      setError("Completá un título y un cuerpo breve para publicar el aviso.");
      return;
    }
    const nextAlert: Alert = {
      id: `alert-${state.demoClock}-${state.alerts.length + 1}`,
      localId,
      kind,
      title: title.trim(),
      body: body.trim(),
      createdAt: state.demoClock,
      active: true,
      read: false,
    };
    if (alert) {
      dispatch({ type: "SHOP_DEACTIVATE_ALERT", alertId: alert.id });
    }
    dispatch({ type: "SHOP_PUBLISH_ALERT", alert: nextAlert });
    onClose();
    showToast(
      alert
        ? "Aviso actualizado. Ya se ve en el perfil del local."
        : "Aviso publicado. Ya se ve en el perfil del local.",
    );
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title={alert ? "Editar aviso" : "Cargar aviso"}
      description="Se muestra en el perfil del local y en las alertas del estudiante."
      footer={
        <Button variant="primary" size="lg" fullWidth onClick={publish}>
          {alert ? "Guardar cambios" : "Publicar aviso"}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <Select
          label="Tipo de aviso"
          value={kind}
          onChange={(event) => setKind(event.target.value as AlertKind)}
        >
          {kindOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <TextInput
          label="Título"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ej. Stock limitado de papel 80g"
          maxLength={70}
        />
        <Textarea
          label="Detalle"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Contá qué pasa y qué debería saber el estudiante."
          maxLength={220}
        />
        {error && <ErrorNote>{error}</ErrorNote>}
      </div>
    </Sheet>
  );
}

export function AlertComposerSheet({ open, onClose, localId, alert }: AlertComposerSheetProps) {
  if (!open) return null;
  return (
    <AlertComposerForm
      key={alert?.id ?? "new"}
      onClose={onClose}
      localId={localId}
      alert={alert}
    />
  );
}
