"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/cn";
import { EASE } from "@/lib/motion";
import { useParamState } from "@/lib/url-state";

type Tab = { value: string; label: string };

type Props = {
  /** URL query parameter the tabs read and write ("" clears it). */
  param: string;
  tabs: Tab[];
  /** Label for the empty value, shown first. Omit to require a value. */
  allLabel?: string;
  label: string;
  className?: string;
};

/** Tabs with a sliding underline, driven by a URL query parameter. */
export function UnderlineTabs({ param, tabs, allLabel = "All", label, className }: Props) {
  const [value, setValue] = useParamState(param);
  const uid = useId();
  const all = [{ value: "", label: allLabel }, ...tabs];
  const active = all.some((t) => t.value === value) ? value : "";

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn("no-scrollbar -mx-gutter flex gap-6 overflow-x-auto border-b border-line px-gutter md:gap-8", className)}
    >
      {all.map((tab) => {
        const selected = active === tab.value;
        return (
          <button
            key={tab.value || "all"}
            role="tab"
            aria-selected={selected}
            onClick={() => setValue(tab.value || null)}
            className={cn(
              "tap relative shrink-0 pb-3 text-label-lg whitespace-nowrap transition-colors duration-300 ease-wedoura",
              selected ? "font-medium text-ink" : "text-mute hover:text-ink",
            )}
          >
            {tab.label}
            {selected && (
              <motion.span
                layoutId={`${uid}-underline`}
                className="absolute inset-x-0 bottom-0 h-0.5 bg-ink"
                transition={{ duration: 0.4, ease: EASE }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
