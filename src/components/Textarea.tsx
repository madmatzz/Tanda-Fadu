import { useId, type TextareaHTMLAttributes } from "react";
import { FormField } from "./FormField";
import { cn } from "../lib/cn";
import { fieldClass } from "../lib/field";

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  label: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, id, disabled = false, ...rest }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <FormField label={label} htmlFor={textareaId} hint={hint} error={error}>
      <textarea
        {...rest}
        id={textareaId}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        className={cn(fieldClass({ invalid: Boolean(error), disabled }), "min-h-textarea py-3")}
      />
    </FormField>
  );
}
