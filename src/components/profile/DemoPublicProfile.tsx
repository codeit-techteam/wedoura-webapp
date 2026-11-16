"use client";

import { notFound } from "next/navigation";
import { VendorProfile } from "@/components/profile/VendorProfile";
import type { Category, City } from "@/data/types";
import { listingToDetail } from "@/lib/listing-view";
import { useDemoPublishedListings, useSessionHydrated } from "@/lib/vendor-api";

type Props = {
  slug: string;
  categories: Pick<Category, "slug" | "name">[];
  cities: Pick<City, "slug" | "name">[];
};

/**
 * The public profile for listings published through /demo. They live in this
 * browser's mock store, which the server cannot see, so unknown slugs fall
 * through to this client fallback: a store-published listing renders through
 * the same mapper and components as every static profile (pending media
 * excluded); anything else is a real 404. The backend replaces this with
 * ordinary server rendering.
 */
export function DemoPublicProfile({ slug, categories, cities }: Props) {
  const hydrated = useSessionHydrated();
  const published = useDemoPublishedListings();
  if (!hydrated) return <div className="min-h-dvh" aria-busy="true" />;

  const listing = published.find((l) => l.slug === slug);
  if (!listing) notFound();

  const detail = listingToDetail(listing, categories, cities, { includePending: false });
  return <VendorProfile vendor={detail} similar={[]} />;
}
