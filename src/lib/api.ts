/**
 * Public reads. The only module that touches content data; every function
 * mirrors one future backend endpoint (docs/api-contract.md) so the sample
 * data can be swapped for fetch calls by changing this file alone.
 *
 * The lifecycle rule lives HERE, not in pages: every public function sees
 * only listings whose status is "published". Vendor-side (authenticated)
 * functions live in src/lib/vendor-api.ts against the mock store.
 */
import { blogPosts } from "@/data/blogs";
import { categories } from "@/data/categories";
import { cities } from "@/data/cities";
import { promises, siteFaq } from "@/data/faq";
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
  Paged,
  Photo,
  RealWedding,
  SitePromise,
  VendorDetail,
  VendorListing,
  VendorSummary,
} from "@/data/types";
import { listings } from "@/data/vendors";

/* ----------------------------------------------------------- internals */

const categoryNames = new Map(categories.map((c) => [c.slug, c.name]));
const cityNames = new Map(cities.map((c) => [c.slug, c.name]));

/** The rule for every public page: only published listings exist. */
function published(): VendorListing[] {
  return listings.filter((l) => l.status === "published");
}

function toSummary(l: VendorListing): VendorSummary {
  return {
    slug: l.slug,
    name: l.name,
    category: l.category,
    categoryName: categoryNames.get(l.category) ?? l.category,
    citySlug: l.baseCity,
    cityName: cityNames.get(l.baseCity) ?? l.baseCity,
    startingPriceINR: l.startingPriceINR,
    priceUnit: l.priceUnit,
    cardPhotos: l.cardPhotos,
    featured: l.featured,
    verified: l.verified,
  };
}

function toDetail(l: VendorListing): VendorDetail {
  // Strip account and admin internals; never expose a phone number.
  const { whatsapp, email, instagram, website } = l.contact;
  return {
    slug: l.slug,
    name: l.name,
    tagline: l.tagline,
    about: l.about,
    aboutPhoto: l.aboutPhoto,
    team: l.team,
    yearsActive: l.yearsActive,
    category: l.category,
    categoryName: categoryNames.get(l.category) ?? l.category,
    services: l.services,
    styles: l.styles,
    categoryValues: l.categoryValues,
    baseCity: l.baseCity,
    cityName: cityNames.get(l.baseCity) ?? l.baseCity,
    citiesServed: l.citiesServed,
    travels: l.travels,
    startingPriceINR: l.startingPriceINR,
    priceUnit: l.priceUnit,
    cover: l.cover,
    cardPhotos: l.cardPhotos,
    portfolio: l.portfolio,
    albums: l.albums,
    films: l.films,
    packages: l.packages,
    faqs: l.faqs,
    contact: { whatsapp, email, instagram, website },
    venue: l.venue,
    verified: l.verified,
  };
}

function paginate<T>(all: T[], page = 1, limit = 24): Paged<T> {
  const pageCount = Math.max(1, Math.ceil(all.length / limit));
  const safePage = Math.min(Math.max(1, page), pageCount);
  return {
    items: all.slice((safePage - 1) * limit, safePage * limit),
    total: all.length,
    page: safePage,
    pageCount,
  };
}

const byFeatured = (a: VendorListing, b: VendorListing) =>
  Number(b.featured) - Number(a.featured) ||
  (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99) ||
  a.name.localeCompare(b.name);

/* ------------------------------------------------------------- vendors */

export type VendorSort = "featured" | "price-asc" | "price-desc" | "name";
export const VENDOR_SORTS: { value: VendorSort; label: string }[] = [
  { value: "featured", label: "Featured first" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "name", label: "Name, A to Z" },
];

/** Budget bands with clear boundaries, mapped onto min/max price. */
export type BudgetBand = "b1" | "b2" | "b3";
export const BUDGET_BANDS: { value: BudgetBand; label: string }[] = [
  { value: "b1", label: "Under ₹1 lakh" },
  { value: "b2", label: "₹1 to under ₹5 lakh" },
  { value: "b3", label: "₹5 lakh and above" },
];

export function budgetToRange(band: string | undefined): { minPrice?: number; maxPrice?: number } {
  if (band === "b1") return { maxPrice: 99999 };
  if (band === "b2") return { minPrice: 100000, maxPrice: 499999 };
  if (band === "b3") return { minPrice: 500000 };
  return {};
}

export interface VendorListParams {
  q?: string;
  category?: CategorySlug | string;
  /** Matches the base city or any city served. */
  city?: string;
  /** Applies to per_event/per_day prices; per_plate and on_request listings
   *  are left out whenever a price bound is set. */
  minPrice?: number;
  maxPrice?: number;
  sort?: VendorSort | string;
  page?: number;
  limit?: number;
  /** Category-specific filters, keyed by CategoryFieldDef.key. */
  fields?: Record<string, string>;
}

