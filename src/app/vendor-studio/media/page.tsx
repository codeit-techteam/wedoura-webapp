"use client";

import { useState } from "react";
import { FilmPreview } from "@/components/media/FilmPreview";
import { Field, inputClass } from "@/components/studio/Field";
import { PhotoManager } from "@/components/studio/PhotoManager";
import { PhotoPicker } from "@/components/studio/PhotoPicker";
import { EmptyState } from "@/components/studio/EmptyState";
import { ScreenSkeleton, useListingForm } from "@/components/studio/screen";
import { Clapperboard, Images } from "lucide-react";
import type { Album, Film, Photo } from "@/data/types";
import { cn } from "@/lib/cn";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export default function MediaPage() {
  const { listing, form, apply } = useListingForm<{
    portfolio: Photo[];
    cover?: Photo;
    avatar?: Photo;
    aboutPhoto?: Photo;
    cardPhotos: Photo[];
    films: Film[];
    albums: Album[];
  }>((l) => ({
    portfolio: l.portfolio,
    cover: l.cover,
    avatar: l.avatar,
    aboutPhoto: l.aboutPhoto,
    cardPhotos: l.cardPhotos,
    films: l.films,
    albums: l.albums,
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

  function setAvatar(photo: Photo) {
    apply({ avatar: photo }, { avatar: photo });
  }

  function setAboutPhoto(photo: Photo) {
    apply({ aboutPhoto: photo }, { aboutPhoto: photo });
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
      <p className="mb-8 max-w-prose text-[length:var(--text-dash-body)] text-mute">
        Your portfolio is what couples remember. Lead with your strongest work. Full films are YouTube or Vimeo links.
      </p>

      <section className="mb-12">
        <h2 className="studio-section-title">
          Photos{" "}
          <span className="text-[length:var(--text-dash-help)] font-sans font-normal tracking-normal text-mute normal-case">
            {form.portfolio.length} · {highlights.length} of 7 highlights
          </span>
        </h2>
        <p className="mt-2 max-w-prose text-[length:var(--text-dash-help)] text-mute">
          Star up to 7 favourites as card highlights, and set a cover for your profile.
        </p>
        <div className="mt-6">
          {form.portfolio.length === 0 ? (
            <EmptyState
              icon={Images}
              title="No photographs yet. Upload your strongest frames to build the portfolio."
            />
          ) : null}
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
              const isAvatar = form.avatar?.id === p.id;
              const isAbout = form.aboutPhoto?.id === p.id;
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
                    <button
                      type="button"
                      className={cn("text-small border-b pb-0.5", isAvatar ? "border-gold" : "border-line")}
                      onClick={() => setAvatar(p)}
                    >
                      {isAvatar ? "Avatar" : "Set avatar"}
                    </button>
                    <button
                      type="button"
                      className={cn("text-small border-b pb-0.5", isAbout ? "border-gold" : "border-line")}
                      onClick={() => setAboutPhoto(p)}
                    >
                      {isAbout ? "About photo" : "Set about photo"}
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

      <section className="mb-12">
        <h2 className="studio-section-title">Wedding stories</h2>
        <p className="mt-2 max-w-prose text-[length:var(--text-dash-help)] text-mute">
          Each story opens as a frame-by-frame reader on your public profile. Pick photographs from your portfolio.
        </p>
        {form.albums.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={Images}
              title="No wedding stories yet. Add one with photographs from your portfolio."
              action={
                <button
                  type="button"
                  className="studio-btn"
                  onClick={() => {
                    const albums: Album[] = [
                      {
                        slug: `story-${Date.now().toString(36)}`,
                        title: "New wedding story",
                        location: listing.baseCity,
                        excerpt: "",
                        photos: form.portfolio.slice(0, 4),
                      },
                    ];
                    apply({ albums }, { albums });
                  }}
                >
                  Add story
                </button>
              }
            />
          </div>
        ) : null}
        <ul className="mt-6 grid gap-4">
          {form.albums.map((album, i) => (
            <li key={album.slug} className="border border-line bg-white p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field id={`album-title-${i}`} label="Title">
                  <input
                    id={`album-title-${i}`}
                    className={inputClass}
                    value={album.title}
                    onChange={(e) => {
                      const titleNext = e.target.value;
                      const albums = form.albums.map((a, idx) =>
                        idx === i
                          ? { ...a, title: titleNext, slug: slugify(titleNext) || a.slug }
                          : a,
                      );
                      apply({ albums }, { albums });
                    }}
                  />
                </Field>
                <Field id={`album-loc-${i}`} label="Location">
                  <input
                    id={`album-loc-${i}`}
                    className={inputClass}
                    value={album.location}
                    onChange={(e) => {
                      const albums = form.albums.map((a, idx) =>
                        idx === i ? { ...a, location: e.target.value } : a,
                      );
                      apply({ albums }, { albums });
                    }}
                  />
                </Field>
                <Field id={`album-date-${i}`} label="Date (optional)">
                  <input
                    id={`album-date-${i}`}
                    type="date"
                    className={inputClass}
                    value={album.date ?? ""}
                    onChange={(e) => {
                      const albums = form.albums.map((a, idx) =>
                        idx === i ? { ...a, date: e.target.value || undefined } : a,
                      );
                      apply({ albums }, { albums });
                    }}
                  />
                </Field>
                <Field id={`album-excerpt-${i}`} label="Short lede">
                  <input
                    id={`album-excerpt-${i}`}
                    className={inputClass}
                    value={album.excerpt ?? ""}
                    placeholder="One line couples see when they open the story"
                    onChange={(e) => {
                      const albums = form.albums.map((a, idx) =>
                        idx === i ? { ...a, excerpt: e.target.value || undefined } : a,
                      );
                      apply({ albums }, { albums });
                    }}
                  />
                </Field>
              </div>
              <div className="mt-4">
                <PhotoPicker
                  label="Story photographs"
                  photos={form.portfolio}
                  selectedIds={album.photos.map((p) => p.id)}
                  max={24}
                  onToggle={(photo) => {
                    const exists = album.photos.some((p) => p.id === photo.id);
                    const photos = exists
                      ? album.photos.filter((p) => p.id !== photo.id)
                      : [...album.photos, photo];
                    const albums = form.albums.map((a, idx) => (idx === i ? { ...a, photos } : a));
                    apply({ albums }, { albums });
                  }}
                />
              </div>
              <button
                type="button"
                className="mt-4 text-small text-mute"
                onClick={() => {
                  const albums = form.albums.filter((_, idx) => idx !== i);
                  apply({ albums }, { albums });
                }}
              >
                Remove story
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-4 border-b border-gold pb-1 text-button tracking-[0.2em] uppercase"
          onClick={() => {
            const albums: Album[] = [
              ...form.albums,
              {
                slug: `story-${Date.now().toString(36)}`,
                title: "New wedding story",
                location: listing.baseCity,
                excerpt: "",
                photos: form.portfolio.slice(0, 4),
              },
            ];
            apply({ albums }, { albums });
          }}
        >
          + Add story
        </button>
      </section>

      <section>
        <h2 className="studio-section-title">Films</h2>
        <p className="mt-2 max-w-prose text-[length:var(--text-dash-help)] text-mute">
          Add a YouTube or Vimeo link and a poster from your photos.
        </p>

        {form.films.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={Clapperboard}
              title="No films yet. Add a YouTube or Vimeo link with a poster from your photos."
            />
          </div>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {form.films.map((film, i) => (
              <li key={film.id} className="studio-card p-2">
                <FilmPreview film={film} sizes="(min-width: 40rem) 24rem, 100vw" />
                <div className="mt-2 flex items-center justify-between gap-2 px-1">
                  <p className="truncate text-[length:var(--text-dash-help)]">{film.title}</p>
                  <button
                    type="button"
                    className="text-[length:var(--text-dash-help)] text-mute"
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
        )}

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
