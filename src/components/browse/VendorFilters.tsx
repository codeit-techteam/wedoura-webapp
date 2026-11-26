"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BUDGET_BANDS, STYLE_FILTERS, VENDOR_SORTS } from "@/lib/api";
import { clearedHref, patchedHref, type ParamRecord } from "@/lib/url";
import { cn } from "@/lib/cn";

type CategoryOpt = { slug: string; name: string; count: number };

interface Props {
  pathname: string;
  /** When set, Category filter/chips navigate here (bare `/vendors`) instead of a pinned route. */
  categoryPathname?: string;
  params: ParamRecord;
  total: number;
  activeCount: number;
  categories: CategoryOpt[];
  /** Category fixed by the route — filter control still shows the name. */
  pinnedCategory?: string;
}

const BUDGET_LABEL: Record<string, string> = {
  "under-1l": "Under ₹1 lakh",
  "1-3l": "₹1–3 lakh",
  "3-8l": "₹3–8 lakh",
  "8-plus": "₹8 lakh+",
  b1: "Under ₹1 lakh",
  b2: "₹1–5 lakh",
  b3: "₹5 lakh+",
};

function toggleStyle(params: ParamRecord, style: string, pathname: string): string {
  const current = params.style ? params.style.split(",").filter(Boolean) : [];
  const next = current.includes(style)
    ? current.filter((s) => s !== style)
    : [...current, style];
  return patchedHref(pathname, params, { style: next.length ? next.join(",") : null, show: null });
}

function useOutsideClose(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, onClose]);
  return ref;
}

