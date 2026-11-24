"use client";

import { useState } from "react";
import { Photo } from "@/components/media/Photo";
import { AlbumStoryViewer } from "@/components/profile/AlbumStoryViewer";
import type { Album } from "@/data/types";

type Props = { albums: Album[] };

/** "2026-01-15" -> "January 2026"; undefined for anything unparseable. */
function albumDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

/**
 * Wedding story covers. Opens the frame-by-frame story reader (title, lede,
 * scrolled photographs) — not a single-image lightbox.
 */
export function AlbumList({ albums }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  const album = open === null ? null : albums[open];

  return (
    <>
      <ul className="mx-auto grid max-w-[90rem] gap-x-[clamp(1.25rem,5vw,5rem)] gap-y-10 sm:grid-cols-2">
        {albums.map((item, i) => {
          const meta = [item.location, albumDate(item.date), `${item.photos.length} photographs`]
            .filter(Boolean)
            .join(" · ");
          return (
            <li key={item.slug} className={i % 2 === 1 ? "sm:mt-24" : undefined}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`Open the story ${item.title}, ${item.photos.length} photographs`}
                className="group block w-full text-left outline-offset-4"
              >
                <div className="relative aspect-4/5 overflow-hidden bg-sand">
                  <Photo
                    photo={item.photos[0]}
                    mode="cover"
                    sizes="(min-width: 40rem) 45vw, 100vw"
                    className="transition-transform duration-1200 ease-wedoura group-hover:scale-104"
                  />
                </div>
                <p className="mt-5 font-serif text-[1.875rem] leading-tight text-ink">{item.title}</p>
                <p className="mt-1 label text-mute">{meta}</p>
                {item.excerpt ? <p className="mt-2 max-w-[36em] text-small text-mute">{item.excerpt}</p> : null}
              </button>
            </li>
          );
        })}
      </ul>
      {album ? <AlbumStoryViewer album={album} onClose={() => setOpen(null)} /> : null}
    </>
  );
}
