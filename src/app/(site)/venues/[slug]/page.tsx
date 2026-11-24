import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemoPublicProfile } from "@/components/profile/DemoPublicProfile";
import { VenueProfile } from "@/components/profile/VenueProfile";
import { JsonLd } from "@/components/seo/JsonLd";
import { getVenue, listAllCategories, listAllCities, listSimilar, listVendors } from "@/lib/api";
import { breadcrumbSchema, vendorSchema } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";

export async function generateStaticParams() {
  // Published venues only; unpublished profiles 404.
  const { items } = await listVendors({ category: "venues", limit: 10000 });
  return items.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: PageProps<"/venues/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const venue = await getVenue(slug);
  if (!venue) return { title: "Venue", robots: { index: false, follow: false } };
  return pageMeta({
    title: `${venue.name} · Wedding venue in ${venue.cityName}`,
    description: venue.tagline || `${venue.name} — wedding venue in ${venue.cityName}.`,
    path: `/venues/${venue.slug}`,
    image: venue.cover?.src ?? venue.cardPhotos[0]?.src,
  });
}

export default async function VenuePage({ params }: PageProps<"/venues/[slug]">) {
  const { slug } = await params;
  const venue = await getVenue(slug);
  if (!venue) notFound();

  const [similar, categories, cities] = await Promise.all([
    listSimilar(slug),
    listAllCategories(),
    listAllCities(),
  ]);
  return (
    <>
      <JsonLd
        schema={[
          vendorSchema(venue),
          breadcrumbSchema([
            { name: "Vendors", path: "/vendors" },
            { name: `Venues in ${venue.cityName}`, path: `/vendors/venues/${venue.baseCity}` },
            { name: venue.name, path: `/venues/${venue.slug}` },
          ]),
        ]}
      />
      {/* Store overlay so a venue-category demo listing's studio edits show live. */}
      <DemoPublicProfile
        slug={slug}
        surface="venue"
        categories={categories.map(({ slug: s, name, fields }) => ({ slug: s, name, fields }))}
        cities={cities.map(({ slug: s, name }) => ({ slug: s, name }))}
        similar={similar}
        fallback={<VenueProfile vendor={venue} similar={similar} />}
      />
    </>
  );
}
