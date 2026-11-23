import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  as?: "p" | "span" | "div";
  /** Gold is the eyebrow default: the deeper gold, so it passes contrast. */
  tone?: "ink" | "mute" | "white" | "gold";
  className?: string;
};

const tones = {
  ink: "text-ink",
  mute: "text-mute",
  white: "text-white",
  gold: "text-gold-deep",
};

/** Small uppercase label with wide letter-spacing. */
export function Label({ children, as: Tag = "p", tone = "gold", className }: Props) {
  return <Tag className={cn("label", tones[tone], className)}>{children}</Tag>;
}
