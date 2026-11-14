"use client";

import { useEffect, useState, type RefObject } from "react";
import { cn } from "@/lib/cn";

type Props = {
  railRef: RefObject<HTMLElement | null>;
  className?: string;
  tone?: "ink" | "white";
};

/** A thin progress line under a horizontal rail; replaces the scrollbar. */
export function RailProgress({ railRef, className, tone = "ink" }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      setProgress(max > 0 ? rail.scrollLeft / max : 0);
    };
    update();
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      rail.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [railRef]);

  return (
    <div
      aria-hidden="true"
      className={cn("relative h-px w-full overflow-hidden", tone === "ink" ? "bg-line" : "bg-white/25", className)}
    >
      <div
        className={cn("absolute inset-y-0 left-0 w-1/4 origin-left", tone === "ink" ? "bg-ink" : "bg-white")}
        style={{ transform: `translateX(${progress * 300}%)` }}
      />
    </div>
  );
}
