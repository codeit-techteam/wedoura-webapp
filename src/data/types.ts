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
  /** "equirectangular" marks a 360° photo (2:1, ≥4000px wide). Absent means "flat". */
  projection?: "flat" | "equirectangular";
}

export interface Film {
  id: string;
  title: string;
  /** Short muted preview (about 10 s), autoplays in view. Empty until a clip exists. */
  previewSrc: string;
  /** Full film, opened from "Watch the film". Empty until a clip exists. */
  fullSrc: string;
  /** YouTube or Vimeo URL for the full film. Hosted uploads stay optional. */
  youtubeUrl?: string;
  poster: Photo;
  durationSec: number;
}

export interface Album {
  slug: string;
  title: string;
  location: string;
  /** ISO date of the wedding the album documents. */
  date?: string;
  /** Short lede shown in the frame-by-frame story reader. */
  excerpt?: string;
  photos: Photo[];
  /**
   * When true, included in the "Inside the stories" carousel (order follows
   * albums[]). Absent means included (legacy albums stay in the carousel).
   */
  featured?: boolean;
}

/* ------------------------------------------------------- categorisation */

/**
 * The search-panel list from the client's homepage, plus the slugs the
 * sample vendors already use. `photography-films` is Photographers,
 * `entertainment-music` is Live bands: the public URLs stay put.
 */
export type CategorySlug =
  | "photography-films"
  | "videographers"
  | "pre-wedding-shoots"
  | "content-creators"
  | "photo-booths"
  | "wedding-planners"
  | "destination-planners"
  | "venues"
  | "lighting-tents"
  | "wedding-officiants"
  | "makeup-beauty"
  | "hair-stylists"
  | "mehendi-artists"
  | "bridal-wear"
  | "groom-wear"
  | "jewellery"
  | "decor-styling"
  | "catering-cakes"
  | "cakes-desserts"
  | "invitations"
  | "favours-gifts"
  | "djs"
  | "entertainment-music"
  | "choreographers"
  | "wedding-transport"
  | "hotels"
  | "travel-agencies";

/** The 11 kinds on the vendor dashboard. Categories map onto one of these. */
export type VendorKind =
  | "photographer"
  | "venue"
  | "decor"
  | "beauty"
  | "caterer"
  | "planner"
  | "mehendi"
  | "music"
  | "invitations"
  | "attire"
  | "travel";

/** Icon key used in the reference search panel. */
export type CategoryIcon =
  | "cam"
  | "film"
  | "heart"
  | "phone"
  | "booth"
  | "clip"
  | "plane"
  | "build"
  | "tent"
  | "book"
  | "brush"
  | "sciss"
  | "hand"
  | "dress"
  | "tie"
  | "gem"
  | "flower"
  | "fork"
  | "cake"
  | "mail"
  | "gift"
  | "disc"
  | "mic"
  | "dance"
  | "car"
  | "bed"
  | "globe";

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
  /** Search-panel group, in the order the panel shows them. */
  group: string;
  icon: CategoryIcon;
  /** Which dashboard field set this category uses. */
  kind: VendorKind;
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
  /** "What's included" bullets, shown as a check list on the profile. */
  inclusions?: string[];
  /** Highlights this package as the most popular choice ("Most booked"). */
  featured?: boolean;
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

/** One space in a venue's 360° tour. The photo it points at must be an
 *  equirectangular photo in the listing's portfolio, so pending-media rules
 *  apply to scenes for free. Angles are degrees: yaw 0–360 from the
 *  panorama's centre, pitch -90 (down) to 90 (up). */
export interface TourScene {
  id: string;
  /** Portfolio photo id of an equirectangular photo. */
  photoId: string;
  name: string;
  /** Where the visitor looks first in this scene. Defaults to 0. */
  startYaw?: number;
}

/** A one-way arrow between scenes, drawn at `yaw` inside `from`. */
export interface TourLink {
  from: string;
  to: string;
  yaw: number;
}

/** A labelled point of interest inside one scene. */
export interface TourMarker {
  scene: string;
  yaw: number;
  pitch: number;
  label: string;
}

export interface VenueTourData {
  scenes: TourScene[];
  links: TourLink[];
  markers?: TourMarker[];
}

