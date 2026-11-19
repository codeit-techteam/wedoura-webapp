"use client";

import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/media/Photo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { degToRad } from "@/lib/panorama";
import { loadTour } from "@/lib/sphere";
import type { ResolvedTour } from "@/lib/tour";
import type { Photo as PhotoData } from "@/data/types";

type Props = {
  tour: ResolvedTour;
  /** The still shown before the visitor steps inside. */
  still: PhotoData;
  venueName: string;
};

type TourHandle = {
  setNode: (id: string) => void;
  destroy: () => void;
};

/**
 * The venue's linked 360° tour. A still photograph until the visitor taps
 * "Step inside"; only then is Photo Sphere Viewer (core + virtual tour +
 * markers + gyroscope) loaded. Drag to look around, arrows placed where the
 * vendor set them lead between spaces, a strip of named spaces, labelled
 * markers, full screen, fade between scenes.
 */
export function VenueTour({ tour, still, venueName }: Props) {
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(tour.scenes[0]?.id ?? "");
  const [failed, setFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<TourHandle | null>(null);

  useEffect(() => {
    if (!started || !containerRef.current) return;
    let disposed = false;

    (async () => {
      try {
        const { Viewer, VirtualTourPlugin, MarkersPlugin, GyroscopePlugin } = await loadTour();
        if (disposed || !containerRef.current) return;

        const startYawByScene = new Map(tour.scenes.map((s) => [s.id, s.startYaw]));
        const viewer = new Viewer({
          container: containerRef.current,
          loadingTxt: "Opening the space…",
          navbar: ["zoom", "move", "caption", "gyroscope", "fullscreen"],
          touchmoveTwoFingers: false,
          defaultYaw: degToRad(tour.scenes[0]?.startYaw ?? 0),
          plugins: [
            MarkersPlugin,
            [
              VirtualTourPlugin,
              {
                positionMode: "manual",
                renderMode: "3d",
                transitionOptions: { showLoader: false, speed: "20rpm", effect: "fade", rotation: false },
                nodes: tour.scenes.map((scene) => ({
                  id: scene.id,
                  panorama: scene.photo.src,
                  name: scene.name,
                  caption: `${scene.name} · ${venueName}${scene.photo.credit ? ` · ${scene.photo.credit}` : ""}`,
                  links: tour.links
                    .filter((link) => link.from === scene.id)
                    .map((link) => ({ nodeId: link.to, position: { yaw: degToRad(link.yaw), pitch: 0 } })),
                  markers: tour.markers
                    .filter((marker) => marker.scene === scene.id)
                    .map((marker, i) => ({
                      id: `${scene.id}-marker-${i}`,
                      position: { yaw: degToRad(marker.yaw), pitch: degToRad(marker.pitch) },
                      tooltip: marker.label,
                      html: `<span class="wedoura-tour-marker">${marker.label}</span>`,
                    })),
                })),
                startNodeId: tour.scenes[0]?.id,
              },
            ],
            GyroscopePlugin,
          ],
        });

        const plugin = viewer.getPlugin<InstanceType<typeof VirtualTourPlugin>>(VirtualTourPlugin);
        plugin.addEventListener("node-changed", (e) => {
          setCurrent(e.node.id);
          const yaw = startYawByScene.get(e.node.id);
          if (yaw !== undefined) viewer.rotate({ yaw: degToRad(yaw), pitch: 0 });
        });
        handleRef.current = {
          setNode: (id: string) => void plugin.setCurrentNode(id),
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
  }, [started, tour, venueName]);

  if (tour.scenes.length === 0) return null;

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
          {tour.scenes.map((scene) => (
            <li key={scene.id}>
              <button
                type="button"
                onClick={() => handleRef.current?.setNode(scene.id)}
                aria-pressed={current === scene.id}
                className={cn(
                  "label tap border px-4 transition-chrome",
                  current === scene.id ? "border-ink bg-ink text-white" : "border-line text-ink hover:border-ink",
                )}
              >
                {scene.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
