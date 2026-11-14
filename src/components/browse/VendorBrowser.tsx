"use client";

import { AnimatePresence, motion } from "motion/react";
import { useDeferredValue, useMemo, useState } from "react";
import { FilterBar, FilterSelect, type FilterOption } from "@/components/browse/FilterBar";
import { LoadMore } from "@/components/browse/LoadMore";
import { VendorCard, type VendorCardData } from "@/components/cards/VendorCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCardGrid } from "@/components/ui/Skeleton";
import { EASE } from "@/lib/motion";
import { useClearParams, useParamState } from "@/lib/url-state";

export type BrowseVendor = VendorCardData & {
  citySlug: string;
  startingPriceINR?: number;
  featured?: boolean;
  /** Lower-cased searchable text. */
  search: string;
};

type Props = {
  vendors: BrowseVendor[];
  categories: FilterOption[];
  cities: FilterOption[];
  budgets: FilterOption[];
  sorts: FilterOption[];
};

const PAGE = 8;
const FILTER_KEYS = ["q", "category", "city", "budget", "sort"];

function inBand(price: number | undefined, band: string): boolean {
  if (price === undefined) return false;
  if (band === "b1") return price < 100000;
  if (band === "b2") return price >= 100000 && price <= 500000;
  if (band === "b3") return price > 500000;
  return true;
}

/** The /vendors browser: URL-driven filters, grid, load more, empty state. */
export function VendorBrowser({ vendors, categories, cities, budgets, sorts }: Props) {
  const [q] = useParamState("q");
  const [category] = useParamState("category");
  const [city] = useParamState("city");
  const [budget] = useParamState("budget");
  const [sort] = useParamState("sort");
  const clear = useClearParams(FILTER_KEYS);
  const [shown, setShown] = useState(PAGE);

  const key = [q, category, city, budget, sort].join("|");
  const deferredKey = useDeferredValue(key);
  const pending = deferredKey !== key;

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let result = vendors.filter((v) => {
      if (category && v.category !== category) return false;
      if (city && v.citySlug !== city) return false;
      if (budget && !inBand(v.startingPriceINR, budget)) return false;
      if (query && !v.search.includes(query)) return false;
      return true;
    });
    result = [...result];
    if (sort === "price-asc") result.sort((a, b) => (a.startingPriceINR ?? 0) - (b.startingPriceINR ?? 0));
    else if (sort === "price-desc") result.sort((a, b) => (b.startingPriceINR ?? 0) - (a.startingPriceINR ?? 0));
    else if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    else result.sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false));
    return result;
  }, [vendors, q, category, city, budget, sort]);

  const visible = filtered.slice(0, shown);
  const activeCount = [q, category, city, budget].filter(Boolean).length;
  const count = `${filtered.length} vendor${filtered.length === 1 ? "" : "s"}`;

  return (
    <div>
      <FilterBar
        count={count}
        activeCount={activeCount}
        onClear={clear}
        className="sticky top-0 z-30 md:top-nav"
      >
        <FilterSelect param="category" label="Category" options={categories} className="md:w-48" />
        <FilterSelect param="city" label="City" options={cities} allLabel="Anywhere" className="md:w-40" />
        <FilterSelect param="budget" label="Budget" options={budgets} allLabel="Any budget" className="md:w-44" />
        <FilterSelect param="sort" label="Sort" options={sorts} allLabel="Featured first" className="md:w-48" />
      </FilterBar>

      <div className="container-wide py-10 md:py-14">
        {q && (
          <p className="mb-8 font-serif text-h3">
            Results for &ldquo;{q}&rdquo;
          </p>
        )}
        {pending ? (
          <SkeletonCardGrid />
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              {visible.length === 0 ? (
                <EmptyState
                  title="No vendors match those filters yet."
                  text="Try a wider budget, another city, or clear the filters to see everyone."
                  action={{ label: "Clear all filters", onClick: clear }}
                />
              ) : (
                <ul className="grid grid-cols-2 gap-2 gap-y-8 xl:grid-cols-4">
                  {visible.map((vendor, i) => (
                    <li key={vendor.slug}>
                      <VendorCard vendor={vendor} priority={i < 4} />
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </AnimatePresence>
        )}
        <LoadMore shown={visible.length} total={filtered.length} onMore={() => setShown((s) => s + PAGE)} noun="vendors" />
      </div>
    </div>
  );
}
