import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { DemoPublicProfile } from "@/components/profile/DemoPublicProfile";
import { VendorProfile } from "@/components/profile/VendorProfile";
import { getVendor, isKnownVendorSlug, listAllCategories, listAllCities, listSimilar, listVendors } from "@/lib/api";

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
  if (!vendor) {
    // A known but unpublished listing is a hard 404 — the rule stands.
    if (await isKnownVendorSlug(slug)) notFound();
    // Truly unknown: maybe a listing published through /demo, which lives
    // in the browser's store. The fallback renders it with the same
    // components, or 404s client-side. Goes away with the backend.
    const [categories, cities] = await Promise.all([listAllCategories(), listAllCities()]);
    return (
      <DemoPublicProfile
        slug={slug}
        categories={categories.map(({ slug: s, name }) => ({ slug: s, name }))}
        cities={cities.map(({ slug: s, name }) => ({ slug: s, name }))}
      />
    );
  }
  if (vendor.venue) redirect(`/venues/${vendor.slug}`);

  const similar = await listSimilar(slug);
  return <VendorProfile vendor={vendor} similar={similar} />;
}
