"use client";

import { motion } from "motion/react";
import { useId, useState } from "react";
import { Photo } from "@/components/media/Photo";
import { PhotoViewer } from "@/components/motion/PhotoViewer";
import { Button } from "@/components/ui/Button";
import type { Photo as PhotoData } from "@/data/types";
import { cn } from "@/lib/cn";

export type PhotoLink = { href: string; label: string };

type Props = {
  photos: PhotoData[];
  /** Column count classes; photos keep their own proportions. */
  columns?: 2 | 3;
  sizes?: string;
  className?: string;
  /** Optional per-photo link (gallery: the vendor), keyed by photo id. */
  links?: Record<string, PhotoLink>;
  /**
   * Show only this many at first, with a "See all" expander. Every photo is
   * still in the markup (server-rendered); the rest are hidden until opened.
   */
  initialCount?: number;
};

/**
 * Uncropped photo grid: masonry-style columns where every photograph keeps
 * its own aspect ratio, each opening the full-screen viewer (shared layout).
 */
export function PhotoGrid({ photos, columns = 3, sizes, className, links, initialCount }: Props) {
  const [index, setIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const prefix = useId();
  const sizesHint = sizes ?? (columns === 3 ? "(min-width: 48rem) 33vw, 50vw" : "50vw");
  const collapsed = initialCount !== undefined && !expanded && photos.length > initialCount;
  const limit = collapsed ? initialCount : photos.length;

  return (
    <>
      <div className={cn("gap-2 space-y-2", columns === 3 ? "columns-2 md:columns-3" : "columns-2", className)}>
        {photos.map((photo, i) => (
          <button
            key={photo.id + i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Open ${photo.alt}`}
            className={cn("group block w-full break-inside-avoid outline-offset-4", i >= limit && "hidden")}
          >
            <motion.div layoutId={`${prefix}-${photo.id}`} className="relative overflow-hidden bg-ivory">
              <Photo
                photo={photo}
                sizes={sizesHint}
                className="transition-transform duration-1200 ease-wedoura group-hover:scale-104"
              />
              {links?.[photo.id] && (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/70 to-transparent p-3 pt-8 text-left text-small text-white opacity-0 transition-opacity duration-300 ease-wedoura group-hover:opacity-100">
                  {links[photo.id].label}
                </span>
              )}
            </motion.div>
          </button>
        ))}
      </div>
      {collapsed && (
        <div className="mt-8 flex justify-center">
          <Button variant="outline" onClick={() => setExpanded(true)}>
            See all {photos.length} photographs
          </Button>
        </div>
      )}
      <PhotoViewer photos={photos} index={index} onChange={setIndex} onClose={() => setIndex(null)} layoutPrefix={prefix} links={links} />
    </>
  );
}
