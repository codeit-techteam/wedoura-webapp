import { PhotoTile } from "@/components/cards/PhotoTile";
import { ImageReveal } from "@/components/motion/ImageReveal";
import type { City } from "@/data/types";
import { cn } from "@/lib/cn";

type Props = { cities: City[] };

/** A photo mosaic of the six cities, uneven tile sizes, names over photos. */
export function CityMosaic({ cities }: Props) {
  // Spans tuned for six tiles on a 4-column grid (2 columns on phones).
  const spans = [
    "col-span-2 row-span-2", // Udaipur: large
    "col-span-1 row-span-1",
    "col-span-1 row-span-1",
    "col-span-1 row-span-1",
    "col-span-1 row-span-1",
    "col-span-2 row-span-1 md:col-span-4", // Delhi: full-width strip
  ];

  return (
    <ul className="grid auto-rows-[36vw] grid-cols-2 gap-2 md:auto-rows-[24vw] md:grid-cols-4" aria-label="Cities">
      {cities.map((city, i) => (
        <li key={city.slug} className={cn("relative", spans[i % spans.length])}>
          <ImageReveal delay={(i % 3) * 0.08} className="h-full">
            <PhotoTile
              photo={city.cover}
              title={city.name}
              href={`/vendors?city=${city.slug}`}
              sizes="(min-width: 48rem) 50vw, 100vw"
            />
          </ImageReveal>
        </li>
      ))}
    </ul>
  );
}
