import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  /** site: 1360px max. wide: 1600px max, for photo-heavy bands. Both centre on wider screens. */
  width?: "site" | "wide";
  className?: string;
};

export function Container({ children, width = "site", className }: Props) {
  return <div className={cn(width === "wide" ? "container-wide" : "container-site", className)}>{children}</div>;
}
