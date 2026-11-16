"use client";

import { useState } from "react";
import { PhotoTile } from "@/components/cards/PhotoTile";
import type { Category } from "@/data/types";

type Props = { categories: Category[] };

/**
 * One full-width row of six tall photo tiles, rendered once: a snap carousel
 * below md, a single row from md where the hovered or focused tile widens.
 */
export function CategoryTiles({ categories }: Props) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <ul
      className="no-scrollbar -mx-gutter flex snap-x snap-mandatory gap-2 overflow-x-auto px-gutter md:mx-0 md:snap-none md:overflow-visible md:px-0"
      aria-label="Vendor categories"
    >
      {categories.map((category, i) => (
        <li
          key={category.slug}
          className="relative w-3/4 shrink-0 snap-start overflow-hidden transition-all duration-700 ease-wedoura md:w-auto md:min-w-0 md:shrink md:grow-(--grow) md:basis-0"
          style={{ "--grow": active === i ? 2.4 : 1 } as React.CSSProperties}
          onMouseEnter={() => setActive(i)}
          onMouseLeave={() => setActive((c) => (c === i ? null : c))}
          onFocus={() => setActive(i)}
          onBlur={() => setActive((c) => (c === i ? null : c))}
        >
          <div className="aspect-3/4 md:aspect-auto md:h-[72vh] md:min-h-96">
            <PhotoTile
              photo={category.cover}
              title={category.name}
              href={`/vendors?category=${category.slug}`}
              sizes="(min-width: 48rem) 30vw, 72vw"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
