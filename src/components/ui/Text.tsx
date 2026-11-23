import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  /** Lead is the larger standfirst, Jost 400 at 20px and up. */
  variant?: "body" | "lead" | "small";
  tone?: "ink" | "mute";
  className?: string;
};

export function Text({ children, variant = "body", tone = "ink", className }: Props) {
  return (
    <p
      className={cn(
        variant === "lead" && "text-lead",
        variant === "small" && "text-small",
        tone === "mute" ? "text-mute" : "text-ink",
        className,
      )}
    >
      {children}
    </p>
  );
}