export interface VenueSpaceDetail {
  name: string;
  /** Short kind line, e.g. "Outdoor · lawn". */
  kind?: string;
  description?: string;
  setting?: "indoor" | "outdoor" | "covered";
  /** Ceremony layout (rows of chairs). */
  ceremony?: number;
  /** Dinner layout (round tables). */
  dinner?: number;
  /** Standing / party layout. */
  standing?: number;
  area?: string;
  areaSqFt?: number;
  bestFor?: string[];
  /** Portfolio photo id for the space card. */
  photoId?: string;
  /** Tour scene id, when this space has a 360° view. */
  sceneId?: string;
}

/** One stay tier on the venue profile (suites, garden rooms, partner hotels). */
export interface VenueRoomTier {
  name: string;
  countLabel: string;
  description?: string;
  rateFromINR?: number;
}

/** Kept for the portal's simple rooms summary; prefer `roomTiers` on the profile. */
export interface VenueRoomOffer {
  count: number;
  types: string;
  rateFromINR?: number;
  partnerRoomsNearby?: string;
}

export interface VenueMenu {
  name: string;
  note?: string;
  pricePerGuestINR?: number;
  minimumGuests?: number;
}

export interface VenueFood {
  cateringMode?: string;
  menus?: VenueMenu[];
  outsideCatererFeeINR?: number;
  cuisines?: string[];
}

export type VenueRuleStatus = "allowed" | "conditions" | "forbidden";

export interface VenueRuleItem {
  status: VenueRuleStatus;
  title: string;
  detail: string;
}

export interface VenueRules {
  /** Rich rule rows for the venue profile. */
  items?: VenueRuleItem[];
  allowed?: string[];
  withConditions?: string[];
  notAllowed?: string[];
  note?: string;
}

/** Inputs for the rough estimate calculator on the venue profile. */
export interface VenueEstimate {
  /** Hire cost charged once per selected event. */
  venueHireINR: number;
  /** Event chips (Mehendi, Wedding, …). */
  events: string[];
  /** Optional package for blocking all rooms (e.g. 24 rooms × 2 nights). */
  roomsPackageINR?: number;
  roomsPackageLabel?: string;
}

export interface VenueDetails {
  capacity: { min: number; max: number };
  /** Short names. The portal tag list still edits this. */
  spaces: string[];
  /** Richer space records for the venue profile. Optional until filled in. */
  spaceDetails?: VenueSpaceDetail[];
  rooms?: VenueRoomOffer;
  roomTiers?: VenueRoomTier[];
  food?: VenueFood;
  rules?: VenueRules;
  facilities?: string[];
  peakMonths?: string[];
  valueMonths?: string[];
  closedMonths?: string[];
  /** Optional pull-quote under the capacity planner. */
  capacityNote?: string;
  /** Overview fact strip (Type, Guests, …). Hidden when empty. */
  overviewFacts?: { label: string; value: string; note?: string }[];
  estimate?: VenueEstimate;
  location?: {
    address?: string;
    mapUrl?: string;
    distances?: { label: string; value: string; detail?: string }[];
  };
  /** Linked 360° tour over equirectangular portfolio photos. */
  tour?: VenueTourData;
}

/** Vendor-facing enquiry status (couple account shows the same). */
export type InquiryStatus = "new" | "replied" | "booked" | "closed";

/** Why a vendor closed an enquiry. */
export type InquiryCloseReason =
  | "not_available"
  | "budget"
  | "no_response"
  | "booked_elsewhere";

/** Which public form created the enquiry. */
export type InquirySource =
  | "vendor_profile"
  | "venue_profile"
  | "shortlist"
  | "package_book";

/**
 * One couple enquiry against a listing. Only form submissions appear —
 * never vendor-added leads. Status is New / Replied / Booked / Closed.
 */
