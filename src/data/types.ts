/**
 * Content types for Wedoura. Sample data in src/data implements these; the
 * real backend will serve the same shapes later. Pages read them only
 * through src/lib/api.ts.
 */

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
  /** Short muted preview (about 10 s), autoplays in view. */
  previewSrc: string;
  /** Full film, opened from "Watch the film". */
  fullSrc: string;
  poster: Photo;
  durationSec: number;
}

export type CategorySlug =
  | "photography-films"
  | "venues"
  | "makeup-beauty"
  | "decor-styling"
  | "catering-cakes"
  | "entertainment-music";

export interface Category {
  slug: CategorySlug;
  name: string;
  shortName: string;
  description: string;
  cover: Photo;
}

export interface City {
  slug: string;
  name: string;
  state: string;
  cover: Photo;
}

export interface PriceLine {
  label: string;
  /** Free text, e.g. "From ₹1,50,000". Sample data must read as sample. */
  price: string;
  note?: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface Album {
  slug: string;
  title: string;
  location: string;
  photos: Photo[];
}

export interface Vendor {
  slug: string;
  name: string;
  category: CategorySlug;
  city: string; // City slug
  tagline: string;
  /** Two sentences for cards. */
  summary: string;
  cover: Photo;
  /** The three best photos, shown on featured cards. */
  bestPhotos: [Photo, Photo, Photo];
  portfolio: Photo[];
  albums: Album[];
  films: Film[];
  about: string[];
  /** Portrait or team photograph shown beside the about text. */
  aboutPhoto: Photo;
  keyFacts: { label: string; value: string }[];
  pricing: PriceLine[];
  /** Numeric rupees for the first price line; drives budget filter and sort. */
  startingPriceINR?: number;
  faq: Faq[];
  whatsapp: string; // E.164, sample numbers only
  featured?: boolean;
  /** Venue-only fields. */
  venue?: {
    capacity: { min: number; max: number };
    view360Url?: string;
    spaces: string[];
    /** 360° tour nodes; panorama is an equirectangular image path. */
    tour?: { id: string; name: string; panorama: string; links: string[] }[];
  };
}

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
  /** Three short sample lines for the detail panel. */
  highlights: string[];
}

export interface SitePromise {
  title: string;
  text: string;
}
