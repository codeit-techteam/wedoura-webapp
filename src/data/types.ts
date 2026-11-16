/**
 * The Wedoura data contract. The sample data in src/data implements these
 * shapes; the future backend must serve exactly the same ones (see
 * docs/api-contract.md). Pages read them only through src/lib/api.ts
 * (public reads) and src/lib/vendor-api.ts (vendor account, mock for now).
 */

/* ---------------------------------------------------------------- media */

export interface Photo {
  id: string;
  src: string;
  /** Intrinsic size. Layouts follow the aspect ratio; photos are never force-cropped. */
  width: number;
  height: number;
  alt: string;
  /** Photographer and source for sample images, e.g. "Alok Verma / Unsplash". */
  credit?: string;
  blurDataURL: string;
}

export interface Film {
  id: string;
  title: string;
  /** Short muted preview (about 10 s), autoplays in view. Empty until a clip exists. */
  previewSrc: string;
  /** Full film, opened from "Watch the film". Empty until a clip exists. */
  fullSrc: string;
  poster: Photo;
  durationSec: number;
}

export interface Album {
  slug: string;
  title: string;
  location: string;
  /** ISO date of the wedding the album documents. */
  date?: string;
  photos: Photo[];
}

/* ------------------------------------------------------- categorisation */

export type CategorySlug =
  | "photography-films"
  | "venues"
  | "makeup-beauty"
  | "decor-styling"
  | "catering-cakes"
  | "entertainment-music";

/** A category-specific listing field, defined once per category. */
export interface CategoryFieldDef {
  /** Key into VendorListing.categoryValues. Must not collide with the
   *  reserved /vendors params: q, category, city, budget, sort, show. */
  key: string;
  label: string;
  input: "select" | "multiselect" | "number" | "text" | "toggle";
  /** For select and multiselect. */
  options?: string[];
  /** Filterable fields become filter controls on /vendors. */
  filterable: boolean;
}

export interface Category {
  slug: CategorySlug;
  name: string;
  shortName: string;
  description: string;
  cover: Photo;
  /** Extra listing fields this category asks its vendors for. */
  fields: CategoryFieldDef[];
}

export interface City {
  slug: string;
  name: string;
  state: string;
  cover: Photo;
}

/* ------------------------------------------------------------ lifecycle */

export type AccountStatus = "applied" | "approved" | "rejected" | "suspended";

export type ListingStatus = "draft" | "in_review" | "changes_requested" | "published" | "unpublished";

/* -------------------------------------------------------------- pricing */

export type PriceUnit = "per_event" | "per_day" | "per_plate" | "on_request";

export interface Package {
  label: string;
  /** Absent when unit is on_request. */
  priceINR?: number;
  unit: PriceUnit;
  note?: string;
}

/* ---------------------------------------------------------------- misc */

export interface Faq {
  question: string;
  answer: string;
}

export interface Contact {
  whatsapp?: string; // E.164
  email?: string;
  instagram?: string;
  website?: string;
  /** Never shown publicly; public shapes omit it. */
  phone?: string;
}

export interface VenueDetails {
  capacity: { min: number; max: number };
  view360Url?: string;
  spaces: string[];
  /** 360° tour nodes; panorama is an equirectangular image path. */
  tour?: { id: string; name: string; panorama: string; links: string[] }[];
}

export type InquiryStatus = "new" | "replied" | "closed";

export interface Inquiry {
  id: string;
  listingId: string;
  name: string;
  partner?: string;
  whatsapp: string;
  date?: string; // ISO date
  city: string;
  message: string;
  status: InquiryStatus;
  createdAt: string; // ISO datetime
}

/* ------------------------------------------------------ vendor accounts */

export interface VendorAccount {
  id: string;
  email: string;
  /** Mock store only; the backend stores a hash and never returns it. */
  password: string;
  contactName: string;
  whatsapp: string;
  status: AccountStatus;
  /** Shown to the vendor when status is rejected. */
  rejectionNote?: string;
  /** Set when approval creates the draft listing. */
  listingId?: string;
  createdAt: string; // ISO datetime
}

/** The signup payload, kept as submitted. */
export interface VendorApplication {
  id: string;
  accountId: string;
  businessName: string;
  category: CategorySlug;
  baseCity: string; // City slug
  contactName: string;
  whatsapp: string;
  email: string;
  /** One link to their work: Instagram or website. */
  workLink: string;
  consent: true;
  submittedAt: string; // ISO datetime
}

