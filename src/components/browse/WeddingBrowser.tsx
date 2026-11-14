"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { FilterSelect, type FilterOption } from "@/components/browse/FilterBar";
import { LoadMore } from "@/components/browse/LoadMore";
import { UnderlineTabs } from "@/components/browse/UnderlineTabs";
import { StoryCard } from "@/components/cards/StoryCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { RealWedding } from "@/data/types";
import { EASE } from "@/lib/motion";
import { useClearParams, useParamState } from "@/lib/url-state";

type Props = {
  weddings: RealWedding[];
  cityNames: Record<string, string>;
  styles: string[];
  cities: FilterOption[];
};

const PAGE = 6;

/** The real-weddings browser: style tabs + city select, URL-driven. */
export function WeddingBrowser({ weddings, cityNames, styles, cities }: Props) {
  const [style] = useParamState("style");
  const [city] = useParamState("city");
  const clear = useClearParams(["style", "city"]);
  const [shown, setShown] = useState(PAGE);

  const filtered = weddings.filter(
    (w) =>
      (!style || w.style.toLowerCase() === style.toLowerCase()) && (!city || w.city === city),
  );
  const visible = filtered.slice(0, shown);
  const key = `${style}|${city}`;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
        <UnderlineTabs
          param="style"
          label="Wedding styles"
          allLabel="All styles"
          tabs={styles.map((s) => ({ value: s.toLowerCase(), label: s }))}
          className="min-w-0 flex-1"
        />
        <FilterSelect param="city" label="City" options={cities} allLabel="Anywhere" className="w-40" />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="mt-10"
        >
          {visible.length === 0 ? (
            <EmptyState
              title="No stories in that corner yet."
              text="Try another style or city, or read everything."
              action={{ label: "Show all stories", onClick: clear }}
            />
          ) : (
            <ul className="grid grid-cols-1 gap-2 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((wedding) => (
                <li key={wedding.slug}>
                  <StoryCard
                    wedding={wedding}
                    cityName={cityNames[wedding.city]}
                    sizes="(min-width: 48rem) 33vw, 100vw"
                    variant="small"
                  />
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </AnimatePresence>
      <LoadMore shown={visible.length} total={filtered.length} onMore={() => setShown((s) => s + PAGE)} noun="stories" />
    </div>
  );
}
