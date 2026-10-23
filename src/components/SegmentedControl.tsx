import { useId } from "react";
import { cn } from "../lib/cn";

export interface SegmentedOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  label: string;
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function segmentClass(checked: boolean, disabled: boolean): string {
  if (disabled) return "text-disabled";
  if (checked) return "bg-surface text-ink shadow-soft";
  return "text-text-secondary hover:text-ink";
}

export function SegmentedControl({ label, options, value, onChange, disabled = false }: SegmentedControlProps) {
  const groupName = useId();

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "flex h-field items-center gap-1 rounded-pill border p-1",
        disabled ? "border-border-soft bg-fill" : "border-border-soft bg-fill shadow-rim",
      )}
    >
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <label
            key={option.value}
            className={cn(
              "flex h-full flex-1 items-center justify-center rounded-pill text-small transition focus-within:outline-2 focus-within:outline-accent",
              disabled ? "cursor-not-allowed" : "cursor-pointer",
              checked && !disabled && "font-semibold",
              segmentClass(checked, disabled),
            )}
          >
            <input
              type="radio"
              name={groupName}
              value={option.value}
              checked={checked}
              disabled={disabled}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}
