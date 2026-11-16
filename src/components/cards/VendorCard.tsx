"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/media/Photo";
import { SaveButton } from "@/components/ui/SaveButton";
import type { CategorySlug, Photo as PhotoData } from "@/data/types";
import { EASE } from "@/lib/motion";

export type VendorCardData = {
  slug: string;
  name: string;
  category: CategorySlug;
  cityName: string;
  startingPrice?: string;
  photos: PhotoData[];
};

type Props = {
  vendor: VendorCardData;
  sizes?: string;
  priority?: boolean;
};

/**
 * The one vendor card: tall photo, details over a gradient, save top right.
 * On hover it slowly cycles through the vendor's photos.
 */
export function VendorCard({ vendor, sizes = "(min-width: 80rem) 24vw, 50vw", priority }: Props) {
  const reduce = useReducedMotion();
  const [frame, setFrame] = useState(0);
  const [hovered, setHovered] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!hovered || reduce || vendor.photos.length < 2) return;
    timer.current = setInterval(() => setFrame((f) => (f + 1) % vendor.photos.length), 1300);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [hovered, reduce, vendor.photos.length]);

  const photo = vendor.photos[frame] ?? vendor.photos[0];

  return (
    <div
      className="group relative transition-transform duration-500 ease-wedoura hover:-translate-y-1"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setFrame(0);
      }}
    >
      <Link href={`/vendors/${vendor.slug}`} className="block">
        <div className="relative aspect-3/4 overflow-hidden bg-ivory">
          <AnimatePresence initial={false}>
            <motion.div
              key={photo.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <Photo photo={photo} mode="cover" sizes={sizes} objectPosition="50% 62%" priority={priority} />
            </motion.div>
          </AnimatePresence>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-ink/80 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white md:p-5">
            <p className="font-serif text-h3">{vendor.name}</p>
            <p className="mt-1 text-small text-white/85">
              {vendor.cityName}
              {vendor.startingPrice ? ` · ${vendor.startingPrice}` : ""}
            </p>
          </div>
        </div>
      </Link>
      <SaveButton slug={vendor.slug} name={vendor.name} className="absolute top-2 right-2" />
    </div>
  );
}
