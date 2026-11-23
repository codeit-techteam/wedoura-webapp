import Link from "next/link";
import { EnquireButton } from "@/components/browse/EnquireButton";
import { Photo } from "@/components/media/Photo";
import { SaveButton } from "@/components/ui/SaveButton";
import type { VendorSummary } from "@/data/types";
import { formatPrice } from "@/lib/format";

interface Props {
  vendor: VendorSummary;
  index: number;
  priority?: boolean;
}

/**
 * A numbered horizontal list card for the /vendors list view.
 * Cover strip on the left, details on the right. No overlay gradients.
 */
export function VendorListCard({ vendor, index, priority }: Props) {
  const travelsBeyondBase =
    vendor.travels?.trim() ||
    vendor.citiesServed.some((c) => c !== vendor.citySlug);

  const styleStr = vendor.styles.length > 0 ? vendor.styles.join(" / ") : null;

  return (
    <article className="group relative flex gap-5 md:gap-7">
      {/* Number */}
      <span
        aria-hidden="true"
        className="hidden shrink-0 pt-1 font-serif text-[2.5rem] leading-none text-mute/25 select-none md:block"
        style={{ width: "2.5rem", textAlign: "right" }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Cover photo strip */}
      <Link
        href={`/vendors/${vendor.slug}`}
        className="relative block w-32 shrink-0 overflow-hidden bg-ivory sm:w-44 md:w-56"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="aspect-[3/4]">
          {vendor.cardPhotos[0] && (
            <Photo
              photo={vendor.cardPhotos[0]}
              mode="cover"
              sizes="(min-width: 48rem) 224px, 128px"
              priority={priority}
              className="transition-transform duration-1200 ease-wedoura group-hover:scale-104"
            />
          )}
        </div>
        {vendor.featured && (
          <span className="absolute top-2 left-2 bg-gold px-2 py-0.5 font-sans text-[10px] font-medium uppercase tracking-[0.1em] text-ink">
            ✦ Pick
          </span>
        )}
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between gap-4 py-1">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="label text-mute">{vendor.categoryName}</p>
              <Link href={`/vendors/${vendor.slug}`}>
                <h2 className="mt-1 font-serif text-h3 leading-tight text-ink transition-chrome hover:text-gold-deep">
                  {vendor.name}
                </h2>
              </Link>
            </div>
            {/* Save button */}
            <SaveButton
              slug={vendor.slug}
              name={vendor.name}
              tone="ink"
              className="shrink-0 mt-0.5"
            />
          </div>

          {vendor.tagline && (
            <p className="mt-2 text-body text-mute line-clamp-2">{vendor.tagline}</p>
          )}

          {/* Facts row */}
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
            <span className="text-small text-mute">
              <span className="font-medium text-ink">Based in</span> {vendor.cityName}
            </span>
            {travelsBeyondBase && (
              <span className="text-small text-mute">Travels anywhere</span>
            )}
            <span className="text-small text-mute">
              <span className="font-medium text-ink">Starting at</span>{" "}
              {formatPrice(vendor.startingPriceINR, vendor.priceUnit)}
            </span>
          </div>

          {styleStr && (
            <p className="mt-2 text-small text-mute">{styleStr}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <EnquireButton slug={vendor.slug} name={vendor.name} />
          <Link
            href={`/vendors/${vendor.slug}`}
            className="tap inline-flex min-h-11 items-center justify-center font-sans text-button font-medium tracking-button uppercase text-ink transition-chrome hover:text-gold-deep link-draw"
          >
            View profile
          </Link>
        </div>
      </div>
    </article>
  );
}
