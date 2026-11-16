"use client";

import { useState } from "react";
import { Photo } from "@/components/media/Photo";
import { PhotoViewer } from "@/components/motion/PhotoViewer";
import type { Album } from "@/data/types";

type Props = { albums: Album[] };

/** Albums as large covers with title, city and count; each opens its own full-screen sequence. */
export function AlbumList({ albums }: Props) {
  const [openAlbum, setOpenAlbum] = useState<number | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const album = openAlbum === null ? null : albums[openAlbum];

  return (
    <>
      <ul className="grid gap-2 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
        {albums.map((item, i) => (
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
                  sizes="(min-width: 90rem) 30vw, (min-width: 40rem) 45vw, 100vw"
                  className="transition-transform duration-1200 ease-wedoura group-hover:scale-104"
                />
              </div>
              <p className="mt-4 font-serif text-h3">{item.title}</p>
              <p className="mt-1 text-small text-mute">
                {item.location} · {item.photos.length} photographs
              </p>
            </button>
          </li>
        ))}
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
