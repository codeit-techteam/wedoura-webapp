"use client";

import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/media/Photo";
import type { Album } from "@/data/types";
import { cn } from "@/lib/cn";
import { usePageScrollLock } from "@/lib/scroll-lock";

type Props = {
  album: Album;
  onClose: () => void;
};

/**
 * Frame-by-frame story reader (reference `.lb`). Ivory full-screen scroll
 * with a title block, progress line and photograph rows — not a single-image
 * lightbox. Escape closes; page scroll locks while open.
 */
export function AlbumStoryViewer({ album, onClose }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  usePageScrollLock(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes = root.querySelectorAll<HTMLElement>("[data-story-reveal]");
    if (reduced) {
      nodes.forEach((n) => n.classList.add("opacity-100", "translate-y-0", "scale-100"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("opacity-100", "translate-y-0", "scale-100");
          io.unobserve(entry.target);
        });
      },
      { root, threshold: 0.12 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [album.slug]);

  function onScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const max = Math.max(1, el.scrollHeight - el.clientHeight);
    setProgress((el.scrollTop / max) * 100);
  }

  const rows: (typeof album.photos)[] = [];
  for (let i = 0; i < album.photos.length; ) {
    const pair = i > 0 && i + 1 < album.photos.length;
    if (pair) {
      rows.push([album.photos[i], album.photos[i + 1]]);
      i += 2;
    } else {
      rows.push([album.photos[i]]);
      i += 1;
    }
  }

  const sub = [album.location, album.excerpt].filter(Boolean).join(" · ");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Story viewer"
      data-lenis-prevent
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-ivory text-ink"
    >
      <header className="flex shrink-0 items-center justify-between gap-4 px-[clamp(1rem,3vw,2.5rem)] py-4">
        <div className="min-w-0">
          <p className="truncate font-serif text-[1.25rem] leading-tight md:text-[1.75rem]">{album.title}</p>
          <p className="mt-1 label text-mute">{album.photos.length} photographs</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="tap shrink-0 px-3 py-2 font-sans text-button tracking-button uppercase text-ink"
        >
          Close ✕
        </button>
      </header>
      <div className="h-px w-full shrink-0 bg-line" aria-hidden="true">
        <i className="block h-px bg-gold transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-0 pb-24 pt-8 text-center"
      >
        <div
          data-story-reveal
          className="mx-auto mb-11 max-w-[56rem] px-[4vw] opacity-0 translate-y-6 transition duration-1000 ease-wedoura"
        >
          <h3 className="font-serif text-[clamp(2.125rem,5vw,4rem)] leading-[1.1] tracking-[0.04em]">
            {album.title}
          </h3>
          {sub ? <p className="mt-3 font-serif text-[1.25rem] italic text-mute">{sub}</p> : null}
        </div>
        {rows.map((row, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className={cn(
              "mx-auto mb-1 flex w-full max-w-[94vw] flex-col gap-1 md:mb-4 md:max-w-[77.5rem] md:flex-row md:justify-center md:gap-3",
              row.length === 1 && "md:max-w-[51.25rem]",
            )}
          >
            {row.map((photo) => (
              <figure
                key={photo.id}
                data-story-reveal
                className="opacity-0 translate-y-16 scale-104 transition duration-1200 ease-wedoura md:min-w-0 md:flex-1"
              >
                <Photo photo={photo} sizes="(min-width: 48rem) 48vw, 94vw" className="w-full" />
                {photo.alt ? (
                  <figcaption className="mt-2 px-4 text-left text-small text-mute md:px-0">{photo.alt}</figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
