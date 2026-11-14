"use client";

import Link from "next/link";
import { useRef } from "react";
import { Photo } from "@/components/media/Photo";
import { Icon } from "@/components/ui/Icon";
import type { Photo as PhotoData } from "@/data/types";

export type RailVendor = {
  slug: string;
  name: string;
  cityName: string;
  category: string;
  startingPrice?: string;
  photos: [PhotoData, PhotoData, PhotoData];
};

type Props = { vendors: RailVendor[] };

/**
 * Featured vendors as a horizontal rail that drags and snaps. Each vendor is
 * a triptych: one large photograph and two small, with name, city and the
 * starting price underneath. Arrow buttons appear from md up.
 */
export function VendorRail({ vendors }: Props) {
  const railRef = useRef<HTMLUListElement>(null);

  function scrollByItem(direction: 1 | -1) {
    const rail = railRef.current;
    const item = rail?.firstElementChild as HTMLElement | null;
    if (!rail || !item) return;
    rail.scrollBy({ left: direction * (item.offsetWidth + 24), behavior: "smooth" });
  }

  return (
    <div className="relative">
      <ul
        ref={railRef}
        className="-mx-gutter flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-gutter px-gutter pb-2"
        aria-label="Featured vendors"
      >
        {vendors.map((vendor) => (
          <li key={vendor.slug} className="w-5/6 shrink-0 snap-start md:w-7/12 xl:w-5/12">
            <Link href={`/vendors/${vendor.slug}`} className="group block outline-offset-4">
              <div className="grid grid-cols-[2fr_1fr] grid-rows-2 gap-2">
                <div className="relative row-span-2 overflow-hidden bg-ivory">
                  <Photo
                    photo={vendor.photos[0]}
                    mode="cover"
                    sizes="(min-width: 48rem) 38vw, 56vw"
                    className="transition-transform duration-1200 ease-wedoura group-hover:scale-104"
                  />
                </div>
                <div className="relative aspect-square overflow-hidden bg-ivory">
                  <Photo photo={vendor.photos[1]} mode="cover" sizes="(min-width: 48rem) 19vw, 28vw" />
                </div>
                <div className="relative aspect-square overflow-hidden bg-ivory">
                  <Photo photo={vendor.photos[2]} mode="cover" sizes="(min-width: 48rem) 19vw, 28vw" />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <p className="font-serif text-h3 leading-tight">{vendor.name}</p>
                <p className="text-small text-mute">{vendor.category}</p>
              </div>
              <p className="mt-1 text-small text-mute">
                {vendor.cityName}
                {vendor.startingPrice ? ` · ${vendor.startingPrice}` : ""}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 hidden justify-end gap-3 md:flex">
        <button
          type="button"
          onClick={() => scrollByItem(-1)}
          aria-label="Previous vendors"
          className="tap inline-flex items-center justify-center border border-line text-ink transition-chrome hover:border-ink"
        >
          <Icon name="arrow-left" size={18} />
        </button>
        <button
          type="button"
          onClick={() => scrollByItem(1)}
          aria-label="Next vendors"
          className="tap inline-flex items-center justify-center border border-line text-ink transition-chrome hover:border-ink"
        >
          <Icon name="arrow-right" size={18} />
        </button>
      </div>
    </div>
  );
}
