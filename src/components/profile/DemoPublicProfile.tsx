"use client";

import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { VendorProfile } from "@/components/profile/VendorProfile";
import type { Category, City, VendorSummary } from "@/data/types";
import { listingToDetail } from "@/lib/listing-view";
import { useDemoPublishedListings, useSessionHydrated } from "@/lib/vendor-api";

type Props = {
  slug: string;
  categories: Pick<Category, "slug" | "name" | "fields">[];
  cities: Pick<City, "slug" | "name">[];
  /** Similar-vendor summaries from the server, kept when the store version renders. */
  similar?: VendorSummary[];
  /** Server-rendered profile to show when the store has nothing newer. */
  fallback?: ReactNode;
};

/**
 * The public profile for listings that live in this browser's mock store,
 * which the server cannot see. Two uses:
 * - Unknown slug (no fallback): a listing published through /demo renders
 *   through the same mapper and components; anything else is a real 404.
 * - Known slug (with fallback): the server-rendered profile shows first and
 *   is swapped for the store version once hydrated, so edits made in the
 *   vendor studio appear on the live page. The backend replaces all of this
 *   with ordinary server rendering.
 */
export function DemoPublicProfile({ slug, categories, cities, similar = [], fallback }: Props) {
  const hydrated = useSessionHydrated();
  const published = useDemoPublishedListings();
  if (!hydrated) return fallback ?? <div className="min-h-dvh" aria-busy="true" />;

  const listing = published.find((l) => l.slug === slug);
  if (!listing) {
    if (fallback) return fallback;
    notFound();
  }

  const detail = listingToDetail(listing, categories, cities, { includePending: false });
  const fields = categories.find((c) => c.slug === listing.category)?.fields;
  return <VendorProfile vendor={detail} similar={similar} categoryFields={fields} />;
}
