"use client";

import { useCallback, useState } from "react";
import { PanoViewer, type PanoComingSoon, type PanoScene } from "@/components/media/PanoViewer";
import type { ResolvedTour } from "@/lib/tour";
import type { Photo as PhotoData } from "@/data/types";

type Props = {
  tour: ResolvedTour;
  /** Still / poster before the visitor taps. Falls back to the first scene. */
  still?: PhotoData;
  venueName: string;
  /** Spaces that have no panorama yet. */
  comingSoon?: PanoComingSoon[];
  /** External request to open a scene (from a space card). */
  loadRequest?: { sceneId: string; nonce: number } | null;
  note?: string;
};

/**
 * Venue 360° tour using the exact reference WebGL viewer (PanoViewer).
 * Scenes come from resolved tour data (equirectangular portfolio photos).
 */
export function VenueTour({
  tour,
  still,
  venueName,
  comingSoon,
  loadRequest,
  note,
}: Props) {
  const scenes: PanoScene[] = tour.scenes.map((s) => ({
    id: s.id,
    name: s.name,
    src: s.photo.src,
    posterSrc: still?.src ?? s.photo.src,
  }));

  if (scenes.length === 0) return null;

  return (
    <PanoViewer
      scenes={scenes}
      comingSoon={comingSoon}
      loadRequest={loadRequest}
      loadHint="Tap to load"
      note={
        note ??
        `Walk ${venueName} before you visit. Drag to look around; it loads only when you tap.`
      }
      variant="tour"
    />
  );
}

/** Hook helpers for space cards that jump into a tour scene. */
export function useTourLoadRequest() {
  const [loadRequest, setLoadRequest] = useState<{ sceneId: string; nonce: number } | null>(null);
  const requestScene = useCallback((sceneId: string) => {
    setLoadRequest({ sceneId, nonce: Date.now() });
  }, []);
  return { loadRequest, requestScene };
}
