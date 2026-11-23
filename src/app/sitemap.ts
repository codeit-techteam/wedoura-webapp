import type { MetadataRoute } from "next";
import {
  listArticles,
  listCategoryCityPairs,
  listDestinations,
  listVendors,
  listWeddings,
} from "@/lib/api";
import { absoluteUrl } from "@/lib/site-config";

/**
 * Everything public and indexable. Deliberately absent: /demo, /login,
 * /saved, /styleguide, /vendor-studio, /api (see robots.ts) — and every
 * listing that is not published, which listVendors guarantees.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [vendors, weddings, articles, pairs, places] = await Promise.all([
    listVendors({ limit: 10000 }),
    listWeddings({ limit: 10000 }),
    listArticles({ limit: 10000 }),
    listCategoryCityPairs(),
    listDestinations(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    "/",
    "/vendors",
    "/real-weddings",
    "/blogs",
    "/gallery",
    "/honeymoon",
    "/soulmates",
    "/about",
    "/contact",
    "/faq",
    "/list-your-business",
    "/privacy-policy",
    "/terms",
  ].map((path) => ({ url: absoluteUrl(path) }));

  return [
    ...staticPages,
    ...vendors.items.map((v) => ({
      url: absoluteUrl(v.category === "venues" ? `/venues/${v.slug}` : `/vendors/${v.slug}`),
      ...(v.publishedAt ? { lastModified: v.publishedAt } : {}),
    })),
    ...pairs.map((p) => ({ url: absoluteUrl(`/vendors/${p.category}/${p.city}`) })),
    ...weddings.items.map((w) => ({ url: absoluteUrl(`/real-weddings/${w.slug}`), lastModified: w.date })),
    ...articles.items.map((a) => ({ url: absoluteUrl(`/blogs/${a.slug}`), lastModified: a.date })),
    ...places.map((d) => ({ url: absoluteUrl(`/honeymoon/${d.slug}`) })),
  ];
}
