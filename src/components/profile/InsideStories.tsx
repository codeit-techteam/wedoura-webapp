"use client";

import { useState } from "react";
import { Photo } from "@/components/media/Photo";
import { cn } from "@/lib/cn";
import type { Album } from "@/data/types";

type Props = {
  albums: Album[];
};

/**
 * Full-viewport album cover carousel with prev/next controls and a dot
 * indicator. Clicking the cover opens the album (the PhotoGrid viewer handles
 * individual photos; here we just link to the album anchor).
 */
export function InsideStories({ albums }: Props) {
  const [index, setIndex] = useState(0);
  const album = albums[index];

  if (albums.length === 0 || !album) return null;

  const cover = album.photos[0];

  return (
    <section
      id="inside"
      aria-label="Inside the stories"
      className="relative -mx-gutter overflow-hidden bg-ink md:-mx-0"
      style={{ height: "min(80svh, 640px)" }}
    >
      {cover && (
        <div className="absolute inset-0">
          <Photo
            photo={cover}
            mode="cover"
            sizes="100vw"
            priority={index === 0}
            quality={75}
          />
          <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/20 to-transparent" />
        </div>
      )}

      {/* Caption */}
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-10" aria-live="polite">
        <p className="label text-white/60">
          {index + 1} / {albums.length}
        </p>
        <p className="mt-2 font-serif text-h2 text-white leading-tight">{album.title}</p>
        <p className="mt-1 text-small text-white/70">{album.location}</p>
      </div>

      {/* Prev / Next */}
      {albums.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous story"
            onClick={() => setIndex((i) => (i - 1 + albums.length) % albums.length)}
            className="tap absolute left-4 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center bg-white/10 text-white backdrop-blur-sm transition-chrome hover:bg-white/20 md:left-6"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next story"
            onClick={() => setIndex((i) => (i + 1) % albums.length)}
            className="tap absolute right-4 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center bg-white/10 text-white backdrop-blur-sm transition-chrome hover:bg-white/20 md:right-6"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      {albums.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5" aria-hidden="true">
          {albums.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to story ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "size-1.5 rounded-full transition-chrome",
                i === index ? "bg-white" : "bg-white/40",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
