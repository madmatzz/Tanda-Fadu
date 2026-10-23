import { Upload } from "lucide-react";
import { cn } from "../lib/cn";

interface DropzoneProps {
  onFile: (file: File) => void;
  label?: string;
  hint?: string;
  disabled?: boolean;
}

export function Dropzone({
  onFile,
  label = "Seleccionar archivo",
  hint = "pdf, word, jpg · hasta 25 MB",
  disabled = false,
}: DropzoneProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-accent-border bg-surface-soft px-card py-8 text-center transition hover:border-accent hover:bg-accent-soft/50 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent",
        disabled && "cursor-not-allowed border-border-soft bg-fill text-text-muted",
      )}
    >
      <input
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        disabled={disabled}
        onChange={(event) => {
          const selected = event.target.files?.[0];
          if (selected) onFile(selected);
          event.target.value = "";
        }}
        className="sr-only"
      />
      <span className="flex size-field items-center justify-center rounded-pill border border-accent-border bg-accent-soft text-accent-ink">
        <Upload aria-hidden className="size-icon-lg" />
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-h3 text-ink">{label}</span>
        <span className="text-small text-text-secondary">{hint}</span>
      </span>
    </label>
  );
}
