import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VendorProfile } from "@/components/profile/VendorProfile";
import { getVenue, listSimilar, listVendors } from "@/lib/api";

export async function generateStaticParams() {
  // Published venues only; unpublished profiles 404.
  const { items } = await listVendors({ category: "venues", limit: 999 });
  return items.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: PageProps<"/venues/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const venue = await getVenue(slug);
  if (!venue) return { title: "Venue" };
  return {
    title: venue.name,
    description: venue.tagline,
    openGraph: venue.cover ? { images: [venue.cover.src] } : undefined,
  };
}

export default async function VenuePage({ params }: PageProps<"/venues/[slug]">) {
  const { slug } = await params;
  const venue = await getVenue(slug);
  if (!venue) notFound();

  const similar = await listSimilar(slug);
  return <VendorProfile vendor={venue} similar={similar} />;
}
