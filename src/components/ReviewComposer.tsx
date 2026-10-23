import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "./Button";
import { Textarea } from "./Textarea";
import { cn } from "../lib/cn";
import { ErrorNote } from "./ErrorNote";

interface ReviewComposerProps {
  onSubmit: (rating: number, text: string) => void;
  onCancel?: () => void;
}

export function ReviewComposer({ onSubmit, onCancel }: ReviewComposerProps) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (text.trim().length < 4) {
      setError("Escribí al menos unas palabras sobre tu experiencia.");
      return;
    }
    setError("");
    onSubmit(rating, text.trim());
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-small font-semibold text-ink">Tu puntaje</span>
        <div className="flex items-center gap-1" role="group" aria-label="Puntaje de 1 a 5">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`${value} ${value === 1 ? "estrella" : "estrellas"}`}
              aria-pressed={rating === value}
              onClick={() => setRating(value)}
              className="rounded-pill p-1 transition hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-accent"
            >
              <Star
                aria-hidden
                className={cn("size-icon-lg", value <= rating ? "fill-accent text-accent" : "text-border")}
              />
            </button>
          ))}
          <span className="ml-2 text-body-strong text-ink">{rating}/5</span>
        </div>
      </div>

      <Textarea
        label="Tu reseña"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="¿Cómo fue la atención, la calidad y la espera?"
        maxLength={280}
        hint={`${text.length}/280 caracteres`}
      />
      {error && <ErrorNote>{error}</ErrorNote>}
      <div className="flex flex-col gap-2">
        <Button variant="primary" size="md" fullWidth onClick={submit}>
          Publicar reseña
        </Button>
        {onCancel && (
          <Button variant="outline" size="md" fullWidth onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}
