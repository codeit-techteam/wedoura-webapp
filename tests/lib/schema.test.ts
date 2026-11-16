/** JSON-LD builders: right @type per content, and never an invented number. */
import { describe, expect, it } from "vitest";
import {
  articleSchema,
  breadcrumbSchema,
  organizationSchema,
  vendorSchema,
  webSiteSchema,
  weddingSchema,
} from "@/lib/schema";
import { listingToDetail } from "@/lib/listing-view";
import { makeFullListing, makeVenueListing } from "../helpers/listing-builder";
import { photos } from "@/data/photos";

const refs = {
  categories: [
    { slug: "photography-films", name: "Photography & Films" },
    { slug: "venues", name: "Venues" },
  ],
  cities: [{ slug: "udaipur", name: "Udaipur" }],
};

const FORBIDDEN = ["aggregateRating", "review", "reviews", "ratingValue", "reviewCount", "priceRange"];

function assertNoInventedNumbers(schema: Record<string, unknown>) {
  const json = JSON.stringify(schema);
  for (const key of FORBIDDEN) expect(json).not.toContain(`"${key}"`);
}

describe("schema builders", () => {
  it("builds LocalBusiness for a vendor and EventVenue for a venue", () => {
    const vendor = vendorSchema(listingToDetail(makeFullListing(), refs.categories, refs.cities));
    expect(vendor["@type"]).toBe("LocalBusiness");
    expect(vendor.name).toBe("Test Atelier Nine");
    expect(vendor.url).toContain("/vendors/test-atelier-nine");
    expect((vendor.address as Record<string, unknown>).addressLocality).toBe("Udaipur");
    expect(vendor.sameAs).toEqual(["https://instagram.com/example", "https://example.com/test-atelier-nine"]);
    assertNoInventedNumbers(vendor);

    const venue = vendorSchema(listingToDetail(makeVenueListing(), refs.categories, refs.cities));
    expect(venue["@type"]).toBe("EventVenue");
    expect(venue.url).toContain("/venues/test-palace-gardens");
    assertNoInventedNumbers(venue);
  });

  it("builds Article for a wedding and BlogPosting for a post", () => {
    const wedding = weddingSchema({
      slug: "w",
      title: "T",
      couple: "A & B",
      city: "udaipur",
      date: "2026-01-01",
      excerpt: "E",
      cover: photos.p24,
      style: "Palace",
      chapters: [],
      credits: [],
    });
    expect(wedding["@type"]).toBe("Article");
    expect(wedding.datePublished).toBe("2026-01-01");
    assertNoInventedNumbers(wedding);

    const post = articleSchema({
      slug: "p",
      title: "T",
      excerpt: "E",
      category: "Planning",
      date: "2026-01-02",
      readMinutes: 5,
      cover: photos.p13,
      body: [],
    });
    expect(post["@type"]).toBe("BlogPosting");
    assertNoInventedNumbers(post);
  });

  it("builds Organization, WebSite and BreadcrumbList", () => {
    expect(organizationSchema()["@type"]).toBe("Organization");
    const site = webSiteSchema();
    expect(site["@type"]).toBe("WebSite");
    expect(JSON.stringify(site)).toContain("search_term_string");
    const crumbs = breadcrumbSchema([
      { name: "Vendors", path: "/vendors" },
      { name: "Photography in Jaipur", path: "/vendors/photography-films/jaipur" },
    ]);
    expect(crumbs["@type"]).toBe("BreadcrumbList");
    expect((crumbs.itemListElement as unknown[]).length).toBe(2);
    assertNoInventedNumbers(crumbs);
  });
});
