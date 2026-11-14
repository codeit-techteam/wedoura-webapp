import Link from "next/link";
import { Photo } from "@/components/media/Photo";
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
            <Link
              href={`/vendors?city=${city.slug}`}
              className="group relative block h-full overflow-hidden bg-ivory"
            >
              <Photo
                photo={city.cover}
                mode="cover"
                sizes="(min-width: 48rem) 50vw, 100vw"
                className="transition-transform duration-1200 ease-wedoura group-hover:scale-104"
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-ink/70 to-transparent"
              />
              <p className="absolute bottom-0 left-0 p-5 font-serif text-h3 text-white md:p-6">{city.name}</p>
            </Link>
          </ImageReveal>
        </li>
      ))}
    </ul>
  );
}
