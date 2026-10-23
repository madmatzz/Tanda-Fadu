import { cn } from "../lib/cn";

interface DividerProps {
  tone?: "soft" | "strong";
}

export function Divider({ tone = "soft" }: DividerProps) {
  return <hr className={cn("border-t", tone === "soft" ? "border-border-soft" : "border-border")} />;
}
