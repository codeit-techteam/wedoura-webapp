"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/media/Photo";
import { Button } from "@/components/ui/Button";
import type { Film } from "@/data/types";
import { cn } from "@/lib/cn";
import { viewer } from "@/lib/motion";
import { usePageScrollLock } from "@/lib/scroll-lock";

type Props = {
  film: Film;
  sizes: string;
  eyebrow?: string;
  className?: string;
};

/**
 * Motion 5: a short muted preview that plays while in view and pauses off
 * screen, with a "Watch the film" button that opens the full film.
 * With no clip yet (empty previewSrc), the poster breathes with a slow zoom
 * instead; with no fullSrc, the button and player are hidden.
 * Under reduced motion everything stays still.
 */
export function FilmPreview({ film, sizes, eyebrow, className }: Props) {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref, { amount: 0.6 });
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const hasPreview = film.previewSrc.length > 0;
  const hasFull = film.fullSrc.length > 0;

  // The effect only drives the element; `playing` follows the video's own
  // play/pause events so the poster fades out exactly when frames appear.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (inView && !reduce && !open) {
      video.play().catch(() => {
        /* autoplay blocked: the poster stays */
      });
    } else {
      video.pause();
    }
  }, [inView, reduce, open]);

  usePageScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const ratio = `${film.poster.width} / ${film.poster.height}`;

  return (
    <figure ref={ref} className={cn("group relative", className)}>
      <div className="relative overflow-hidden bg-ink" style={{ aspectRatio: ratio }}>
        <Photo
          photo={film.poster}
          sizes={sizes}
          mode="cover"
          className={cn(
            // No clip yet: the poster breathes while in view instead.
            !hasPreview && !reduce && "transition-transform duration-6000 ease-wedoura",
            !hasPreview && !reduce && inView && "scale-106",
          )}
        />
        {hasPreview && (
          <video
            ref={videoRef}
            src={film.previewSrc}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            tabIndex={-1}
            onPlaying={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEmptied={() => setPlaying(false)}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-wedoura",
              playing ? "opacity-100" : "opacity-0",
            )}
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-4 p-5 text-white md:flex-row md:items-end md:justify-between md:p-8">
          <div className="min-w-0">
            {eyebrow && <p className="label text-white/80">{eyebrow}</p>}
            <p className="mt-1 font-serif text-h3 text-balance">{film.title}</p>
          </div>
          {hasFull && (
            <Button variant="outline" tone="white" onClick={() => setOpen(true)} className="shrink-0 px-5">
              Watch the film
            </Button>
          )}
        </div>
      </div>
      <figcaption className="sr-only">{film.title}</figcaption>

      <AnimatePresence>
        {open && hasFull && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${film.title} film`}
            data-lenis-prevent
            className="fixed inset-0 z-50 flex flex-col bg-ink text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={viewer.backdrop}
          >
            <div className="flex items-center justify-between px-gutter py-4">
              <p className="label text-white/70">{film.title}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="label tap px-3 text-white hover:text-white/70"
                autoFocus
              >
                Close
              </button>
            </div>
            <div className="flex flex-1 items-center justify-center px-gutter pb-gutter">
              <video
                src={film.fullSrc}
                controls
                autoPlay
                playsInline
                poster={film.poster.src}
                className="max-h-full w-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </figure>
  );
}
