"use client";

import Link from "next/link";
import { Photo } from "@/components/media/Photo";
import { VendorsHeartButton } from "@/components/browse/vendors/VendorsHeartButton";
import type { VendorSummary } from "@/data/types";
import { formatINR } from "@/lib/format";

type Props = {
  vendor: VendorSummary;
  index: number;
  priority?: boolean;
};

/** 4:5 grid card for the vendors directory only. */
export function VendorsGridCard({ vendor, index, priority }: Props) {
  const cover = vendor.cardPhotos[0] ?? vendor.stripPhotos[0];
  const serial = String(index + 1).padStart(2, "0");
  const price =
    vendor.startingPriceINR != null && vendor.priceUnit !== "on_request"
      ? formatINR(vendor.startingPriceINR)
      : null;

  return (
    <article className="lb rv">
      {cover ? (
        <Link href={`/vendors/${vendor.slug}`} className="im" tabIndex={-1} aria-hidden>
          <Photo
            photo={cover}
            mode="cover"
            sizes="(min-width: 64rem) 30vw, 48vw"
            priority={priority}
            className="h-full w-full"
          />
        </Link>
      ) : (
        <span className="im" aria-hidden />
      )}
      <VendorsHeartButton slug={vendor.slug} name={vendor.name} />
      <div className="t">
        <span className="no" aria-hidden="true">
          {serial}
        </span>
        <h3>
          <Link href={`/vendors/${vendor.slug}`}>{vendor.name}</Link>
        </h3>
        <p className="m">
          {vendor.categoryName} · {vendor.cityName}
          {price ? (
            <>
              {" "}
              · from <b>{price}</b>
            </>
          ) : null}
        </p>
      </div>
    </article>
  );
}
