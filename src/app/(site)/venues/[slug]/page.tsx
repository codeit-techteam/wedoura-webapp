import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VenueProfile } from "@/components/profile/VenueProfile";
import { JsonLd } from "@/components/seo/JsonLd";
import { getVenue, listSimilar, listVendors } from "@/lib/api";
import { breadcrumbSchema, vendorSchema } from "@/lib/schema";
import { absoluteUrl } from "@/lib/site-config";

export async function generateStaticParams() {
  // Published venues only; unpublished profiles 404.
  const { items } = await listVendors({ category: "venues", limit: 10000 });
  return items.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: PageProps<"/venues/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const venue = await getVenue(slug);
  if (!venue) return { title: "Venue" };
  return {
    title: `${venue.name} · Wedding venue in ${venue.cityName}`,
    description: venue.tagline,
    alternates: { canonical: absoluteUrl(`/venues/${venue.slug}`) },
    openGraph: venue.cover ? { images: [{ url: absoluteUrl(venue.cover.src) }] } : undefined,
  };
}

export default async function VenuePage({ params }: PageProps<"/venues/[slug]">) {
  const { slug } = await params;
  const venue = await getVenue(slug);
  if (!venue) notFound();

  const similar = await listSimilar(slug);
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
      <VenueProfile vendor={venue} similar={similar} />
    </>
  );
}
