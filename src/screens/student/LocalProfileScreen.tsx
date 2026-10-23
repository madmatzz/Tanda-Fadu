import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Clock,
  Heart,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import { Screen } from "../../shell/Screen";
import { Sheet } from "../../shell/Sheet";
import { useDemo } from "../../demo/DemoProvider";
import {
  localAlerts,
  localByIdOrSlug,
  localReviews,
  optimalTime,
  ratingBreakdown,
} from "../../demo/selectors";
import { modeShort } from "../../demo/pricing";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { CatalogChips } from "../../components/CatalogChips";
import { Chip } from "../../components/Chip";
import { Divider } from "../../components/Divider";
import { EmptyState } from "../../components/EmptyState";
import { IconButton } from "../../components/IconButton";
import { LinkText } from "../../components/LinkText";
import { ProgressBar } from "../../components/ProgressBar";
import { QueueVisualization } from "../../components/QueueVisualization";
import { RatingStars } from "../../components/RatingStars";
import { ReportQueueSheet } from "../../components/ReportQueueSheet";
import { ReviewCard } from "../../components/ReviewCard";
import { ReviewComposer } from "../../components/ReviewComposer";
import { SectionLabel } from "../../components/SectionLabel";
import { AlertCard } from "../../components/AlertCard";
import { BarChart } from "../../components/BarChart";

const hourLabels = ["08", "10", "12", "14", "16", "18", "20", "22"];

