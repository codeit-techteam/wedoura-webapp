import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { DemoPublicProfile } from "@/components/profile/DemoPublicProfile";
import { VendorProfile } from "@/components/profile/VendorProfile";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategory, getVendor, isKnownVendorSlug, listAllCategories, listAllCities, listSimilar, listVendors } from "@/lib/api";
import { breadcrumbSchema, vendorSchema } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";

export async function generateStaticParams() {
  // Published, non-venue listings only; unpublished profiles 404.
  const { items } = await listVendors({ limit: 10000 });
  return items.filter((v) => v.category !== "venues").map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: PageProps<"/vendors/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await getVendor(slug);
  if (!vendor) return { title: "Vendor", robots: { index: false, follow: false } };
  const image = vendor.cover?.src ?? vendor.cardPhotos[0]?.src;
  return pageMeta({
    title: `${vendor.name} · ${vendor.categoryName} in ${vendor.cityName}`,
    description: vendor.tagline || `${vendor.name} — ${vendor.categoryName} in ${vendor.cityName}.`,
    path: `/vendors/${vendor.slug}`,
    image,
  });
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
        categories={categories.map(({ slug: s, name, fields }) => ({ slug: s, name, fields }))}
        cities={cities.map(({ slug: s, name }) => ({ slug: s, name }))}
      />
    );
  }
  if (vendor.venue) redirect(`/venues/${vendor.slug}`);

  const [similar, category, categories, cities] = await Promise.all([
    listSimilar(slug),
    getCategory(vendor.category),
    listAllCategories(),
    listAllCities(),
  ]);
  return (
    <>
      <JsonLd
        schema={[
          vendorSchema(vendor),
          breadcrumbSchema([
            { name: "Vendors", path: "/vendors" },
            { name: `${vendor.categoryName} in ${vendor.cityName}`, path: `/vendors/${vendor.category}/${vendor.baseCity}` },
            { name: vendor.name, path: `/vendors/${vendor.slug}` },
          ]),
        ]}
      />
      {/* The store overlay lets studio edits to this listing show live in the
          browser; the server-rendered profile below stays the SEO content. */}
      <DemoPublicProfile
        slug={slug}
        categories={categories.map(({ slug: s, name, fields }) => ({ slug: s, name, fields }))}
        cities={cities.map(({ slug: s, name }) => ({ slug: s, name }))}
        similar={similar}
        fallback={<VendorProfile vendor={vendor} similar={similar} categoryFields={category?.fields} />}
      />
    </>
  );
}
