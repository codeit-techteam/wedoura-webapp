import Link from "next/link";
import { Photo } from "@/components/media/Photo";
import { SaveButton } from "@/components/ui/SaveButton";
import type { VendorSummary } from "@/data/types";
import { formatPrice } from "@/lib/format";

type Props = {
  vendor: VendorSummary;
  sizes?: string;
  priority?: boolean;
};

/**
 * A light vendor tile for homepage: photo in 4/5 aspect, name in serif,
 * meta line below (city · category · price). No overlay gradients.
 */
export function VendorTile({
  vendor,
  sizes = "(min-width: 64rem) 33vw, (min-width: 40rem) 50vw, 100vw",
  priority,
}: Props) {
  const photo = vendor.cardPhotos[0];

  return (
    <div className="group relative">
      <Link href={`/vendors/${vendor.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
          {photo && (
            <Photo
              photo={photo}
              mode="cover"
              sizes={sizes}
              priority={priority}
              className="transition-transform duration-1200 ease-wedoura group-hover:scale-104"
            />
          )}
        </div>
        <div className="mt-4">
          <p className="font-serif text-[1.35rem] leading-snug text-ink md:text-[1.45rem]">{vendor.name}</p>
          <p className="mt-1.5 text-small text-mute">
            {vendor.cityName} · {vendor.categoryName} · {formatPrice(vendor.startingPriceINR, vendor.priceUnit)}
          </p>
        </div>
      </Link>
      <SaveButton
        slug={vendor.slug}
        name={vendor.name}
        className="absolute top-3 right-3"
      />
    </div>
  );
}
