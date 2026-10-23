import { useState } from "react";
import { useNavigate } from "react-router";
import { Star } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { Sheet } from "../../shell/Sheet";
import { useDemo } from "../../demo/DemoProvider";
import { localById, localReviews, ratingBreakdown } from "../../demo/selectors";
import type { Review } from "../../demo/types";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Chip } from "../../components/Chip";
import { EmptyState } from "../../components/EmptyState";
import { ErrorNote } from "../../components/ErrorNote";
import { PageTitle } from "../../components/PageTitle";
import { ProgressBar } from "../../components/ProgressBar";
import { RatingStars } from "../../components/RatingStars";
import { ReviewCard } from "../../components/ReviewCard";
import { Textarea } from "../../components/Textarea";
import { elPoliLogoUrl } from "../../lib/assets";

const PANEL_LOCAL_ID = "local-el-poli";

export function ShopReviewsScreen() {
  const navigate = useNavigate();
  const { state, dispatch } = useDemo();
  const [filter, setFilter] = useState<"all" | "unanswered">("all");
  const [replying, setReplying] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState("");
  const local = localById(state, PANEL_LOCAL_ID) ?? state.locals[0];
  const reviews = localReviews(state, local.id);
  const filtered = reviews.filter((review) => filter === "all" || !review.reply);
  const unanswered = reviews.filter((review) => !review.reply).length;

  const openReply = (review: Review) => {
    setReplying(review);
    setReplyText(review.reply ?? "");
    setError("");
  };

  const publishReply = () => {
    if (!replying) return;
    if (replyText.trim().length < 4) {
      setError("Escribí una respuesta breve antes de publicar.");
      return;
    }
    dispatch({ type: "SHOP_REPLY_REVIEW", reviewId: replying.id, reply: replyText.trim() });
    setReplying(null);
    setReplyText("");
    setError("");
  };

  return (
    <>
      <Screen
        title="Reseñas"
        leading="logo"
        logoSrc={elPoliLogoUrl}
        backTo="/imprenta"
        trailing="Imprenta"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="md" fullWidth onClick={() => navigate("/imprenta")}>
              Panel
            </Button>
            <Button variant="primary" size="md" fullWidth onClick={() => navigate("/imprenta/perfil")}>
              Mi perfil
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <PageTitle
            title="Reseñas"
            subtitle={`Lo que dicen los estudiantes de ${local.name}.`}
          />

          <Card tone="sunrise">
            <div className="flex items-center gap-4">
              <span className="text-big-number text-ink">{local.rating.toFixed(1).replace(".", ",")}</span>
              <div className="flex flex-col gap-1">
                <RatingStars rating={local.rating} size="md" />
                <span className="text-small text-text-secondary">{local.reviewCount} reseñas en total</span>
                <Chip tone={unanswered > 0 ? "warning" : "success"}>
                  {unanswered > 0 ? `${unanswered} sin responder` : "Todas respondidas"}
                </Chip>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-3">
              <p className="text-h3 text-ink">Valoración por aspecto</p>
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

          <div className="flex flex-wrap gap-2">
            {[
              { value: "all" as const, label: `Todas (${reviews.length})` },
              { value: "unanswered" as const, label: `Sin responder (${unanswered})` },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={filter === item.value}
                onClick={() => setFilter(item.value)}
              >
                <Chip tone={filter === item.value ? "ink" : "neutral"}>{item.label}</Chip>
              </button>
            ))}
          </div>

          {filtered.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filtered.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  replyAction={!review.reply}
                  onReply={() => openReply(review)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Star aria-hidden className="size-icon" />}
              title="No hay reseñas en este filtro"
              description="Cuando un estudiante deje una reseña, la vas a ver acá."
            />
          )}
        </div>
      </Screen>

      <Sheet
        open={Boolean(replying)}
        onClose={() => setReplying(null)}
        title="Responder reseña"
        description={replying ? `Reseña de ${replying.author}` : undefined}
        footer={
          <Button variant="primary" size="lg" fullWidth onClick={publishReply}>
            Publicar respuesta
          </Button>
        }
      >
        <div className="flex flex-col gap-3">
          {replying && (
            <div className="rounded-md border border-border-soft bg-surface-soft p-3">
              <RatingStars rating={replying.rating} showValue valueLabel={`${replying.rating}/5`} />
              <p className="mt-2 text-body text-ink">“{replying.text}”</p>
            </div>
          )}
          <Textarea
            label="Tu respuesta"
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
            placeholder="Gracias por la reseña. Te esperamos en el próximo trabajo."
            maxLength={220}
            hint={`${replyText.length}/220 caracteres`}
          />
          {error && <ErrorNote>{error}</ErrorNote>}
        </div>
      </Sheet>
    </>
  );
}
