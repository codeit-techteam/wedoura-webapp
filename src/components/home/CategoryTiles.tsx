"use client";

import { useState } from "react";
import { Rail } from "@/components/browse/Rail";
import { PhotoTile } from "@/components/cards/PhotoTile";
import type { Category } from "@/data/types";

type Props = { categories: Category[] };

/**
 * One full-width row of six tall photo tiles. The hovered or focused tile
 * widens while the others narrow. Mobile: a snap carousel.
 */
export function CategoryTiles({ categories }: Props) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div>
      {/* Mobile: snap carousel. */}
      <div className="md:hidden">
        <Rail label="Vendor categories" itemClassName="w-3/4" arrows={false} bleed>
          {categories.map((category) => (
            <div key={category.slug} className="aspect-3/4">
              <PhotoTile
                photo={category.cover}
                title={category.name}
                href={`/vendors?category=${category.slug}`}
                sizes="72vw"
              />
            </div>
          ))}
        </Rail>
      </div>

      {/* Desktop: a single row where the hovered tile widens. */}
      <ul className="hidden gap-2 md:flex" aria-label="Vendor categories">
        {categories.map((category, i) => (
          <li
            key={category.slug}
            className="relative min-w-0 overflow-hidden transition-all duration-700 ease-wedoura"
            style={{ flexGrow: active === i ? 2.4 : 1, flexBasis: 0 }}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive((c) => (c === i ? null : c))}
            onFocus={() => setActive(i)}
            onBlur={() => setActive((c) => (c === i ? null : c))}
          >
            <div className="h-[72vh] min-h-96">
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
    </div>
  );
}