export function LocalProfileScreen() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useDemo();
  const local = localByIdOrSlug(state, slug);
  const [reportOpen, setReportOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [writingReview, setWritingReview] = useState(false);

  if (!local) {
    return (
      <Screen title="Local" leading="back" backTo="/locales" trailing="Locales">
        <EmptyState
          icon={<MapPin aria-hidden className="size-icon" />}
          title="No encontramos este local"
          description="Puede que ya no esté disponible en la demo."
          action={
            <Button variant="outline" size="md" onClick={() => navigate("/locales")}>
              Ver locales
            </Button>
          }
        />
      </Screen>
    );
  }

  const saved = state.savedLocalIds.includes(local.id);
  const alerts = localAlerts(state, local.id);
  const reviews = localReviews(state, local.id);
  const bestIndex = Math.max(0, hourLabels.indexOf(local.bestTime.slice(0, 2)));
  const heroClass =
    local.tone === "ink"
      ? "border-ink bg-ink-fade text-surface"
      : local.tone === "sunset"
        ? "border-accent bg-sunset text-ink"
        : "border-accent-border bg-sunrise text-ink";
  const logoOnHero = local.hasLogo;

  const chooseLocal = () => {
    dispatch({ type: "SELECT_LOCAL", localId: local.id });
    if (state.draft.file) {
      navigate("/comparar?desde=local");
    } else {
      navigate(`/imprimir?local=${local.slug}`);
    }
  };

  const submitReview = (rating: number, text: string) => {
    dispatch({
      type: "ADD_REVIEW",
      review: {
        id: `review-${state.demoClock}-${state.reviews.length + 1}`,
        localId: local.id,
        author: "Lucía Pérez",
        rating,
        text,
        createdAt: state.demoClock,
      },
    });
    setReviewsOpen(false);
    setWritingReview(false);
  };

  return (
    <>
      <Screen
        title={local.name}
        leading="back"
        backTo="/locales"
        trailing="Local"
        footer={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => navigate(`/comparar?desde=local&local=${local.slug}`)}
            >
              Comparar
            </Button>
            <Button variant="primary" size="md" fullWidth onClick={chooseLocal}>
              {state.draft.file ? "Elegir local" : "Imprimir acá"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <section className={`relative overflow-hidden rounded-lg border p-card shadow-float ${heroClass}`}>
            <div aria-hidden className="absolute -right-12 -top-14 size-orb rounded-pill bg-surface/20 blur-orb" />
            <div className="relative flex items-start gap-4">
              <span
                className={`flex size-thumb shrink-0 items-center justify-center overflow-hidden rounded-lg border p-1 ${
                  logoOnHero ? "border-glass-border bg-surface" : "border-surface/40 bg-surface/15"
                }`}
              >
                {logoOnHero ? (
                  <img src="/logo-elpoli.png" alt="" className="size-full object-contain" />
                ) : (
                  <span className="text-h2 font-semibold">{local.initials}</span>
                )}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-caption opacity-80">{local.floorLabel}</p>
                    <h1 className="text-h1">{local.name}</h1>
                  </div>
                  <IconButton
                    label={saved ? "Quitar de guardados" : "Guardar local"}
                    tone="glass"
                    size="sm"
                    onClick={() => {
                      dispatch({ type: "TOGGLE_SAVED_LOCAL", localId: local.id });
                    }}
                    icon={<Heart aria-hidden className={saved ? "size-icon fill-accent text-accent" : "size-icon"} />}
                  />
                </div>
                <p className="text-small opacity-90">{local.tagline}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Chip tone="glass" icon={<Star aria-hidden className="size-3 fill-accent text-accent" />}>
                    {local.rating.toFixed(1).replace(".", ",")} · {local.reviewCount} reseñas
                  </Chip>
                  <Chip tone="success">Abierto ahora</Chip>
                </div>
              </div>
            </div>
          </section>

          {alerts.length > 0 && (
            <div className="flex flex-col gap-2">
              {alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} local={local} />
              ))}
            </div>
          )}

          <Card>
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <SectionLabel>Cola en vivo</SectionLabel>
                  <h2 className="text-h2 text-ink">¿Cuánto se espera?</h2>
                </div>
                <Chip tone="info">En vivo</Chip>
              </div>
              <QueueVisualization variant="virtual" />
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1 rounded-md border border-border-soft bg-surface-soft p-3">
                  <span className="text-caption text-text-secondary">Cola virtual</span>
                  <span className="text-h2 text-ink">{local.queue.waitVirtual} min</span>
                  <span className="text-caption text-text-muted">{local.queue.virtual} personas</span>
                </div>
                <div className="flex flex-col gap-1 rounded-md border border-border-soft bg-surface-soft p-3">
                  <span className="text-caption text-text-secondary">Presencial</span>
                  <span className="text-h2 text-ink">{local.queue.waitInPerson} min</span>
                  <span className="text-caption text-text-muted">{local.queue.inPerson} personas</span>
                </div>
              </div>
              <Button variant="outline" size="md" fullWidth onClick={() => setReportOpen(true)}>
                Reportar cola
              </Button>
            </div>
          </Card>

          <section className="flex flex-col gap-3">
            <div className="flex items-end justify-between gap-2">
              <h2 className="text-h2 text-ink">Reseñas</h2>
              <LinkText
                size="small"
                onClick={() => {
                  setWritingReview(false);
                  setReviewsOpen(true);
                }}
              >
                Ver todas
              </LinkText>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border-soft bg-surface p-4 shadow-soft">
              <span className="text-big-number text-ink">{local.rating.toFixed(1).replace(".", ",")}</span>
              <div className="flex flex-col gap-1">
                <RatingStars rating={local.rating} />
                <span className="text-small text-text-secondary">{local.reviewCount} reseñas</span>
              </div>
            </div>
            {reviews.slice(0, 2).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
            <Button
              variant="soft"
              size="md"
              fullWidth
              onClick={() => {
                setWritingReview(true);
                setReviewsOpen(true);
              }}
            >
              Escribir una reseña
            </Button>
          </section>

          <Card>
            <div className="flex flex-col gap-3">
              <SectionLabel>Valoración del local</SectionLabel>
              {ratingBreakdown(local).map((item) => (
                <ProgressBar
                  key={item.label}
                  value={item.value * 20}
                  tone="success"
                  label={item.label}
                  valueLabel={`${item.value.toFixed(1).replace(".", ",")}/5`}
                />
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <SectionLabel>Mejor momento</SectionLabel>
                  <h2 className="text-h2 text-ink">Evitá las horas pico</h2>
                </div>
                <Chip tone="success">{optimalTime(local)}</Chip>
              </div>
              <BarChart values={local.occupancy} labels={hourLabels} highlightIndex={5} bestIndex={bestIndex} />
              <p className="text-small text-text-secondary">
                La franja recomendada es a las {optimalTime(local)}. A las 18:00 suele haber más gente.
              </p>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-3">
              <SectionLabel>Papel y stock</SectionLabel>
              <CatalogChips local={local} />
              <div className="flex flex-wrap items-center gap-2 text-caption text-text-muted">
                <span>{modeShort("bn")} y color</span>
                <span aria-hidden>·</span>
                <span>A3 disponible</span>
                <span aria-hidden>·</span>
                <span>Actualizado hace poco</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-3">
              <SectionLabel>Dónde y cuándo</SectionLabel>
              <div className="flex items-start gap-3">
                <MapPin aria-hidden className="mt-0.5 size-icon text-accent" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-body-strong text-ink">{local.floorLabel}</span>
                  <span className="text-small text-text-secondary">FADU · Ciudad Universitaria</span>
                </div>
              </div>
              <Divider />
              <div className="flex items-start gap-3">
                <Clock aria-hidden className="mt-0.5 size-icon text-accent" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-body-strong text-ink">Horario</span>
                  <span className="text-small text-text-secondary">{local.hours}</span>
                </div>
              </div>
              <Divider />
              <div className="flex items-start gap-3">
                <Phone aria-hidden className="mt-0.5 size-icon text-accent" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-body-strong text-ink">Teléfono</span>
                  <span className="text-small text-text-secondary">{local.phone}</span>
                </div>
              </div>
            </div>
          </Card>

          <p className="text-caption text-text-muted">
            {local.reviewCount} estudiantes ya reseñaron este local. Los datos son ficticios para la demo.
          </p>
        </div>
      </Screen>

      <ReportQueueSheet open={reportOpen} onClose={() => setReportOpen(false)} local={local} />

      <Sheet
        open={reviewsOpen}
        onClose={() => setReviewsOpen(false)}
        title={writingReview ? `Reseñar ${local.name}` : `Reseñas de ${local.name}`}
        description={writingReview ? "Contá cómo fue tu experiencia." : `${local.rating.toFixed(1).replace(".", ",")} de 5 · ${local.reviewCount} reseñas`}
      >
        {writingReview ? (
          <ReviewComposer onSubmit={submitReview} onCancel={() => setWritingReview(false)} />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-md border border-border-soft bg-surface-soft p-3">
              <span className="text-big-number text-ink">{local.rating.toFixed(1).replace(".", ",")}</span>
              <div className="flex flex-col gap-1">
                <RatingStars rating={local.rating} />
                <span className="text-small text-text-secondary">{local.reviewCount} reseñas</span>
              </div>
            </div>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => setWritingReview(true)}
            >
              Escribir una reseña
            </Button>
          </div>
        )}
      </Sheet>
    </>
  );
}
