import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  /** Lead is serif and larger, for standfirsts. */
  variant?: "body" | "lead" | "small";
  tone?: "ink" | "mute";
  className?: string;
};

export function Text({ children, variant = "body", tone = "ink", className }: Props) {
  return (
    <p
      className={cn(
        variant === "lead" && "font-serif text-lead",
        variant === "small" && "text-small",
        tone === "mute" ? "text-mute" : "text-ink",
        className,
      )}
    >
      {children}
    </p>
  );
}
