"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BottomSheet } from "@/components/browse/BottomSheet";
import { FilterSelect } from "@/components/browse/FilterBar";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { BUDGET_BANDS, STYLE_FILTERS, VENDOR_SORTS } from "@/lib/api";
import { patchedHref, clearedHref, type ParamRecord } from "@/lib/url";

interface Props {
  pathname: string;
  params: ParamRecord;
  total: number;
  activeCount: number;
}

function toggleStyle(params: ParamRecord, style: string, pathname: string): string {
  const current = params.style ? params.style.split(",").filter(Boolean) : [];
  const next = current.includes(style)
    ? current.filter((s) => s !== style)
    : [...current, style];
  return patchedHref(pathname, params, { style: next.length ? next.join(",") : null, show: null });
}

const control =
  "tap inline-flex min-h-11 items-center gap-2 border border-line bg-white px-4 font-sans text-[0.9375rem] text-ink transition-chrome hover:border-ink";

const controlActive = "border-ink bg-ink text-ivory hover:border-ink";

function ViewToggle({ params, pathname }: { params: ParamRecord; pathname: string }) {
  const view = params.view ?? "list";
  return (
    <div className="flex border border-line" role="group" aria-label="View">
      <Link
        href={patchedHref(pathname, params, { view: "list" })}
        scroll={false}
        aria-label="List view"
        aria-pressed={view === "list"}
        className={cn(
          "tap flex size-11 items-center justify-center transition-chrome",
          view === "list" ? "bg-ink text-ivory" : "bg-white text-mute hover:text-ink",
        )}
      >
        <Icon name="menu" size={18} />
      </Link>
      <Link
        href={patchedHref(pathname, params, { view: "grid" })}
        scroll={false}
        aria-label="Grid view"
        aria-pressed={view === "grid"}
        className={cn(
          "tap flex size-11 items-center justify-center border-l border-line transition-chrome",
          view === "grid" ? "bg-ink text-ivory" : "bg-white text-mute hover:text-ink",
        )}
      >
        <Icon name="grid" size={18} />
      </Link>
    </div>
  );
}

