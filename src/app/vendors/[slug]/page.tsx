import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import type { VendorCardData } from "@/components/cards/VendorCard";
import { VendorProfile } from "@/components/profile/VendorProfile";
import { getCategories, getCities, getSimilarVendors, getVendor, getVendors } from "@/lib/api";

export async function generateStaticParams() {
  const vendors = await getVendors();
  return vendors.filter((v) => !v.venue).map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: PageProps<"/vendors/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await getVendor(slug);
  if (!vendor) return { title: "Vendor" };
  return {
    title: vendor.name,
    description: vendor.summary,
    openGraph: { images: [vendor.cover.src] },
  };
}

export default async function VendorPage({ params }: PageProps<"/vendors/[slug]">) {
  const { slug } = await params;
  const vendor = await getVendor(slug);
  if (!vendor) notFound();
  if (vendor.venue) redirect(`/venues/${vendor.slug}`);

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
      vendor={vendor}
      categoryName={categoryNames.get(vendor.category) ?? vendor.category}
      cityName={cityNames.get(vendor.city) ?? vendor.city}
      similar={similar}
    />
  );
}
