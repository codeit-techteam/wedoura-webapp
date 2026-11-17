import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  /** Lead is larger and light (Jost 300, 20px+), for standfirsts. */
  variant?: "body" | "lead" | "small";
  tone?: "ink" | "mute";
  className?: string;
};

export function Text({ children, variant = "body", tone = "ink", className }: Props) {
  return (
    <p
      className={cn(
        variant === "lead" && "text-lead font-light",
        variant === "small" && "text-small",
        tone === "mute" ? "text-mute" : "text-ink",
        className,
      )}
    >
      {children}
    </p>
  );
}
