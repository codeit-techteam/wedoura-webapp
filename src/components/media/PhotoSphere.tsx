"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Photo } from "@/data/types";
import { cn } from "@/lib/cn";
import { degToRad } from "@/lib/panorama";
import { loadSphere } from "@/lib/sphere";

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
 * One 360° photo, viewed in place. Photo Sphere Viewer is imported only when
 * this mounts (see src/lib/sphere.ts); until then — and if loading fails —
 * the flat photograph stays visible. Drag or touch to look around, scroll or
 * pinch to zoom, gyroscope on phones, full screen from the toolbar.
 */
export function PhotoSphere({ photo, startYaw, onYawChange, autorotate = true, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const yawRef = useRef(onYawChange);
  useEffect(() => {
    yawRef.current = onYawChange;
  }, [onYawChange]);

  useEffect(() => {
    if (!containerRef.current) return;
    let disposed = false;
    let destroy = () => {};

    (async () => {
      try {
        const { Viewer, AutorotatePlugin, GyroscopePlugin } = await loadSphere();
        if (disposed || !containerRef.current) return;
        const viewer = new Viewer({
          container: containerRef.current,
          panorama: photo.src,
          loadingTxt: "Opening the photograph…",
          navbar: ["zoom", "move", "gyroscope", "fullscreen"],
          touchmoveTwoFingers: false,
          keyboard: false,
          defaultYaw: degToRad(startYaw ?? 0),
          plugins: [
            [
              AutorotatePlugin,
              autorotate
                ? { autostartDelay: 1200, autorotateSpeed: "0.6rpm", autostartOnIdle: false }
                : { autostartDelay: null, autostartOnIdle: false },
            ],
            GyroscopePlugin,
          ],
        });
        viewer.addEventListener("ready", () => {
          if (!disposed) setReady(true);
        });
        viewer.addEventListener("position-updated", (e) => {
          const deg = ((e.position.yaw * 180) / Math.PI + 360) % 360;
          yawRef.current?.(Math.round(deg * 10) / 10);
        });
        destroy = () => viewer.destroy();
      } catch {
        if (!disposed) setFailed(true);
      }
    })();

    return () => {
      disposed = true;
      destroy();
    };
    // The viewer is rebuilt per photo; startYaw/autorotate only matter at creation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo.src]);

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-ink", className)}>
      {(!ready || failed) && (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="100vw"
          quality={75}
          placeholder="blur"
          blurDataURL={photo.blurDataURL}
          className="object-cover select-none"
          draggable={false}
        />
      )}
      <div ref={containerRef} className={cn("h-full w-full", (!ready || failed) && "invisible")} />
      {photo.credit && (
        <p className="label pointer-events-none absolute right-2 bottom-2 z-10 text-[12px] normal-case tracking-normal text-white/60">
          {photo.credit}
        </p>
      )}
    </div>
  );
}
