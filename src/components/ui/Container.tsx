import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  /** site: 1360px max content width. wide: 1920px near full-bleed, for photo bands. Both centre on wider screens. */
  width?: "site" | "wide";
  className?: string;
};

export function Container({ children, width = "site", className }: Props) {
  return <div className={cn(width === "wide" ? "container-wide" : "container-site", className)}>{children}</div>;
}