/** Style filter as a popover of chips — keeps the strap one row tall. */
function StyleMenu({ params, pathname }: { params: ParamRecord; pathname: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = params.style ? params.style.split(",").filter(Boolean) : [];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(control, active.length > 0 && controlActive)}
      >
        Style
        {active.length > 0 ? <em className="not-italic text-gold">{active.length}</em> : null}
        <Icon name="chevron-down" size={12} className={cn("transition-chrome", open && "rotate-180")} />
      </button>
      {open ? (
        <div
          role="group"
          aria-label="Style"
          className="absolute top-[calc(100%+0.5rem)] left-0 z-40 min-w-[18rem] border border-line bg-white p-4"
        >
          <div className="flex flex-wrap gap-2">
            {STYLE_FILTERS.map((s) => (
              <Link
                key={s}
                href={toggleStyle(params, s, pathname)}
                scroll={false}
                className={cn(
                  "tap inline-flex min-h-11 items-center border px-4 text-[0.9375rem] transition-chrome",
                  active.includes(s)
                    ? "border-ink bg-ink text-ivory"
                    : "border-line bg-white text-ink hover:border-ink",
                )}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BudgetMenu({ params, pathname }: { params: ParamRecord; pathname: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const value = params.budget ?? "";
  const label = BUDGET_BANDS.find((b) => b.value === value)?.label;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(control, value && controlActive)}
      >
        Starting price
        {label ? <em className="not-italic text-gold">{label}</em> : null}
        <Icon name="chevron-down" size={12} className={cn("transition-chrome", open && "rotate-180")} />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute top-[calc(100%+0.5rem)] left-0 z-40 min-w-[14rem] border border-line bg-white py-1"
        >
          <li role="option" aria-selected={!value}>
            <Link
              href={patchedHref(pathname, params, { budget: null, show: null })}
              scroll={false}
              onClick={() => setOpen(false)}
              className={cn(
                "tap block px-4 py-2.5 text-[0.9375rem] hover:bg-ivory",
                !value ? "font-medium text-ink" : "text-mute",
              )}
            >
              Any budget
            </Link>
          </li>
          {BUDGET_BANDS.map((b) => (
            <li key={b.value} role="option" aria-selected={value === b.value}>
              <Link
                href={patchedHref(pathname, params, { budget: b.value, show: null })}
                scroll={false}
                onClick={() => setOpen(false)}
                className={cn(
                  "tap block border-t border-line px-4 py-2.5 text-[0.9375rem] hover:bg-ivory",
                  value === b.value ? "font-medium text-ink" : "text-ink",
                )}
              >
                {b.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function SortMenu({ params, pathname }: { params: ParamRecord; pathname: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const value = params.sort ?? "";
  const label = VENDOR_SORTS.find((s) => s.value === value)?.label ?? "Recommended";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={control}
      >
        <span className="text-mute">Sort</span>
        <b className="font-medium">{label}</b>
        <Icon name="chevron-down" size={12} className={cn("transition-chrome", open && "rotate-180")} />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute top-[calc(100%+0.5rem)] right-0 z-40 min-w-[14rem] border border-line bg-white py-1"
        >
          <li role="option" aria-selected={!value}>
            <Link
              href={patchedHref(pathname, params, { sort: null, show: null })}
              scroll={false}
              onClick={() => setOpen(false)}
              className={cn("tap flex justify-between px-4 py-2.5 text-[0.9375rem] hover:bg-ivory", !value && "font-medium")}
            >
              Recommended
              {!value ? <span className="text-gold-deep">✓</span> : null}
            </Link>
          </li>
          {VENDOR_SORTS.map((s) => (
            <li key={s.value} role="option" aria-selected={value === s.value}>
              <Link
                href={patchedHref(pathname, params, { sort: s.value, show: null })}
                scroll={false}
                onClick={() => setOpen(false)}
                className={cn(
                  "tap flex justify-between border-t border-line px-4 py-2.5 text-[0.9375rem] hover:bg-ivory",
                  value === s.value && "font-medium",
                )}
              >
                {s.label}
                {value === s.value ? <span className="text-gold-deep">✓</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ActiveChips({ params, pathname }: { params: ParamRecord; pathname: string }) {
  const chips: { label: string; clearKey: string }[] = [];

  if (params.budget) {
    const b = BUDGET_BANDS.find((x) => x.value === params.budget);
    if (b) chips.push({ label: b.label, clearKey: "budget" });
  }
  if (params.style) {
    for (const s of params.style.split(",").filter(Boolean)) {
      chips.push({ label: s, clearKey: `style:${s}` });
    }
  }
  if (params.travel === "1") chips.push({ label: "Travels anywhere", clearKey: "travel" });
  if (params.picks === "1") chips.push({ label: "Wedoura picks", clearKey: "picks" });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-3">
      {chips.map((chip) => {
        const href = chip.clearKey.startsWith("style:")
          ? toggleStyle(params, chip.clearKey.slice(6), pathname)
          : patchedHref(pathname, params, { [chip.clearKey]: null, show: null });
        return (
          <Link
            key={chip.clearKey}
            href={href}
            scroll={false}
            className="tap inline-flex min-h-9 items-center gap-2 bg-sand px-3.5 py-1 text-small text-ink"
          >
            {chip.label}
            <span aria-hidden="true" className="text-[0.6875rem] text-mute">
              ✕
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export function VendorFilters({ pathname, params, total, activeCount }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const count = `${total} vendor${total !== 1 ? "s" : ""}`;
  const travelActive = params.travel === "1";
  const picksActive = params.picks === "1";

  const clearHref =
    activeCount > 0
      ? clearedHref(pathname, params, ["q", "category", "city", "budget", "style", "travel", "picks", "sort", "show"])
      : undefined;

  return (
    <div className="sticky top-[var(--nav-h)] z-30 border-b border-line bg-ivory/95 backdrop-blur-md">
      {/* Mobile strip */}
      <div className="flex items-center justify-between gap-4 px-gutter py-2.5 md:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="tap inline-flex min-h-11 items-center gap-2 text-label-lg font-medium text-ink"
          aria-haspopup="dialog"
        >
          <Icon name="menu" size={18} />
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
        <p className="text-small text-mute" aria-live="polite">
          {count}
        </p>
      </div>

      {/* Desktop: one-row control bar matching the reference */}
      <div className="container-site hidden py-3 md:block">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <BudgetMenu params={params} pathname={pathname} />
            <StyleMenu params={params} pathname={pathname} />
            <Link
              href={patchedHref(pathname, params, { travel: travelActive ? null : "1", show: null })}
              scroll={false}
              className={cn(control, travelActive && controlActive)}
              aria-pressed={travelActive}
            >
              Travels anywhere
            </Link>
            <Link
              href={patchedHref(pathname, params, { picks: picksActive ? null : "1", show: null })}
              scroll={false}
              className={cn(control, picksActive && controlActive)}
              aria-pressed={picksActive}
            >
              ✦ Wedoura picks
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SortMenu params={params} pathname={pathname} />
            <p className="whitespace-nowrap text-small text-mute" aria-live="polite">
              {count}
            </p>
            {clearHref ? (
              <Link
                href={clearHref}
                scroll={false}
                className="border-b border-gold pb-0.5 font-sans text-[0.6875rem] font-medium tracking-[0.2em] uppercase"
              >
                Clear
              </Link>
            ) : null}
            <ViewToggle params={params} pathname={pathname} />
          </div>
        </div>
        <ActiveChips params={params} pathname={pathname} />
      </div>

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
          <div className="border-b border-line pb-5">
            <p className="label text-mute">Style</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {STYLE_FILTERS.map((s) => {
                const active = (params.style ?? "").split(",").filter(Boolean).includes(s);
                return (
                  <Link
                    key={s}
                    href={toggleStyle(params, s, pathname)}
                    scroll={false}
                    className={cn(
                      "tap inline-flex min-h-11 items-center border px-3 text-small transition-chrome",
                      active ? "border-ink bg-ink text-ivory" : "border-line text-mute",
                    )}
                  >
                    {s}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="border-b border-line pb-5">
            <p className="label text-mute mb-3">More filters</p>
            <div className="flex flex-col gap-2">
              <Link
                href={patchedHref(pathname, params, { travel: travelActive ? null : "1", show: null })}
                scroll={false}
                className={cn(
                  "tap inline-flex min-h-11 items-center border px-4 text-small",
                  travelActive ? "border-ink bg-ink text-ivory" : "border-line text-mute",
                )}
              >
                Travels anywhere
              </Link>
              <Link
                href={patchedHref(pathname, params, { picks: picksActive ? null : "1", show: null })}
                scroll={false}
                className={cn(
                  "tap inline-flex min-h-11 items-center border px-4 text-small",
                  picksActive ? "border-ink bg-ink text-ivory" : "border-line text-mute",
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
        {clearHref ? (
          <Link
            href={clearHref}
            scroll={false}
            onClick={() => setSheetOpen(false)}
            className="link-draw mt-6 inline-block text-small text-ink"
          >
            Clear all filters
          </Link>
        ) : null}
        <button
          type="button"
          onClick={() => setSheetOpen(false)}
          className="tap mt-5 w-full min-h-12 bg-ink font-sans text-button font-medium tracking-button text-ivory uppercase"
        >
          Show vendors
        </button>
      </BottomSheet>
    </div>
  );
}
