/** The WEDOURA_SEED generator must be deterministic, valid and well spread. */
import { describe, expect, it } from "vitest";
import { categories } from "@/data/categories";
import { cities } from "@/data/cities";
import { photoList } from "@/data/photos";
import { generateSeedArticles, generateSeedListings, generateSeedWeddings } from "@/data/seed";

describe("generateSeedListings", () => {
  const listings = generateSeedListings();

  it("is deterministic", () => {
    expect(generateSeedListings()).toEqual(listings);
  });

  it("yields roughly 200 published vendors with the samples", () => {
    const published = listings.filter((l) => l.status === "published");
    expect(published.length + 10).toBeGreaterThanOrEqual(195);
    expect(published.length + 10).toBeLessThanOrEqual(205);
    // And a few deliberately unpublished ones.
    expect(listings.length - published.length).toBeGreaterThan(0);
  });

  it("covers every category and every city", () => {
    const published = listings.filter((l) => l.status === "published");
    for (const c of categories) {
      expect(published.some((l) => l.category === c.slug), c.slug).toBe(true);
    }
    for (const c of cities) {
      expect(published.some((l) => l.baseCity === c.slug), c.slug).toBe(true);
    }
  });

  it("only reuses existing photographs", () => {
    const known = new Set(photoList.map((p) => p.id));
    for (const l of listings) {
      for (const p of [l.cover, l.aboutPhoto, ...l.cardPhotos, ...l.portfolio, ...l.albums.flatMap((a) => a.photos)]) {
        if (p) expect(known.has(p.id), p.id).toBe(true);
      }
    }
  });

  it("never collides with sample ids or slugs, and slugs are unique", () => {
    const slugs = listings.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const l of listings) {
      expect(l.id.startsWith("lst-")).toBe(false);
      expect(l.id.startsWith("seed-")).toBe(true);
    }
  });

  it("gives every published listing a publishedAt and valid card photos", () => {
    for (const l of listings.filter((x) => x.status === "published")) {
      expect(l.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(l.cardPhotos).toHaveLength(3);
      expect(l.about.length).toBeGreaterThan(0);
      if (l.priceUnit !== "on_request") expect(l.startingPriceINR).toBeGreaterThan(0);
    }
  });

  it("fills category values from the category's own field definitions", () => {
    for (const l of listings) {
      const defs = categories.find((c) => c.slug === l.category)!.fields;
      for (const [key, value] of Object.entries(l.categoryValues)) {
        const def = defs.find((d) => d.key === key);
        expect(def, `${l.slug} has unknown field ${key}`).toBeDefined();
        if (def!.input === "select") expect(def!.options).toContain(value);
      }
    }
  });

  it("includes minimal listings so empty sections are exercised", () => {
    const minimal = listings.filter((l) => l.albums.length === 0 && l.films.length === 0 && !l.aboutPhoto);
    expect(minimal.length).toBeGreaterThan(5);
  });
});

describe("generateSeedWeddings / generateSeedArticles", () => {
  it("are deterministic and sized for paging", () => {
    expect(generateSeedWeddings()).toEqual(generateSeedWeddings());
    expect(generateSeedArticles()).toEqual(generateSeedArticles());
    expect(generateSeedWeddings().length).toBeGreaterThanOrEqual(20);
    expect(generateSeedArticles().length).toBeGreaterThanOrEqual(10);
  });

  it("credits published seed vendors by slug, and at least one unpublished one by design", () => {
    const listings = generateSeedListings();
    const bySlug = new Map(listings.map((l) => [l.slug, l]));
    const weddings = generateSeedWeddings();
    let unpublishedCredits = 0;
    for (const w of weddings) {
      for (const credit of w.credits) {
        if (!credit.vendorSlug) continue;
        const owner = bySlug.get(credit.vendorSlug);
        expect(owner, credit.vendorSlug).toBeDefined();
        if (owner!.status !== "published") unpublishedCredits++;
      }
    }
    // The stories deliberately carry some credits to unpublished seeds so the
    // public pages can prove they render as plain names.
    expect(unpublishedCredits).toBeGreaterThan(0);
  });

  it("wedding slugs and article slugs are unique", () => {
    const w = generateSeedWeddings().map((x) => x.slug);
    const a = generateSeedArticles().map((x) => x.slug);
    expect(new Set(w).size).toBe(w.length);
    expect(new Set(a).size).toBe(a.length);
  });
});
