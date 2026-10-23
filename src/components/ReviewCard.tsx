import { Store } from "lucide-react";
import type { Review } from "../demo/types";
import { DEMO_CLOCK, minutesAgoLabel } from "../demo/time";
import { Card } from "./Card";
import { RatingStars } from "./RatingStars";
import { Divider } from "./Divider";

interface ReviewCardProps {
  review: Review;
  onReply?: () => void;
  replyAction?: boolean;
}

export function ReviewCard({ review, onReply, replyAction = false }: ReviewCardProps) {
  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <RatingStars rating={review.rating} showValue valueLabel={`${review.rating}/5`} />
          <span className="text-caption text-text-muted">{minutesAgoLabel(review.createdAt, DEMO_CLOCK)}</span>
        </div>
        <p className="text-body text-ink">“{review.text}”</p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-small font-semibold text-text-secondary">{review.author}</p>
          {replyAction && !review.reply && onReply && (
            <button
              type="button"
              onClick={onReply}
              className="text-small font-semibold text-accent-ink underline decoration-accent-border underline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
            >
              Responder
            </button>
          )}
        </div>
        {review.reply && (
          <>
            <Divider />
            <div className="flex gap-2 rounded-md border border-border-soft bg-surface-soft p-3">
              <Store aria-hidden className="mt-0.5 size-icon shrink-0 text-text-secondary" />
              <div className="flex flex-col gap-1">
                <p className="text-small font-semibold text-ink">Respuesta del local</p>
                <p className="text-small text-text-secondary">{review.reply}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
