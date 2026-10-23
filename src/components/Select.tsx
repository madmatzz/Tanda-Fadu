import { useId, type ReactNode, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { FormField } from "./FormField";
import { cn } from "../lib/cn";
import { fieldClass } from "../lib/field";

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "size"> {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function Select({ label, hint, error, id, disabled = false, children, ...rest }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <FormField label={label} htmlFor={selectId} hint={hint} error={error}>
      <div className="relative">
        <select
          {...rest}
          id={selectId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          className={cn(fieldClass({ invalid: Boolean(error), disabled }), "h-field appearance-none pr-field")}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1/2 right-card size-icon -translate-y-1/2",
            disabled ? "text-text-muted" : "text-ink",
          )}
        />
      </div>
    </FormField>
  );
}
