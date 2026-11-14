import { cn } from "@/lib/cn";

/** 1px rule in the hairline colour. Pass tone="ink" for the heavier section rule. */
export function Hairline({ tone = "line", className }: { tone?: "line" | "ink"; className?: string }) {
  return <hr className={cn("border-0 border-t", tone === "ink" ? "border-ink" : "border-line", className)} />;
}
