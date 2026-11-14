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

export interface VendorFilter {
  category?: CategorySlug | string;
  city?: string;
}

export async function getVendors(filter: VendorFilter = {}): Promise<Vendor[]> {
  return vendors.filter(
    (v) => (!filter.category || v.category === filter.category) && (!filter.city || v.city === filter.city),
  );
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

export async function getRealWeddings(): Promise<RealWedding[]> {
  return [...realWeddings].sort((a, b) => b.date.localeCompare(a.date));
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
