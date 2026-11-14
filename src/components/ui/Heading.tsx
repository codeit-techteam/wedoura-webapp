import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Level = 1 | 2 | 3 | 4;
type Size = "display" | "h1" | "h2" | "h3";

const sizes: Record<Size, string> = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
};

type Props = {
  /** Semantic level. */
  level?: Level;
  /** Visual size, independent of level. Defaults to the level. */
  size?: Size;
  children: ReactNode;
  className?: string;
  id?: string;
};

/**
 * Serif headline. Wrap one word in <em> for the italic emphasis the brief asks for:
 * <Heading>Weddings, <em>seen whole</em>.</Heading>
 */
export function Heading({ level = 2, size, children, className, id }: Props) {
  const Tag = `h${level}` as const;
  const visual = size ?? ((`h${level}` in sizes ? `h${level}` : "h3") as Size);
  return (
    <Tag id={id} className={cn("font-serif font-light", sizes[visual], className)}>
      {children}
    </Tag>
  );
}
