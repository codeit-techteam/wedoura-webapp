"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { NavCategory, NavCity } from "@/components/chrome/Navbar";
import { Wordmark } from "@/components/chrome/Wordmark";
import { Icon } from "@/components/ui/Icon";
import { Label } from "@/components/ui/Label";
import type { SearchSuggestions } from "@/lib/api";
import { useFocusTrap } from "@/lib/focus-trap";
import { EASE } from "@/lib/motion";

type Props = {
  open: boolean;
  onClose: () => void;
  categories: NavCategory[];
  cities: NavCity[];
};

type Suggestion = { href: string; label: string; kind: string };

const DEBOUNCE_MS = 200;

/**
 * Full-screen search. A bordered bar like the hero (icon, field, Search),
 * live suggestions, and city/category shortcuts when the field is empty.
 */
export function SearchOverlay({ open, onClose, categories, cities }: Props) {
  // The panel unmounts on close, so query and suggestion state reset
  // naturally — no reset effect needed.
  return (
    <AnimatePresence>
      {open && <SearchPanel onClose={onClose} categories={categories} cities={cities} />}
    </AnimatePresence>
  );
}

function SearchPanel({ onClose, categories, cities }: Omit<Props, "open">) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(-1);
  // The last fetched results, tagged with the query they answer; everything
  // else (loading, emptiness) is derived at render time.
  const [results, setResults] = useState<{ query: string; items: Suggestion[] } | null>(null);
  useFocusTrap(rootRef, true, inputRef);

  // Suggestions come from /api/search (capped server-side), debounced, so
  // the vendor index never ships with the page.
  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as SearchSuggestions;
        setResults({
          query: q,
          items: [
            ...data.vendors.map((v) => ({
              href: v.category === "venues" ? `/venues/${v.slug}` : `/vendors/${v.slug}`,
              label: v.name,
              kind: v.cityName,
            })),
            ...data.cities.map((c) => ({ href: `/vendors?city=${c.slug}`, label: c.name, kind: "City" })),
            ...data.categories.map((c) => ({ href: `/vendors?category=${c.slug}`, label: c.name, kind: "Category" })),
          ],
        });
      } catch {
        // Aborted or offline: keep whatever is shown; Enter still searches.
      }
    }, DEBOUNCE_MS);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  const settled = results?.query === query.trim();
  const suggestions = query.trim() && results ? results.items : [];

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
    "link-draw inline-flex min-h-10 items-center font-serif text-h3 text-ink transition-chrome hover:text-mute";
  const showSuggestions = query.trim().length > 0;

  return (
        <motion.div
          ref={rootRef}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          data-lenis-prevent
          className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-white text-ink"
        >
          <div className="container-wide flex h-nav shrink-0 items-center justify-between border-b border-line bg-white">
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

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-ivory">
            <form onSubmit={submit} className="container-site flex min-h-full flex-col justify-center py-section-sm">
              <div className="mx-auto w-full max-w-(--container-hero-search)">
                <Label className="text-mute">Search vendors, venues and cities</Label>

                <div className="mt-4 grid h-16 grid-cols-[auto_1fr_auto] items-stretch border border-line bg-white shadow-none md:h-[4.5rem]">
                  <span
                    className="flex items-center justify-center border-r border-line px-5 text-mute md:px-6"
                    aria-hidden="true"
                  >
                    <Icon name="search" size={20} />
                  </span>
                  <input
                    ref={inputRef}
                    id="site-search"
                    name="q"
                    type="search"
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
                    className="min-w-0 bg-transparent px-4 font-sans text-body-lg text-ink outline-none placeholder:text-mute/60 md:px-6"
                  />
                  <button
                    type="submit"
                    className="tap flex items-center justify-center gap-3 bg-ink px-5 text-white transition-chrome hover:bg-black md:px-9"
                  >
                    <Icon name="search" size={18} className="md:hidden" />
                    <span className="label hidden md:inline">Search</span>
                    <span className="sr-only md:hidden">Search</span>
                  </button>
                </div>

                {showSuggestions && (suggestions.length > 0 || settled) && (
                  <div className="mt-2 border border-line bg-white">
                    <ul id="search-suggestions" className="divide-y divide-line" aria-label="Suggestions">
                      {suggestions.map((s, i) => (
                        <li key={`${s.kind}-${s.href}`}>
                          <Link
                            href={s.href}
                            onClick={(e) => {
                              e.preventDefault();
                              go(s.href);
                            }}
                            onMouseEnter={() => setHighlight(i)}
                            className={`flex tap items-baseline justify-between gap-6 px-5 py-4 transition-colors duration-300 ease-wedoura md:px-6 ${
                              highlight === i ? "bg-ivory text-ink" : "text-mute hover:bg-ivory hover:text-ink"
                            }`}
                          >
                            <span className="font-serif text-h3">{s.label}</span>
                            <span className="label">{s.kind}</span>
                          </Link>
                        </li>
                      ))}
                      {settled && suggestions.length === 0 && (
                        <li className="px-5 py-8 md:px-6">
                          <p className="font-serif text-h3">Nothing matches &ldquo;{query.trim()}&rdquo; yet.</p>
                          <p className="mt-2 text-small text-mute">Press Enter to search all vendors instead.</p>
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {!showSuggestions && (
                  <div className="mt-10 grid gap-6 md:grid-cols-2 md:gap-8">
                    <div className="border border-line bg-white p-6 md:p-8">
                      <Label>Cities</Label>
                      <ul className="mt-5 flex flex-col gap-1">
                        {cities.map((city) => (
                          <li key={city.slug}>
                            <Link href={`/vendors?city=${city.slug}`} onClick={onClose} className={quickLink}>
                              {city.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="border border-line bg-white p-6 md:p-8">
                      <Label>Categories</Label>
                      <ul className="mt-5 flex flex-col gap-1">
                        {categories.map((category) => (
                          <li key={category.slug}>
                            <Link
                              href={`/vendors?category=${category.slug}`}
                              onClick={onClose}
                              className={quickLink}
                            >
                              {category.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </motion.div>
  );
}