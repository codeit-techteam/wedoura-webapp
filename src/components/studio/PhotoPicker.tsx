"use client";

import { Photo as PhotoImg } from "@/components/media/Photo";
import type { Photo } from "@/data/types";
import { cn } from "@/lib/cn";

type Props = {
  /** The pool to pick from (usually the portfolio). */
  photos: Photo[];
  /** Selected ids, in order. */
  selectedIds: string[];
  onToggle: (photo: Photo) => void;
  /** Stop selecting beyond this many. */
  max?: number;
  label: string;
};

/** Pick photos from the uploaded pool; selection order is shown. */
export function PhotoPicker({ photos, selectedIds, onToggle, max, label }: Props) {
  if (photos.length === 0) {
    return (
      <p className="border border-dashed border-line bg-white px-4 py-6 text-center text-small text-mute">
        Upload photographs first; they appear here to choose from.
      </p>
    );
  }
  return (
    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-6" aria-label={label}>
      {photos.map((photo) => {
        const index = selectedIds.indexOf(photo.id);
        const picked = index >= 0;
        const full = max !== undefined && selectedIds.length >= max && !picked;
        return (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => onToggle(photo)}
              disabled={full}
              aria-pressed={picked}
              aria-label={`${picked ? "Remove" : "Choose"} ${photo.alt || "photo"}`}
              className={cn(
                "relative block w-full border-2 outline-offset-2 transition-chrome",
                picked ? "border-ink" : "border-transparent hover:border-line",
                full && "opacity-40",
              )}
            >
              <span className="relative block aspect-square overflow-hidden bg-ivory">
                <PhotoImg photo={photo} mode="cover" sizes="(min-width: 64rem) 12vw, 30vw" />
              </span>
              {picked && (
                <span className="label absolute top-1.5 right-1.5 flex size-6 items-center justify-center bg-ink text-white">
                  {index + 1}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
