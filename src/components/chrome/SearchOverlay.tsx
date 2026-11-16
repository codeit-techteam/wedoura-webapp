"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import type { NavCategory, NavCity, NavVendor } from "@/components/chrome/Navbar";
import { Wordmark } from "@/components/chrome/Wordmark";
import { Icon } from "@/components/ui/Icon";
import { Label } from "@/components/ui/Label";
import { useFocusTrap } from "@/lib/focus-trap";
import { EASE } from "@/lib/motion";

type Props = {
  open: boolean;
  onClose: () => void;
  categories: NavCategory[];
  cities: NavCity[];
  vendors: NavVendor[];
};

type Suggestion = { href: string; label: string; kind: string };

/**
 * Full-screen search. One large input with live suggestions from the data
 * layer (vendors, cities, categories); submitting routes to /vendors?q=.
 */
export function SearchOverlay({ open, onClose, categories, cities, vendors }: Props) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(-1);
  useFocusTrap(rootRef, open, inputRef);

  const cityNames = useMemo(() => new Map(cities.map((c) => [c.slug, c.name])), [cities]);

  const suggestions: Suggestion[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const matchedVendors = vendors
      .filter((v) => v.name.toLowerCase().includes(q))
      .slice(0, 5)
      .map((v) => ({
        href: `/vendors/${v.slug}`,
        label: v.name,
        kind: cityNames.get(v.citySlug) ?? "Vendor",
      }));
    const matchedCities = cities
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map((c) => ({ href: `/vendors?city=${c.slug}`, label: c.name, kind: "City" }));
    const matchedCategories = categories
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map((c) => ({ href: `/vendors?category=${c.slug}`, label: c.name, kind: "Category" }));
    return [...matchedVendors, ...matchedCities, ...matchedCategories];
  }, [query, vendors, cities, categories, cityNames]);

  const go = (href: string) => {
    router.push(href);
    setQuery("");
    setHighlight(-1);
    onClose();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (highlight >= 0 && suggestions[highlight]) {
      go(suggestions[highlight].href);
      return;
    }
    const q = query.trim();
    go(q ? `/vendors?q=${encodeURIComponent(q)}` : "/vendors");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
    }
  };

  const quickLink =
    "inline-flex tap items-center font-serif text-h3 text-ink transition-chrome hover:text-mute";
  const showSuggestions = query.trim().length > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={rootRef}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-white text-ink"
        >
          <div className="container-wide flex h-nav shrink-0 items-center justify-between border-b border-line">
            <Wordmark />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="-mr-2 inline-flex tap items-center justify-center gap-2 transition-chrome hover:opacity-70"
            >
              <span className="nav-link hidden md:inline">Close</span>
              <Icon name="close" size={24} />
            </button>
          </div>

          <form onSubmit={submit} className="container-site flex-1 py-section-sm">
            <label htmlFor="site-search" className="label text-mute">
              Search vendors, venues and cities
            </label>
            <div className="mt-6 flex items-end gap-4 border-b border-ink pb-4">
              <input
                ref={inputRef}
                id="site-search"
                name="q"
                type="text"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                role="combobox"
                aria-expanded={showSuggestions && suggestions.length > 0}
                aria-controls="search-suggestions"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlight(-1);
                }}
                onKeyDown={onKeyDown}
                placeholder="Photographers in Udaipur"
                className="w-full min-w-0 bg-transparent font-serif text-search outline-none placeholder:text-mute/50"
              />
              <button type="submit" aria-label="Search" className="inline-flex tap items-center justify-center transition-chrome hover:opacity-70">
                <Icon name="arrow-right" size={28} />
              </button>
            </div>

            {showSuggestions && (
              <ul id="search-suggestions" className="mt-6" aria-label="Suggestions">
                {suggestions.map((s, i) => (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      onClick={(e) => {
                        e.preventDefault();
                        go(s.href);
                      }}
                      onMouseEnter={() => setHighlight(i)}
                      className={`flex tap items-baseline justify-between gap-6 border-b border-line py-3 transition-colors duration-300 ease-wedoura ${
                        highlight === i ? "text-ink" : "text-mute hover:text-ink"
                      }`}
                    >
                      <span className="font-serif text-h3">{s.label}</span>
                      <span className="label">{s.kind}</span>
                    </Link>
                  </li>
                ))}
                {suggestions.length === 0 && (
                  <li className="py-6">
                    <p className="font-serif text-h3">Nothing matches &ldquo;{query.trim()}&rdquo; yet.</p>
                    <p className="mt-2 text-small text-mute">Press Enter to search all vendors instead.</p>
                  </li>
                )}
              </ul>
            )}

            {!showSuggestions && (
              <div className="mt-14 grid gap-14 md:grid-cols-2">
                <div>
                  <Label>Cities</Label>
                  <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-1">
                    {cities.map((city) => (
                      <li key={city.slug}>
                        <Link href={`/vendors?city=${city.slug}`} onClick={onClose} className={quickLink}>
                          {city.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Label>Categories</Label>
                  <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-1">
                    {categories.map((category) => (
                      <li key={category.slug}>
                        <Link href={`/vendors?category=${category.slug}`} onClick={onClose} className={quickLink}>
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
