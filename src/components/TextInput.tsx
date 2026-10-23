import { useId, type InputHTMLAttributes } from "react";
import { FormField } from "./FormField";
import { cn } from "../lib/cn";
import { fieldClass } from "../lib/field";

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "size"> {
  label: string;
  hint?: string;
  error?: string;
}

export function TextInput({ label, hint, error, id, disabled = false, ...rest }: TextInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <FormField label={label} htmlFor={inputId} hint={hint} error={error}>
      <input
        {...rest}
        id={inputId}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        className={cn(fieldClass({ invalid: Boolean(error), disabled }), "h-field")}
      />
    </FormField>
  );
}
