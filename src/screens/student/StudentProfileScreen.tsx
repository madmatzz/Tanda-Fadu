import { useState } from "react";
import { useNavigate } from "react-router";
import {
  BookOpen,
  ChevronRight,
  Heart,
  RotateCcw,
  Store,
  UserRound,
} from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { useToast } from "../../shell/ToastProvider";
import { localById, userOrders } from "../../demo/selectors";
import { DemoMenu } from "../../components/DemoMenu";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Chip } from "../../components/Chip";
import { EmptyState } from "../../components/EmptyState";
import { LinkText } from "../../components/LinkText";
import { LocalLogo } from "../../components/LocalLogo";
import { PageTitle } from "../../components/PageTitle";
import { SectionLabel } from "../../components/SectionLabel";
import { Divider } from "../../components/Divider";

export function StudentProfileScreen() {
  const navigate = useNavigate();
  const { state, dispatch, resetDemo } = useDemo();
  const { showToast } = useToast();
  const [demoOpen, setDemoOpen] = useState(false);
  const savedLocals = state.savedLocalIds
    .map((id) => localById(state, id))
    .filter((local): local is NonNullable<typeof local> => Boolean(local));
  const orders = userOrders(state);
  const reviews = state.reviews.filter((review) => review.author === "Lucía Pérez");

  return (
    <>
      <Screen
        title="Mi perfil"
        leading="back"
        backTo="/"
        trailing="Perfil"
        footer={
          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon={<Store aria-hidden className="size-icon" />}
            onClick={() => navigate("/imprenta")}
          >
            Soy imprenta
          </Button>
        }
      >
        <div className="flex flex-col gap-6">
          <PageTitle title="Mi perfil" subtitle="Tus datos demo, locales guardados y preferencias." />

          <Card>
            <div className="flex items-center gap-4">
              <span className="flex size-thumb shrink-0 items-center justify-center rounded-pill bg-accent-soft text-h2 text-accent-ink">
                LP
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-h2 text-ink">Lucía Pérez</p>
                  <Chip tone="accent">Estudiante</Chip>
                </div>
                <p className="text-small text-text-secondary">lucia.perez@fadu.uba.ar</p>
                <p className="text-caption text-text-muted">Legajo 108.245 · Diseño Gráfico</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-1 rounded-lg border border-border-soft bg-surface p-3">
              <span className="text-h2 text-ink">{orders.length}</span>
              <span className="text-caption text-text-secondary">Pedidos</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg border border-border-soft bg-surface p-3">
              <span className="text-h2 text-ink">{savedLocals.length}</span>
              <span className="text-caption text-text-secondary">Guardados</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg border border-border-soft bg-surface p-3">
              <span className="text-h2 text-ink">{reviews.length}</span>
              <span className="text-caption text-text-secondary">Reseñas</span>
            </div>
          </div>

          <section className="flex flex-col gap-3">
            <div className="flex items-end justify-between gap-2">
              <h2 className="text-h2 text-ink">Locales guardados</h2>
              <LinkText size="small" onClick={() => navigate("/locales")}>
                Buscar más
              </LinkText>
            </div>
            {savedLocals.length > 0 ? (
              <div className="flex flex-col gap-2">
                {savedLocals.map((local) => (
                  <div
                    key={local.id}
                    className="flex items-center gap-3 rounded-lg border border-border-soft bg-surface p-3 shadow-soft"
                  >
                    <LocalLogo local={local} size="md" />
                    <button
                      type="button"
                      onClick={() => navigate(`/locales/${local.slug}`)}
                      className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      <span className="truncate text-body-strong text-ink">{local.name}</span>
                      <span className="text-caption text-text-secondary">
                        {local.floorLabel} · {local.tagline}
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Quitar ${local.name} de guardados`}
                      onClick={() => dispatch({ type: "TOGGLE_SAVED_LOCAL", localId: local.id })}
                      className="flex size-control shrink-0 items-center justify-center rounded-pill text-accent transition hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      <Heart aria-hidden className="size-icon fill-accent" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Heart aria-hidden className="size-icon" />}
                title="No guardaste locales todavía"
                description="Tocá el corazón en un local para tenerlo a mano."
                action={
                  <Button variant="outline" size="md" onClick={() => navigate("/locales")}>
                    Ver locales
                  </Button>
                }
              />
            )}
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-h2 text-ink">Preferencias</h2>
            <Card>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-body text-text-secondary">
                    <BookOpen aria-hidden className="size-icon" />
                    Papel preferido
                  </span>
                  <span className="text-body-strong text-ink">Obra 80g</span>
                </div>
                <Divider />
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-body text-text-secondary">
                    <UserRound aria-hidden className="size-icon" />
                    Pago preferido
                  </span>
                  <span className="text-body-strong text-ink">MercadoPago</span>
                </div>
              </div>
            </Card>
          </section>

          <section className="flex flex-col gap-3">
            <SectionLabel>Controles de demo</SectionLabel>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="md" fullWidth onClick={() => setDemoOpen(true)}>
                Abrir menú demo
              </Button>
              <Button
                variant="soft"
                size="md"
                fullWidth
                icon={<RotateCcw aria-hidden className="size-icon" />}
                onClick={() => {
                  resetDemo();
                  showToast("Demo reiniciada. Volvimos al estado inicial.");
                }}
              >
                Reiniciar demo
              </Button>
              <button
                type="button"
                onClick={() => navigate("/design-system")}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-2 text-small font-semibold text-text-secondary transition hover:bg-fill focus-visible:outline-2 focus-visible:outline-accent"
              >
                Ver design system
                <ChevronRight aria-hidden className="size-icon" />
              </button>
            </div>
          </section>
        </div>
      </Screen>
      <DemoMenu open={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  );
}
