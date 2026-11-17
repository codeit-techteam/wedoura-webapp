/**
 * The published-only rule: a listing in any non-published status appears
 * nowhere public — no list, profile, counts, featured, similar rail, films,
 * gallery, search, sitemap — and wedding credits lose their link (never the
 * name).
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ListingStatus, RealWedding, VendorListing } from "@/data/types";

const testDb = vi.hoisted(() => {
  const listings: VendorListing[] = [];
  const weddings: RealWedding[] = [];
  return { listings, weddings };
});

vi.mock("@/data/vendors", () => ({ listings: testDb.listings, sampleListings: testDb.listings }));
vi.mock("@/data/real-weddings", () => ({ realWeddings: testDb.weddings }));

import {
  getVendor,
  getVenue,
  getWedding,
  isKnownVendorSlug,
  listCategoriesWithCounts,
  listCategoryCityPairs,
  listCitiesWithCounts,
  listFeatured,
  listFilms,
  listGalleryPhotos,
  listSimilar,
  listVendors,
  searchSuggestions,
} from "@/lib/api";
import sitemap from "@/app/sitemap";
import { photos } from "@/data/photos";
import { makeFullListing, makeVenueListing } from "../helpers/listing-builder";

const HIDDEN_STATUSES: ListingStatus[] = ["draft", "in_review", "changes_requested", "unpublished"];

beforeEach(() => {
  testDb.listings.length = 0;
  testDb.weddings.length = 0;
});

describe.each(HIDDEN_STATUSES)("a %s listing", (status) => {
  beforeEach(() => {
    testDb.listings.push(
      makeFullListing({ id: "hidden", slug: "hidden-vendor", name: "Hidden Vendor", status, publishedAt: undefined }),
      makeFullListing({ id: "visible", slug: "visible-vendor", name: "Visible Vendor", featured: false, featuredOrder: undefined }),
    );
  });

  it("is absent from every list and lookup", async () => {
    const list = await listVendors({});
    expect(list.items.map((v) => v.slug)).toEqual(["visible-vendor"]);
    expect(list.total).toBe(1);
    expect(await getVendor("hidden-vendor")).toBeUndefined();
    expect(await listFeatured()).not.toContainEqual(expect.objectContaining({ slug: "hidden-vendor" }));
    expect((await listSimilar("visible-vendor")).map((v) => v.slug)).not.toContain("hidden-vendor");
    const suggestions = await searchSuggestions("hidden");
    expect(suggestions.vendors).toHaveLength(0);
  });

  it("is still a known slug, so the route hard-404s instead of soft-rendering", async () => {
    expect(await isKnownVendorSlug("hidden-vendor")).toBe(true);
  });

  it("is counted nowhere", async () => {
    // Both test vendors share category and city, so counts must come from
    // the visible one alone.
    const categories = await listCategoriesWithCounts();
    expect(categories.find((c) => c.slug === "photography-films")?.count).toBe(1);
    const cities = await listCitiesWithCounts();
    expect(cities.find((c) => c.slug === "udaipur")?.count).toBe(1);
    const pairs = await listCategoryCityPairs();
    expect(pairs.find((p) => p.category === "photography-films" && p.city === "udaipur")?.count).toBe(1);
  });

  it("contributes no films and no gallery photos", async () => {
    // The hidden vendor is the only owner of its film.
    const hidden = testDb.listings[0];
    hidden.films = [{ id: "hidden-film", title: "Hidden film", previewSrc: "", fullSrc: "", poster: photos.p24, durationSec: 0 }];
    const filmIds = (await listFilms()).map((f) => f.id);
    expect(filmIds).toContain("test-film-1"); // from the visible one
    expect(filmIds).not.toContain("hidden-film");
    // A photo only the hidden vendor uses must not reach the gallery.
    hidden.portfolio = [photos.p44];
    testDb.listings[1].portfolio = testDb.listings[1].portfolio.filter((p) => p.id !== "p44");
    const gallery = await listGalleryPhotos(1, 1000);
    expect(gallery.items.map((i) => i.photo.id)).not.toContain("p44");
    for (const item of gallery.items) expect(item.vendor?.slug).not.toBe("hidden-vendor");
  });

  it("is absent from the sitemap", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls.some((u) => u.includes("hidden-vendor"))).toBe(false);
    expect(urls.some((u) => u.includes("visible-vendor"))).toBe(true);
  });

  it("loses its link in wedding credits but keeps its name", async () => {
    testDb.weddings.push({
      slug: "test-wedding",
      title: "A test wedding",
      couple: "T. & T.",
      city: "udaipur",
      date: "2026-01-01",
      excerpt: "x",
      cover: photos.p24,
      style: "Palace",
      chapters: [],
      credits: [
        { role: "Photography", vendorSlug: "visible-vendor", name: "Visible Vendor" },
        { role: "Decor", vendorSlug: "hidden-vendor", name: "Hidden Vendor" },
      ],
    });
    const wedding = await getWedding("test-wedding");
    expect(wedding!.credits).toEqual([
      { role: "Photography", vendorSlug: "visible-vendor", name: "Visible Vendor" },
      { role: "Decor", name: "Hidden Vendor" },
    ]);
  });
});

describe("a hidden venue", () => {
  it("is not served by getVenue", async () => {
    testDb.listings.push(makeVenueListing({ status: "unpublished" }));
    expect(await getVenue("test-palace-gardens")).toBeUndefined();
  });
});
