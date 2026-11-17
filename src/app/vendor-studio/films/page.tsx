"use client";

import { useRef, useState } from "react";
import { FilmPreview } from "@/components/media/FilmPreview";
import { Field, ScreenHeader, StudioCard, inputClass } from "@/components/studio/Field";
import { PhotoPicker } from "@/components/studio/PhotoPicker";
import { SaveState } from "@/components/studio/autosave";
import { ReorderButtons, ScreenSkeleton, moveItem, useListingForm } from "@/components/studio/screen";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Film, Photo } from "@/data/types";

const MAX_FILE_MB = 8;

export default function FilmsPage() {
  const { listing, form, apply, status, error } = useListingForm<{ films: Film[] }>((l) => ({ films: l.films }));
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [poster, setPoster] = useState<Photo | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  if (!form || !listing) return <ScreenSkeleton />;

  const save = (films: Film[]) => apply({ films }, { films });

  const add = (src: string) => {
    if (!title.trim()) return setMessage("Give the film a title first.");
    if (!poster) return setMessage("Pick a poster from your photos first.");
    setMessage(null);
    const film: Film = {
      id: `film-up-${Date.now().toString(36)}`,
      title: title.trim(),
      previewSrc: src,
      fullSrc: src,
      poster,
      durationSec: 0,
    };
    save([...form.films, film]);
    setTitle("");
    setLink("");
    setPoster(null);
  };

  const addLink = () => {
    if (!/^https?:\/\/.+/.test(link.trim())) return setMessage("A full video link (https://…), or add a file.");
    add(link.trim());
  };

  const addFile = (file: File) => {
    if (!file.type.startsWith("video/")) return setMessage(`"${file.name}" is not a video file.`);
    if (file.size > MAX_FILE_MB * 1024 * 1024)
      return setMessage(`"${file.name}" is over ${MAX_FILE_MB}MB. Host larger films and add them as a link.`);
    const reader = new FileReader();
    reader.onload = () => add(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-3xl">
      <ScreenHeader
        title="Films"
        text="Short films with a muted preview. On your profile they play in view, sound off until tapped."
        right={<SaveState status={status} error={error} />}
      />

      {form.films.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No films yet."
            text="A 10-second muted preview brings a profile to life. Add one below."
            tone="white"
            className="border border-line"
          />
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {form.films.map((film, i) => (
            <li key={film.id} className="border border-line bg-white p-2">
              <FilmPreview film={film} sizes="(min-width: 40rem) 24rem, 100vw" />
              <div className="flex items-center justify-between gap-2 px-1 pt-2">
                <p className="min-w-0 truncate text-small text-ink">{film.title}</p>
                <span className="flex shrink-0 items-center gap-1">
                  <ReorderButtons
                    index={i}
                    total={form.films.length}
                    onMove={(f, t) => save(moveItem(form.films, f, t))}
                    label={film.title || "film"}
                  />
                  <button type="button" onClick={() => save(form.films.filter((f) => f.id !== film.id))} className="label tap px-2 text-mute transition-chrome hover:text-ink">
                    Delete
                  </button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <StudioCard title="Add a film" className="mt-8">
        <div className="grid gap-6">
          <Field id="fi-title" label="Title">
            <input id="fi-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. A lake-palace morning" className={inputClass} />
          </Field>
          <Field id="fi-poster" label="Poster" hint="Shown before the film plays.">
            <PhotoPicker
              label="Choose a poster"
              photos={listing.portfolio}
              selectedIds={poster ? [poster.id] : []}
              onToggle={(photo) => setPoster(poster?.id === photo.id ? null : photo)}
              max={1}
            />
          </Field>
          <Field id="fi-link" label="Video link" hint={`A direct .mp4/.webm link, or add a file up to ${MAX_FILE_MB}MB.`}>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input id="fi-link" type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" className={inputClass} />
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={addLink} className="label tap flex-1 border border-ink px-4 py-2.5 text-ink transition-chrome hover:bg-ink hover:text-white sm:flex-none sm:py-0">
                  Add link
                </button>
                <button type="button" onClick={() => fileRef.current?.click()} className="label tap flex-1 border border-line px-4 py-2.5 text-ink transition-chrome hover:border-ink sm:flex-none sm:py-0">
                  Add file
                </button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                className="sr-only"
                aria-label="Upload a film file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) addFile(file);
                  e.target.value = "";
                }}
              />
            </div>
          </Field>
          {message && (
            <p className="text-small text-ink" role="alert">
              {message}
            </p>
          )}
        </div>
      </StudioCard>
    </div>
  );
}
