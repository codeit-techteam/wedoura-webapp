/**
 * The one mapper from a VendorListing to the public shapes. Used by
 * src/lib/api.ts (static sample data, server) and by the client overlay and
 * portal previews, so whatever a vendor saves is exactly what the public
 * site renders. Pure: imports types only.
 */
import type { Photo, VendorDetail, VendorListing, VendorSummary } from "@/data/types";

type NamedRef = { slug: string; name: string };

export interface ViewOptions {
  /** True in portal previews: show media still pending admin approval.
   *  False (default) everywhere public. */
  includePending?: boolean;
}

function nameOf(refs: NamedRef[], slug: string): string {
  return refs.find((r) => r.slug === slug)?.name ?? slug;
}

function visiblePhotos(photos: Photo[], pending: Set<string>): Photo[] {
  return photos.filter((p) => !pending.has(p.id));
}

function stripPhotosFor(listing: VendorListing, pending: Set<string>): Photo[] {
  const cards = visiblePhotos(listing.cardPhotos, pending);
  const portfolio = visiblePhotos(listing.portfolio, pending);
  const seen = new Set<string>();
  const out: Photo[] = [];
  for (const photo of [...cards, ...portfolio]) {
    if (seen.has(photo.id)) continue;
    seen.add(photo.id);
    out.push(photo);
    if (out.length >= 7) break;
  }
  return out;
}

export function listingToSummary(
  listing: VendorListing,
  categories: NamedRef[],
  cities: NamedRef[],
  options: ViewOptions = {},
): VendorSummary {
  const pending = new Set(options.includePending ? [] : (listing.pendingMediaIds ?? []));
  return {
    slug: listing.slug,
    name: listing.name,
    tagline: listing.tagline,
    category: listing.category,
    categoryName: nameOf(categories, listing.category),
    citySlug: listing.baseCity,
    cityName: nameOf(cities, listing.baseCity),
    citiesServed: listing.citiesServed,
    travels: listing.travels,
    styles: listing.styles,
    startingPriceINR: listing.startingPriceINR,
    priceUnit: listing.priceUnit,
    cardPhotos: visiblePhotos(listing.cardPhotos, pending),
    stripPhotos: stripPhotosFor(listing, pending),
    photoCount: Math.max(
      visiblePhotos(listing.portfolio, pending).length,
      visiblePhotos(listing.cardPhotos, pending).length,
    ),
    yearsActive: listing.yearsActive,
    avatar: listing.avatar && !pending.has(listing.avatar.id) ? listing.avatar : undefined,
    featured: listing.featured,
    verified: listing.verified,
    publishedAt: listing.publishedAt,
  };
}

export function listingToDetail(
  listing: VendorListing,
  categories: NamedRef[],
  cities: NamedRef[],
  options: ViewOptions = {},
): VendorDetail {
  const pending = new Set(options.includePending ? [] : (listing.pendingMediaIds ?? []));
  // Never expose a phone number in a public shape.
  const { whatsapp, email, instagram, website } = listing.contact;
  return {
    slug: listing.slug,
    name: listing.name,
    tagline: listing.tagline,
    about: listing.about,
    aboutPhoto: listing.aboutPhoto && !pending.has(listing.aboutPhoto.id) ? listing.aboutPhoto : undefined,
    team: listing.team,
    yearsActive: listing.yearsActive,
    category: listing.category,
    categoryName: nameOf(categories, listing.category),
    services: listing.services,
    styles: listing.styles,
    categoryValues: listing.categoryValues,
    baseCity: listing.baseCity,
    cityName: nameOf(cities, listing.baseCity),
    citiesServed: listing.citiesServed,
    travels: listing.travels,
    startingPriceINR: listing.startingPriceINR,
    priceUnit: listing.priceUnit,
    cover: listing.cover && !pending.has(listing.cover.id) ? listing.cover : undefined,
    avatar: listing.avatar && !pending.has(listing.avatar.id) ? listing.avatar : undefined,
    cardPhotos: visiblePhotos(listing.cardPhotos, pending),
    portfolio: visiblePhotos(listing.portfolio, pending),
    albums: listing.albums
      .map((album) => ({ ...album, photos: visiblePhotos(album.photos, pending) }))
      .filter((album) => album.photos.length > 0),
    films: listing.films.filter((f) => !pending.has(f.id)),
    packages: listing.packages,
    faqs: listing.faqs,
    contact: { whatsapp, email, instagram, website },
    venue: listing.venue,
    travel: listing.travel,
    experiences: listing.experiences,
    testimonials: listing.testimonials,
    interview: listing.interview,
    press: listing.press,
    founder: listing.founder,
    availability: listing.availability,
    verified: listing.verified,
  };
}

/** Every media id a listing references (photos and films). */
export function listingMediaIds(listing: VendorListing): Set<string> {
  const ids = new Set<string>();
  for (const p of listing.portfolio) ids.add(p.id);
  for (const p of listing.cardPhotos) ids.add(p.id);
  if (listing.cover) ids.add(listing.cover.id);
  if (listing.aboutPhoto) ids.add(listing.aboutPhoto.id);
  if (listing.avatar) ids.add(listing.avatar.id);
  for (const album of listing.albums) for (const p of album.photos) ids.add(p.id);
  for (const film of listing.films) ids.add(film.id);
  return ids;
}
