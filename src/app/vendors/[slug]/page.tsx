import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { VendorProfile } from "@/components/profile/VendorProfile";
import { getVendor, listSimilar, listVendors } from "@/lib/api";

export async function generateStaticParams() {
  // Published, non-venue listings only; unpublished profiles 404.
  const { items } = await listVendors({ limit: 999 });
  return items.filter((v) => v.category !== "venues").map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: PageProps<"/vendors/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await getVendor(slug);
  if (!vendor) return { title: "Vendor" };
  return {
    title: vendor.name,
    description: vendor.tagline,
    openGraph: vendor.cover ? { images: [vendor.cover.src] } : undefined,
  };
}

export default async function VendorPage({ params }: PageProps<"/vendors/[slug]">) {
  const { slug } = await params;
  const vendor = await getVendor(slug);
  if (!vendor) notFound();
  if (vendor.venue) redirect(`/venues/${vendor.slug}`);

  const similar = await listSimilar(slug);
  return <VendorProfile vendor={vendor} similar={similar} />;
}
