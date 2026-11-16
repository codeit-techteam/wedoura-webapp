/**
 * Structured-data builders (schema.org JSON-LD). Pure functions over the
 * public shapes; rendered by src/components/seo/JsonLd.tsx. Never any
 * aggregateRating, review or other invented number — the site publishes no
 * statistics it does not have.
 */
import type { BlogPost, RealWedding, VendorDetail } from "@/data/types";
import { SITE_NAME, SITE_TAGLINE, SOCIALS, absoluteUrl } from "@/lib/site-config";

type Schema = Record<string, unknown>;

export function organizationSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    description: SITE_TAGLINE,
    url: absoluteUrl("/"),
    ...(SOCIALS.length > 0 ? { sameAs: SOCIALS.map((s) => s.href) } : {}),
  };
}

export function webSiteSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/vendors?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** A vendor or venue profile. */
export function vendorSchema(vendor: VendorDetail): Schema {
  const path = vendor.category === "venues" ? `/venues/${vendor.slug}` : `/vendors/${vendor.slug}`;
  const sameAs = [vendor.contact.instagram, vendor.contact.website].filter(
    (v): v is string => typeof v === "string" && v.length > 0,
  );
  return {
    "@context": "https://schema.org",
    "@type": vendor.category === "venues" ? "EventVenue" : "LocalBusiness",
    name: vendor.name,
    description: vendor.tagline,
    url: absoluteUrl(path),
    ...(vendor.cover ? { image: absoluteUrl(vendor.cover.src) } : {}),
    address: { "@type": "PostalAddress", addressLocality: vendor.cityName, addressCountry: "IN" },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function weddingSchema(wedding: RealWedding): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: wedding.title,
    description: wedding.excerpt,
    datePublished: wedding.date,
    image: absoluteUrl(wedding.cover.src),
    url: absoluteUrl(`/real-weddings/${wedding.slug}`),
    publisher: { "@type": "Organization", name: SITE_NAME },
  };
}

export function articleSchema(post: BlogPost): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    image: absoluteUrl(post.cover.src),
    url: absoluteUrl(`/blogs/${post.slug}`),
    publisher: { "@type": "Organization", name: SITE_NAME },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
