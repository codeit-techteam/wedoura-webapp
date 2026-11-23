"use client";

import Link from "next/link";
import { useState } from "react";
import { BottomSheet } from "@/components/browse/BottomSheet";
import { FilterSelect } from "@/components/browse/FilterBar";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import {
  BUDGET_BANDS,
  STYLE_FILTERS,
  VENDOR_SORTS,
} from "@/lib/api";
import { patchedHref, clearedHref, type ParamRecord } from "@/lib/url";

/* ---------------------------------------------------------------- types */

interface Props {
  pathname: string;
  params: ParamRecord;
  /** Total result count. */
  total: number;
  /** Active filter count (not counting show/view). */
  activeCount: number;
}

/* --------------------------------------------------------------- style multi-select */

/** Toggle one style in the comma-separated `style` param. */
function toggleStyle(params: ParamRecord, style: string, pathname: string): string {
  const current = params.style ? params.style.split(",").filter(Boolean) : [];
  const next = current.includes(style)
    ? current.filter((s) => s !== style)
    : [...current, style];
  return patchedHref(pathname, params, { style: next.length ? next.join(",") : null, show: null });
}

/* --------------------------------------------------------------- sort button */

function SortButton({ params, pathname }: { params: ParamRecord; pathname: string }) {
  return (
    <FilterSelect
      param="sort"
      label="Sort"
      options={VENDOR_SORTS.map((s) => ({ value: s.value, label: s.label }))}
      allLabel="Recommended"
      pathname={pathname}
      params={params}
    />
  );
}

/* ---------------------------------------------------------- view toggle */

function ViewToggle({ params, pathname }: { params: ParamRecord; pathname: string }) {
  const view = params.view ?? "list";
  return (
    <div className="flex items-center gap-1 px-3">
      <Link
        href={patchedHref(pathname, params, { view: "list" })}
        scroll={false}
        aria-label="List view"
        className={cn(
          "tap flex size-8 items-center justify-center transition-chrome",
          view === "list" ? "text-ink" : "text-mute hover:text-ink",
        )}
      >
        <Icon name="menu" size={18} />
      </Link>
      <Link
        href={patchedHref(pathname, params, { view: "grid" })}
        scroll={false}
        aria-label="Grid view"
        className={cn(
          "tap flex size-8 items-center justify-center transition-chrome",
          view === "grid" ? "text-ink" : "text-mute hover:text-ink",
        )}
      >
        <Icon name="grid" size={18} />
      </Link>
    </div>
  );
}

/* ---------------------------------------------------------- style chips */

