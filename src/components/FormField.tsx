import type { ReactNode } from "react";
import { ErrorNote } from "./ErrorNote";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, htmlFor, hint, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-small font-semibold text-ink">
        {label}
      </label>
      {children}
      {error ? <ErrorNote>{error}</ErrorNote> : hint && <p className="text-small text-text-secondary">{hint}</p>}
    </div>
  );
}
