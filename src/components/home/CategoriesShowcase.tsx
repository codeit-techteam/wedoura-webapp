"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { Photo } from "@/components/media/Photo";
import { PhotoCard } from "@/components/media/PhotoCard";
import type { Category } from "@/data/types";
import { EASE } from "@/lib/motion";

type Props = { categories: Category[] };

/**
 * Desktop: the six category names as a large serif index on the left; the
 * hovered or focused name crossfades a photograph on the right.
 * Mobile: a horizontal snap-scroll row of tall cards.
 */
export function CategoriesShowcase({ categories }: Props) {
  const [active, setActive] = useState(0);

  return (
    <div>
      {/* Mobile: snap-scroll rail of tall cards. */}
      <ul
        className="-mx-gutter flex snap-x snap-mandatory gap-4 overflow-x-auto px-gutter pb-2 md:hidden"
        aria-label="Vendor categories"
      >
        {categories.map((category) => (
          <li key={category.slug} className="w-3/5 shrink-0 snap-start">
            <PhotoCard
              photo={category.cover}
              ratio="3/4"
              sizes="60vw"
              href={`/vendors?category=${category.slug}`}
              title={category.name}
              compact
            />
          </li>
        ))}
      </ul>

      {/* Desktop: serif index + crossfading photograph. */}
      <div className="hidden items-start gap-16 md:grid md:grid-cols-[1.1fr_1fr] xl:gap-24">
        <ul aria-label="Vendor categories">
          {categories.map((category, i) => (
            <li key={category.slug} className="border-b border-line first:border-t">
              <Link
                href={`/vendors?category=${category.slug}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className="group flex items-baseline justify-between gap-6 py-5 outline-offset-4"
                aria-current={active === i ? "true" : undefined}
              >
                <span
                  className={`font-serif text-h2 leading-none transition-colors duration-300 ease-wedoura ${
                    active === i ? "text-ink" : "text-mute"
                  }`}
                >
                  {category.name}
                </span>
                <span
                  className={`max-w-56 text-right text-small text-mute transition-opacity duration-300 ease-wedoura ${
                    active === i ? "opacity-100" : "opacity-0"
                  }`}
                  aria-hidden="true"
                >
                  {category.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="relative aspect-4/5 overflow-hidden bg-ivory" aria-hidden="true">
          <AnimatePresence initial={false}>
            <motion.div
              key={categories[active].slug}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <Photo
                photo={categories[active].cover}
                mode="cover"
                sizes="(min-width: 48rem) 40vw, 100vw"
                className="h-full w-full"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