function StyleSelector({
  params,
  pathname,
  layout,
}: {
  params: ParamRecord;
  pathname: string;
  layout: "desktop" | "mobile";
}) {
  const active = params.style ? params.style.split(",").filter(Boolean) : [];

  if (layout === "desktop") {
    return (
      <div className="flex min-h-14 flex-col justify-center gap-0.5 px-4 py-2">
        <span className="label text-mute">Style</span>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {STYLE_FILTERS.map((s) => (
            <Link
              key={s}
              href={toggleStyle(params, s, pathname)}
              scroll={false}
              className={cn(
                "tap inline-flex items-center rounded-none border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.07em] transition-chrome",
                active.includes(s)
                  ? "border-ink bg-ink text-ivory"
                  : "border-line text-mute hover:border-ink hover:text-ink",
              )}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-line pb-5 last:border-0 last:pb-0">
      <p className="label text-mute">Style</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {STYLE_FILTERS.map((s) => (
          <Link
            key={s}
            href={toggleStyle(params, s, pathname)}
            scroll={false}
            onClick={() => {}} // BottomSheet handles close separately
            className={cn(
              "tap inline-flex items-center border px-3 py-1.5 text-small transition-chrome",
              active.includes(s)
                ? "border-ink bg-ink text-ivory"
                : "border-line text-mute hover:border-ink hover:text-ink",
            )}
          >
            {s}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ travels/picks toggles */

function MoreToggles({
  params,
  pathname,
}: {
  params: ParamRecord;
  pathname: string;
}) {
  const travelActive = params.travel === "1";
  const picksActive = params.picks === "1";
  return (
    <div className="flex min-h-14 flex-col justify-center gap-2 px-4 py-2">
      <span className="label text-mute">More</span>
      <div className="flex gap-3">
        <Link
          href={patchedHref(pathname, params, { travel: travelActive ? null : "1", show: null })}
          scroll={false}
          className={cn(
            "tap inline-flex items-center gap-1.5 border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.07em] transition-chrome",
            travelActive ? "border-ink bg-ink text-ivory" : "border-line text-mute hover:border-ink hover:text-ink",
          )}
        >
          Travels anywhere
        </Link>
        <Link
          href={patchedHref(pathname, params, { picks: picksActive ? null : "1", show: null })}
          scroll={false}
          className={cn(
            "tap inline-flex items-center gap-1.5 border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.07em] transition-chrome",
            picksActive ? "border-ink bg-ink text-ivory" : "border-line text-mute hover:border-ink hover:text-ink",
          )}
        >
          ✦ Wedoura picks
        </Link>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- active chips */

function ActiveChips({ params, pathname }: { params: ParamRecord; pathname: string }) {
  const chips: { label: string; clearKey: string; value: string }[] = [];

  if (params.budget) {
    const b = BUDGET_BANDS.find((x) => x.value === params.budget);
    if (b) chips.push({ label: b.label, clearKey: "budget", value: params.budget });
  }
  if (params.style) {
    for (const s of params.style.split(",").filter(Boolean)) {
      chips.push({ label: s, clearKey: `style:${s}`, value: s });
    }
  }
  if (params.travel === "1") chips.push({ label: "Travels anywhere", clearKey: "travel", value: "1" });
  if (params.picks === "1") chips.push({ label: "Wedoura picks", clearKey: "picks", value: "1" });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-2">
      {chips.map((chip) => {
        let href: string;
        if (chip.clearKey.startsWith("style:")) {
          const s = chip.clearKey.slice(6);
          href = toggleStyle(params, s, pathname);
        } else {
          href = patchedHref(pathname, params, { [chip.clearKey]: null });
        }
        return (
          <Link
            key={chip.clearKey}
            href={href}
            scroll={false}
            className="tap inline-flex items-center gap-1.5 border border-ink bg-ivory px-3 py-1 text-small text-ink transition-chrome hover:bg-ink hover:text-ivory"
          >
            {chip.label}
            <Icon name="close" size={12} />
          </Link>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- main bar */

export function VendorFilters({
  pathname,
  params,
  total,
  activeCount,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const count = `${total} vendor${total !== 1 ? "s" : ""}`;

  const clearHref =
    activeCount > 0
      ? clearedHref(pathname, params, ["q", "category", "city", "budget", "style", "travel", "picks", "sort", "show"])
      : undefined;

  return (
    <div className="sticky top-14 z-30 border-b border-line bg-white">
      {/* Mobile strip */}
      <div className="flex items-center justify-between gap-4 border-b border-line px-gutter py-2.5 md:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="tap inline-flex items-center gap-2 text-label-lg font-medium text-ink"
          aria-haspopup="dialog"
        >
          <Icon name="menu" size={18} />
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
        <p className="text-small text-mute" aria-live="polite">{count}</p>
      </div>

      {/* Desktop strap */}
      <div className="container-site hidden md:block">
        <div className="border border-line border-t-0 bg-white">
          <div className="flex items-stretch divide-x divide-line">
            {/* Budget */}
            <FilterSelect
              param="budget"
              label="Starting price"
              options={BUDGET_BANDS.map((b) => ({ value: b.value, label: b.label }))}
              allLabel="Any budget"
              pathname={pathname}
              params={params}
            />

            {/* Style */}
            <div className="flex-[2]">
              <StyleSelector params={params} pathname={pathname} layout="desktop" />
            </div>

            {/* More (travels + picks) */}
            <div className="flex-1">
              <MoreToggles params={params} pathname={pathname} />
            </div>

            {/* Sort */}
            <div className="w-44">
              <SortButton params={params} pathname={pathname} />
            </div>

            {/* Count + clear + view toggle */}
            <div className="flex shrink-0 items-center gap-3 px-4 py-2">
              <p className="text-small text-mute whitespace-nowrap" aria-live="polite">{count}</p>
              {clearHref && (
                <Link href={clearHref} scroll={false} className="link-draw text-small text-ink whitespace-nowrap">
                  Clear all
                </Link>
              )}
              <ViewToggle params={params} pathname={pathname} />
            </div>
          </div>

          {/* Active chips row */}
          <ActiveChips params={params} pathname={pathname} />
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filters">
        <div className="flex flex-col gap-5">
          <FilterSelect
            param="budget"
            label="Starting price"
            options={BUDGET_BANDS.map((b) => ({ value: b.value, label: b.label }))}
            allLabel="Any budget"
            pathname={pathname}
            params={params}
          />
          <StyleSelector params={params} pathname={pathname} layout="mobile" />
          <div className="border-b border-line pb-5">
            <p className="label text-mute mb-3">More filters</p>
            <div className="flex flex-col gap-2">
              <Link
                href={patchedHref(pathname, params, { travel: params.travel === "1" ? null : "1", show: null })}
                scroll={false}
                className={cn(
                  "tap inline-flex items-center gap-2 border px-4 py-2.5 text-small transition-chrome",
                  params.travel === "1" ? "border-ink bg-ink text-ivory" : "border-line text-mute",
                )}
              >
                Travels anywhere
              </Link>
              <Link
                href={patchedHref(pathname, params, { picks: params.picks === "1" ? null : "1", show: null })}
                scroll={false}
                className={cn(
                  "tap inline-flex items-center gap-2 border px-4 py-2.5 text-small transition-chrome",
                  params.picks === "1" ? "border-ink bg-ink text-ivory" : "border-line text-mute",
                )}
              >
                ✦ Wedoura picks only
              </Link>
            </div>
          </div>
          <FilterSelect
            param="sort"
            label="Sort"
            options={VENDOR_SORTS.map((s) => ({ value: s.value, label: s.label }))}
            allLabel="Recommended"
            pathname={pathname}
            params={params}
          />
        </div>
        {clearHref && (
          <Link
            href={clearHref}
            scroll={false}
            onClick={() => setSheetOpen(false)}
            className="link-draw mt-6 inline-block text-small text-ink"
          >
            Clear all filters
          </Link>
        )}
        <button
          type="button"
          onClick={() => setSheetOpen(false)}
          className="tap mt-5 w-full min-h-12 bg-ink font-sans text-button font-medium tracking-button uppercase text-ivory"
        >
          Show vendors
        </button>
      </BottomSheet>
    </div>
  );
}
