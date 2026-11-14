import type { Metadata } from "next";
import { Suspense } from "react";
import { VendorBrowser, type BrowseVendor } from "@/components/browse/VendorBrowser";
import { SkeletonCardGrid } from "@/components/ui/Skeleton";
import { Container } from "@/components/ui/Container";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { BUDGET_BANDS, VENDOR_SORTS, getCategories, getCities, getVendors } from "@/lib/api";

export const metadata: Metadata = {
  title: "Vendors",
  description:
    "Photographers, venues, makeup artists, decorators, caterers and musicians across India. Filter by category, city and budget.",
};

export default async function VendorsPage() {
  const [vendors, categories, cities] = await Promise.all([getVendors(), getCategories(), getCities()]);
  const cityNames = new Map(cities.map((c) => [c.slug, c.name]));
  const categoryNames = new Map(categories.map((c) => [c.slug, c.name]));

  const browseVendors: BrowseVendor[] = vendors.map((v) => ({
    slug: v.slug,
    name: v.name,
    category: v.category,
    citySlug: v.city,
    cityName: cityNames.get(v.city) ?? v.city,
    startingPrice: v.pricing[0]?.price,
    startingPriceINR: v.startingPriceINR,
    featured: v.featured,
    photos: v.bestPhotos,
    search: [v.name, v.tagline, v.city, cityNames.get(v.city) ?? "", v.category, categoryNames.get(v.category) ?? ""]
      .join(" ")
      .toLowerCase(),
  }));

  return (
    <main>
      <Container className="pt-10 pb-8 md:pt-16 md:pb-10">
        <MaskedHeading as="h1" className="font-serif text-h1" lines={[<>Every vendor, one place.</>]} />
        <p className="mt-4 max-w-prose text-mute">
          Filter by what you need, where you are marrying and what you want to spend.
        </p>
      </Container>
      <Suspense
        fallback={
          <div className="container-wide py-14">
            <SkeletonCardGrid />
          </div>
        }
      >
        <VendorBrowser
          vendors={browseVendors}
          categories={categories.map((c) => ({ value: c.slug, label: c.shortName }))}
          cities={cities.map((c) => ({ value: c.slug, label: c.name }))}
          budgets={BUDGET_BANDS.map((b) => ({ value: b.value, label: b.label }))}
          sorts={VENDOR_SORTS.filter((s) => s.value !== "featured").map((s) => ({ value: s.value, label: s.label }))}
        />
      </Suspense>
    </main>
  );
}
