"use client";

import { useState } from "react";
import { Photo } from "@/components/media/Photo";
import { PhotoViewer } from "@/components/motion/PhotoViewer";
import { Icon } from "@/components/ui/Icon";
import type { Album } from "@/data/types";

type Props = { albums: Album[] };

/** Albums as rows; each opens its own full-screen photo sequence. */
export function AlbumList({ albums }: Props) {
  const [openAlbum, setOpenAlbum] = useState<number | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const album = openAlbum === null ? null : albums[openAlbum];

  return (
    <>
      <ul className="border-t border-line">
        {albums.map((item, i) => (
          <li key={item.slug} className="border-b border-line">
            <button
              type="button"
              onClick={() => {
                setOpenAlbum(i);
                setIndex(0);
              }}
              className="group flex tap w-full items-center gap-6 py-4 text-left outline-offset-4 md:gap-10"
            >
              <div className="relative aspect-4/3 w-24 shrink-0 overflow-hidden bg-ivory md:w-32">
                <Photo
                  photo={item.photos[0]}
                  mode="cover"
                  sizes="8rem"
                  className="transition-transform duration-1200 ease-wedoura group-hover:scale-104"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-h3">{item.title}</p>
                <p className="mt-1 text-small text-mute">
                  {item.location} · {item.photos.length} photographs
                </p>
              </div>
              <Icon name="arrow-right" size={20} className="shrink-0 text-gold transition-transform duration-300 ease-wedoura group-hover:translate-x-1" />
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
