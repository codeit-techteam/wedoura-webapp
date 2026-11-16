"use client";

import { AnimatePresence, motion } from "motion/react";
import { PhotoTile } from "@/components/cards/PhotoTile";
import { Photo } from "@/components/media/Photo";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import type { Destination } from "@/data/types";
import { EASE } from "@/lib/motion";
import { useParamState } from "@/lib/url-state";

type Props = { destinations: Destination[] };

/**
 * Honeymoon destinations: large photo tiles; choosing one opens a detail
 * panel beneath the grid. The choice lives in the URL (?place=).
 */
export function DestinationExplorer({ destinations }: Props) {
  const [place, setPlace] = useParamState("place");
  const selected = destinations.find((d) => d.slug === place) ?? null;

  return (
    <div>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4" aria-label="Destinations">
        {destinations.map((destination) => (
          <li key={destination.slug} className="relative aspect-3/4">
            <button
              type="button"
              onClick={() => setPlace(place === destination.slug ? null : destination.slug)}
              aria-expanded={place === destination.slug}
              className="block h-full w-full text-left outline-offset-4"
            >
              <PhotoTile
                photo={destination.cover}
                title={destination.name}
                sizes="(min-width: 48rem) 25vw, 100vw"
              />
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence mode="wait">
        {selected && (
          <motion.section
            key={selected.slug}
            aria-label={selected.name}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="mt-2 grid gap-8 bg-ivory p-6 md:grid-cols-[1.2fr_1fr] md:gap-14 md:p-12">
              <div className="relative aspect-4/3 overflow-hidden">
                <Photo photo={selected.cover} mode="cover" sizes="(min-width: 48rem) 55vw, 100vw" />
              </div>
              <div>
                <div className="flex items-start justify-between gap-6">
                  <h2 className="font-serif text-h2">{selected.name}</h2>
                  <button
                    type="button"
                    onClick={() => setPlace(null)}
                    className="label tap px-2 text-mute transition-chrome hover:text-ink"
                  >
                    Close
                  </button>
                </div>
                <p className="mt-2 text-small text-mute">
                  {selected.country} · Best from {selected.bestMonths}
                </p>
                <p className="mt-5 max-w-prose text-mute">{selected.summary}</p>
                <Label className="mt-8 block">Why couples go</Label>
                <ul className="mt-3 border-t border-ink/20">
                  {selected.highlights.map((line) => (
                    <li key={line} className="border-b border-ink/20 py-3 text-body">
                      {line}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Button href="/contact" variant="outline">
                    Plan it with us
                  </Button>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
