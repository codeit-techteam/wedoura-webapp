"use client";

import { useState } from "react";
import { Photo } from "@/components/media/Photo";
import { PhotoViewer } from "@/components/motion/PhotoViewer";
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
 * Albums as large covers with title, city, date and photo count; each opens
 * its own full-screen sequence in the viewer.
 */
export function AlbumList({ albums }: Props) {
  const [openAlbum, setOpenAlbum] = useState<number | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const album = openAlbum === null ? null : albums[openAlbum];

  return (
    <>
      <ul className="grid gap-x-2 gap-y-10 sm:grid-cols-2">
        {albums.map((item, i) => {
          const meta = [item.location, albumDate(item.date), `${item.photos.length} photographs`]
            .filter(Boolean)
            .join(" · ");
          return (
            <li key={item.slug}>
              <button
                type="button"
                onClick={() => {
                  setOpenAlbum(i);
                  setIndex(0);
                }}
                aria-label={`Open the album ${item.title}, ${item.photos.length} photographs`}
                className="group block w-full text-left outline-offset-4"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-ivory">
                  <Photo
                    photo={item.photos[0]}
                    mode="cover"
                    sizes="(min-width: 40rem) 45vw, 100vw"
                    className="transition-transform duration-1200 ease-wedoura group-hover:scale-104"
                  />
                </div>
                <p className="mt-5 font-serif text-h3">{item.title}</p>
                <p className="mt-1 text-small text-mute">{meta}</p>
              </button>
            </li>
          );
        })}
      </ul>
      {album && (
        <PhotoViewer
          photos={album.photos}
          index={index}
          onChange={setIndex}
          onClose={() => {
            setIndex(null);
            setOpenAlbum(null);
          }}
          layoutPrefix={`album-${album.slug}`}
        />
      )}
    </>
  );
}
