"use client";

import { useState } from "react";
import { FilmPreview } from "@/components/media/FilmPreview";
import { Field, inputClass } from "@/components/studio/Field";
import { PhotoManager } from "@/components/studio/PhotoManager";
import { PhotoPicker } from "@/components/studio/PhotoPicker";
import { SaveState } from "@/components/studio/autosave";
import { ScreenSkeleton, useListingForm } from "@/components/studio/screen";
import type { Film, Photo } from "@/data/types";
import { cn } from "@/lib/cn";

export default function MediaPage() {
  const { listing, form, apply, status, error } = useListingForm<{
    portfolio: Photo[];
    cover?: Photo;
    cardPhotos: Photo[];
    films: Film[];
  }>((l) => ({
    portfolio: l.portfolio,
    cover: l.cover,
    cardPhotos: l.cardPhotos,
    films: l.films,
  }));
  const [title, setTitle] = useState("");
  const [youtube, setYoutube] = useState("");
  const [poster, setPoster] = useState<Photo | null>(null);
  const [filmMsg, setFilmMsg] = useState<string | null>(null);

  if (!form || !listing) return <ScreenSkeleton />;

  const highlights = form.cardPhotos.slice(0, 7);

  function setCover(photo: Photo) {
    apply({ cover: photo }, { cover: photo });
  }

  function toggleHighlight(photo: Photo) {
    const exists = form!.cardPhotos.some((p) => p.id === photo.id);
    const next = exists
      ? form!.cardPhotos.filter((p) => p.id !== photo.id)
      : form!.cardPhotos.length >= 7
        ? form!.cardPhotos
        : [...form!.cardPhotos, photo];
    apply({ cardPhotos: next }, { cardPhotos: next });
  }

  function addFilm() {
    if (!title.trim()) return setFilmMsg("Give the film a title.");
    if (!/^https?:\/\/.+/.test(youtube.trim())) return setFilmMsg("A YouTube or Vimeo link (https://…).");
    if (!poster) return setFilmMsg("Pick a poster from your photos.");
    setFilmMsg(null);
    const film: Film = {
      id: `film-${Date.now().toString(36)}`,
      title: title.trim(),
      previewSrc: "",
      fullSrc: youtube.trim(),
      youtubeUrl: youtube.trim(),
      poster,
      durationSec: 0,
    };
    const films = [...form!.films, film];
    apply({ films }, { films });
    setTitle("");
    setYoutube("");
    setPoster(null);
  }

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-h1">Photos and videos</h1>
          <p className="mt-3 max-w-prose italic text-mute">
            Your portfolio is what couples remember. Lead with your strongest work. Full films are YouTube or Vimeo links.
          </p>
        </div>
        <SaveState status={status} error={error} />
      </header>

      <section className="mb-12">
        <h2 className="font-serif text-h2">
          Photos{" "}
          <span className="text-small font-sans font-normal tracking-normal text-mute normal-case">
            {form.portfolio.length} · {highlights.length} of 7 highlights
          </span>
        </h2>
        <p className="mt-2 max-w-prose text-mute">
          Star up to 7 favourites as card highlights, and set a cover for your profile.
        </p>
        <div className="mt-6">
          <PhotoManager
            photos={form.portfolio}
            pendingIds={listing.pendingMediaIds}
            hint="At least 12 photographs"
            onChange={(portfolio) => apply({ portfolio }, { portfolio })}
          />
        </div>
        {form.portfolio.length > 0 ? (
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {form.portfolio.map((p) => {
              const hl = form.cardPhotos.some((c) => c.id === p.id);
              const isCover = form.cover?.id === p.id;
              return (
                <li key={p.id} className="border border-line bg-white p-2">
                  <p className="truncate text-small">{p.alt || "Photo"}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={cn("text-small border-b pb-0.5", hl ? "border-gold text-ink" : "border-line text-mute")}
                      aria-pressed={hl}
                      onClick={() => toggleHighlight(p)}
                    >
                      {hl ? "★ Highlight" : "☆ Highlight"}
                    </button>
                    <button
                      type="button"
                      className={cn("text-small border-b pb-0.5", isCover ? "border-gold" : "border-line")}
                      onClick={() => setCover(p)}
                    >
                      {isCover ? "Cover" : "Set cover"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
        {form.cover ? (
          <p className="mt-4 text-small text-mute">Cover set. 360° photos open in the shared viewer from the grid.</p>
        ) : null}
      </section>

      <section>
        <h2 className="font-serif text-h2">Films</h2>
        <p className="mt-2 max-w-prose text-mute">Add a YouTube or Vimeo link and a poster from your photos.</p>

        {form.films.length > 0 ? (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {form.films.map((film, i) => (
              <li key={film.id} className="border border-line bg-white p-2">
                <FilmPreview film={film} sizes="(min-width: 40rem) 24rem, 100vw" />
                <div className="mt-2 flex items-center justify-between gap-2 px-1">
                  <p className="truncate text-small">{film.title}</p>
                  <button
                    type="button"
                    className="text-small text-mute"
                    onClick={() => {
                      const films = form.films.filter((_, idx) => idx !== i);
                      apply({ films }, { films });
                    }}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-6 grid gap-4 border border-line bg-white p-5 md:grid-cols-2">
          <Field id="film-title" label="Title">
            <input id="film-title" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field id="film-yt" label="YouTube or Vimeo link">
            <input id="film-yt" className={inputClass} value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="https://" />
          </Field>
          <div className="md:col-span-2">
            <div className="mt-1">
              <PhotoPicker
                label="Poster"
                photos={form.portfolio}
                selectedIds={poster ? [poster.id] : []}
                max={1}
                onToggle={(photo) => setPoster(poster?.id === photo.id ? null : photo)}
              />
            </div>
          </div>
          {filmMsg ? (
            <p className="text-small text-ink md:col-span-2" role="alert">
              {filmMsg}
            </p>
          ) : null}
          <button
            type="button"
            onClick={addFilm}
            className="min-h-12 bg-ink px-5 font-sans text-button font-medium tracking-button text-ivory uppercase md:col-span-2 md:w-fit"
          >
            Add film
          </button>
        </div>
      </section>
    </div>
  );
}
