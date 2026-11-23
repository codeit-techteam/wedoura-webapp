"use client";

import { PanoViewer } from "@/components/media/PanoViewer";
import type { Photo } from "@/data/types";
import { cn } from "@/lib/cn";

type Props = {
  photo: Photo;
  /** Where the view starts, in degrees. */
  startYaw?: number;
  /** Reports the yaw (degrees, 0–360) as the viewer looks around. */
  onYawChange?: (yawDeg: number) => void;
  /** A gentle spin until the visitor interacts. On by default. */
  autorotate?: boolean;
  className?: string;
};

/**
 * One 360° photo in place. Uses the same exact WebGL viewer as venue tours
 * (PanoViewer). Equirectangular detection stays in upload/panorama helpers.
 */
export function PhotoSphere({ photo, startYaw, onYawChange, autorotate = true, className }: Props) {
  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-ink", className)}>
      <PanoViewer
        scenes={[
          {
            id: photo.id,
            name: photo.alt || "360° photograph",
            src: photo.src,
            posterSrc: photo.src,
          },
        ]}
        variant="inline"
        autoStart
        hideScenes
        startYawDeg={startYaw}
        autorotate={autorotate}
        onYawChange={onYawChange}
        loadHint="Opening…"
        className="h-full [&_.pv]:min-h-full"
      />
      {photo.credit && (
        <p className="label pointer-events-none absolute right-2 bottom-2 z-10 text-[12px] normal-case tracking-normal text-white/60">
          {photo.credit}
        </p>
      )}
    </div>
  );
}
