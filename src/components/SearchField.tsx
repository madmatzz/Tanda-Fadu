import { Search } from "lucide-react";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function SearchField({
  value,
  onChange,
  placeholder = "Buscar local o servicio",
  label = "Buscar local",
}: SearchFieldProps) {
  return (
    <div className="relative">
      <Search
        aria-hidden
        className="pointer-events-none absolute left-4 top-1/2 size-icon -translate-y-1/2 text-text-muted"
      />
      <input
        type="search"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-field w-full rounded-pill border border-border-soft bg-surface pl-12 pr-card text-body text-ink placeholder:text-text-muted shadow-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft"
      />
    </div>
  );
}
