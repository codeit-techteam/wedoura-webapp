"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useId } from "react";
import { cn } from "@/lib/cn";
import { EASE } from "@/lib/motion";
import { patchedHref, type ParamRecord } from "@/lib/url";

type Tab = { value: string; label: string };

type Props = {
  /** URL query parameter the tabs set ("" clears it). */
  param: string;
  tabs: Tab[];
  /** Label for the empty value, shown first. Omit to require a value. */
  allLabel?: string;
  label: string;
  /**
   * The page's pathname and current query params, passed from the server
   * component so the active tab is in the server HTML. Client-only screens
   * (saved, studio) may omit both and read the URL in the browser.
   */
  pathname?: string;
  params?: ParamRecord;
  className?: string;
};

/**
 * Tabs with a sliding underline. Each tab is a real link that patches the
 * URL query, so the active state is server-rendered and works without JS.
 */
export function UnderlineTabs({ param, tabs, allLabel = "All", label, pathname, params, className }: Props) {
  const uid = useId();
  const clientPathname = usePathname();
  const clientSearch = useSearchParams();
  const resolvedPathname = pathname ?? clientPathname;
  const resolvedParams = params ?? Object.fromEntries(clientSearch.entries());
  const value = resolvedParams[param] ?? "";
  const all = [{ value: "", label: allLabel }, ...tabs];
  const active = all.some((t) => t.value === value) ? value : "";

  return (
    <nav
      aria-label={label}
      className={cn("no-scrollbar -mx-gutter flex gap-6 overflow-x-auto border-b border-line px-gutter md:gap-8", className)}
    >
      {all.map((tab) => {
        const selected = active === tab.value;
        return (
          <Link
            key={tab.value || "all"}
            href={patchedHref(resolvedPathname, resolvedParams, { [param]: tab.value || null, show: null })}
            scroll={false}
            aria-current={selected ? "true" : undefined}
            className={cn(
              "tap relative inline-flex shrink-0 items-end pb-3 text-label-lg whitespace-nowrap transition-colors duration-300 ease-wedoura",
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
          </Link>
        );
      })}
    </nav>
  );
}
