"use client";

import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/media/Photo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { Photo as PhotoData } from "@/data/types";

export type TourSpace = { id: string; name: string; panorama: string; links: string[] };

type Props = {
  spaces: TourSpace[];
  /** The still shown before the visitor steps inside. */
  still: PhotoData;
  venueName: string;
};

type TourHandle = {
  setNode: (id: string) => void;
  destroy: () => void;
};

/**
 * The venue's 360° tour. A still photograph until the visitor taps
 * "Step inside"; only then is Photo Sphere Viewer (core + virtual tour +
 * gyroscope) loaded. Drag to look around, arrows between spaces, a strip of
 * named spaces, full screen, fade between scenes.
 */
export function VenueTour({ spaces, still, venueName }: Props) {
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(spaces[0]?.id ?? "");
  const [failed, setFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<TourHandle | null>(null);

  useEffect(() => {
    if (!started || !containerRef.current) return;
    let disposed = false;

    (async () => {
      try {
        const [{ Viewer }, { VirtualTourPlugin }, { GyroscopePlugin }] = await Promise.all([
          import("@photo-sphere-viewer/core"),
          import("@photo-sphere-viewer/virtual-tour-plugin"),
          import("@photo-sphere-viewer/gyroscope-plugin"),
        ]);
        await Promise.all([
          import("@photo-sphere-viewer/core/index.css"),
          import("@photo-sphere-viewer/virtual-tour-plugin/index.css"),
        ]);
        if (disposed || !containerRef.current) return;

        const viewer = new Viewer({
          container: containerRef.current,
          loadingTxt: "Opening the space…",
          navbar: ["zoom", "move", "caption", "gyroscope", "fullscreen"],
          touchmoveTwoFingers: false,
          plugins: [
            [
              VirtualTourPlugin,
              {
                positionMode: "manual",
                renderMode: "3d",
                transitionOptions: { showLoader: false, speed: "20rpm", effect: "fade", rotation: false },
                nodes: spaces.map((space, i) => ({
                  id: space.id,
                  panorama: space.panorama,
                  name: space.name,
                  caption: `${space.name} · ${venueName}`,
                  links: space.links.map((nodeId, j) => ({
                    nodeId,
                    position: { yaw: ((j + 1) * Math.PI) / 2 + i, pitch: 0 },
                  })),
                })),
                startNodeId: spaces[0]?.id,
              },
            ],
            GyroscopePlugin,
          ],
        });

        const tour = viewer.getPlugin<InstanceType<typeof VirtualTourPlugin>>(VirtualTourPlugin);
        tour.addEventListener("node-changed", (e) => setCurrent(e.node.id));
        handleRef.current = {
          setNode: (id: string) => void tour.setCurrentNode(id),
          destroy: () => viewer.destroy(),
        };
      } catch {
        if (!disposed) setFailed(true);
      }
    })();

    return () => {
      disposed = true;
      handleRef.current?.destroy();
      handleRef.current = null;
    };
  }, [started, spaces, venueName]);

  if (spaces.length === 0) return null;

  return (
    <div>
      <div className="relative aspect-video overflow-hidden bg-ink">
        {!started && (
          <>
            <Photo photo={still} mode="cover" sizes="(min-width: 48rem) 60vw, 100vw" />
            <div aria-hidden="true" className="absolute inset-0 bg-ink/35" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-white">
              <p className="font-serif text-h3">Walk the spaces before you visit.</p>
              <Button tone="white" onClick={() => setStarted(true)}>
                Step inside
              </Button>
              <p className="text-small text-white/80">Drag to look around; arrows move between spaces.</p>
            </div>
          </>
        )}
        {started && failed && (
          <div className="flex h-full items-center justify-center p-6 text-center text-white">
            <p className="max-w-sm text-body">The 360° viewer could not load here. The photographs above show every space.</p>
          </div>
        )}
        <div ref={containerRef} className={cn("h-full w-full", (!started || failed) && "hidden")} />
      </div>

      {started && !failed && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Spaces in this tour">
          {spaces.map((space) => (
            <li key={space.id}>
              <button
                type="button"
                onClick={() => handleRef.current?.setNode(space.id)}
                aria-pressed={current === space.id}
                className={cn(
                  "label tap border px-4 transition-chrome",
                  current === space.id ? "border-ink bg-ink text-white" : "border-line text-ink hover:border-ink",
                )}
              >
                {space.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
