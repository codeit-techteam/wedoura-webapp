"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import Link from "next/link";
import { useState, type PointerEvent } from "react";
import { Photo } from "@/components/media/Photo";
import { PhotoCard } from "@/components/media/PhotoCard";
import type { City } from "@/data/types";

type Props = { cities: City[] };

/**
 * Desktop: large serif city names in a list; a small photograph follows the
 * pointer over the hovered city. Mobile: a two-column photo grid.
 */
export function CitiesIndex({ cities }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 200, damping: 30, mass: 0.6 });
  const y = useSpring(rawY, { stiffness: 200, damping: 30, mass: 0.6 });

  function onPointerMove(e: PointerEvent) {
    if (e.pointerType !== "mouse") return;
    rawX.set(e.clientX);
    rawY.set(e.clientY);
  }

  const showFloater = active !== null && !reduce;

  return (
    <div>
      {/* Mobile: two-column photo grid. */}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:hidden" aria-label="Cities">
        {cities.map((city) => (
          <li key={city.slug}>
            <PhotoCard
              photo={city.cover}
              ratio="4/5"
              sizes="50vw"
              href={`/vendors?city=${city.slug}`}
              title={city.name}
              meta={city.state !== city.name ? city.state : undefined}
              compact
            />
          </li>
        ))}
      </ul>

      {/* Desktop: serif index with a pointer-following photograph. */}
      <div className="relative hidden md:block" onPointerMove={onPointerMove} onPointerLeave={() => setActive(null)}>
        <ul aria-label="Cities">
          {cities.map((city, i) => (
            <li key={city.slug} className="border-b border-line first:border-t">
              <Link
                href={`/vendors?city=${city.slug}`}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive((current) => (current === i ? null : current))}
                onFocus={() => setActive(i)}
                onBlur={() => setActive((current) => (current === i ? null : current))}
                className="group flex items-baseline gap-8 py-6 outline-offset-4"
              >
                <span
                  className={`font-serif text-h1 leading-none transition-colors duration-300 ease-wedoura ${
                    active === null || active === i ? "text-ink" : "text-mute"
                  }`}
                >
                  {city.name}
                </span>
                {city.state !== city.name && <span className="label text-mute">{city.state}</span>}
              </Link>
            </li>
          ))}
        </ul>

        {/* The photograph that follows the pointer. Decorative only. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-0 z-30 hidden w-72 md:block"
          style={{ x, y, translateX: "4%", translateY: "-50%" }}
          animate={{ opacity: showFloater ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {active !== null && (
            <div className="relative aspect-3/4 overflow-hidden">
              <Photo photo={cities[active].cover} mode="cover" sizes="18rem" />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
