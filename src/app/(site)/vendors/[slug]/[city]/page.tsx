import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VendorBrowse } from "@/components/browse/VendorBrowse";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategory, listAllCities, listCategoryCityPairs } from "@/lib/api";
import { breadcrumbSchema } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";
import { pickParams } from "@/lib/url";

/**
 * Category-in-city directory, e.g. /vendors/photography-films/jaipur. The
 * first segment doubles as the profile route's [slug]; anything that is not
 * a category slug 404s here, so profiles never soft-render with an extra
 * segment. Only pairs with a published vendor exist (sitemap + links agree).
 */

export async function generateStaticParams() {
  const pairs = await listCategoryCityPairs();
  return pairs.map((p) => ({ slug: p.category, city: p.city }));
}

async function resolvePair(categorySlug: string, citySlug: string) {
  const [category, cities, pairs] = await Promise.all([
    getCategory(categorySlug),
    listAllCities(),
    listCategoryCityPairs(),
  ]);
  const city = cities.find((c) => c.slug === citySlug);
  if (!category || !city) return undefined;
  if (!pairs.some((p) => p.category === category.slug && p.city === city.slug)) return undefined;
  return { category, city };
}

export async function generateMetadata({ params }: PageProps<"/vendors/[slug]/[city]">): Promise<Metadata> {
  const { slug, city: citySlug } = await params;
  const pair = await resolvePair(slug, citySlug);
  if (!pair) return {};
  const { category, city } = pair;
  const path = `/vendors/${category.slug}/${city.slug}`;
  const description = `${category.description} Browse ${category.name.toLowerCase()} for weddings in ${city.name}, ${city.state}.`;
  return pageMeta({
    title: `${category.name} in ${city.name}`,
    description,
    path,
    image: category.cover.src,
  });
}

export default async function CategoryCityPage({ params, searchParams }: PageProps<"/vendors/[slug]/[city]">) {
  const { slug, city: citySlug } = await params;
  const pair = await resolvePair(slug, citySlug);
  if (!pair) notFound();
  const { category, city } = pair;

  const sp = await searchParams;
  const fieldKeys = category.fields.filter((f) => f.filterable && f.options?.length).map((f) => f.key);
  const query = pickParams(sp, [
    "q", "budget", "style", "travel", "picks", "sort", "view", "show", ...fieldKeys,
  ]);

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { name: "Vendors", path: "/vendors" },
          { name: `${category.name} in ${city.name}`, path: `/vendors/${category.slug}/${city.slug}` },
        ])}
      />
      <VendorBrowse
        pathname={`/vendors/${category.slug}/${city.slug}`}
        params={query}
        pinned={{ category: category.slug, city: city.slug }}
        clearPathname={`/vendors/${category.slug}/${city.slug}`}
      />
    </>
  );
}
