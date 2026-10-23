import { useState } from "react";
import { useNavigate } from "react-router";
import { BookOpen, Layers, Star } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { localById } from "../../demo/selectors";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { CatalogChips } from "../../components/CatalogChips";
import { DemoMenu } from "../../components/DemoMenu";
import { PageTitle } from "../../components/PageTitle";
import { RatingStars } from "../../components/RatingStars";
import { TextInput } from "../../components/TextInput";
import { Chip } from "../../components/Chip";

const PANEL_LOCAL_ID = "local-el-poli";

export function ShopProfileScreen() {
  const navigate = useNavigate();
  const { state, dispatch } = useDemo();
  const [demoOpen, setDemoOpen] = useState(false);
  const local = localById(state, PANEL_LOCAL_ID) ?? state.locals[0];
  const [name, setName] = useState(local.name);
  const [phone, setPhone] = useState(local.phone);
  const [hours, setHours] = useState(local.hours);

  const save = () => {
    dispatch({ type: "UPDATE_LOCAL", localId: local.id, patch: { name, phone, hours } });
  };

  return (
    <>
      <Screen
        title="Mi perfil"
        leading="logo"
        logoSrc="/logo-elpoli.png"
        backTo="/imprenta"
        trailing="Imprenta"
        footer={
          <Button variant="primary" size="lg" fullWidth onClick={save}>
            Guardar cambios
          </Button>
        }
      >
        <div className="flex flex-col gap-5">
          <PageTitle title="Mi perfil" subtitle="Así te ven los estudiantes en Fadu Print." />

          <Card tone="sunrise">
            <div className="flex items-center gap-4">
              <span className="flex size-thumb shrink-0 items-center justify-center overflow-hidden rounded-lg border border-glass-border bg-surface p-1 shadow-soft">
                <img src="/logo-elpoli.png" alt="" className="size-full object-contain" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="truncate text-h2 text-ink">{local.name}</p>
                <p className="text-small text-text-secondary">{local.tagline} · {local.floorLabel}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone="glass" icon={<Star aria-hidden className="size-3 fill-accent text-accent" />}>
                    {local.rating.toFixed(1).replace(".", ",")} · {local.reviewCount}
                  </Chip>
                  <Chip tone="success">Abierto ahora</Chip>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-3">
              <p className="text-h3 text-ink">Datos del local</p>
              <TextInput
                label="Nombre del local"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={40}
              />
              <TextInput
                label="Teléfono"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                maxLength={20}
              />
              <TextInput
                label="Horario"
                value={hours}
                onChange={(event) => setHours(event.target.value)}
                maxLength={60}
              />
              <p className="text-caption text-text-muted">
                Los cambios se guardan en esta demo y se reflejan en el perfil público.
              </p>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-3">
              <p className="text-h3 text-ink">Vista previa del catálogo</p>
              <CatalogChips local={local} />
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-0.5 rounded-md border border-border-soft bg-surface-soft p-3">
                  <span className="text-caption text-text-secondary">Cola virtual</span>
                  <span className="text-h3 text-ink">{local.queue.virtual} personas</span>
                </div>
                <div className="flex flex-col gap-0.5 rounded-md border border-border-soft bg-surface-soft p-3">
                  <span className="text-caption text-text-secondary">En el local</span>
                  <span className="text-h3 text-ink">{local.queue.inPerson} personas</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="md"
              fullWidth
              icon={<Layers aria-hidden className="size-icon" />}
              onClick={() => navigate("/imprenta/stock")}
            >
              Gestionar stock
            </Button>
            <Button
              variant="outline"
              size="md"
              fullWidth
              icon={<BookOpen aria-hidden className="size-icon" />}
              onClick={() => navigate("/imprenta/resenas")}
            >
              Responder reseñas
            </Button>
            <button
              type="button"
              onClick={() => setDemoOpen(true)}
              className="text-small font-semibold text-text-secondary underline decoration-accent-border underline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
            >
              Abrir menú demo
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border-soft bg-surface-soft p-3 text-caption text-text-muted">
            <RatingStars rating={local.rating} />
            <span>El puntaje se actualiza con cada reseña nueva.</span>
          </div>
        </div>
      </Screen>

      <DemoMenu open={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  );
}
