"use client";

import Link from "next/link";
import { Photo } from "@/components/media/Photo";
import { SaveButton } from "@/components/ui/SaveButton";
import type { VendorSummary } from "@/data/types";
import { formatPriceLakh } from "@/lib/format";

type Props = {
  vendor: VendorSummary;
  sizes?: string;
  priority?: boolean;
};

/**
 * Popular-vendors homepage tile from the home reference: 4/5 photo with a
 * corner Save control, serif name, gold city · category, From ₹1.5L row.
 * No star ratings until real reviews exist.
 */
export function VendorTile({
  vendor,
  sizes = "(min-width: 64rem) 33vw, (min-width: 40rem) 50vw, 100vw",
  priority,
}: Props) {
  const photo = vendor.cardPhotos[0];
  const price = formatPriceLakh(vendor.startingPriceINR, vendor.priceUnit);

  return (
    <article className="group relative">
      <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
        <Link href={`/vendors/${vendor.slug}`} className="absolute inset-0 block" tabIndex={-1} aria-hidden>
          {photo ? (
            <Photo
              photo={photo}
              mode="cover"
              sizes={sizes}
              priority={priority}
              className="transition-transform duration-1200 ease-wedoura group-hover:scale-104"
            />
          ) : null}
        </Link>
        <SaveButton
          slug={vendor.slug}
          name={vendor.name}
          tone="ink"
          withLabel
          className="absolute top-0 right-0 z-10 min-h-11 bg-ivory px-[1.125rem] py-3 text-ink opacity-100 hover:bg-white"
        />
      </div>
      <div className="pt-5 pl-1 md:pl-4">
        <h3 className="font-serif text-[clamp(1.5rem,2vw,2rem)] leading-tight text-ink">
          <Link href={`/vendors/${vendor.slug}`} className="hover:text-gold-deep">
            {vendor.name}
          </Link>
        </h3>
        <p className="mt-1.5 font-sans text-[0.6875rem] font-medium tracking-[0.22em] text-gold-deep uppercase">
          {vendor.cityName} · {vendor.categoryName}
        </p>
        <div className="mt-3.5 flex items-baseline justify-between gap-3 border-t border-line pt-3 font-sans text-[0.9375rem]">
          {price.startsWith("From ") ? (
            <span>
              From <b className="font-medium text-gold-deep">{price.slice(5)}</b>
            </span>
          ) : (
            <span className="font-medium text-gold-deep">{price}</span>
          )}
          {vendor.verified ? (
            <span className="text-mute">
              <b className="font-medium text-ink">Verified</b>
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
