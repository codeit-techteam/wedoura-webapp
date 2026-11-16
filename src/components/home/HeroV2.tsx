"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HeroSearch } from "@/components/home/HeroSearch";
import { Photo } from "@/components/media/Photo";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import type { Photo as PhotoData } from "@/data/types";
import { EASE } from "@/lib/motion";

type Option = { slug: string; name: string };

type Props = {
  photos: PhotoData[];
  cities: Option[];
  categories: Option[];
};

const SLIDE_SECONDS = 6;

/**
 * Full-screen hero: three photographs crossfading slowly with a gentle zoom,
 * centred headline, search and category links over the photograph. The
 * content eases back as the page scrolls away.
 */
export function HeroV2({ photos, cities, categories }: Props) {
  const reduce = useReducedMotion();
  const [slide, setSlide] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  // Spring the progress so Lenis + Ken Burns are not fighting per-frame scale
  // on the same layer (that pairing caused scroll jitter on the hero).
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 180, damping: 36, mass: 0.12 });
  const fadeProgress = reduce ? scrollYProgress : smoothProgress;
  const contentOpacity = useTransform(fadeProgress, [0, 0.65], [1, 0.35]);

  useEffect(() => {
    if (reduce || photos.length < 2) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % photos.length), SLIDE_SECONDS * 1000);
    return () => clearInterval(id);
  }, [reduce, photos.length]);

  const current = photos[slide] ?? photos[0];

  return (
    <section
      ref={sectionRef}
      data-nav-dark
      aria-label="Welcome"
      // svh, not dvh: the dynamic viewport resizes as the mobile URL bar
      // collapses, which made the hero (and everything after it) jump while
      // scrolling. The small viewport height is stable.
      className="relative -mt-nav flex min-h-svh flex-col items-center justify-center overflow-hidden bg-ink px-gutter pb-bottombar pt-24 text-white md:pt-28"
    >
      <div className="absolute inset-0">
        {/* The first slide is a plain element so the server-rendered hero is
            visible before hydration (it is the page's LCP element). */}
        {/* The zoom settles inward (1.06 -> 1): growing the LCP element would
            keep re-issuing larger LCP candidates for the whole slide. */}
        {slide === 0 && photos[0] && (
          <motion.div
            className="absolute inset-0 will-change-transform"
            initial={{ scale: reduce ? 1 : 1.06 }}
            animate={{ scale: 1 }}
            transition={{ scale: { duration: SLIDE_SECONDS + 1.5, ease: "linear" } }}
          >
            <Photo photo={photos[0]} sizes="100vw" mode="cover" priority quality={75} objectPosition="60% 38%" />
          </motion.div>
        )}
        <AnimatePresence initial={false}>
          {slide !== 0 && (
            <motion.div
              key={current.id}
              className="absolute inset-0 will-change-transform"
              initial={{ opacity: 0, scale: reduce ? 1 : 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 1.2, ease: EASE },
                scale: { duration: SLIDE_SECONDS + 1.5, ease: "linear" },
              }}
            >
              <Photo photo={current} sizes="100vw" mode="cover" quality={75} objectPosition="60% 38%" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legibility: a centred base gradient under the copy and search. */}
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/30 to-transparent" />

      <motion.div
        className="relative flex w-full max-w-(--container-hero-search) flex-col items-center text-center"
        style={reduce ? undefined : { opacity: contentOpacity }}
      >
        <MaskedHeading
          as="h1"
          className="text-center font-serif text-hero text-balance"
          lines={[
            "Your wedding,",
            // Elements in the lines array need keys (strings do not).
            <span key="hands">
              in <em>good hands</em>.
            </span>,
          ]}
        />
        <motion.p
          className="mt-5 max-w-xl text-sublead text-white/90 text-balance md:mt-6"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
        >
          India&apos;s best wedding people, chosen from their real work.
        </motion.p>
        <motion.div
          className="mt-8 flex w-full flex-col items-center md:mt-10"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
        >
          <HeroSearch cities={cities} categories={categories} />
          <ul className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Browse a category">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/vendors?category=${c.slug}`}
                  className="link-draw inline-block py-1 text-caption font-medium tracking-label uppercase text-white/85"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </section>
  );
}
