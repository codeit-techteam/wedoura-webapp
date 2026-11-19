"use client";

import { useRef, useState } from "react";
import { PhotoSphere } from "@/components/media/PhotoSphere";
import { Field, ScreenHeader, StudioCard, inputClass } from "@/components/studio/Field";
import { PhotoPicker } from "@/components/studio/PhotoPicker";
import { SaveState } from "@/components/studio/autosave";
import { ReorderButtons, ScreenSkeleton, moveItem, useListingForm } from "@/components/studio/screen";
import type { Photo, TourLink, TourMarker, TourScene, VenueDetails, VenueTourData } from "@/data/types";

type Form = {
  category: string;
  venue?: VenueDetails;
  portfolio: Photo[];
};

const EMPTY_TOUR: VenueTourData = { scenes: [], links: [], markers: [] };

/** Wrap any number into 0–360. */
function normYaw(value: number): number {
  return ((value % 360) + 360) % 360;
}

/**
 * The venue's 360° tour: pick equirectangular portfolio photos as scenes,
 * name them, set where each one opens, and place the arrows that lead
 * between them. Couples walk the result from the profile's "Step inside".
 */
export default function TourPage() {
  const { listing, form, apply, status, error } = useListingForm<Form>((l) => ({
    category: l.category,
    venue: l.venue,
    portfolio: l.portfolio,
  }));
  const [previewScene, setPreviewScene] = useState<string | null>(null);
  const lastYaw = useRef<number>(0);
  if (!form || !listing) return <ScreenSkeleton />;

  const venue: VenueDetails = form.venue ?? { capacity: { min: 50, max: 200 }, spaces: [] };
  const tour: VenueTourData = venue.tour ?? EMPTY_TOUR;
  const panoramas = form.portfolio.filter((p) => p.projection === "equirectangular");
  const photoById = new Map(form.portfolio.map((p) => [p.id, p]));

  const setTour = (next: VenueTourData) => {
    const nextVenue = { ...venue, tour: next.scenes.length > 0 ? next : undefined };
    apply({ venue: nextVenue }, { venue: nextVenue });
  };

  if (form.category !== "venues") {
    return (
      <div className="max-w-2xl">
        <ScreenHeader
          title="360 tour"
          text="Linked walk-throughs are for venue listings. Your 360° photos still open as spheres in your portfolio."
        />
      </div>
    );
  }

  const togglePhoto = (photo: Photo) => {
    const existing = tour.scenes.find((s) => s.photoId === photo.id);
    if (existing) {
      setTour({
        scenes: tour.scenes.filter((s) => s.id !== existing.id),
        links: tour.links.filter((l) => l.from !== existing.id && l.to !== existing.id),
        markers: (tour.markers ?? []).filter((m) => m.scene !== existing.id),
      });
      if (previewScene === existing.id) setPreviewScene(null);
    } else {
      const scene: TourScene = {
        id: `sc-${photo.id}`,
        photoId: photo.id,
        name: `Space ${tour.scenes.length + 1}`,
        startYaw: 0,
      };
      setTour({ ...tour, scenes: [...tour.scenes, scene] });
    }
  };

  const patchScene = (id: string, patch: Partial<TourScene>) =>
    setTour({ ...tour, scenes: tour.scenes.map((s) => (s.id === id ? { ...s, ...patch } : s)) });

  const linkBetween = (from: string, to: string) => tour.links.find((l) => l.from === from && l.to === to);

  const toggleLink = (from: string, to: string) => {
    const existing = linkBetween(from, to);
    setTour({
      ...tour,
      links: existing
        ? tour.links.filter((l) => l !== existing)
        : [...tour.links, { from, to, yaw: 0 } satisfies TourLink],
    });
  };

  const setLinkYaw = (from: string, to: string, yaw: number) =>
    setTour({
      ...tour,
      links: tour.links.map((l) => (l.from === from && l.to === to ? { ...l, yaw: normYaw(yaw) } : l)),
    });

  const markers = tour.markers ?? [];
  const sceneMarkers = (scene: string) => markers.filter((m) => m.scene === scene);
  const addMarker = (scene: string) =>
    setTour({ ...tour, markers: [...markers, { scene, yaw: lastYaw.current, pitch: 0, label: "" } satisfies TourMarker] });
  const patchMarker = (marker: TourMarker, patch: Partial<TourMarker>) =>
    setTour({ ...tour, markers: markers.map((m) => (m === marker ? { ...m, ...patch } : m)) });
  const removeMarker = (marker: TourMarker) => setTour({ ...tour, markers: markers.filter((m) => m !== marker) });

  return (
    <div className="max-w-4xl">
      <ScreenHeader
        title="360 tour"
        text="Pick 360° photos from your portfolio as scenes, name them, set where each opens and place the arrows between them."
        right={<SaveState status={status} error={error} />}
      />
      <div className="mt-8 grid gap-6">
        <StudioCard
          title="Scenes"
          text={
            panoramas.length === 0
              ? "No 360° photos yet. Upload equirectangular photos (2:1, at least 4000px wide) under Photos; they are spotted automatically."
              : "Choose which 360° photos become scenes, in walking order."
          }
        >
          <PhotoPicker
            photos={panoramas}
            selectedIds={tour.scenes.map((s) => s.photoId)}
            onToggle={togglePhoto}
            label="360° photos to use as scenes"
          />
        </StudioCard>

        {tour.scenes.map((scene, i) => {
          const photo = photoById.get(scene.photoId);
          const others = tour.scenes.filter((s) => s.id !== scene.id);
          return (
            <StudioCard key={scene.id} title={scene.name || `Scene ${i + 1}`}>
              <div className="grid gap-6">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Field id={`sc-name-${scene.id}`} label="Scene name" hint="e.g. The courtyard">
                      <input
                        id={`sc-name-${scene.id}`}
                        type="text"
                        value={scene.name}
                        onChange={(e) => patchScene(scene.id, { name: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                  <ReorderButtons
                    index={i}
                    total={tour.scenes.length}
                    onMove={(from, to) => setTour({ ...tour, scenes: moveItem(tour.scenes, from, to) })}
                    label={scene.name || `scene ${i + 1}`}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    id={`sc-yaw-${scene.id}`}
                    label="Starting view (degrees)"
                    hint="Where visitors look first. Drag the preview, then use the current view."
                  >
                    <div className="flex gap-2">
                      <input
                        id={`sc-yaw-${scene.id}`}
                        type="number"
                        min={0}
                        max={360}
                        value={scene.startYaw ?? 0}
                        onChange={(e) => patchScene(scene.id, { startYaw: normYaw(Number(e.target.value) || 0) })}
                        className={inputClass}
                      />
                      {previewScene === scene.id && (
                        <button
                          type="button"
                          onClick={() => patchScene(scene.id, { startYaw: normYaw(Math.round(lastYaw.current)) })}
                          className="label tap shrink-0 border border-line px-3 text-ink transition-chrome hover:border-ink"
                        >
                          Use current view
                        </button>
                      )}
                    </div>
                  </Field>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => setPreviewScene(previewScene === scene.id ? null : scene.id)}
                      aria-expanded={previewScene === scene.id}
                      className="label tap border border-line px-4 py-2.5 text-ink transition-chrome hover:border-ink"
                    >
                      {previewScene === scene.id ? "Close preview" : "Preview this scene"}
                    </button>
                  </div>
                </div>

                {previewScene === scene.id && photo && (
                  <div className="aspect-2/1 overflow-hidden border border-line">
                    <PhotoSphere
                      photo={photo}
                      startYaw={scene.startYaw}
                      autorotate={false}
                      onYawChange={(deg) => (lastYaw.current = deg)}
                    />
                  </div>
                )}

                {others.length > 0 && (
                  <Field
                    id={`sc-links-${scene.id}`}
                    label="Arrows from this scene"
                    hint="Each arrow sits at a direction (degrees) inside this scene and leads to another one."
                  >
                    <ul className="grid gap-2">
                      {others.map((other) => {
                        const link = linkBetween(scene.id, other.id);
                        return (
                          <li key={other.id} className="flex flex-wrap items-center gap-3 border border-line bg-white px-3 py-2.5">
                            <label className="tap flex flex-1 cursor-pointer items-center gap-2.5 text-small">
                              <input
                                type="checkbox"
                                checked={!!link}
                                onChange={() => toggleLink(scene.id, other.id)}
                                className="size-4 accent-ink"
                              />
                              To {other.name || "unnamed scene"}
                            </label>
                            {link && (
                              <label className="flex items-center gap-2 text-small text-mute">
                                at
                                <input
                                  type="number"
                                  min={0}
                                  max={360}
                                  value={link.yaw}
                                  onChange={(e) => setLinkYaw(scene.id, other.id, Number(e.target.value) || 0)}
                                  aria-label={`Arrow direction to ${other.name || "unnamed scene"}, degrees`}
                                  className={`${inputClass} w-24 px-2 py-1.5`}
                                />
                                °
                              </label>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </Field>
                )}

                <Field
                  id={`sc-markers-${scene.id}`}
                  label="Markers"
                  hint="Optional labelled points, e.g. Stage, Bridal suite entrance."
                >
                  {sceneMarkers(scene.id).length > 0 && (
                    <ul className="mb-2 grid gap-2">
                      {sceneMarkers(scene.id).map((marker, j) => (
                        <li key={j} className="flex flex-wrap items-center gap-2 border border-line bg-white px-3 py-2.5">
                          <input
                            type="text"
                            value={marker.label}
                            onChange={(e) => patchMarker(marker, { label: e.target.value })}
                            placeholder="Label"
                            aria-label={`Marker ${j + 1} label`}
                            className={`${inputClass} flex-1 px-2 py-1.5`}
                          />
                          <label className="flex items-center gap-1.5 text-small text-mute">
                            yaw
                            <input
                              type="number"
                              min={0}
                              max={360}
                              value={marker.yaw}
                              onChange={(e) => patchMarker(marker, { yaw: normYaw(Number(e.target.value) || 0) })}
                              aria-label={`Marker ${j + 1} direction, degrees`}
                              className={`${inputClass} w-20 px-2 py-1.5`}
                            />
                          </label>
                          <label className="flex items-center gap-1.5 text-small text-mute">
                            pitch
                            <input
                              type="number"
                              min={-90}
                              max={90}
                              value={marker.pitch}
                              onChange={(e) =>
                                patchMarker(marker, { pitch: Math.max(-90, Math.min(90, Number(e.target.value) || 0)) })
                              }
                              aria-label={`Marker ${j + 1} height, degrees`}
                              className={`${inputClass} w-20 px-2 py-1.5`}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => removeMarker(marker)}
                            className="label tap px-2 text-mute transition-chrome hover:text-ink"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    type="button"
                    onClick={() => addMarker(scene.id)}
                    className="label tap border border-line px-4 py-2 text-ink transition-chrome hover:border-ink"
                  >
                    Add a marker
                  </button>
                </Field>
              </div>
            </StudioCard>
          );
        })}
      </div>
    </div>
  );
}
