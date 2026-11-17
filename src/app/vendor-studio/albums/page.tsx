"use client";

import { useState } from "react";
import { Photo as PhotoImg } from "@/components/media/Photo";
import { Field, ScreenHeader, inputClass } from "@/components/studio/Field";
import { PhotoPicker } from "@/components/studio/PhotoPicker";
import { SaveState } from "@/components/studio/autosave";
import { ReorderButtons, ScreenSkeleton, moveItem, useListingForm } from "@/components/studio/screen";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Album, Photo } from "@/data/types";

export default function AlbumsPage() {
  const { listing, form, apply, status, error } = useListingForm<{ albums: Album[] }>((l) => ({ albums: l.albums }));
  const [editing, setEditing] = useState<number | null>(null);
  if (!form || !listing) return <ScreenSkeleton />;

  const save = (albums: Album[]) => apply({ albums }, { albums });

  const create = () => {
    const slug = `album-${Date.now().toString(36)}`;
    save([...form.albums, { slug, title: "", location: "", photos: [] }]);
    setEditing(form.albums.length);
  };

  const update = (index: number, patch: Partial<Album>) => {
    save(form.albums.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  };

  if (form.albums.length === 0) {
    return (
      <div className="max-w-3xl">
        <ScreenHeader title="Albums" text="Whole weddings, each its own sequence on your profile." right={<SaveState status={status} error={error} />} />
        <div className="mt-8">
          <EmptyState title="No albums yet." text="An album is one wedding told start to finish. Aim for three." action={{ label: "Create your first album", onClick: create }} tone="white" className="border border-line" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <ScreenHeader
        title="Albums"
        text={`${form.albums.length} album${form.albums.length === 1 ? "" : "s"}. Each opens as its own sequence on your profile.`}
        right={<SaveState status={status} error={error} />}
      />
      <ul className="mt-8 grid gap-4">
        {form.albums.map((album, i) => (
          <li key={album.slug} className="border border-line bg-white">
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <button type="button" onClick={() => setEditing(editing === i ? null : i)} className="tap flex min-w-0 flex-1 items-center gap-4 text-left">
                {album.photos[0] && (
                  <span className="relative block size-12 shrink-0 overflow-hidden bg-ivory">
                    <PhotoImg photo={album.photos[0]} mode="cover" sizes="3rem" />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate font-serif text-h3">{album.title || "Untitled album"}</span>
                  <span className="block text-small text-mute">
                    {[album.location, album.date, `${album.photos.length} photos`].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </button>
              <div className="flex shrink-0 items-center gap-2">
                <ReorderButtons index={i} total={form.albums.length} onMove={(f, t) => save(moveItem(form.albums, f, t))} label={album.title || "album"} />
                <button type="button" onClick={() => save(form.albums.filter((_, j) => j !== i))} className="label tap px-2 text-mute transition-chrome hover:text-ink">
                  Delete
                </button>
              </div>
            </div>
            {editing === i && (
              <div className="grid gap-6 border-t border-line p-4">
                <div className="grid gap-5 sm:grid-cols-3">
                  <Field id={`al-title-${i}`} label="Title">
                    <input id={`al-title-${i}`} type="text" value={album.title} onChange={(e) => update(i, { title: e.target.value })} className={inputClass} />
                  </Field>
                  <Field id={`al-city-${i}`} label="City">
                    <input id={`al-city-${i}`} type="text" value={album.location} onChange={(e) => update(i, { location: e.target.value })} className={inputClass} />
                  </Field>
                  <Field id={`al-date-${i}`} label="Date">
                    <input id={`al-date-${i}`} type="date" value={album.date ?? ""} onChange={(e) => update(i, { date: e.target.value || undefined })} className={inputClass} />
                  </Field>
                </div>
                <Field id={`al-photos-${i}`} label="Photos" hint="Pick in order; the numbers show the sequence.">
                  <PhotoPicker
                    label={`Photos for ${album.title || "this album"}`}
                    photos={listing.portfolio}
                    selectedIds={album.photos.map((p) => p.id)}
                    onToggle={(photo: Photo) => {
                      const picked = album.photos.some((p) => p.id === photo.id);
                      update(i, { photos: picked ? album.photos.filter((p) => p.id !== photo.id) : [...album.photos, photo] });
                    }}
                  />
                </Field>
              </div>
            )}
          </li>
        ))}
      </ul>
      <button type="button" onClick={create} className="label tap mt-6 border border-ink px-5 py-2.5 text-ink transition-chrome hover:bg-ink hover:text-white">
        Add an album
      </button>
    </div>
  );
}
