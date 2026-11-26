"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { BottomSheet } from "@/components/browse/BottomSheet";
import { cn } from "@/lib/cn";
import type { CategoryGroup, CityOption } from "@/components/browse/SearchPill";

type Props = {
  cities: CityOption[];
  categoryGroups: CategoryGroup[];
  city?: string;
  category?: string;
  q?: string;
  panel: "where" | "what" | null;
  onPanelChange: (panel: "where" | "what" | null) => void;
};

function cityLabel(cities: CityOption[], slug: string | undefined) {
  if (!slug) return "Anywhere in India";
  return cities.find((c) => c.slug === slug)?.name ?? "Anywhere in India";
}

function catLabel(groups: CategoryGroup[], slug: string | undefined) {
  if (!slug) return "All vendors";
  for (const g of groups) {
    const c = g.categories.find((x) => x.slug === slug);
    if (c) return c.name;
  }
  return "All vendors";
}

const Chev = () => (
  <svg className="chev" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

/**
 * Find-vendors search bar (What / Where / name / Search) for /vendors only.
 * Remount via key when URL city/category/q change so draft state resets.
 */
export function VendorsSearch({
  cities,
  categoryGroups,
  city: initCity = "",
  category: initCat = "",
  q: initQ = "",
  panel,
  onPanelChange,
}: Props) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const catId = useId();
  const locId = useId();

  const [city, setCity] = useState(initCity);
  const [category, setCategory] = useState(initCat);
  const [q, setQ] = useState(initQ);
  const [citySearch, setCitySearch] = useState("");
  const [catSearch, setCatSearch] = useState("");
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const sync = () => setIsNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!panel || isNarrow) return;
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) onPanelChange(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onPanelChange(null);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [panel, isNarrow, onPanelChange]);

  function submit() {
    onPanelChange(null);
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (category) params.set("category", category);
    if (q.trim()) params.set("q", q.trim());
    const qs = params.toString();
    router.push(qs ? `/vendors?${qs}` : "/vendors");
  }

  const filteredCities = citySearch
    ? cities.filter((c) => c.name.toLowerCase().includes(citySearch.toLowerCase()))
    : cities;

  const filteredGroups = catSearch
    ? categoryGroups
        .map((g) => ({
          ...g,
          categories: g.categories.filter((c) =>
            c.name.toLowerCase().includes(catSearch.toLowerCase()),
          ),
        }))
        .filter((g) => g.categories.length > 0)
    : categoryGroups;

  const noCategories = catSearch.length > 0 && filteredGroups.length === 0;

  const wherePanel = (
    <>
      <div className="sh">
        <span>Where is your wedding?</span>
        <button type="button" className="shx" onClick={() => onPanelChange(null)}>
          Close
        </button>
      </div>
      <div className="ps">
        <SearchIcon />
        <input
          type="text"
          value={citySearch}
          onChange={(e) => setCitySearch(e.target.value)}
          placeholder="Search a city"
          aria-label="Search a city"
          autoComplete="off"
        />
      </div>
      <div className="pgrid">
        <h4>Cities</h4>
        <button
          type="button"
          className={cn("opt", !city && "on")}
          onClick={() => {
            setCity("");
            setCitySearch("");
            onPanelChange("what");
          }}
        >
          Anywhere in India
        </button>
        {filteredCities.map((c) => (
          <button
            key={c.slug}
            type="button"
            className={cn("opt", city === c.slug && "on")}
            onClick={() => {
              setCity(c.slug);
              setCitySearch("");
              onPanelChange("what");
            }}
          >
            {c.name}
          </button>
        ))}
      </div>
    </>
  );

  const whatPanel = (
    <>
      <div className="sh">
        <span>What do you need?</span>
        <button type="button" className="shx" onClick={() => onPanelChange(null)}>
          Close
        </button>
      </div>
      <div className="ps">
        <SearchIcon />
        <input
          type="text"
          value={catSearch}
          onChange={(e) => setCatSearch(e.target.value)}
          placeholder="Search categories"
          aria-label="Search categories"
          autoComplete="off"
        />
        <button
          type="button"
          className={cn("all", !category && "on")}
          onClick={() => {
            setCategory("");
            setCatSearch("");
            onPanelChange(null);
          }}
        >
          All vendors
        </button>
      </div>
      {noCategories ? (
        <p className="empty" style={{ padding: "20px 22px" }}>
          No category matches that. Try another word.
        </p>
      ) : (
        <div className="cgrid">
          {filteredGroups.map((g) => (
            <div key={g.group} className="grp">
              <h4>{g.group}</h4>
              {g.categories.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  className={cn("opt", category === c.slug && "on")}
                  onClick={() => {
                    setCategory(c.slug);
                    setCatSearch("");
                    onPanelChange(null);
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="vsearch" ref={rootRef}>
      <div className="srch">
        <div className="dd" id="ddCat">
          <button
            className="trig"
            type="button"
            aria-haspopup="dialog"
            aria-expanded={panel === "what"}
            aria-controls={catId}
            onClick={() => onPanelChange(panel === "what" ? null : "what")}
          >
            <span className="lbl">What you need</span>
            <span className="val">{catLabel(categoryGroups, category)}</span>
            <Chev />
          </button>
          {!isNarrow && panel === "what" ? (
            <div className="panel pc" id={catId} role="dialog" aria-label="Choose a vendor category">
              {whatPanel}
            </div>
          ) : null}
        </div>

        <div className="dd" id="ddLoc">
          <button
            className="trig"
            type="button"
            aria-haspopup="dialog"
            aria-expanded={panel === "where"}
            aria-controls={locId}
            onClick={() => onPanelChange(panel === "where" ? null : "where")}
          >
            <span className="lbl">Where</span>
            <span className="val">{cityLabel(cities, city)}</span>
            <Chev />
          </button>
          {!isNarrow && panel === "where" ? (
            <div className="panel pl" id={locId} role="dialog" aria-label="Choose a location">
              {wherePanel}
            </div>
          ) : null}
        </div>

        <label className="nm">
          <SearchIcon />
          <span className="vh">Search by name</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Search by name"
            autoComplete="off"
          />
        </label>

        <button className="btn" type="button" onClick={submit}>
          Search
        </button>
      </div>

      {isNarrow ? (
        <>
          <BottomSheet open={panel === "where"} onClose={() => onPanelChange(null)} title="Where is your wedding?">
            <div className="vendors-dir">{wherePanel}</div>
          </BottomSheet>
          <BottomSheet open={panel === "what"} onClose={() => onPanelChange(null)} title="What do you need?">
            <div className="vendors-dir">{whatPanel}</div>
          </BottomSheet>
        </>
      ) : null}
    </div>
  );
}