export async function listVendors(params: VendorListParams = {}): Promise<Paged<VendorSummary>> {
  const q = params.q?.trim().toLowerCase();
  const priced = params.minPrice !== undefined || params.maxPrice !== undefined;

  let result = published().filter((l) => {
    if (params.category && l.category !== params.category) return false;
    if (params.city && l.baseCity !== params.city && !l.citiesServed.includes(params.city)) return false;
    if (priced) {
      // Per-plate and on-request prices are not comparable to event budgets.
      if (l.priceUnit === "per_plate" || l.priceUnit === "on_request" || l.startingPriceINR === undefined) return false;
      if (params.minPrice !== undefined && l.startingPriceINR < params.minPrice) return false;
      if (params.maxPrice !== undefined && l.startingPriceINR > params.maxPrice) return false;
    }
    if (params.fields) {
      const defs = categories.find((c) => c.slug === l.category)?.fields ?? [];
      for (const [key, value] of Object.entries(params.fields)) {
        if (!value) continue;
        if (!defs.some((d) => d.key === key && d.filterable)) continue;
        const own = l.categoryValues[key];
        const matches = Array.isArray(own) ? own.includes(value) : String(own) === value;
        if (!matches) return false;
      }
    }
    if (q) {
      const haystack = [
        l.name,
        l.tagline,
        l.baseCity,
        cityNames.get(l.baseCity) ?? "",
        l.category,
        categoryNames.get(l.category) ?? "",
        ...l.services,
        ...l.styles,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  result = [...result];
  const price = (l: VendorListing) =>
    l.priceUnit === "on_request" || l.startingPriceINR === undefined ? Number.MAX_SAFE_INTEGER : l.startingPriceINR;
  if (params.sort === "price-asc") result.sort((a, b) => price(a) - price(b));
  else if (params.sort === "price-desc")
    result.sort((a, b) => {
      // On-request listings stay last in both price orders.
      const aReq = price(a) === Number.MAX_SAFE_INTEGER;
      const bReq = price(b) === Number.MAX_SAFE_INTEGER;
      if (aReq !== bReq) return aReq ? 1 : -1;
      return price(b) - price(a);
    });
  else if (params.sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
  else result.sort(byFeatured);

  const paged = paginate(result, params.page, params.limit);
  return { ...paged, items: paged.items.map(toSummary) };
}

export async function getVendor(slug: string): Promise<VendorDetail | undefined> {
  const listing = published().find((l) => l.slug === slug);
  return listing ? toDetail(listing) : undefined;
}

export async function getVenue(slug: string): Promise<VendorDetail | undefined> {
  const listing = published().find((l) => l.slug === slug && l.category === "venues");
  return listing ? toDetail(listing) : undefined;
}

export async function listFeatured(category?: CategorySlug | string, limit = 8): Promise<VendorSummary[]> {
  return published()
    .filter((l) => (category ? l.category === category : true))
    .sort(byFeatured)
    .slice(0, limit)
    .map(toSummary);
}

/** Same category first, then same city, never the vendor itself. */
export async function listSimilar(slug: string, limit = 4): Promise<VendorSummary[]> {
  const pool = published();
  const self = pool.find((l) => l.slug === slug);
  if (!self) return [];
  const others = pool.filter((l) => l.slug !== slug);
  const sameCategory = others.filter((l) => l.category === self.category);
  const sameCity = others.filter((l) => l.category !== self.category && l.baseCity === self.baseCity);
  const rest = others.filter((l) => l.category !== self.category && l.baseCity !== self.baseCity);
  return [...sameCategory, ...sameCity, ...rest].slice(0, limit).map(toSummary);
}

/* ------------------------------------------- categories and cities */

export type CategoryWithCount = Category & { count: number };
export type CityWithCount = City & { count: number };

/** Only categories with at least one published vendor appear anywhere. */
export async function listCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const pool = published();
  return categories
    .map((c) => ({ ...c, count: pool.filter((l) => l.category === c.slug).length }))
    .filter((c) => c.count > 0);
}

/** Only cities with at least one published vendor (based there or serving it). */
export async function listCitiesWithCounts(): Promise<CityWithCount[]> {
  const pool = published();
  return cities
    .map((c) => ({
      ...c,
      count: pool.filter((l) => l.baseCity === c.slug || l.citiesServed.includes(c.slug)).length,
    }))
    .filter((c) => c.count > 0);
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  return categories.find((c) => c.slug === slug);
}

/** Every category, for forms (signup): applicants may be in a category with
 *  no published vendor yet. Public browsing uses the counted function. */
export async function listAllCategories(): Promise<Category[]> {
  return categories;
}

/** Every city, for forms (signup). */
export async function listAllCities(): Promise<City[]> {
  return cities;
}

/* ---------------------------------------------------- films and photos */

/** Films belonging to published listings. */
export async function listFilms(limit?: number): Promise<Film[]> {
  const result: Film[] = [];
  const seen = new Set<string>();
  for (const listing of published()) {
    for (const film of listing.films) {
      if (!seen.has(film.id)) {
        seen.add(film.id);
        result.push(film);
      }
    }
  }
  return limit ? result.slice(0, limit) : result;
}

export async function getFilm(id: string): Promise<Film | undefined> {
  return (await listFilms()).find((f) => f.id === id);
}

export async function getPhoto(id: string): Promise<Photo | undefined> {
  return photoList.find((p) => p.id === id);
}

/** The gallery wall: photos owned by published vendors, linked back to them. */
export interface GalleryItem {
  photo: Photo;
  vendor?: { slug: string; name: string };
  category?: CategorySlug;
}

export async function listGalleryPhotos(page = 1, limit = 100): Promise<Paged<GalleryItem>> {
  const byPhoto = new Map<string, { slug: string; name: string; category: CategorySlug }>();
  for (const listing of published()) {
    const owned = [listing.cover, ...listing.cardPhotos, ...listing.portfolio].filter(
      (p): p is Photo => p !== undefined,
    );
    for (const photo of owned) {
      if (!byPhoto.has(photo.id)) {
        byPhoto.set(photo.id, { slug: listing.slug, name: listing.name, category: listing.category });
      }
    }
  }
  const items = photoList
    .filter((photo) => byPhoto.has(photo.id))
    .map((photo) => {
      const owner = byPhoto.get(photo.id);
      return {
        photo,
        vendor: owner ? { slug: owner.slug, name: owner.name } : undefined,
        category: owner?.category,
      };
    });
  return paginate(items, page, limit);
}

/* ------------------------------------------------------------ weddings */

export interface WeddingListParams {
  city?: string;
  style?: string;
  page?: number;
  limit?: number;
}

export async function listWeddings(params: WeddingListParams = {}): Promise<Paged<RealWedding>> {
  const all = realWeddings
    .filter(
      (w) =>
        (!params.city || w.city === params.city) &&
        (!params.style || w.style.toLowerCase() === params.style.toLowerCase()),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  return paginate(all, params.page, params.limit ?? 50);
}

export async function getWedding(slug: string): Promise<RealWedding | undefined> {
  return realWeddings.find((w) => w.slug === slug);
}

export async function listWeddingStyles(): Promise<string[]> {
  return [...new Set(realWeddings.map((w) => w.style))].sort();
}

/* ------------------------------------------------------------ articles */

export interface ArticleListParams {
  category?: string;
  page?: number;
  limit?: number;
}

export async function listArticles(params: ArticleListParams = {}): Promise<Paged<BlogPost>> {
  const all = [...blogPosts]
    .filter((p) => !params.category || p.category.toLowerCase() === params.category.toLowerCase())
    .sort((a, b) => b.date.localeCompare(a.date));
  return paginate(all, params.page, params.limit ?? 50);
}

export async function getArticle(slug: string): Promise<BlogPost | undefined> {
  return blogPosts.find((p) => p.slug === slug);
}

/* ---------------------------------------------------------------- misc */

export async function listDestinations(): Promise<Destination[]> {
  return destinations;
}

export async function getSiteFaq(): Promise<Faq[]> {
  return siteFaq;
}

export async function getPromises(): Promise<SitePromise[]> {
  return promises;
}

/** Everything the navbar search suggests from: published vendors only. */
export interface SearchIndex {
  cities: { slug: string; name: string }[];
  categories: { slug: string; name: string }[];
  vendors: { slug: string; name: string; citySlug: string; category: CategorySlug }[];
}

export async function getSearchIndex(): Promise<SearchIndex> {
  const [cats, cits] = await Promise.all([listCategoriesWithCounts(), listCitiesWithCounts()]);
  return {
    cities: cits.map((c) => ({ slug: c.slug, name: c.name })),
    categories: cats.map((c) => ({ slug: c.slug, name: c.name })),
    vendors: published().map((l) => ({ slug: l.slug, name: l.name, citySlug: l.baseCity, category: l.category })),
  };
}
