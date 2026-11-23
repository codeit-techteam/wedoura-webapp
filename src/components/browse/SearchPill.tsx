"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BottomSheet } from "@/components/browse/BottomSheet";
import { cn } from "@/lib/cn";

/* ---------------------------------------------------------------- types */

export type CityOption = { slug: string; name: string };
export type CategoryOption = { slug: string; name: string; icon?: string };
export type CategoryGroup = { group: string; categories: CategoryOption[] };

type Props = {
  cities?: CityOption[];
  categoryGroups?: CategoryGroup[];
  /** Initial city slug */
  city?: string;
  /** Initial category slug */
  category?: string;
  /** Show a "name" text field (vendors page mode). */
  nameSearch?: boolean;
  /** Initial name query */
  q?: string;
  className?: string;
};

type Panel = "where" | "what" | null;

/* ---------------------------------------------------------------- utils */

function cityName(cities: CityOption[], slug: string | undefined) {
  if (!slug) return "Anywhere in India";
  return cities.find((c) => c.slug === slug)?.name ?? "Anywhere in India";
}

function catName(groups: CategoryGroup[], slug: string | undefined) {
  if (!slug) return "All vendors";
  for (const g of groups) {
    const c = g.categories.find((c) => c.slug === slug);
    if (c) return c.name;
  }
  return "All vendors";
}

/* --------------------------------------------------------------- component */

