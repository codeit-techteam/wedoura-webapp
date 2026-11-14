import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  as?: "p" | "span" | "div";
  /** Gold is never used for text; it is for marks, rules and icons. */
  tone?: "ink" | "mute" | "white";
  className?: string;
};

const tones = { ink: "text-ink", mute: "text-mute", white: "text-white" };

/** Small uppercase label with wide letter-spacing. */
export function Label({ children, as: Tag = "p", tone = "mute", className }: Props) {
  return <Tag className={cn("label", tones[tone], className)}>{children}</Tag>;
}
