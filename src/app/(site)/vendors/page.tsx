import type { Metadata } from "next";
import { VendorBrowse } from "@/components/browse/VendorBrowse";
import { listCategoriesWithCounts } from "@/lib/api";
import { absoluteUrl } from "@/lib/site-config";
import { pickParams } from "@/lib/url";

export const metadata: Metadata = {
  title: "Vendors",
  description:
    "Photographers, venues, makeup artists, decorators, caterers and musicians across India — with real work and open pricing.",
  alternates: { canonical: absoluteUrl("/vendors") },
};

const BASE_KEYS = [
  "q", "category", "city", "budget", "style", "travel", "picks", "sort", "view", "show",
];
const PATHNAME = "/vendors";

export default async function VendorsPage({ searchParams }: PageProps<"/vendors">) {
  const sp = await searchParams;
  const base = pickParams(sp, BASE_KEYS);

  // Category-specific field params for the active category
  const categories = await listCategoriesWithCounts();
  const fieldKeys =
    categories
      .find((c) => c.slug === base.category)
      ?.fields.filter((f) => f.filterable && f.options?.length)
      .map((f) => f.key) ?? [];
  const params = pickParams(sp, [...BASE_KEYS, ...fieldKeys]);

  return (
    <VendorBrowse
      pathname={PATHNAME}
      params={params}
    />
  );
}
