import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Placeholder } from "@/components/chrome/Placeholder";
import { getVendors, getVenue } from "@/lib/api";

export async function generateStaticParams() {
  const venues = await getVendors({ category: "venues" });
  return venues.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: PageProps<"/venues/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const venue = await getVenue(slug);
  return venue ? { title: venue.name, description: venue.summary } : { title: "Venue" };
}

export default async function VenuePage({ params }: PageProps<"/venues/[slug]">) {
  const { slug } = await params;
  const venue = await getVenue(slug);
  if (!venue) notFound();
  return <Placeholder eyebrow="Venue" title={venue.name} step={9} />;
}
