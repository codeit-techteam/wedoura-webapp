/**
 * The only module that touches content data. Pages and components import
 * from here, never from src/data, so the sample data can be swapped for the
 * real backend by changing this file alone. Every function is async for the
 * same reason.
 */
import { blogPosts } from "@/data/blogs";
import { categories } from "@/data/categories";
import { cities } from "@/data/cities";
import { promises, siteFaq } from "@/data/faq";
import { films } from "@/data/films";
import { destinations } from "@/data/honeymoon";
import { photoList } from "@/data/photos";
import { realWeddings } from "@/data/real-weddings";
import type {
  BlogPost,
  Category,
  CategorySlug,
  City,
  Destination,
  Faq,
  Film,
  Photo,
  RealWedding,
  SitePromise,
  Vendor,
} from "@/data/types";
import { vendors } from "@/data/vendors";

export type { BlogPost, Category, CategorySlug, City, Destination, Faq, Film, Photo, RealWedding, SitePromise, Vendor };

export async function getCategories(): Promise<Category[]> {
  return categories;
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  return categories.find((c) => c.slug === slug);
}

export async function getCities(): Promise<City[]> {
  return cities;
}

export async function getCity(slug: string): Promise<City | undefined> {
  return cities.find((c) => c.slug === slug);
}

/** Budget bands on the starting price: b1 under ₹1L, b2 ₹1–5L, b3 over ₹5L. */
export type BudgetBand = "b1" | "b2" | "b3";
export const BUDGET_BANDS: { value: BudgetBand; label: string }[] = [
  { value: "b1", label: "Under ₹1 lakh" },
  { value: "b2", label: "₹1–5 lakh" },
  { value: "b3", label: "Over ₹5 lakh" },
];

export type VendorSort = "featured" | "price-asc" | "price-desc" | "name";
export const VENDOR_SORTS: { value: VendorSort; label: string }[] = [
  { value: "featured", label: "Featured first" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "name", label: "Name, A to Z" },
];

export interface VendorFilter {
  q?: string;
  category?: CategorySlug | string;
  city?: string;
  budget?: BudgetBand | string;
  sort?: VendorSort | string;
}

function inBand(price: number | undefined, band: string): boolean {
  if (price === undefined) return false;
  if (band === "b1") return price < 100000;
  if (band === "b2") return price >= 100000 && price <= 500000;
  if (band === "b3") return price > 500000;
  return true;
}

export async function getVendors(filter: VendorFilter = {}): Promise<Vendor[]> {
  const q = filter.q?.trim().toLowerCase();
  const cityNames = new Map(cities.map((c) => [c.slug, c.name.toLowerCase()]));
  const categoryNames = new Map(categories.map((c) => [c.slug, c.name.toLowerCase()]));

  let result = vendors.filter((v) => {
    if (filter.category && v.category !== filter.category) return false;
    if (filter.city && v.city !== filter.city) return false;
    if (filter.budget && !inBand(v.startingPriceINR, filter.budget)) return false;
    if (q) {
      const haystack = [
        v.name,
        v.tagline,
        v.city,
        cityNames.get(v.city) ?? "",
        v.category,
        categoryNames.get(v.category) ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const sort = filter.sort ?? "featured";
  result = [...result];
  if (sort === "price-asc") result.sort((a, b) => (a.startingPriceINR ?? 0) - (b.startingPriceINR ?? 0));
  else if (sort === "price-desc") result.sort((a, b) => (b.startingPriceINR ?? 0) - (a.startingPriceINR ?? 0));
  else if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
  else result.sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false));
  return result;
}

export async function getVendor(slug: string): Promise<Vendor | undefined> {
  return vendors.find((v) => v.slug === slug);
}

export async function getVenue(slug: string): Promise<Vendor | undefined> {
  return vendors.find((v) => v.slug === slug && v.category === "venues");
}

export async function getFeaturedVendors(limit = 3): Promise<Vendor[]> {
  return vendors.filter((v) => v.featured).slice(0, limit);
}

/** Same category first, then same city, never the vendor itself. */
export async function getSimilarVendors(slug: string, limit = 4): Promise<Vendor[]> {
  const vendor = vendors.find((v) => v.slug === slug);
  if (!vendor) return [];
  const others = vendors.filter((v) => v.slug !== slug);
  const sameCategory = others.filter((v) => v.category === vendor.category);
  const sameCity = others.filter((v) => v.category !== vendor.category && v.city === vendor.city);
  const rest = others.filter((v) => v.category !== vendor.category && v.city !== vendor.city);
  return [...sameCategory, ...sameCity, ...rest].slice(0, limit);
}

export interface WeddingFilter {
  city?: string;
  style?: string;
}

export async function getRealWeddings(filter: WeddingFilter = {}): Promise<RealWedding[]> {
  return realWeddings
    .filter(
      (w) =>
        (!filter.city || w.city === filter.city) &&
        (!filter.style || w.style.toLowerCase() === filter.style.toLowerCase()),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getWeddingStyles(): Promise<string[]> {
  return [...new Set(realWeddings.map((w) => w.style))].sort();
}

export async function getRealWedding(slug: string): Promise<RealWedding | undefined> {
  return realWeddings.find((w) => w.slug === slug);
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  return [...blogPosts].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  return blogPosts.find((p) => p.slug === slug);
}

export async function getFilms(): Promise<Film[]> {
  return films;
}

export async function getFilm(id: string): Promise<Film | undefined> {
  return films.find((f) => f.id === id);
}

export async function getGalleryPhotos(): Promise<Photo[]> {
  return photoList;
}

export async function getPhoto(id: string): Promise<Photo | undefined> {
  return photoList.find((p) => p.id === id);
}

export async function getDestinations(): Promise<Destination[]> {
  return destinations;
}

export async function getSiteFaq(): Promise<Faq[]> {
  return siteFaq;
}

export async function getPromises(): Promise<SitePromise[]> {
  return promises;
}

/** The gallery wall: every photo, linked to a vendor whose work it appears in. */
export interface GalleryItem {
  photo: Photo;
  vendor?: { slug: string; name: string };
  category?: CategorySlug;
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const byPhoto = new Map<string, { slug: string; name: string; category: CategorySlug }>();
  for (const vendor of vendors) {
    for (const photo of [vendor.cover, ...vendor.bestPhotos, ...vendor.portfolio]) {
      if (!byPhoto.has(photo.id)) {
        byPhoto.set(photo.id, { slug: vendor.slug, name: vendor.name, category: vendor.category });
      }
    }
  }
  return photoList.map((photo) => {
    const owner = byPhoto.get(photo.id);
    return {
      photo,
      vendor: owner ? { slug: owner.slug, name: owner.name } : undefined,
      category: owner?.category,
    };
  });
}

/** Everything the navbar search suggests from: cities, categories, vendors. */
export interface SearchIndex {
  cities: { slug: string; name: string }[];
  categories: { slug: string; name: string }[];
  vendors: { slug: string; name: string; citySlug: string; category: CategorySlug }[];
}

export async function getSearchIndex(): Promise<SearchIndex> {
  return {
    cities: cities.map((c) => ({ slug: c.slug, name: c.name })),
    categories: categories.map((c) => ({ slug: c.slug, name: c.name })),
    vendors: vendors.map((v) => ({ slug: v.slug, name: v.name, citySlug: v.city, category: v.category })),
  };
}
