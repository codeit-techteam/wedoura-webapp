"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/media/Photo";
import { Icon } from "@/components/ui/Icon";
import type { CategorySlug, Photo as PhotoData } from "@/data/types";
import { cn } from "@/lib/cn";
import { EASE } from "@/lib/motion";
import { toggleSaved, useSaved } from "@/lib/saved";

export type TabVendor = {
  slug: string;
  name: string;
  category: CategorySlug;
  cityName: string;
  startingPrice?: string;
  photos: PhotoData[];
};

type Props = {
  vendors: TabVendor[];
  tabs: { slug: string; name: string }[];
};

/** A vendor card: tall photo, details over a gradient, save top right.
 *  On hover it slowly cycles through the vendor's three photos. */
function VendorCard({ vendor }: { vendor: TabVendor }) {
  const saved = useSaved();
  const reduce = useReducedMotion();
  const [frame, setFrame] = useState(0);
  const [hovered, setHovered] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSaved = saved.includes(vendor.slug);

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
              <Photo
                photo={photo}
                mode="cover"
                sizes="(min-width: 80rem) 24vw, (min-width: 48rem) 45vw, 50vw"
                objectPosition="50% 62%"
              />
            </motion.div>
          </AnimatePresence>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-ink/80 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white md:p-5">
            <p className="font-serif text-h3 leading-tight">{vendor.name}</p>
            <p className="mt-1 text-small text-white/85">
              {vendor.cityName}
              {vendor.startingPrice ? ` · ${vendor.startingPrice}` : ""}
            </p>
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={() => toggleSaved(vendor.slug)}
        aria-label={isSaved ? `Remove ${vendor.name} from saved` : `Save ${vendor.name}`}
        aria-pressed={isSaved}
        className={cn(
          "tap absolute top-2 right-2 inline-flex items-center justify-center text-white transition-chrome",
          isSaved ? "opacity-100" : "opacity-80 hover:opacity-100",
        )}
      >
        <Icon name="bookmark" size={22} className={isSaved ? "fill-current" : ""} />
      </button>
    </div>
  );
}

/** Category tabs with a sliding underline over a near-edge-to-edge grid. */
export function FeaturedTabs({ vendors, tabs }: Props) {
  const [active, setActive] = useState("all");
  const shown = active === "all" ? vendors : vendors.filter((v) => v.category === active);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Vendor categories"
        className="no-scrollbar -mx-gutter flex gap-6 overflow-x-auto border-b border-line px-gutter md:gap-8"
      >
        {[{ slug: "all", name: "All" }, ...tabs].map((tab) => (
          <button
            key={tab.slug}
            role="tab"
            aria-selected={active === tab.slug}
            onClick={() => setActive(tab.slug)}
            className={cn(
              "tap relative shrink-0 pb-3 text-label-lg whitespace-nowrap transition-colors duration-300 ease-wedoura",
              active === tab.slug ? "font-medium text-ink" : "text-mute hover:text-ink",
            )}
          >
            {tab.name}
            {active === tab.slug && (
              <motion.span
                layoutId="tab-underline"
                className="absolute inset-x-0 bottom-0 h-0.5 bg-ink"
                transition={{ duration: 0.4, ease: EASE }}
              />
            )}
          </button>
        ))}
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-2 gap-y-8 md:mt-8 xl:grid-cols-4">
        {shown.map((vendor) => (
          <li key={vendor.slug}>
            <VendorCard vendor={vendor} />
          </li>
        ))}
      </ul>
    </div>
  );
}
