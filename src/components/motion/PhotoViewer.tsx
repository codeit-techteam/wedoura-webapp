"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { PhotoSphere } from "@/components/media/PhotoSphere";
import type { Photo as PhotoData } from "@/data/types";
import { cn } from "@/lib/cn";
import { viewer } from "@/lib/motion";
import { usePageScrollLock } from "@/lib/scroll-lock";

type Props = {
  photos: PhotoData[];
  /** Index of the open photo, or null when closed. */
  index: number | null;
  onChange: (index: number) => void;
  onClose: () => void;
  /** Must match the layoutId used on the thumbnail: `${layoutPrefix}-${photo.id}`. */
  layoutPrefix?: string;
  /** Optional per-photo link shown under the caption, keyed by photo id. */
  links?: Record<string, { href: string; label: string }>;
};

/**
 * Motion 4: full-screen photo viewer. The thumbnail grows into the viewer
 * through a shared layoutId. Swipe or drag, arrow keys, Escape to close.
 */
export function PhotoViewer({ photos, index, onChange, onClose, layoutPrefix = "photo", links }: Props) {
  const photo = index === null ? null : (photos[index] ?? null);
  const open = photo !== null;
  const is360 = photo?.projection === "equirectangular";
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  const step = useCallback(
    (delta: number) => {
      if (index === null) return;
      onChange((index + delta + photos.length) % photos.length);
    },
    [index, onChange, photos.length],
  );

  usePageScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, step]);

  return (
    <AnimatePresence>
      {photo && index !== null && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          data-lenis-prevent
          className="fixed inset-0 z-50 flex flex-col bg-ink text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={viewer.backdrop}
        >
          <div className="flex items-center justify-between px-gutter py-4">
            <p className="label text-white/70">
              {index + 1} / {photos.length}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="label tap px-3 text-white hover:text-white/70"
            >
              Close
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-gutter pb-gutter">
            <motion.div
              key={photo.id}
              layoutId={`${layoutPrefix}-${photo.id}`}
              transition={viewer.photo}
              drag={is360 || reduce ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) step(1);
                else if (info.offset.x > 60) step(-1);
              }}
              className={cn("relative w-full", is360 && "h-full")}
              style={
                is360
                  ? undefined
                  : {
                      aspectRatio: `${photo.width} / ${photo.height}`,
                      maxWidth: `calc((100vh - 9rem) * ${photo.width / photo.height})`,
                    }
              }
            >
              {is360 ? (
                <PhotoSphere photo={photo} />
              ) : (
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="100vw"
                  quality={90}
                  placeholder="blur"
                  blurDataURL={photo.blurDataURL}
                  className="object-contain select-none"
                  draggable={false}
                  priority
                />
              )}
            </motion.div>

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous photo"
                  className={cn(
                    "label tap absolute top-1/2 left-2 z-10 -translate-y-1/2 px-3 text-white/70 hover:text-white",
                    is360 ? "bg-ink/50" : "hidden md:block",
                  )}
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next photo"
                  className={cn(
                    "label tap absolute top-1/2 right-2 z-10 -translate-y-1/2 px-3 text-white/70 hover:text-white",
                    is360 ? "bg-ink/50" : "hidden md:block",
                  )}
                >
                  Next
                </button>
              </>
            )}
          </div>

          <div className="px-gutter pb-6 text-center text-small text-white/70">
            <p>{photo.alt}</p>
            {links?.[photo.id] && (
              <Link href={links[photo.id].href} onClick={onClose} className="link-draw mt-1 inline-block text-white">
                {links[photo.id].label}
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
