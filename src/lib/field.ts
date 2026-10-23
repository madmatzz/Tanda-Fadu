import { cn } from "./cn";

interface FieldState {
  invalid?: boolean;
  disabled?: boolean;
}

// Estilo compartido de TextInput, Select y Textarea.
export function fieldClass({ invalid = false, disabled = false }: FieldState): string {
  const state = disabled
    ? "cursor-not-allowed border border-border-soft bg-fill text-text-muted"
    : invalid
      ? "border border-danger bg-surface text-ink"
      : "border border-border-soft bg-surface text-ink";

  return cn(
    "w-full rounded-md px-card text-body placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft",
    state,
  );
}