export function SearchPill({
  cities = [],
  categoryGroups = [],
  city: initCity = "",
  category: initCat = "",
  nameSearch = false,
  q: initQ = "",
  className,
}: Props) {
  const router = useRouter();
  const [city, setCity] = useState(initCity);
  const [category, setCategory] = useState(initCat);
  const [q, setQ] = useState(initQ);
  const [panel, setPanel] = useState<Panel>(null);
  const [citySearch, setCitySearch] = useState("");
  const [catSearch, setCatSearch] = useState("");
  const pillRef = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    if (!panel) return;
    function onDown(e: MouseEvent) {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
        setPanel(null);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [panel]);

  /* Escape closes */
  useEffect(() => {
    if (!panel) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPanel(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panel]);

  function openPanel(p: Panel) {
    setPanel((prev) => (prev === p ? null : p));
  }

  function pickCity(slug: string) {
    setCity(slug);
    setCitySearch("");
    setPanel("what"); // auto-open what panel
  }

  function pickCategory(slug: string) {
    setCategory(slug);
    setCatSearch("");
    setPanel(null);
  }

  function submit() {
    setPanel(null);
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (category) params.set("category", category);
    if (nameSearch && q.trim()) params.set("q", q.trim());
    const qs = params.toString();
    router.push(qs ? `/vendors?${qs}` : "/vendors");
  }

  /* ----- filtered lists */
  const filteredCities = citySearch
    ? cities.filter((c) => c.name.toLowerCase().includes(citySearch.toLowerCase()))
    : cities;

  const filteredGroups = catSearch
    ? categoryGroups
        .map((g) => ({
          ...g,
          categories: g.categories.filter((c) =>
            c.name.toLowerCase().includes(catSearch.toLowerCase())
          ),
        }))
        .filter((g) => g.categories.length > 0)
    : categoryGroups;

  const noCategories = catSearch.length > 0 && filteredGroups.length === 0;

  /* ----- is mobile? use BottomSheet */
  // We detect via CSS — render both and show/hide with responsive classes.
  // For the popover, we render it in the pill container for desktop.

  const isDesktopWhereOpen = panel === "where";
  const isDesktopWhatOpen = panel === "what";

  return (
    <div ref={pillRef} className={cn("relative", className)}>
      {/* The pill bar */}
      <div
        className={cn(
          "flex flex-col items-stretch border border-line bg-white shadow-[0_22px_50px_rgba(20,14,12,0.10)] lg:flex-row",
          nameSearch ? "lg:grid lg:grid-cols-[1fr_1fr_1.2fr_auto]" : "lg:grid lg:grid-cols-[1fr_1.25fr_auto]",
        )}
      >
        {/* Vendors page: What | Where | Name. Home: Where | What. */}
        {nameSearch ? (
          <>
            <button
              type="button"
              onClick={() => openPanel("what")}
              aria-expanded={panel === "what"}
              aria-haspopup="listbox"
              className={cn(
                "tap flex min-h-20 flex-1 flex-col items-start justify-center gap-0.5 border-b border-line px-6 text-left hover:bg-ivory/60 lg:border-r lg:border-b-0",
                panel === "what" && "bg-ivory/60",
              )}
            >
              <span className="label text-gold-deep">What you need</span>
              <span className={cn("text-[1.125rem]", category ? "text-ink" : "text-mute")}>
                {catName(categoryGroups, category)}
              </span>
            </button>
            <button
              type="button"
              onClick={() => openPanel("where")}
              aria-expanded={panel === "where"}
              aria-haspopup="listbox"
              className={cn(
                "tap flex min-h-20 flex-1 flex-col items-start justify-center gap-0.5 border-b border-line px-6 text-left hover:bg-ivory/60 lg:border-r lg:border-b-0",
                panel === "where" && "bg-ivory/60",
              )}
            >
              <span className="label text-gold-deep">Where</span>
              <span className={cn("text-[1.125rem]", city ? "text-ink" : "text-mute")}>
                {cityName(cities, city)}
              </span>
            </button>
            <div className="flex min-h-20 flex-1 flex-col items-start justify-center gap-0.5 border-b border-line px-6 lg:border-r lg:border-b-0">
              <label className="label text-gold-deep" htmlFor="searchpill-name">
                Search by name
              </label>
              <input
                id="searchpill-name"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Search by name"
                className="w-full border-none bg-transparent text-[1.125rem] text-ink placeholder:text-mute focus:outline-none"
              />
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => openPanel("where")}
              aria-expanded={panel === "where"}
              aria-haspopup="listbox"
              className={cn(
                "tap flex min-h-20 flex-1 flex-col items-start justify-center gap-0.5 border-b border-line px-6 text-left hover:bg-ivory/60 lg:border-r lg:border-b-0",
                panel === "where" && "bg-ivory/60",
              )}
            >
              <span className="label text-gold-deep">Where</span>
              <span className={cn("text-[1.125rem]", city ? "text-ink" : "text-mute")}>
                {cityName(cities, city)}
              </span>
            </button>
            <button
              type="button"
              onClick={() => openPanel("what")}
              aria-expanded={panel === "what"}
              aria-haspopup="listbox"
              className={cn(
                "tap flex min-h-20 flex-1 flex-col items-start justify-center gap-0.5 border-b border-line px-6 text-left hover:bg-ivory/60 lg:border-b-0",
                panel === "what" && "bg-ivory/60",
              )}
            >
              <span className="label text-gold-deep">What you need</span>
              <span className={cn("text-[1.125rem]", category ? "text-ink" : "text-mute")}>
                {catName(categoryGroups, category)}
              </span>
            </button>
          </>
        )}

        <button
          type="button"
          onClick={submit}
          className="tap flex min-h-20 items-center justify-center bg-ink px-7 font-sans text-button font-medium tracking-button text-ivory uppercase transition-colors hover:bg-gold-deep lg:px-10"
        >
          {nameSearch ? "Search" : "Find vendors"}
        </button>
      </div>

      {/* ---- DESKTOP POPOVERS ---- */}
      {isDesktopWhereOpen && (
        <div
          role="dialog"
          aria-label="Where is your wedding?"
          className="absolute top-full left-0 z-40 mt-2 hidden w-80 overflow-hidden border border-line bg-white shadow-[0_22px_50px_rgba(20,14,12,0.14)] lg:block"
        >
          <div className="border-b border-line px-5 py-4">
            <p className="label text-mute mb-3">Where is your wedding?</p>
            <input
              autoFocus
              type="text"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              placeholder="Search cities…"
              className="w-full border-b border-line bg-transparent pb-2 text-[0.95rem] text-ink placeholder:text-mute/60 focus:outline-none"
            />
          </div>
          <ul className="max-h-72 overflow-y-auto py-2">
            <li>
              <button
                type="button"
                onClick={() => pickCity("")}
                className={cn(
                  "tap w-full px-5 py-2.5 text-left text-[0.95rem] hover:bg-ivory",
                  !city && "font-medium text-ink"
                )}
              >
                Anywhere in India
              </button>
            </li>
            {filteredCities.map((c) => (
              <li key={c.slug}>
                <button
                  type="button"
                  onClick={() => pickCity(c.slug)}
                  className={cn(
                    "tap w-full px-5 py-2.5 text-left text-[0.95rem] hover:bg-ivory",
                    city === c.slug && "font-medium text-ink"
                  )}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isDesktopWhatOpen && (
        <div
          role="dialog"
          aria-label="What do you need?"
          className={cn(
            "absolute top-full z-40 mt-2 hidden w-96 overflow-hidden border border-line bg-white shadow-[0_22px_50px_rgba(20,14,12,0.14)] lg:block",
            nameSearch ? "left-[calc(50%-12rem)]" : "left-[33%]"
          )}
        >
          <div className="border-b border-line px-5 py-4">
            <p className="label text-mute mb-3">What do you need?</p>
            <input
              autoFocus
              type="text"
              value={catSearch}
              onChange={(e) => setCatSearch(e.target.value)}
              placeholder={`Search categories — try "mehendi" or "DJ"`}
              className="w-full border-b border-line bg-transparent pb-2 text-[0.95rem] text-ink placeholder:text-mute/60 focus:outline-none"
            />
          </div>
          <div className="max-h-80 overflow-y-auto py-2">
            <button
              type="button"
              onClick={() => pickCategory("")}
              className={cn(
                "tap w-full px-5 py-2.5 text-left text-[0.95rem] hover:bg-ivory",
                !category && "font-medium text-ink"
              )}
            >
              All vendors
            </button>
            {noCategories ? (
              <p className="px-5 py-4 text-small text-mute">
                No category matches that. Try another word.
              </p>
            ) : (
              filteredGroups.map((g) => (
                <div key={g.group}>
                  <p className="label px-5 pt-4 pb-1 text-mute">{g.group}</p>
                  {g.categories.map((c) => (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => pickCategory(c.slug)}
                      className={cn(
                        "tap w-full px-5 py-2 text-left text-[0.95rem] hover:bg-ivory",
                        category === c.slug && "font-medium text-ink"
                      )}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ---- MOBILE BOTTOM SHEETS ---- */}
      <div className="lg:hidden">
        <BottomSheet open={panel === "where"} onClose={() => setPanel(null)} title="Where is your wedding?">
          <input
            type="text"
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            placeholder="Search cities…"
            className="mb-4 w-full border-b border-line bg-transparent pb-2 text-[0.95rem] text-ink placeholder:text-mute/60 focus:outline-none"
          />
          <ul className="space-y-0.5">
            <li>
              <button
                type="button"
                onClick={() => pickCity("")}
                className={cn("tap w-full py-3 text-left text-[0.95rem] hover:text-gold-deep", !city && "font-medium text-ink")}
              >
                Anywhere in India
              </button>
            </li>
            {filteredCities.map((c) => (
              <li key={c.slug}>
                <button
                  type="button"
                  onClick={() => pickCity(c.slug)}
                  className={cn("tap w-full py-3 text-left text-[0.95rem] hover:text-gold-deep", city === c.slug && "font-medium text-ink")}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </BottomSheet>

        <BottomSheet open={panel === "what"} onClose={() => setPanel(null)} title="What do you need?">
          <input
            type="text"
            value={catSearch}
            onChange={(e) => setCatSearch(e.target.value)}
            placeholder={`Search categories — try "mehendi" or "DJ"`}
            className="mb-4 w-full border-b border-line bg-transparent pb-2 text-[0.95rem] text-ink placeholder:text-mute/60 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => pickCategory("")}
            className={cn("tap mb-2 block w-full py-2.5 text-left text-[0.95rem] hover:text-gold-deep", !category && "font-medium text-ink")}
          >
            All vendors
          </button>
          {noCategories ? (
            <p className="text-small text-mute">No category matches that. Try another word.</p>
          ) : (
            filteredGroups.map((g) => (
              <div key={g.group} className="mt-4">
                <p className="label mb-1 text-mute">{g.group}</p>
                {g.categories.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => pickCategory(c.slug)}
                    className={cn("tap w-full py-2.5 text-left text-[0.95rem] hover:text-gold-deep", category === c.slug && "font-medium text-ink")}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            ))
          )}
        </BottomSheet>
      </div>
    </div>
  );
}
