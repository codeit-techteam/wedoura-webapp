/** Paging behaviour that must hold at any vendor count. */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VendorListing } from "@/data/types";

const testDb = vi.hoisted(() => {
  const listings: VendorListing[] = [];
  return { listings };
});

vi.mock("@/data/vendors", () => ({ listings: testDb.listings, sampleListings: testDb.listings }));

import { listGalleryPhotos, listVendors } from "@/lib/api";
import { photoList } from "@/data/photos";
import { makeFullListing } from "../helpers/listing-builder";

beforeEach(() => {
  testDb.listings.length = 0;
});

function pushMany(n: number, overrides: (i: number) => Partial<VendorListing> = () => ({})) {
  for (let i = 0; i < n; i++) {
    testDb.listings.push(
      makeFullListing({
        id: `t-${i}`,
        slug: `vendor-${String(i).padStart(3, "0")}`,
        name: `Vendor ${String(i).padStart(3, "0")}`,
        featured: false,
        featuredOrder: undefined,
        ...overrides(i),
      }),
    );
  }
}

describe("listVendors paging", () => {
  it("pages, counts and clamps correctly at 200 vendors", async () => {
    pushMany(200);
    const page1 = await listVendors({ page: 1, limit: 24, sort: "name" });
    expect(page1.items).toHaveLength(24);
    expect(page1.total).toBe(200);
    expect(page1.pageCount).toBe(Math.ceil(200 / 24));
    const last = await listVendors({ page: 999, limit: 24, sort: "name" });
    expect(last.page).toBe(page1.pageCount);
    expect(last.items.length).toBeGreaterThan(0);
    // The cumulative ?show= pattern: a growing limit returns a growing prefix.
    const show8 = await listVendors({ page: 1, limit: 8, sort: "name" });
    const show16 = await listVendors({ page: 1, limit: 16, sort: "name" });
    expect(show16.items.slice(0, 8)).toEqual(show8.items);
  });

  it("returns an empty page when no vendor matches", async () => {
    pushMany(10);
    const result = await listVendors({ q: "no such vendor anywhere" });
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.pageCount).toBe(1);
  });
});

describe("gallery paging", () => {
  it("filters by category before paginating", async () => {
    // 30 photography vendors covering most photos, 1 decor vendor whose
    // photos sit late in photoList order.
    pushMany(30, () => ({ portfolio: photoList.slice(0, 40) }));
    testDb.listings.push(
      makeFullListing({
        id: "decor",
        slug: "late-decor",
        name: "Late Decor",
        category: "decor-styling",
        categoryValues: {},
        cover: photoList[44],
        cardPhotos: [photoList[44], photoList[45], photoList[43]],
        portfolio: [photoList[44], photoList[45]],
      }),
    );
    // With a tiny page size, the decor photos must still appear on page 1
    // of the decor-filtered gallery (the filter runs before the cap).
    const decorPage = await listGalleryPhotos(1, 5, "decor-styling");
    expect(decorPage.items.length).toBeGreaterThan(0);
    for (const item of decorPage.items) expect(item.category).toBe("decor-styling");
    const all = await listGalleryPhotos(1, 10);
    expect(all.items).toHaveLength(10);
    expect(all.total).toBeGreaterThan(10);
  });
});
