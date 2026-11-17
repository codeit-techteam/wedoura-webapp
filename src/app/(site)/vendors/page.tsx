import type { Metadata } from "next";
import { VendorBrowse } from "@/components/browse/VendorBrowse";
import { listCategoriesWithCounts } from "@/lib/api";
import { absoluteUrl } from "@/lib/site-config";
import { pickParams } from "@/lib/url";

export const metadata: Metadata = {
  title: "Vendors",
  description:
    "Photographers, venues, makeup artists, decorators, caterers and musicians across India. Filter by category, city and budget.",
  // Filtered query-param views are not separate documents; the pretty
  // /vendors/{category}/{city} pages carry their own canonicals.
  alternates: { canonical: absoluteUrl("/vendors") },
};

const BASE_KEYS = ["q", "category", "city", "budget", "sort", "show"];
const PATHNAME = "/vendors";

export default async function VendorsPage({ searchParams }: PageProps<"/vendors">) {
  const sp = await searchParams;
  const base = pickParams(sp, BASE_KEYS);
  // Category-specific filter params exist only for the active category.
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
      heading={["Every vendor, one place."]}
      intro="Filter by what you need, where you are marrying and what you want to spend."
    />
  );
}
