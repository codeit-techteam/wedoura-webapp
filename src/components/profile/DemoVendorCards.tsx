"use client";

import { VendorCard } from "@/components/cards/VendorCard";
import type { Category, City } from "@/data/types";
import { listingToSummary } from "@/lib/listing-view";
import { SAMPLE_ID_PREFIX } from "@/lib/mock-store";
import { useDemoPublishedListings } from "@/lib/vendor-api";

type Props = {
  /** Slugs the server already rendered, so nothing appears twice. */
  excludeSlugs: string[];
  category?: string;
  city?: string;
  categories: Pick<Category, "slug" | "name">[];
  cities: Pick<City, "slug" | "name">[];
};

/**
 * Cards for listings published through /demo, appended after the
 * server-rendered grid with identical layout classes. Renders nothing when
 * no demo listing is published; the backend makes this unnecessary.
 */
export function DemoVendorCards({ excludeSlugs, category, city, categories, cities }: Props) {
  const published = useDemoPublishedListings();
  const exclude = new Set(excludeSlugs);
  const shown = published.filter(
    (l) =>
      // Sample rows (incl. the demo-owned lst-01) are already server-rendered.
      !l.id.startsWith(SAMPLE_ID_PREFIX) &&
      !exclude.has(l.slug) &&
      (!category || l.category === category) &&
      (!city || l.baseCity === city || l.citiesServed.includes(city)),
  );
  if (shown.length === 0) return null;

  return (
    <ul className="mt-2 grid grid-cols-2 gap-2 gap-y-8 lg:grid-cols-3 min-[80rem]:grid-cols-4" aria-label="Recently published vendors">
      {shown.map((listing) => (
        <li key={listing.slug}>
          <VendorCard vendor={listingToSummary(listing, categories, cities)} />
        </li>
      ))}
    </ul>
  );
}
