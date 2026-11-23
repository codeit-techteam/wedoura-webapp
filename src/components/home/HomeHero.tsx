import Image from "next/image";
import { SearchPill } from "@/components/browse/SearchPill";
import type { CategoryGroup, CityOption } from "@/components/browse/SearchPill";

type Props = {
  cities: CityOption[];
  categoryGroups: CategoryGroup[];
};

/**
 * Homepage first screen: headline, full-bleed photo, search pill overlapping
 * the photo, trust row. Light ivory — no data-nav-dark.
 */
export function HomeHero({ cities, categoryGroups }: Props) {
  return (
    <div className="bg-ivory">
      <section aria-label="Hero" className="flex min-h-[min(100svh,52rem)] flex-col">
        <div className="px-[clamp(1.25rem,5vw,5.5rem)] pt-10 pb-8 md:pt-14 md:pb-10 xl:pt-16">
          <p className="label text-gold-deep">India’s luxury wedding planning platform</p>
          <h1 className="mt-4 max-w-[14em] font-serif text-[clamp(2.875rem,5.6vw,6rem)] leading-[1.02] text-ink">
            Plan your wedding, <em>beautifully</em>
          </h1>
          <p className="mt-5 max-w-[28em] text-[clamp(1.125rem,1.4vw,1.3125rem)] leading-relaxed text-mute">
            Find and book trusted photographers, planners, venues and more, all in one calm place.
          </p>
        </div>
        <div className="relative min-h-[20rem] flex-1 overflow-hidden bg-sand">
          <Image
            src="/ref/home/image-12.webp"
            alt="A couple exchanging vows on a clifftop deck above the sea, framed by tropical flowers and seated guests"
            fill
            className="object-cover object-[50%_72%]"
            sizes="100vw"
            priority
            unoptimized
          />
        </div>
      </section>

      <div className="relative z-10 -mt-12 px-[clamp(1.25rem,5vw,5.5rem)] pb-10 md:-mt-14 md:pb-14">
        <SearchPill cities={cities} categoryGroups={categoryGroups} className="mx-auto max-w-[65rem]" />
        <ul
          aria-label="Why Wedoura"
          className="mx-auto mt-7 flex max-w-[65rem] flex-wrap items-center justify-center gap-x-8 gap-y-2 font-sans text-[0.9375rem] text-mute"
        >
          {["Free to use", "Prices shown openly", "Hand-picked vendors"].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span aria-hidden="true" className="text-gold">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
