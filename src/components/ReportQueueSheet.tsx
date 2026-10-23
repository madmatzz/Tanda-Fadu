import { useState } from "react";
import type { Local, QueueCrowd } from "../demo/types";
import { useDemo } from "../demo/DemoProvider";
import { Sheet } from "../shell/Sheet";
import { Button } from "../components/Button";
import { RadioCard } from "../components/RadioCard";
import { SegmentedControl } from "../components/SegmentedControl";
import { minutesBetween } from "../demo/time";

interface ReportQueueSheetProps {
  open: boolean;
  onClose: () => void;
  local: Local;
}

export function ReportQueueSheet({ open, onClose, local }: ReportQueueSheetProps) {
  const { state, dispatch } = useDemo();
  const [inQueue, setInQueue] = useState(true);
  const [crowd, setCrowd] = useState<QueueCrowd>("medium");
  const lastReport = state.lastQueueReport[local.id];
  const canReport = !lastReport || minutesBetween(lastReport, state.demoClock) >= 30;

  const submit = () => {
    dispatch({ type: "REPORT_QUEUE", localId: local.id, crowd, inQueue });
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Reportar cola"
      description={`${local.name} · ${local.floorLabel}`}
      footer={
        <Button variant="primary" size="lg" fullWidth onClick={submit} disabled={!canReport}>
          Actualizar cola
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-small font-semibold text-ink">¿Estás en el local?</span>
          <div className="flex flex-col gap-2">
            <RadioCard
              name="queue-in-person"
              value="yes"
              checked={inQueue}
              onChange={() => setInQueue(true)}
              title="Sí, estoy en la fila"
              description="Tu reporte también actualiza la espera presencial."
            />
            <RadioCard
              name="queue-in-person"
              value="no"
              checked={!inQueue}
              onChange={() => setInQueue(false)}
              title="No, solo estoy mirando"
              description="Igual podés contarnos cuánta gente hay."
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-small font-semibold text-ink">¿Cuánta gente hay?</span>
          <SegmentedControl
            label="Cantidad de gente en el local"
            value={crowd}
            onChange={(value) => setCrowd(value as QueueCrowd)}
            options={[
              { value: "low", label: "Poca" },
              { value: "medium", label: "Normal" },
              { value: "high", label: "Mucha" },
            ]}
          />
        </div>

        <div className="rounded-md border border-border-soft bg-surface-soft p-3 text-small text-text-secondary">
          {lastReport
            ? canReport
              ? "Ya pasaron más de 30 minutos desde tu último reporte. Podés actualizarlo."
              : "Ya reportaste esta cola hace poco. Podés volver a hacerlo en 30 minutos."
            : "Todavía no hay reportes recientes de este local. Tu ayuda mejora la espera de todos."}
        </div>
      </div>
    </Sheet>
  );
}
