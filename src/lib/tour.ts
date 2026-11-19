import type { Photo, TourLink, TourMarker, VenueTourData } from "@/data/types";

export type ResolvedTourScene = {
  id: string;
  name: string;
  startYaw: number;
  photo: Photo;
};

export type ResolvedTour = {
  scenes: ResolvedTourScene[];
  links: TourLink[];
  markers: TourMarker[];
};

/**
 * Turn stored tour data (scenes pointing at portfolio photo ids) into scenes
 * carrying their photos. Feed it the photos the reader is allowed to see —
 * the public detail's portfolio is already pending-filtered, so scenes whose
 * photo awaits approval drop out here, along with any links and markers that
 * pointed into them. Returns null when nothing is left to walk.
 */
export function resolveTour(tour: VenueTourData | undefined, photos: Photo[]): ResolvedTour | null {
  if (!tour || tour.scenes.length === 0) return null;
  const byId = new Map(photos.map((p) => [p.id, p]));
  const scenes: ResolvedTourScene[] = [];
  for (const scene of tour.scenes) {
    const photo = byId.get(scene.photoId);
    if (!photo || photo.projection !== "equirectangular") continue;
    scenes.push({ id: scene.id, name: scene.name, startYaw: scene.startYaw ?? 0, photo });
  }
  if (scenes.length === 0) return null;
  const kept = new Set(scenes.map((s) => s.id));
  const links = tour.links.filter((l) => kept.has(l.from) && kept.has(l.to) && l.from !== l.to);
  const markers = (tour.markers ?? []).filter((m) => kept.has(m.scene));
  return { scenes, links, markers };
}
