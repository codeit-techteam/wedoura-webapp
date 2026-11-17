"use client";

import { PhotoTile } from "@/components/cards/PhotoTile";
import { Reveal } from "@/components/motion/Reveal";
import type { Category } from "@/data/types";

type Props = { categories: (Category & { count?: number })[] };

/**
 * Six category tiles: snap carousel on small screens; from md, two rows of
 * three with staggered reveal and a quiet lift on hover or focus.
 */
export function CategoryTiles({ categories }: Props) {
  return (
    <ul
      className="no-scrollbar -mx-gutter flex snap-x snap-mandatory gap-2 overflow-x-auto px-gutter md:mx-0 md:grid md:grid-cols-3 md:gap-card-gap md:gap-y-14 md:snap-none md:overflow-visible md:px-0"
      aria-label="Vendor categories"
    >
      {categories.map((category, i) => (
        <Reveal
          as="li"
          key={category.slug}
          delay={i * 0.08}
          className="relative w-3/4 shrink-0 snap-start transition-transform duration-700 ease-wedoura md:w-auto md:shrink md:hover:z-10 md:hover:-translate-y-1 md:hover:scale-[1.02] md:focus-within:z-10 md:focus-within:-translate-y-1 md:focus-within:scale-[1.02]"
        >
          <div className="aspect-card overflow-hidden">
            <PhotoTile
              photo={category.cover}
              title={category.name}
              meta={category.count ? `${category.count} vendor${category.count === 1 ? "" : "s"}` : undefined}
              href={`/vendors?category=${category.slug}`}
              sizes="(min-width: 48rem) 33vw, 72vw"
            />
          </div>
        </Reveal>
      ))}
    </ul>
  );
}