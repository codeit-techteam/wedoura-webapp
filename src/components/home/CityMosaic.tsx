import { PhotoTile } from "@/components/cards/PhotoTile";
import { ImageReveal } from "@/components/motion/ImageReveal";
import type { City } from "@/data/types";
import { cn } from "@/lib/cn";

type Props = { cities: (City & { count?: number })[] };

const ORDER = ["udaipur", "jaipur", "goa", "bengaluru", "mumbai", "delhi"] as const;

const SPANS = [
  "col-span-2 row-span-2", // Udaipur
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-2 row-span-2 md:col-span-4", // Delhi: full width, double row height
];

function sortCities(cities: (City & { count?: number })[]) {
  const bySlug = new Map(cities.map((c) => [c.slug, c]));
  const ordered = ORDER.map((slug) => bySlug.get(slug)).filter((c): c is City & { count?: number } => c !== undefined);
  for (const city of cities) {
    if (!ORDER.includes(city.slug as (typeof ORDER)[number])) ordered.push(city);
  }
  return ordered;
}

/** One grid: five uneven tiles and a full-width Delhi band with enough height for landscape covers. */
export function CityMosaic({ cities }: Props) {
  const ordered = sortCities(cities);

  return (
    <ul
      className="grid auto-rows-[min(40vw,16rem)] grid-cols-2 gap-2 md:auto-rows-[min(18vw,12.5rem)] md:grid-cols-4"
      aria-label="Cities"
    >
      {ordered.map((city, i) => {
        const wide = city.slug === "delhi";
        const tile = (
          <PhotoTile
            photo={city.cover}
            title={city.name}
            meta={city.count ? `${city.count} vendor${city.count === 1 ? "" : "s"}` : undefined}
            href={`/vendors?city=${city.slug}`}
            sizes={wide ? "100vw" : i === 0 ? "(min-width: 48rem) 50vw, 100vw" : "(min-width: 48rem) 25vw, 50vw"}
            objectPosition={wide ? "50% 38%" : undefined}
            className="h-full min-h-0"
          />
        );

        return (
          <li key={city.slug} className={cn("relative min-h-0", SPANS[i] ?? "col-span-1 row-span-1")}>
            {wide ? (
              <div className="h-full min-h-0">{tile}</div>
            ) : (
              <ImageReveal delay={(i % 3) * 0.08} className="h-full min-h-0">
                {tile}
              </ImageReveal>
            )}
          </li>
        );
      })}
    </ul>
  );
}