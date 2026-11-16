"use client";

import { useRef, type ReactNode } from "react";
import { RailProgress } from "@/components/home/RailProgress";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  /** Classes for each item wrapper, e.g. "w-5/6 md:w-1/3". */
  itemClassName: string;
  label: string;
  /** Show arrow buttons from md up. */
  arrows?: boolean;
  tone?: "ink" | "white";
  className?: string;
  /** Bleed the rail to the viewport edge from inside a container. */
  bleed?: boolean;
};

/**
 * The one horizontal rail: snap scrolling, hidden scrollbar, a thin progress
 * line, optional arrows on desktop. Children are the items, in order.
 */
export function Rail({ children, itemClassName, label, arrows = true, tone = "ink", className, bleed = false }: Props) {
  const railRef = useRef<HTMLUListElement>(null);

  function scrollByItem(direction: 1 | -1) {
    const rail = railRef.current;
    const item = rail?.firstElementChild as HTMLElement | null;
    if (!rail || !item) return;
    rail.scrollBy({ left: direction * (item.offsetWidth + 8), behavior: "smooth" });
  }

  const items = Array.isArray(children) ? children : [children];

  return (
    <div className={className}>
      <ul
        ref={railRef}
        aria-label={label}
        className={cn(
          "no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto",
          bleed && "-mx-gutter px-gutter",
        )}
      >
        {items.map((child, i) => (
          <li key={i} className={cn("shrink-0 snap-start", itemClassName)}>
            {child}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex items-center gap-6">
        <RailProgress railRef={railRef} tone={tone} className="flex-1" />
        {arrows && (
          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              onClick={() => scrollByItem(-1)}
              aria-label={`Previous, ${label}`}
              className={cn(
                "tap inline-flex items-center justify-center border transition-chrome",
                tone === "ink" ? "border-line text-ink hover:border-ink" : "border-white/30 text-white hover:border-white",
              )}
            >
              <Icon name="arrow-left" size={18} />
            </button>
            <button
              type="button"
              onClick={() => scrollByItem(1)}
              aria-label={`Next, ${label}`}
              className={cn(
                "tap inline-flex items-center justify-center border transition-chrome",
                tone === "ink" ? "border-line text-ink hover:border-ink" : "border-white/30 text-white hover:border-white",
              )}
            >
              <Icon name="arrow-right" size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
