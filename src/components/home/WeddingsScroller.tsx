"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { RailProgress } from "@/components/home/RailProgress";
import { StoryCard } from "@/components/cards/StoryCard";
import type { RealWedding } from "@/data/types";
import { useIsDesktop } from "@/lib/media";

type Props = {
  weddings: RealWedding[];
  cityNames: Record<string, string>;
};

/**
 * Real weddings, rendered once. The server and small screens get a swipe
 * carousel; from md (and with motion allowed) the same cards upgrade to a
 * pinned section where vertical scrolling moves the horizontal row.
 */
export function WeddingsScroller({ weddings, cityNames }: Props) {
  const reduce = useReducedMotion();
  const desktop = useIsDesktop();
  const pinRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLUListElement>(null);
  const { scrollYProgress } = useScroll({ target: pinRef, offset: ["start start", "end end"] });
  // Each cover is ~72vw wide; the track slides the overflow across the pin.
  const x = useTransform(scrollYProgress, [0.08, 0.92], ["0vw", `-${Math.max(weddings.length - 1, 0) * 74 - 18}vw`]);

  if (reduce || !desktop) {
    return (
      <div>
        <ul ref={railRef} className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto px-gutter">
          {weddings.map((wedding) => (
            <li key={wedding.slug} className="w-11/12 shrink-0 snap-start md:w-3/5">
              <StoryCard wedding={wedding} cityName={cityNames[wedding.city]} sizes="(min-width: 48rem) 60vw, 92vw" />
            </li>
          ))}
        </ul>
        <div className="mt-5 px-gutter md:px-0">
          <RailProgress railRef={railRef} />
        </div>
      </div>
    );
  }

  return (
    <div ref={pinRef} className="h-[220vh]">
      <div className="sticky top-0 flex h-dvh flex-col justify-center overflow-hidden">
        <motion.ul className="flex gap-2 pl-gutter will-change-transform" style={{ x }}>
          {weddings.map((wedding) => (
            <li key={wedding.slug} className="w-[72vw] shrink-0">
              <StoryCard wedding={wedding} cityName={cityNames[wedding.city]} sizes="72vw" />
            </li>
          ))}
        </motion.ul>
        <div className="container-site mt-8">
          <div className="relative h-px w-full overflow-hidden bg-line" aria-hidden="true">
            <motion.div className="absolute inset-y-0 left-0 w-full origin-left bg-ink" style={{ scaleX: scrollYProgress }} />
          </div>
        </div>
      </div>
    </div>
  );
}