/* -------------------------------------------------------- vendor listing */

/** The full listing a vendor manages. Public pages never see this shape. */
export interface VendorListing {
  id: string;
  accountId: string;
  /* Admin-managed */
  status: ListingStatus;
  featured: boolean;
  featuredOrder?: number;
  verified: boolean;
  /** The admin's note to the vendor (changes_requested); cleared on resubmit. */
  reviewNote?: string;
  /** Photo/film ids added while published; hidden publicly until the admin
   *  approves them. */
  pendingMediaIds?: string[];
  /** ISO date set by the system when the listing is first published.
   *  Breaks featured-order ties: newest published first. */
  publishedAt?: string;
  /* Identity */
  name: string;
  slug: string;
  tagline: string;
  about: string[];
  /** Portrait or team photograph shown beside the about text. */
  aboutPhoto?: Photo;
  team?: string;
  yearsActive?: number;
  /* Categorisation */
  category: CategorySlug;
  services: string[];
  styles: string[];
  /** Values for the category's CategoryFieldDefs, keyed by def key. */
  categoryValues: Record<string, string | string[] | number | boolean>;
  /* Where */
  baseCity: string; // City slug
  citiesServed: string[]; // City slugs
  /** Free text, e.g. "Across India". Absent means they do not travel. */
  travels?: string;
  /* Price */
  startingPriceINR?: number;
  priceUnit: PriceUnit;
  /* Work */
  cover?: Photo;
  /** The three photos shown on cards. */
  cardPhotos: Photo[];
  portfolio: Photo[];
  albums: Album[];
  films: Film[];
  packages: Package[];
  faqs: Faq[];
  contact: Contact;
  /** Venue listings only. */
  venue?: VenueDetails;
}

/* --------------------------------------------------------- public shapes */

/** What lists and cards receive. Lists never return VendorDetail. */
export interface VendorSummary {
  slug: string;
  name: string;
  category: CategorySlug;
  categoryName: string;
  citySlug: string;
  cityName: string;
  startingPriceINR?: number;
  priceUnit: PriceUnit;
  cardPhotos: Photo[];
  featured: boolean;
  verified: boolean;
  /** ISO date of first publication; sorts "newest" and feeds sitemap lastmod. */
  publishedAt?: string;
}

/** What the public profile receives: the listing minus account and admin
 *  internals, plus display names. Contact never includes the phone. */
export interface VendorDetail {
  slug: string;
  name: string;
  tagline: string;
  about: string[];
  aboutPhoto?: Photo;
  team?: string;
  yearsActive?: number;
  category: CategorySlug;
  categoryName: string;
  services: string[];
  styles: string[];
  categoryValues: Record<string, string | string[] | number | boolean>;
  baseCity: string;
  cityName: string;
  citiesServed: string[];
  travels?: string;
  startingPriceINR?: number;
  priceUnit: PriceUnit;
  cover?: Photo;
  cardPhotos: Photo[];
  portfolio: Photo[];
  albums: Album[];
  films: Film[];
  packages: Package[];
  faqs: Faq[];
  contact: Omit<Contact, "phone">;
  venue?: VenueDetails;
  verified: boolean;
}

/* ------------------------------------------------------ paged responses */

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageCount: number;
}

/* ------------------------------------------------- stories and articles */

export interface StoryChapter {
  title: string;
  text: string[];
  photos: Photo[];
}

export interface VendorCredit {
  role: string;
  vendorSlug?: string;
  name: string;
}

export interface RealWedding {
  slug: string;
  title: string;
  couple: string;
  city: string; // City slug
  date: string; // ISO date
  excerpt: string;
  cover: Photo;
  /** e.g. "Palace", "Beach", "Garden"; drives the style filter. */
  style: string;
  /** Optional film shown inside the story. */
  filmId?: string;
  chapters: StoryChapter[];
  credits: VendorCredit[];
  featured?: boolean;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string; // ISO date
  readMinutes: number;
  cover: Photo;
  body: { heading?: string; paragraphs: string[]; photo?: Photo }[];
}

export interface Destination {
  slug: string;
  name: string;
  country: string;
  bestMonths: string;
  summary: string;
  cover: Photo;
  /** Three short lines for the detail panel. */
  highlights: string[];
}

export interface SitePromise {
  title: string;
  text: string;
}