export interface Inquiry {
  id: string;
  listingId: string;
  /** Couple name as submitted. */
  name: string;
  partner?: string;
  whatsapp: string;
  email?: string;
  /** Exact wedding date when the form asked for one (ISO date). */
  date?: string;
  /** Month when the form asked for a month (YYYY-MM). */
  weddingMonth?: string;
  /** City or venue line from the form. */
  city: string;
  guests?: number;
  budget?: string;
  message: string;
  /** Package / collection label when the form had one. */
  collection?: string;
  source: InquirySource;
  status: InquiryStatus;
  closeReason?: InquiryCloseReason;
  /** Private vendor note; not shown to the couple. */
  notes?: string;
  /** When set, the couple account can list this enquiry. */
  coupleEmail?: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

/* -------------------------------------------- vendor identity documents */

/** Government ID types accepted at signup. Never store the Aadhaar number. */
export type VendorIdType =
  | "masked_aadhaar"
  | "pan"
  | "voter_id"
  | "passport"
  | "driving_licence";

export type VendorDocumentStatus = "submitted" | "approved" | "rejected";

export interface VendorDocumentFile {
  name: string;
  mimeType: string;
  size: number;
  /**
   * Private storage key (mock: `idb:…`). Never a public CDN URL — the real
   * backend serves short-lived signed URLs to admins only.
   */
  url: string;
  side: "front" | "back";
}

/** Identity document submitted at signup or re-uploaded from Settings. */
export interface VendorDocument {
  id: string;
  vendorId: string;
  type: VendorIdType;
  files: VendorDocumentFile[];
  status: VendorDocumentStatus;
  rejectReason?: string;
  /** When the vendor agreed to verification use of the document. */
  consentAt: string;
  submittedAt: string;
  reviewedAt?: string;
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
  /** Current identity document (latest submission). */
  documentId?: string;
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
  /** Optional early-access flag from the signup form. */
  foundingPartner?: boolean;
  /** Identity document submitted with the application. */
  documentId?: string;
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
  /** Round mark shown on cards and the profile hero; first card photo when unset. */
  avatar?: Photo;
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
  /** Hotel or travel-agency listings. */
  travel?: HotelProfile | AgencyProfile;
  /** Moments a couple can add to a honeymoon request. */
  experiences?: Experience[];
  /** Vendor-entered. Shown as "Kind words", never as verified reviews. */
  testimonials?: Testimonial[];
  /** Written by Wedoura. Hidden on the profile when absent. */
  interview?: Interview;
  /** Vendor-proposed interview edits while published. Live profile keeps
   *  `interview` until an admin approves this draft (same idea as pending media). */
  pendingInterview?: Interview;
  /** Publication names, with no invented circulation figures. */
  press?: string[];
  /** Founder intro: a short video or poster + caption. */
  founder?: FounderProfile;
  availability?: Availability;
  /** Vendor-submitted real weddings awaiting Wedoura editorial review. Not public. */
  weddingSubmissions?: WeddingSubmission[];
}

/** A real wedding a vendor asks Wedoura to feature. */
export interface WeddingSubmission {
  id: string;
  coupleNames: string;
  /** YYYY-MM */
  weddingMonth: string;
  venue: string;
  city: string;
  /** Couple gave permission to publish. */
  permission: true;
  note?: string;
  status: "pending" | "featured" | "declined";
  submittedAt: string;
}

/* --------------------------------------------------------- public shapes */

/** What lists and cards receive. Lists never return VendorDetail. */
export interface VendorSummary {
  slug: string;
  name: string;
  tagline: string;
  category: CategorySlug;
  categoryName: string;
  citySlug: string;
  cityName: string;
  citiesServed: string[];
  travels?: string;
  styles: string[];
  startingPriceINR?: number;
  priceUnit: PriceUnit;
  cardPhotos: Photo[];
  /** Round mark on the card; UI falls back to the first card photo. */
  avatar?: Photo;
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
  /** Round mark on the hero; UI falls back to the first card photo. */
  avatar?: Photo;
  cardPhotos: Photo[];
  portfolio: Photo[];
  albums: Album[];
  films: Film[];
  packages: Package[];
  faqs: Faq[];
  contact: Omit<Contact, "phone">;
  venue?: VenueDetails;
  travel?: HotelProfile | AgencyProfile;
  experiences?: Experience[];
  testimonials?: Testimonial[];
  interview?: Interview;
  press?: string[];
  founder?: FounderProfile;
  availability?: Availability;
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

/** One photograph inside a chapter, with optional caption and aspect hint. */
export interface StoryFigure {
  photo: Photo;
  caption?: string;
  /** Reference aspect classes: 3/2, 4/5, 2/3. Absent = intrinsic. */
  aspect?: "3/2" | "4/5" | "2/3";
}

/** How figures are grouped into a gallery row. */
export type StoryRowLayout = "single" | "pair" | "mosaic" | "petals";

export interface StoryChapter {
  /** Roman numeral, as on the story page. */
  numeral?: string;
  title: string;
  /** Short line under the numeral, before the paragraphs. */
  intro?: string;
  text: string[];
  /** Flat list — used for "all photographs" and when figures/rows are absent. */
  photos: Photo[];
  /** Captioned figures for the chapter gallery. Falls back to `photos`. */
  figures?: StoryFigure[];
  /** One layout token per row; figures are consumed in order. */
  rows?: StoryRowLayout[];
  /** "details" = photo + details list; "night" = video clips band. */
  variant?: "default" | "details" | "night";
}

export interface StoryNightClip {
  src: string;
  alt: string;
  aspectRatio?: string;
}

export interface VendorCredit {
  role: string;
  vendorSlug?: string;
  name: string;
  /** When set, credit links to a venue profile instead of /vendors. */
  venueSlug?: string;
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
  editorNote?: string;
  /** Mid-story pull quote (editor's note band). */
  pullQuote?: string;
  palette?: { name: string; hex: string; note?: string }[];
  details?: { label: string; value: string }[];
  /** Links into filtered vendor lists ("Get the look"). */
  getTheLook?: { label: string; href: string; note?: string }[];
  /** Hero eyebrow, e.g. "Real Wedding · The Courtyard House". */
  heroEyebrow?: string;
  /** Line under the couple names. */
  heroSubtitle?: string;
  /** Intro headline above the story body. */
  storyHeadline?: string;
  /** Opening paragraphs before chapter I. */
  intro?: string[];
  /** Fact chips under the hero (Venue, Photography, …). */
  creditStrip?: { label: string; value: string }[];
  /** Glance list beside the intro. */
  glance?: { label: string; value: string; href?: string }[];
  /** Short clips for "The Night" chapter. */
  nightClips?: StoryNightClip[];
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

export interface DestinationExperience {
  title: string;
  description: string;
}

export interface Destination {
  slug: string;
  name: string;
  country: string;
  bestMonths: string;
  summary: string;
  cover: Photo;
  /** Teaser lines on the index grid. */
  highlights: string[];
  /** Opening copy for the detail page. */
  overview: string[];
  experiences: DestinationExperience[];
  gallery: Photo[];
  /** Why couples pick this place for a first trip. */
  whyCouples: string[];
  /** Practical notes (getting there, stays, pace). */
  practical: { label: string; value: string }[];
}

export interface SitePromise {
  title: string;
  text: string;
}

/* ------------------------------------------------- v2 records */

export interface Testimonial {
  quote: string;
  couple: string;
  /** City or location, e.g. "Bengaluru" or "Destination wedding, Goa". */
  location?: string;
  /** ISO date of the wedding, when the vendor supplied one. */
  date?: string;
}

export interface Interview {
  title: string;
  /** Who at Wedoura wrote it. */
  by: string;
  /** One-line teaser shown above the Q&A. */
  lede?: string;
  /** Introductory paragraphs before Q&A, if any. */
  paragraphs?: string[];
  /** Q&A pairs; shown as an expandable list. */
  questions?: { question: string; answer: string }[];
  /** YouTube embed URL for a video version of the interview. */
  youtubeUrl?: string;
  /** Human-readable duration label, e.g. "4 min". */
  durationLabel?: string;
  /** Poster image for the video button. */
  poster?: Photo;
}

/** Vendor founder / about-the-person video strip. */
export interface FounderProfile {
  caption: string;
  poster: Photo;
  /** Display name under the caption, e.g. the founder. */
  name?: string;
  /** Short about paragraphs below the film / poster. */
  about?: string[];
  youtubeUrl?: string;
  previewSrc?: string;
}

/** Reserved for later. Nothing reads this until real reviews exist. */
export interface Review {
  id: string;
  listingId: string;
  quote: string;
  couple: string;
  date: string;
}

export interface Availability {
  /** ISO dates the vendor has blocked. */
  blockedDates: string[];
  /** Venue only: blocked dates per space name. */
  spaces?: { space: string; blockedDates: string[] }[];
}

export interface HotelRoom {
  name: string;
  count?: number;
  size?: string;
  view?: string;
  rateFromINR?: number;
  description?: string;
  photoId?: string;
}

export interface HotelDining {
  name: string;
  description?: string;
}

export interface HotelProfile {
  kind: "hotel";
  propertyType: string;
  /** Shown only when the hotel itself publishes a star rating. */
  starRating?: number;
  rooms: HotelRoom[];
  mealPlans?: string[];
  honeymoonTouches?: string[];
  policies?: string[];
  dining?: HotelDining[];
  /** Short evening / dusk band copy. */
  eveningNote?: string;
  gettingThere?: { label: string; value: string; detail?: string }[];
  /** Mood tags for honeymoon search (Beach, Hills, …). */
  moods?: string[];
  overviewHeadline?: string;
}

export interface AgencyProfile {
  kind: "agency";
  destinations: string[];
  registrations?: string[];
}

export interface TravelCollection {
  name: string;
  pricePerCoupleINR?: number;
  note?: string;
  /** Optional stay slug highlights for this collection. */
  staySlugs?: string[];
}

export interface ItineraryDay {
  day: number;
  title: string;
  text: string;
  /** Optional place line, e.g. "Ubud → Uluwatu". */
  place?: string;
}

export interface PackageStayHighlight {
  name: string;
  description?: string;
  nights?: number;
  photoId?: string;
  staySlug?: string;
}

export interface HoneymoonPackage {
  slug: string;
  name: string;
  destination: string;
  nights: number;
  days?: number;
  /** Vendor slug of the agency that sells it, when one is published. */
  vendorSlug?: string;
  summary: string;
  /** Hero eyebrow, e.g. "Honeymoon package · Bali, Indonesia". */
  heroEyebrow?: string;
  overviewHeadline?: string;
  overview?: string[];
  glance?: { label: string; value: string }[];
  routeLabel?: string;
  collections: TravelCollection[];
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  stays?: PackageStayHighlight[];
  /** Experience slugs shown as "moments". */
  momentSlugs?: string[];
  goodToKnow: string[];
  faqs?: { question: string; answer: string }[];
  gallery?: Photo[];
  cover: Photo;
  moods?: string[];
  featured?: boolean;
}

export interface Experience {
  slug: string;
  name: string;
  description: string;
  priceFromINR?: number;
  /** Optional cover for the landing cards. */
  cover?: Photo;
  moods?: string[];
}

export interface CoupleAccount {
  id: string;
  names: string;
  email: string;
  /** YYYY-MM */
  weddingMonth?: string;
  city?: string;
  shortlist: string[];
}

export interface PlanningRequest {
  id: string;
  name: string;
  email?: string;
  whatsapp?: string;
  weddingDate?: string;
  budget?: string;
  city?: string;
  weddingMonth?: string;
  /** Honeymoon requests: the mood the couple picked (Beach, Hills, …). */
  mood?: string;
  note?: string;
  createdAt: string;
}

export interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

export interface SoulmatesWaitlist {
  id: string;
  name: string;
  email: string;
  city?: string;
  createdAt: string;
}

/* ------------------------------------------------------------- partners */

/** Where a partner band can appear; only the homepage for now. */
export type PartnerPlacement = "home" | "honeymoon";

/**
 * A brand partnership shown as a quiet editorial band. Managed from the
 * admin app later; the public site only ever sees active partners whose
 * date window includes today (enforced in api.ts, like the listing rule).
 */
export interface Partner {
  id: string;
  /** Brand name; also the logo's accessible name. */
  name: string;
  /** Brand logo. Optional: without one the name renders as a wordmark. */
  logo?: Photo;
  /** The band's one large photograph. */
  image: Photo;
  /** One large line, e.g. the campaign line. */
  headline: string;
  /** One short supporting line. */
  line: string;
  /** Outbound link; the band is unlinked without it. */
  href?: string;
  placement: PartnerPlacement;
  /** ISO dates; open-ended when absent. */
  startDate?: string;
  endDate?: string;
  active: boolean;
}
