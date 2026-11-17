/**
 * The mapping check: a vendor created through the data functions
 * (emptyListing → filled → published) must surface every field in the right
 * public place — the card (VendorSummary), the profile (VendorDetail), the
 * filters and the search results — and never the private ones.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VendorListing } from "@/data/types";

const testDb = vi.hoisted(() => {
  const listings: VendorListing[] = [];
  return { listings };
});

vi.mock("@/data/vendors", () => ({ listings: testDb.listings, sampleListings: testDb.listings }));

import {
  getVendor,
  getVenue,
  listFeatured,
  listVendors,
  searchSuggestions,
} from "@/lib/api";
import { listingToDetail, listingToSummary } from "@/lib/listing-view";
import { makeFullListing, makeMinimalListing, makeVenueListing } from "../helpers/listing-builder";

const refs = { categories: [{ slug: "photography-films", name: "Photography & Films" }], cities: [{ slug: "udaipur", name: "Udaipur" }] };

beforeEach(() => {
  testDb.listings.length = 0;
});

describe("the card (VendorSummary)", () => {
  it("carries every card-visible field and nothing private", () => {
    const listing = makeFullListing();
    const summary = listingToSummary(listing, refs.categories, refs.cities);
    expect(summary).toEqual({
      slug: "test-atelier-nine",
      name: "Test Atelier Nine",
      category: "photography-films",
      categoryName: "Photography & Films",
      citySlug: "udaipur",
      cityName: "Udaipur",
      startingPriceINR: 175000,
      priceUnit: "per_event",
      cardPhotos: listing.cardPhotos,
      avatar: listing.avatar,
      featured: true,
      verified: true,
      publishedAt: "2026-03-05",
    });
    // Nothing admin- or account-shaped leaks onto cards.
    expect(summary).not.toHaveProperty("id");
    expect(summary).not.toHaveProperty("accountId");
    expect(summary).not.toHaveProperty("status");
    expect(summary).not.toHaveProperty("contact");
  });
});

describe("the profile (VendorDetail)", () => {
  it("maps every filled field into place", async () => {
    const listing = makeFullListing();
    testDb.listings.push(listing);
    const detail = await getVendor(listing.slug);
    expect(detail).toBeDefined();
    expect(detail!.name).toBe(listing.name);
    expect(detail!.tagline).toBe(listing.tagline);
    expect(detail!.about).toEqual(listing.about);
    expect(detail!.aboutPhoto).toEqual(listing.aboutPhoto);
    expect(detail!.team).toBe(listing.team);
    expect(detail!.yearsActive).toBe(listing.yearsActive);
    expect(detail!.services).toEqual(listing.services);
    expect(detail!.styles).toEqual(listing.styles);
    expect(detail!.categoryValues).toEqual(listing.categoryValues);
    expect(detail!.citiesServed).toEqual(listing.citiesServed);
    expect(detail!.travels).toBe(listing.travels);
    expect(detail!.startingPriceINR).toBe(listing.startingPriceINR);
    expect(detail!.priceUnit).toBe(listing.priceUnit);
    expect(detail!.cover).toEqual(listing.cover);
    expect(detail!.avatar).toEqual(listing.avatar);
    expect(detail!.portfolio).toEqual(listing.portfolio);
    expect(detail!.albums).toEqual(listing.albums);
    expect(detail!.films).toEqual(listing.films);
    expect(detail!.packages).toEqual(listing.packages);
    expect(detail!.faqs).toEqual(listing.faqs);
    expect(detail!.verified).toBe(true);
  });

  it("never exposes the phone or admin fields", async () => {
    testDb.listings.push(makeFullListing());
    const detail = await getVendor("test-atelier-nine");
    expect(detail!.contact).toEqual({
      whatsapp: "+911111111111",
      email: "studio@example.com",
      instagram: "https://instagram.com/example",
      website: "https://example.com/test-atelier-nine",
    });
    expect(detail!.contact).not.toHaveProperty("phone");
    for (const key of ["id", "accountId", "status", "featured", "featuredOrder", "reviewNote", "pendingMediaIds"]) {
      expect(detail).not.toHaveProperty(key);
    }
  });

  it("hides pending media everywhere public but keeps it in portal previews", () => {
    const listing = makeFullListing();
    const pendingId = listing.portfolio[1].id;
    listing.pendingMediaIds = [pendingId];
    const publicDetail = listingToDetail(listing, refs.categories, refs.cities);
    expect(publicDetail.portfolio.map((p) => p.id)).not.toContain(pendingId);
    const preview = listingToDetail(listing, refs.categories, refs.cities, { includePending: true });
    expect(preview.portfolio.map((p) => p.id)).toContain(pendingId);
  });

  it("serves venue listings through getVenue with their venue details", async () => {
    const venue = makeVenueListing();
    testDb.listings.push(venue);
    const detail = await getVenue(venue.slug);
    expect(detail?.venue).toEqual(venue.venue);
    // A venue is not served from getVendor-only routes the other way round:
    expect(await getVenue("not-a-venue")).toBeUndefined();
  });
});

describe("the filters", () => {
  beforeEach(() => {
    testDb.listings.push(makeFullListing(), makeMinimalListing());
  });

  it("finds the vendor by category", async () => {
    const result = await listVendors({ category: "photography-films" });
    expect(result.items.map((v) => v.slug)).toEqual(["test-atelier-nine"]);
  });

  it("finds the vendor by base city and by served city", async () => {
    for (const city of ["udaipur", "goa"]) {
      const result = await listVendors({ city });
      expect(result.items.map((v) => v.slug)).toContain("test-atelier-nine");
    }
    const elsewhere = await listVendors({ city: "delhi" });
    expect(elsewhere.items.map((v) => v.slug)).not.toContain("test-atelier-nine");
  });

  it("finds the vendor in its budget band only", async () => {
    const inBand = await listVendors({ minPrice: 100000, maxPrice: 499999 });
    expect(inBand.items.map((v) => v.slug)).toContain("test-atelier-nine");
    const under = await listVendors({ maxPrice: 99999 });
    expect(under.items.map((v) => v.slug)).not.toContain("test-atelier-nine");
  });

  it("matches the filterable category field value", async () => {
    const hit = await listVendors({ category: "photography-films", fields: { coverage: "Photography + film" } });
    expect(hit.items.map((v) => v.slug)).toEqual(["test-atelier-nine"]);
    const miss = await listVendors({ category: "photography-films", fields: { coverage: "Film" } });
    expect(miss.items).toHaveLength(0);
  });

  it("matches q against name, tagline, services and styles", async () => {
    for (const q of ["atelier nine", "very distinctive", "wedding films", "editorial"]) {
      const result = await listVendors({ q });
      expect(result.items.map((v) => v.slug), `q=${q}`).toContain("test-atelier-nine");
    }
  });

  it("appears first in the featured list", async () => {
    const featured = await listFeatured();
    expect(featured[0]?.slug).toBe("test-atelier-nine");
  });
});

describe("the search results", () => {
  it("suggests the vendor, capped per type", async () => {
    testDb.listings.push(makeFullListing());
    const result = await searchSuggestions("atelier");
    expect(result.vendors.map((v) => v.slug)).toContain("test-atelier-nine");
    expect(result.vendors[0]).toEqual({
      slug: "test-atelier-nine",
      name: "Test Atelier Nine",
      cityName: "Udaipur",
      category: "photography-films",
    });
  });

  it("keeps every cap at scale", async () => {
    for (let i = 0; i < 200; i++) {
      testDb.listings.push(
        makeFullListing({ id: `t-${i}`, slug: `test-vendor-${i}`, name: `Test Vendor ${i}`, featured: false, featuredOrder: undefined }),
      );
    }
    const result = await searchSuggestions("test vendor");
    expect(result.vendors.length).toBeLessThanOrEqual(5);
    expect(result.cities.length).toBeLessThanOrEqual(3);
    expect(result.categories.length).toBeLessThanOrEqual(3);
    const empty = await searchSuggestions("   ");
    expect(empty).toEqual({ vendors: [], cities: [], categories: [] });
  });
});

describe("the minimal listing", () => {
  it("publishes cleanly with empty optional sections", async () => {
    testDb.listings.push(makeMinimalListing());
    const detail = await getVendor("bare-minimum-studio");
    expect(detail).toBeDefined();
    expect(detail!.albums).toEqual([]);
    expect(detail!.films).toEqual([]);
    expect(detail!.packages).toEqual([]);
    expect(detail!.faqs).toEqual([]);
    expect(detail!.aboutPhoto).toBeUndefined();
    expect(detail!.team).toBeUndefined();
    expect(detail!.travels).toBeUndefined();
    expect(detail!.startingPriceINR).toBeUndefined();
    expect(detail!.priceUnit).toBe("on_request");
  });
});