export function VendorFilters({
  pathname,
  categoryPathname,
  params,
  activeCount,
  categories,
  pinnedCategory,
}: Props) {
  const catPath = categoryPathname ?? pathname;
  const [sheetOpen, setSheetOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [sortOpen, setSortOpen] = useState(false);

  const activeCategory = pinnedCategory ?? params.category ?? "";
  const catName = categories.find((c) => c.slug === activeCategory)?.name;
  const budget = params.budget ?? "";
  const budgetLabel = budget ? BUDGET_LABEL[budget] ?? BUDGET_BANDS.find((b) => b.value === budget)?.label : "";
  const styles = params.style ? params.style.split(",").filter(Boolean) : [];
  const styleLabel =
    styles.length === 0 ? "" : styles.length === 1 ? styles[0] : `${styles.length} styles`;
  const travelActive = params.travel === "1";
  const picksActive = params.picks === "1";
  const moreCount = (travelActive ? 1 : 0) + (picksActive ? 1 : 0);
  const sortValue = params.sort ?? "";
  const sortLabel = VENDOR_SORTS.find((s) => s.value === sortValue)?.label ?? "Recommended";
  const view = params.view === "grid" ? "grid" : "list";

  const clearHref = clearedHref(pathname, params, [
    "q",
    "category",
    "city",
    "budget",
    "style",
    "travel",
    "picks",
    "sort",
    "show",
  ]);

  const chips: { label: string; href: string; key: string }[] = [];
  if (params.category && !pinnedCategory && catName) {
    chips.push({
      label: catName,
      key: "cat",
      href: patchedHref(pathname, params, { category: null, show: null }),
    });
  }
  if (params.city) {
    chips.push({
      label: params.city,
      key: "city",
      href: patchedHref(pathname, params, { city: null, show: null }),
    });
  }
  if (params.q) {
    chips.push({
      label: `“${params.q}”`,
      key: "q",
      href: patchedHref(pathname, params, { q: null, show: null }),
    });
  }
  if (budget && budgetLabel) {
    chips.push({
      label: budgetLabel,
      key: "budget",
      href: patchedHref(pathname, params, { budget: null, show: null }),
    });
  }
  for (const s of styles) {
    chips.push({ label: s, key: `style:${s}`, href: toggleStyle(params, s, pathname) });
  }
  if (travelActive) {
    chips.push({
      label: "Travels for destination weddings",
      key: "travel",
      href: patchedHref(pathname, params, { travel: null, show: null }),
    });
  }
  if (picksActive) {
    chips.push({
      label: "Wedoura picks",
      key: "picks",
      href: patchedHref(pathname, params, { picks: null, show: null }),
    });
  }

  function toggleGroup(id: string) {
    setOpenGroup((prev) => (prev === id ? null : id));
    setSortOpen(false);
  }

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  const sortRef = useOutsideClose(sortOpen, () => setSortOpen(false));

  return (
    <>
      <div className="fbar" id="fbar">
        <aside className={cn("side", sheetOpen && "on")} id="side" aria-label="Filters">
          {/* Category */}
          <div className={cn("fgrp", openGroup === "fCat" && "open")} data-g="fCat">
            <button
              type="button"
              className={cn("fh", activeCategory && "act")}
              aria-expanded={openGroup === "fCat"}
              onClick={() => toggleGroup("fCat")}
            >
              <span>Category</span>
              <em>{catName && !pinnedCategory ? catName : ""}</em>
            </button>
            <div className="fpop">
              <div id="fCat">
                <Link
                  href={patchedHref(catPath, params, { category: null, show: null })}
                  scroll={false}
                  className="fl"
                  onClick={() => setOpenGroup(null)}
                  aria-current={!activeCategory ? "true" : undefined}
                >
                  All vendors
                  <small>{categories.reduce((n, c) => n + c.count, 0)}</small>
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={patchedHref(catPath, params, { category: c.slug, show: null })}
                    scroll={false}
                    className={cn("fl", c.count === 0 && "dim")}
                    onClick={() => setOpenGroup(null)}
                    aria-current={activeCategory === c.slug ? "true" : undefined}
                  >
                    {c.name}
                    <small>{c.count}</small>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Starting price */}
          <div className={cn("fgrp", openGroup === "fBud" && "open")} data-g="fBud">
            <button
              type="button"
              className={cn("fh", budget && "act")}
              aria-expanded={openGroup === "fBud"}
              onClick={() => toggleGroup("fBud")}
            >
              <span>Starting price</span>
              <em>{budgetLabel}</em>
            </button>
            <div className="fpop">
              <div className="pills" id="fBud">
                <Link
                  href={patchedHref(pathname, params, { budget: null, show: null })}
                  scroll={false}
                  className="pill"
                  aria-pressed={!budget}
                  onClick={() => setOpenGroup(null)}
                >
                  Any
                </Link>
                {BUDGET_BANDS.map((b) => (
                  <Link
                    key={b.value}
                    href={patchedHref(pathname, params, { budget: b.value, show: null })}
                    scroll={false}
                    className="pill"
                    aria-pressed={budget === b.value}
                    onClick={() => setOpenGroup(null)}
                  >
                    {BUDGET_LABEL[b.value] ?? b.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Style */}
          <div className={cn("fgrp", openGroup === "fStyle" && "open")} data-g="fStyle">
            <button
              type="button"
              className={cn("fh", styles.length > 0 && "act")}
              aria-expanded={openGroup === "fStyle"}
              onClick={() => toggleGroup("fStyle")}
            >
              <span>Style</span>
              <em>{styleLabel}</em>
            </button>
            <div className="fpop">
              <div className="pills" id="fStyle">
                {STYLE_FILTERS.map((s) => (
                  <Link
                    key={s}
                    href={toggleStyle(params, s, pathname)}
                    scroll={false}
                    className="pill"
                    aria-pressed={styles.includes(s)}
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* More */}
          <div className={cn("fgrp", openGroup === "fMore" && "open")} data-g="fMore">
            <button
              type="button"
              className={cn("fh", moreCount > 0 && "act")}
              aria-expanded={openGroup === "fMore"}
              onClick={() => toggleGroup("fMore")}
            >
              <span>More</span>
              <em>{moreCount > 0 ? String(moreCount) : ""}</em>
            </button>
            <div className="fpop">
              <Link
                href={patchedHref(pathname, params, {
                  travel: travelActive ? null : "1",
                  show: null,
                })}
                scroll={false}
                className="tgl"
                aria-pressed={travelActive}
              >
                Travels for destination weddings
                <i />
              </Link>
              <Link
                href={patchedHref(pathname, params, {
                  picks: picksActive ? null : "1",
                  show: null,
                })}
                scroll={false}
                className="tgl"
                aria-pressed={picksActive}
              >
                Wedoura picks only
                <i />
              </Link>
            </div>
          </div>

          <div className="sidefoot">
            <Link href={clearHref} scroll={false} className="clr" onClick={() => setSheetOpen(false)}>
              Clear all
            </Link>
            <button type="button" className="btn" onClick={() => setSheetOpen(false)}>
              Show vendors
            </button>
          </div>
        </aside>

        <div className="tools">
          <button type="button" className="fbtn" id="fOpen" onClick={() => setSheetOpen(true)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
              <circle cx="16" cy="6" r="2" />
              <circle cx="10" cy="12" r="2" />
              <circle cx="18" cy="18" r="2" />
            </svg>
            Filters
            <i>{activeCount > 0 ? activeCount : ""}</i>
          </button>

          <div className="sortw" ref={sortRef}>
            <button
              type="button"
              className="sortb"
              aria-haspopup="menu"
              aria-expanded={sortOpen}
              onClick={() => {
                setSortOpen((v) => !v);
                setOpenGroup(null);
              }}
            >
              Sort: <b>{sortLabel}</b>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {sortOpen ? (
              <div className="sortm" role="menu">
                <Link
                  href={patchedHref(pathname, params, { sort: null, show: null })}
                  scroll={false}
                  role="menuitem"
                  data-active={!sortValue ? "true" : undefined}
                  onClick={() => setSortOpen(false)}
                >
                  Recommended
                </Link>
                {VENDOR_SORTS.filter((s) => s.value !== "featured").map((s) => (
                  <Link
                    key={s.value}
                    href={patchedHref(pathname, params, { sort: s.value, show: null })}
                    scroll={false}
                    role="menuitem"
                    data-active={sortValue === s.value ? "true" : undefined}
                    onClick={() => setSortOpen(false)}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <div className="view" role="group" aria-label="Layout">
            <Link
              href={patchedHref(pathname, params, { view: "list" })}
              scroll={false}
              aria-label="List view"
              aria-pressed={view === "list"}
            >
              <svg viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="7" />
                <rect x="3" y="13" width="18" height="7" />
              </svg>
            </Link>
            <Link
              href={patchedHref(pathname, params, { view: "grid" })}
              scroll={false}
              aria-label="Grid view"
              aria-pressed={view === "grid"}
            >
              <svg viewBox="0 0 24 24">
                <rect x="3" y="3" width="8" height="8" />
                <rect x="13" y="3" width="8" height="8" />
                <rect x="3" y="13" width="8" height="8" />
                <rect x="13" y="13" width="8" height="8" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div
        className="fbg"
        id="fbg"
        hidden={!sheetOpen}
        onClick={() => setSheetOpen(false)}
        aria-hidden
      />

      {/* Results line + chips live in VendorBrowse; chips helper exported via props render below when used inline */}
      {chips.length > 0 ? (
        <div className="vh" aria-hidden>
          {/* chips rendered in results cline by VendorBrowse using same params */}
        </div>
      ) : null}
    </>
  );
}

/** Removable filter chips for the results line. */
export function VendorFilterChips({
  pathname,
  params,
  cityName,
  categoryName,
  pinnedCategory,
}: {
  pathname: string;
  params: ParamRecord;
  cityName?: string;
  categoryName?: string;
  pinnedCategory?: string;
}) {
  const chips: { label: string; href: string; key: string }[] = [];

  if (params.category && !pinnedCategory && categoryName) {
    chips.push({
      label: categoryName,
      key: "cat",
      href: patchedHref(pathname, params, { category: null, show: null }),
    });
  }
  if (params.city && cityName) {
    chips.push({
      label: cityName,
      key: "city",
      href: patchedHref(pathname, params, { city: null, show: null }),
    });
  }
  if (params.q) {
    chips.push({
      label: `“${params.q}”`,
      key: "q",
      href: patchedHref(pathname, params, { q: null, show: null }),
    });
  }
  if (params.budget) {
    const label = BUDGET_LABEL[params.budget] ?? params.budget;
    chips.push({
      label,
      key: "budget",
      href: patchedHref(pathname, params, { budget: null, show: null }),
    });
  }
  if (params.style) {
    for (const s of params.style.split(",").filter(Boolean)) {
      chips.push({ label: s, key: `style:${s}`, href: toggleStyle(params, s, pathname) });
    }
  }
  if (params.travel === "1") {
    chips.push({
      label: "Travels for destination weddings",
      key: "travel",
      href: patchedHref(pathname, params, { travel: null, show: null }),
    });
  }
  if (params.picks === "1") {
    chips.push({
      label: "Wedoura picks",
      key: "picks",
      href: patchedHref(pathname, params, { picks: null, show: null }),
    });
  }

  if (chips.length === 0) return null;

  const clearHref = clearedHref(pathname, params, [
    "q",
    "category",
    "city",
    "budget",
    "style",
    "travel",
    "picks",
    "show",
  ]);

  return (
    <div className="chips">
      {chips.map((c) => (
        <Link key={c.key} href={c.href} scroll={false} className="chip">
          {c.label}
        </Link>
      ))}
      <Link href={clearHref} scroll={false} className="clr">
        Clear all
      </Link>
    </div>
  );
}
