"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { RailProgress } from "@/components/home/RailProgress";
import { Photo } from "@/components/media/Photo";
import type { Category } from "@/data/types";
import { cn } from "@/lib/cn";

type Props = { categories: Category[] };

/**
 * One full-width row of six tall photo tiles. The hovered or focused tile
 * widens while the others narrow. Mobile: a snap carousel with a progress
 * line instead of a scrollbar.
 */
export function CategoryTiles({ categories }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const railRef = useRef<HTMLUListElement>(null);

  const tile = (category: Category, overlayClass?: string) => (
    <>
      <Photo
        photo={category.cover}
        mode="cover"
        sizes="(min-width: 48rem) 30vw, 72vw"
        className="transition-transform duration-1200 ease-wedoura group-hover:scale-104"
      />
      <div
        aria-hidden="true"
        className={cn("absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-ink/75 to-transparent", overlayClass)}
      />
      <p className="absolute inset-x-0 bottom-0 p-5 font-serif text-h3 text-white md:p-6">{category.name}</p>
    </>
  );

  return (
    <div>
      {/* Mobile: snap carousel. */}
      <div className="md:hidden">
        <ul
          ref={railRef}
          className="no-scrollbar -mx-gutter flex snap-x snap-mandatory gap-2 overflow-x-auto px-gutter"
          aria-label="Vendor categories"
        >
          {categories.map((category) => (
            <li key={category.slug} className="w-3/4 shrink-0 snap-start">
              <Link
                href={`/vendors?category=${category.slug}`}
                className="group relative block aspect-3/4 overflow-hidden bg-ivory"
              >
                {tile(category)}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-5 px-gutter">
          <RailProgress railRef={railRef} />
        </div>
      </div>

      {/* Desktop: a single row where the hovered tile widens. */}
      <ul className="hidden gap-2 md:flex" aria-label="Vendor categories">
        {categories.map((category, i) => (
          <li
            key={category.slug}
            className="relative min-w-0 overflow-hidden transition-all duration-700 ease-wedoura"
            style={{ flexGrow: active === i ? 2.4 : 1, flexBasis: 0 }}
          >
            <Link
              href={`/vendors?category=${category.slug}`}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive((c) => (c === i ? null : c))}
              onFocus={() => setActive(i)}
              onBlur={() => setActive((c) => (c === i ? null : c))}
              className="group relative block h-[72vh] min-h-96 overflow-hidden bg-ivory"
            >
              {tile(category)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
