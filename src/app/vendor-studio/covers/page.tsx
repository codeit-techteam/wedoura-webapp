"use client";

import { useEffect, useState } from "react";
import { VendorCard } from "@/components/cards/VendorCard";
import { Photo as PhotoImg } from "@/components/media/Photo";
import { Field, ScreenHeader } from "@/components/studio/Field";
import { PhotoPicker } from "@/components/studio/PhotoPicker";
import { SaveState } from "@/components/studio/autosave";
import { ScreenSkeleton, useListingForm } from "@/components/studio/screen";
import type { Category, City, Photo } from "@/data/types";
import { listAllCategories, listAllCities } from "@/lib/api";
import { listingToSummary } from "@/lib/listing-view";

type Form = { cover?: Photo; cardPhotos: Photo[]; aboutPhoto?: Photo };

export default function CoversPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  useEffect(() => {
    void listAllCategories().then(setCategories);
    void listAllCities().then(setCities);
  }, []);

  const { listing, form, apply, status, error } = useListingForm<Form>((l) => ({
    cover: l.cover,
    cardPhotos: l.cardPhotos,
    aboutPhoto: l.aboutPhoto,
  }));
  if (!form || !listing || categories.length === 0 || cities.length === 0) return <ScreenSkeleton />;

  const toggleCard = (photo: Photo) => {
    const picked = form.cardPhotos.some((p) => p.id === photo.id);
    const cardPhotos = picked ? form.cardPhotos.filter((p) => p.id !== photo.id) : [...form.cardPhotos, photo];
    apply({ cardPhotos }, { cardPhotos });
  };

  // The live previews render exactly what the public site will.
  const draft = { ...listing, ...form };
  const summary = listingToSummary(draft, categories, cities, { includePending: true });

  return (
    <div className="max-w-4xl">
      <ScreenHeader
        title="Cover & card photos"
        text="The cover opens your profile; the three card photos cycle on your card in lists."
        right={<SaveState status={status} error={error} />}
      />
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div className="grid gap-9">
          <Field id="cv-cover" label="Cover photo" hint="One photo. It is shown full-bleed, so wide images work best.">
            <PhotoPicker
              label="Choose the cover"
              photos={listing.portfolio}
              selectedIds={form.cover ? [form.cover.id] : []}
              onToggle={(photo) => {
                const cover = form.cover?.id === photo.id ? undefined : photo;
                apply({ cover }, { cover });
              }}
              max={1}
            />
          </Field>
          <Field id="cv-cards" label="Card photos" hint={`Exactly three, in order. ${form.cardPhotos.length} of 3 chosen.`}>
            <PhotoPicker label="Choose the three card photos" photos={listing.portfolio} selectedIds={form.cardPhotos.map((p) => p.id)} onToggle={toggleCard} max={3} />
          </Field>
          <Field id="cv-about" label="About photo" hint="Optional: a portrait or team photograph beside your about text.">
            <PhotoPicker
              label="Choose the about photo"
              photos={listing.portfolio}
              selectedIds={form.aboutPhoto ? [form.aboutPhoto.id] : []}
              onToggle={(photo) => {
                const aboutPhoto = form.aboutPhoto?.id === photo.id ? undefined : photo;
                apply({ aboutPhoto }, { aboutPhoto });
              }}
              max={1}
            />
          </Field>
        </div>

        {/* Live previews, exactly as couples see them. */}
        <aside aria-label="Previews" className="lg:sticky lg:top-6 lg:self-start">
          <p className="label text-mute">Your card in lists</p>
          <div className="mt-3 max-w-60">
            {summary.cardPhotos.length > 0 ? (
              <VendorCard vendor={summary} sizes="15rem" />
            ) : (
              <p className="border border-line bg-white p-4 text-small text-mute">Pick card photos to see the card.</p>
            )}
          </div>
          <p className="label mt-8 text-mute">Your profile cover</p>
          <div className="mt-3">
            {form.cover ? (
              <div className="relative flex h-44 flex-col justify-end overflow-hidden bg-ink text-white">
                <PhotoImg photo={form.cover} mode="cover" sizes="20rem" objectPosition="50% 45%" />
                <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/25 to-ink/20" />
                <div className="relative p-4">
                  <p className="font-serif text-h3">{listing.name}</p>
                  <p className="text-small text-white/85">
                    {summary.categoryName} · {summary.cityName}
                  </p>
                </div>
              </div>
            ) : (
              <p className="border border-line bg-white p-4 text-small text-mute">Pick a cover to see the opener.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
