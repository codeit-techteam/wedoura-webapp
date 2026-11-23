"use client";

import { useState } from "react";
import { Photo } from "@/components/media/Photo";
import { formatDuration } from "@/lib/format";
import type { Film } from "@/data/types";

type Props = {
  film: Film;
  sizes: string;
};

/** Extract the YouTube video ID from a watch or embed URL. */
function youtubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

/**
 * A film card that shows the poster thumbnail; on click it replaces itself
 * with an inline YouTube iframe (no autoplay until the user clicks). Falls
 * back to a plain poster when no YouTube URL is set.
 */
export function FilmYouTube({ film, sizes }: Props) {
  const [playing, setPlaying] = useState(false);
  const vid = film.youtubeUrl ? youtubeId(film.youtubeUrl) : null;

  if (playing && vid) {
    return (
      <div className="relative aspect-video w-full bg-ink">
        <iframe
          src={`https://www.youtube.com/embed/${vid}?autoplay=1&rel=0`}
          title={film.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <div className="group relative aspect-video w-full cursor-pointer overflow-hidden bg-ink" onClick={vid ? () => setPlaying(true) : undefined}>
      {film.poster && (
        <Photo photo={film.poster} mode="cover" sizes={sizes} quality={75} />
      )}
      <div aria-hidden="true" className="absolute inset-0 bg-ink/30 transition-chrome group-hover:bg-ink/40" />
      {vid && (
        <button
          type="button"
          aria-label={`Play film: ${film.title}`}
          className="tap absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex size-14 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-chrome group-hover:bg-white/30"
          onClick={() => setPlaying(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </button>
      )}
      <div className="absolute bottom-0 inset-x-0 p-4">
        <p className="label text-white leading-snug">{film.title}</p>
        {film.durationSec > 0 && (
          <p className="mt-0.5 text-small text-white/60">{formatDuration(film.durationSec)}</p>
        )}
      </div>
    </div>
  );
}
