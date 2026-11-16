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
    category: listing.category,
    categoryName: nameOf(categories, listing.category),
    citySlug: listing.baseCity,
    cityName: nameOf(cities, listing.baseCity),
    startingPriceINR: listing.startingPriceINR,
    priceUnit: listing.priceUnit,
    cardPhotos: visiblePhotos(listing.cardPhotos, pending),
    featured: listing.featured,
    verified: listing.verified,
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
  for (const album of listing.albums) for (const p of album.photos) ids.add(p.id);
  for (const film of listing.films) ids.add(film.id);
  return ids;
}
