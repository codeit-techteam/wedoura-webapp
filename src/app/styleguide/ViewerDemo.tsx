"use client";

import { useState } from "react";
import { PhotoCard } from "@/components/media/PhotoCard";
import { PhotoViewer } from "@/components/motion/PhotoViewer";
import { Reveal } from "@/components/motion/Reveal";
import type { Photo } from "@/data/types";

/** Thumbnails that grow into the full-screen viewer (motion 4). */
export function ViewerDemo({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);

  return (
    <>
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {photos.map((photo, i) => (
          <Reveal as="li" key={photo.id} delay={i * 0.08}>
            <PhotoCard
              photo={photo}
              sizes="(min-width: 768px) 25vw, 50vw"
              layoutId={`styleguide-${photo.id}`}
              onClick={() => setIndex(i)}
            />
          </Reveal>
        ))}
      </ul>
      <PhotoViewer
        photos={photos}
        index={index}
        onChange={setIndex}
        onClose={() => setIndex(null)}
        layoutPrefix="styleguide"
      />
    </>
  );
}
