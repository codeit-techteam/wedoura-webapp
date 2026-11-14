import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { VendorCardData } from "@/components/cards/VendorCard";
import { VendorProfile } from "@/components/profile/VendorProfile";
import { getCategories, getCities, getSimilarVendors, getVendors, getVenue } from "@/lib/api";

export async function generateStaticParams() {
  const vendors = await getVendors({ category: "venues" });
  return vendors.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: PageProps<"/venues/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const venue = await getVenue(slug);
  if (!venue) return { title: "Venue" };
  return {
    title: venue.name,
    description: venue.summary,
    openGraph: { images: [venue.cover.src] },
  };
}

export default async function VenuePage({ params }: PageProps<"/venues/[slug]">) {
  const { slug } = await params;
  const venue = await getVenue(slug);
  if (!venue) notFound();

  const [categories, cities, similarVendors] = await Promise.all([
    getCategories(),
    getCities(),
    getSimilarVendors(slug),
  ]);
  const cityNames = new Map(cities.map((c) => [c.slug, c.name]));
  const categoryNames = new Map(categories.map((c) => [c.slug, c.name]));

  const similar: VendorCardData[] = similarVendors.map((v) => ({
    slug: v.slug,
    name: v.name,
    category: v.category,
    cityName: cityNames.get(v.city) ?? v.city,
    startingPrice: v.pricing[0]?.price,
    photos: v.bestPhotos,
  }));

  return (
    <VendorProfile
      vendor={venue}
      categoryName={categoryNames.get(venue.category) ?? venue.category}
      cityName={cityNames.get(venue.city) ?? venue.city}
      similar={similar}
    />
  );
}
