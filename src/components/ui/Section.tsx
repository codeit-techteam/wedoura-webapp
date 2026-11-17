import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  /** Alternate bands use warm ivory. */
  tone?: "white" | "ivory";
  size?: "default" | "small";
  className?: string;
  id?: string;
  "aria-label"?: string;
};

function hasCustomVerticalPad(className?: string) {
  return className?.split(/\s+/).some((c) => c.startsWith("pt-") || c.startsWith("pb-") || c.startsWith("py-"));
}

export function Section({ children, tone = "white", size = "default", className, ...rest }: Props) {
  return (
    <section
      {...rest}
      className={cn(
        !hasCustomVerticalPad(className) && (size === "default" ? "py-section" : "py-section-sm"),
        tone === "ivory" && "bg-ivory",
        className,
      )}
    >
      {children}
    </section>
  );
}
