"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { FilmPreview } from "@/components/media/FilmPreview";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import type { Film } from "@/data/types";

type Props = { films: Film[] };

/**
 * The one dark section. Desktop: as it scrolls into view the first film
 * grows from a card to nearly full-screen, then the row with the others
 * follows. Mobile and reduced motion: a simple row of large cards.
 */
export function FilmsShowcase({ films }: Props) {
  const reduce = useReducedMotion();
  const pinRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: pinRef, offset: ["start start", "end end"] });
  const scale = useTransform(scrollYProgress, [0.05, 0.75], [0.55, 1]);
  const [first, ...rest] = films;

  const heading = (
    <div className="container-site">
      <MaskedHeading as="h2" className="font-serif text-h1" lines={[<>The day, in motion.</>]} />
      <p className="mt-4 max-w-prose text-white/80">Short films from real weddings. Sound off until you want it.</p>
    </div>
  );

  const row = (items: Film[], big = false) => (
    <ul className="no-scrollbar -mx-gutter mt-10 flex snap-x snap-mandatory gap-2 overflow-x-auto px-gutter md:mx-0 md:px-0">
      {items.map((film) => (
        <li key={film.id} className={big ? "w-11/12 shrink-0 snap-start md:w-7/12" : "w-11/12 shrink-0 snap-start md:w-1/2"}>
          <FilmPreview film={film} sizes="(min-width: 48rem) 55vw, 92vw" />
        </li>
      ))}
    </ul>
  );

  if (reduce) {
    return (
      <section className="bg-ink py-section text-white" aria-label="Wedding films">
        {heading}
        <div className="container-wide">{row(films, true)}</div>
      </section>
    );
  }

  return (
    <section className="bg-ink text-white" aria-label="Wedding films">
      {/* Mobile: heading + row. */}
      <div className="py-section md:hidden">
        {heading}
        <div className="px-gutter">{row(films, true)}</div>
      </div>

      {/* Desktop: the first film grows to nearly full-screen while pinned. */}
      <div className="hidden md:block">
        <div className="pt-section">{heading}</div>
        <div ref={pinRef} className="h-[220vh]">
          <div className="sticky top-0 flex h-dvh items-center justify-center overflow-hidden">
            <motion.div className="w-[94vw] will-change-transform" style={{ scale }}>
              {first && <FilmPreview film={first} sizes="94vw" />}
            </motion.div>
          </div>
        </div>
        <div className="container-wide pb-section">{rest.length > 0 && row(rest)}</div>
      </div>
    </section>
  );
}
