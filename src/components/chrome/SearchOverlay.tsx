"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { NavCategory, NavCity } from "@/components/chrome/Navbar";
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
};

/**
 * Full-screen search. One large input plus cities and categories as quick
 * links. Screen only: submitting routes to /vendors with query parameters.
 */
export function SearchOverlay({ open, onClose, categories, cities }: Props) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  useFocusTrap(rootRef, open, inputRef);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/vendors?q=${encodeURIComponent(q)}` : "/vendors");
    setQuery("");
    onClose();
  };

  const quickLink =
    "inline-flex tap items-center font-serif text-h3 leading-none text-ink transition-chrome hover:text-mute";

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
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Photographers in Udaipur"
                className="w-full min-w-0 bg-transparent font-serif text-search font-light outline-none placeholder:text-mute/50"
              />
              <button type="submit" aria-label="Search" className="inline-flex tap items-center justify-center transition-chrome hover:opacity-70">
                <Icon name="arrow-right" size={28} />
              </button>
            </div>

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
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
