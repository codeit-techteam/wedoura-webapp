import Link from "next/link";
import { Photo } from "@/components/media/Photo";
import type { VendorSummary } from "@/data/types";
import { formatPriceLakh } from "@/lib/format";

type Props = {
  vendor: VendorSummary;
  sizes?: string;
  priority?: boolean;
};

/**
 * Popular-vendors homepage tile: 4/5 photo, serif name, gold city · category,
 * then “From ₹1.5L” with Verified only when the listing is verified.
 * No ratings — those stay hidden until real reviews exist.
 */
export function VendorTile({
  vendor,
  sizes = "(min-width: 64rem) 33vw, (min-width: 40rem) 50vw, 100vw",
  priority,
}: Props) {
  const photo = vendor.cardPhotos[0];
  const price = formatPriceLakh(vendor.startingPriceINR, vendor.priceUnit);

  return (
    <Link href={`/vendors/${vendor.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
        {photo ? (
          <Photo
            photo={photo}
            mode="cover"
            sizes={sizes}
            priority={priority}
            className="transition-transform duration-1200 ease-wedoura group-hover:scale-104"
          />
        ) : null}
      </div>
      <div className="mt-5">
        <p className="font-serif text-[clamp(1.5rem,2vw,1.875rem)] leading-snug text-ink">
          {vendor.name}
        </p>
        <p className="mt-2 font-sans text-[0.6875rem] font-medium tracking-[0.22em] text-gold-deep uppercase">
          {vendor.cityName} · {vendor.categoryName}
        </p>
        <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-line pt-3 font-sans text-[0.9375rem]">
          <span className="font-medium text-gold-deep">{price}</span>
          {vendor.verified ? <span className="text-mute">Verified</span> : null}
        </div>
      </div>
    </Link>
  );
}
