/**
 * Registry of public profile sections for vendor and venue pages.
 * Sticky nav, section order and empty-hiding read from here — not hard-coded
 * in the profile components. tests/profile-sections.test.ts fails when a
 * public field has no dashboard editor.
 */
import type { CategorySlug, Film, VendorDetail } from "@/data/types";
import { resolveTour } from "@/lib/tour";

export type ProfileSurface = "vendor" | "venue";

/** Which listings show the section. */
export type ProfileCategoryScope = "all" | "venues" | "non-venues";

export type ProfileFieldStatus = "OK" | "READ-ONLY" | "DERIVED";

export type ProfileField = {
  /** Short label for docs and tests. */
  label: string;
  /** VendorListing / VendorDetail path (dotted). */
  path: string;
  /** Dashboard screen that edits it, or an explicit non-editor note. */
  dashboard: string;
  status: ProfileFieldStatus;
};

export type ProfileSectionDef = {
  id: string;
  /** Couple-facing heading / subnav label. */
  publicHeading: string;
  /** DOM id used by sticky nav (`#anchor`). */
  anchorId: string;
  fields: ProfileField[];
  /** Primary dashboard screen for this section. */
  dashboardScreen: string;
  surfaces: ProfileSurface[];
  categories: ProfileCategoryScope;
  /** Hidden when this returns false. */
  visible: (vendor: VendorDetail) => boolean;
};

export type ProfileSubnavItem = { id: string; label: string };

function filmPlayable(film: Film): boolean {
  return Boolean(film.youtubeUrl || film.previewSrc || film.fullSrc);
}

function scopeMatches(scope: ProfileCategoryScope, category: CategorySlug, hasVenue: boolean): boolean {
  if (scope === "all") return true;
  if (scope === "venues") return hasVenue || category === "venues";
  return !hasVenue && category !== "venues";
}

/** Vendor profile sections in display order (inquire always last when present). */
export const VENDOR_PROFILE_SECTIONS: ProfileSectionDef[] = [
  {
    id: "inside",
    publicHeading: "Stories",
    anchorId: "inside",
    dashboardScreen: "/vendor-studio/media#albums",
    surfaces: ["vendor"],
    categories: "all",
    visible: (v) => v.albums.length > 0,
    fields: [
      { label: "Album cover", path: "albums[].photos[0]", dashboard: "/vendor-studio/media", status: "OK" },
      { label: "Album title", path: "albums[].title", dashboard: "/vendor-studio/media", status: "OK" },
      { label: "Album location", path: "albums[].location", dashboard: "/vendor-studio/media", status: "OK" },
    ],
  },
  {
    id: "portfolio",
    publicHeading: "Portfolio",
    anchorId: "portfolio",
    dashboardScreen: "/vendor-studio/media",
    surfaces: ["vendor"],
    categories: "all",
    visible: (v) => v.portfolio.length > 0,
    fields: [
      { label: "Portfolio photos", path: "portfolio", dashboard: "/vendor-studio/media", status: "OK" },
      { label: "Photo caption / alt", path: "portfolio[].alt", dashboard: "/vendor-studio/media", status: "OK" },
      { label: "Photo order", path: "portfolio", dashboard: "/vendor-studio/media", status: "OK" },
      { label: "360 flag", path: "portfolio[].projection", dashboard: "/vendor-studio/media", status: "OK" },
      { label: "Card highlights", path: "cardPhotos", dashboard: "/vendor-studio/media", status: "OK" },
      { label: "Cover photo", path: "cover", dashboard: "/vendor-studio/media", status: "OK" },
    ],
  },
  {
    id: "venue-summary",
    publicHeading: "The venue",
    anchorId: "venue",
    dashboardScreen: "/vendor-studio/profile#venue",
    surfaces: ["vendor"],
    categories: "venues",
    visible: (v) => Boolean(v.venue),
    fields: [
      { label: "Capacity", path: "venue.capacity", dashboard: "/vendor-studio/profile#venue", status: "OK" },
      { label: "Space names", path: "venue.spaces", dashboard: "/vendor-studio/profile#venue", status: "OK" },
      { label: "360 tour", path: "venue.tour", dashboard: "/vendor-studio/profile#venue", status: "OK" },
    ],
  },
  {
    id: "albums",
    publicHeading: "Albums",
    anchorId: "albums",
    dashboardScreen: "/vendor-studio/media#albums",
    surfaces: ["vendor"],
    categories: "all",
    visible: (v) => v.albums.length > 0,
    fields: [
      { label: "Title", path: "albums[].title", dashboard: "/vendor-studio/media", status: "OK" },
      { label: "Location", path: "albums[].location", dashboard: "/vendor-studio/media", status: "OK" },
      { label: "Date", path: "albums[].date", dashboard: "/vendor-studio/media", status: "OK" },
      { label: "Excerpt", path: "albums[].excerpt", dashboard: "/vendor-studio/media", status: "OK" },
      { label: "Photos in order", path: "albums[].photos", dashboard: "/vendor-studio/media", status: "OK" },
    ],
  },
  {
    id: "kind-words",
    publicHeading: "Kind words",
    anchorId: "kind-words",
    dashboardScreen: "/vendor-studio/profile#kind",
    surfaces: ["vendor", "venue"],
    categories: "all",
    visible: (v) => Boolean(v.testimonials?.length || v.press?.length),
    fields: [
      { label: "Quote", path: "testimonials[].quote", dashboard: "/vendor-studio/profile#kind", status: "OK" },
      { label: "Couple names", path: "testimonials[].couple", dashboard: "/vendor-studio/profile#kind", status: "OK" },
      { label: "Place", path: "testimonials[].location", dashboard: "/vendor-studio/profile#kind", status: "OK" },
      { label: "Press names", path: "press", dashboard: "/vendor-studio/profile#basics", status: "OK" },
    ],
  },
  {
    id: "about",
    publicHeading: "About",
    anchorId: "about",
    dashboardScreen: "/vendor-studio/profile#about",
    surfaces: ["vendor"],
    categories: "all",
    visible: (v) => v.about.length > 0,
    fields: [
      { label: "About paragraphs", path: "about", dashboard: "/vendor-studio/profile#about", status: "OK" },
      { label: "About photo", path: "aboutPhoto", dashboard: "/vendor-studio/media", status: "OK" },
      { label: "Services chips", path: "services", dashboard: "/vendor-studio/profile#category", status: "OK" },
      { label: "Style chips", path: "styles", dashboard: "/vendor-studio/profile#category", status: "OK" },
    ],
  },
  {
    id: "voices",
    publicHeading: "Voices",
    anchorId: "voices",
    dashboardScreen: "/vendor-studio/profile#interview",
    surfaces: ["vendor"],
    categories: "all",
    visible: (v) => Boolean(v.interview),
    fields: [
      { label: "Interview title", path: "interview.title", dashboard: "/vendor-studio/profile#interview", status: "OK" },
      { label: "Byline", path: "interview.by", dashboard: "/vendor-studio/profile#interview", status: "OK" },
      { label: "Lede", path: "interview.lede", dashboard: "/vendor-studio/profile#interview", status: "OK" },
      { label: "Paragraphs", path: "interview.paragraphs", dashboard: "/vendor-studio/profile#interview", status: "OK" },
      { label: "Questions and answers", path: "interview.questions", dashboard: "/vendor-studio/profile#interview", status: "OK" },
      { label: "Video link", path: "interview.youtubeUrl", dashboard: "/vendor-studio/profile#interview", status: "OK" },
      { label: "Duration label", path: "interview.durationLabel", dashboard: "/vendor-studio/profile#interview", status: "OK" },
    ],
  },
  {
    id: "founder",
    publicHeading: "Founder",
    anchorId: "founder",
    dashboardScreen: "/vendor-studio/profile#founder",
    surfaces: ["vendor"],
    categories: "all",
    visible: (v) => Boolean(v.founder),
    fields: [
      { label: "Caption", path: "founder.caption", dashboard: "/vendor-studio/profile#founder", status: "OK" },
      { label: "Name", path: "founder.name", dashboard: "/vendor-studio/profile#founder", status: "OK" },
      { label: "About", path: "founder.about", dashboard: "/vendor-studio/profile#founder", status: "OK" },
      { label: "Video link", path: "founder.youtubeUrl", dashboard: "/vendor-studio/profile#founder", status: "OK" },
      { label: "Poster", path: "founder.poster", dashboard: "/vendor-studio/profile#founder", status: "OK" },
    ],
  },
  {
    id: "pricing",
    publicHeading: "Pricing",
    anchorId: "pricing",
    dashboardScreen: "/vendor-studio/profile#pricing",
    surfaces: ["vendor"],
    categories: "all",
    visible: (v) => v.packages.length > 0,
    fields: [
      { label: "Collection name", path: "packages[].label", dashboard: "/vendor-studio/profile#pricing", status: "OK" },
      { label: "Price", path: "packages[].priceINR", dashboard: "/vendor-studio/profile#pricing", status: "OK" },
      { label: "Unit", path: "packages[].unit", dashboard: "/vendor-studio/profile#pricing", status: "OK" },
      { label: "Note", path: "packages[].note", dashboard: "/vendor-studio/profile#pricing", status: "OK" },
      { label: "Inclusions", path: "packages[].inclusions", dashboard: "/vendor-studio/profile#pricing", status: "OK" },
      { label: "Featured", path: "packages[].featured", dashboard: "/vendor-studio/profile#pricing", status: "OK" },
      { label: "Starting price", path: "startingPriceINR", dashboard: "/vendor-studio/profile#pricing", status: "OK" },
      { label: "Price unit", path: "priceUnit", dashboard: "/vendor-studio/profile#pricing", status: "OK" },
    ],
  },
  {
    id: "films",
    publicHeading: "Films",
    anchorId: "films",
    dashboardScreen: "/vendor-studio/media#films",
    surfaces: ["vendor"],
    categories: "all",
    visible: (v) => v.films.some(filmPlayable),
    fields: [
      { label: "Title", path: "films[].title", dashboard: "/vendor-studio/media", status: "OK" },
      { label: "Link", path: "films[].youtubeUrl", dashboard: "/vendor-studio/media", status: "OK" },
      { label: "Poster", path: "films[].poster", dashboard: "/vendor-studio/media", status: "OK" },
    ],
  },
  {
    id: "faq",
    publicHeading: "FAQ",
    anchorId: "faq",
    dashboardScreen: "/vendor-studio/profile#faqs",
    surfaces: ["vendor"],
    categories: "all",
    visible: (v) => v.faqs.length > 0,
    fields: [
      { label: "Question", path: "faqs[].question", dashboard: "/vendor-studio/profile#faqs", status: "OK" },
      { label: "Answer", path: "faqs[].answer", dashboard: "/vendor-studio/profile#faqs", status: "OK" },
    ],
  },
  {
    id: "inquire",
    publicHeading: "Inquire",
    anchorId: "inquire",
    dashboardScreen: "/vendor-studio/profile#contact",
    surfaces: ["vendor"],
    categories: "all",
    visible: () => true,
    fields: [
      { label: "WhatsApp", path: "contact.whatsapp", dashboard: "/vendor-studio/profile#contact", status: "OK" },
      { label: "Enquiry email", path: "contact.email", dashboard: "/vendor-studio/profile#contact", status: "OK" },
      { label: "Instagram", path: "contact.instagram", dashboard: "/vendor-studio/profile#contact", status: "OK" },
      { label: "Website", path: "contact.website", dashboard: "/vendor-studio/profile#contact", status: "OK" },
      {
        label: "Phone",
        path: "contact.phone",
        dashboard: "Not public (stripped by listingToDetail)",
        status: "READ-ONLY",
      },
      { label: "Starting price (sticky bar)", path: "startingPriceINR", dashboard: "/vendor-studio/profile#pricing", status: "OK" },
      { label: "WhatsApp (sticky bar)", path: "contact.whatsapp", dashboard: "/vendor-studio/profile#contact", status: "OK" },
    ],
  },
];

/** Venue profile sections in display order. */
export const VENUE_PROFILE_SECTIONS: ProfileSectionDef[] = [
  {
    id: "overview",
    publicHeading: "Overview",
    anchorId: "overview",
    dashboardScreen: "/vendor-studio/profile#about",
    surfaces: ["venue"],
    categories: "venues",
    visible: (v) => v.about.length > 0 || Boolean(v.venue?.overviewFacts?.length),
    fields: [
      { label: "About paragraphs", path: "about", dashboard: "/vendor-studio/profile#about", status: "OK" },
      { label: "Overview facts", path: "venue.overviewFacts", dashboard: "/vendor-studio/profile#venue", status: "OK" },
    ],
  },
  {
    id: "spaces",
    publicHeading: "Spaces",
    anchorId: "spaces",
    dashboardScreen: "/vendor-studio/profile#venue",
    surfaces: ["venue"],
    categories: "venues",
    visible: (v) => Boolean(v.venue?.spaceDetails?.length),
    fields: [
      { label: "Space details", path: "venue.spaceDetails", dashboard: "/vendor-studio/profile#venue", status: "OK" },
      { label: "Space photo", path: "venue.spaceDetails[].photoId", dashboard: "/vendor-studio/profile#venue", status: "OK" },
      { label: "Space scene", path: "venue.spaceDetails[].sceneId", dashboard: "/vendor-studio/profile#venue", status: "OK" },
    ],
  },
  {
    id: "tour",
    publicHeading: "360° tour",
    anchorId: "tour",
    dashboardScreen: "/vendor-studio/profile#venue",
    surfaces: ["venue"],
    categories: "venues",
    visible: (v) => Boolean(resolveTour(v.venue?.tour, v.portfolio)?.scenes.length),
    fields: [
      { label: "Tour scenes", path: "venue.tour.scenes", dashboard: "/vendor-studio/profile#venue", status: "OK" },
      { label: "Tour links", path: "venue.tour.links", dashboard: "/vendor-studio/profile#venue", status: "OK" },
      { label: "Tour markers", path: "venue.tour.markers", dashboard: "/vendor-studio/profile#venue", status: "OK" },
    ],
  },
  {
    id: "capacity",
    publicHeading: "Capacity",
    anchorId: "capacity",
    dashboardScreen: "/vendor-studio/profile#venue",
    surfaces: ["venue"],
    categories: "venues",
    visible: (v) => Boolean(v.venue?.spaceDetails?.length),
    fields: [
      { label: "Capacity range", path: "venue.capacity", dashboard: "/vendor-studio/profile#venue", status: "OK" },
      { label: "Capacity note", path: "venue.capacityNote", dashboard: "/vendor-studio/profile#venue", status: "OK" },
      { label: "Space capacities", path: "venue.spaceDetails", dashboard: "/vendor-studio/profile#venue", status: "OK" },
    ],
  },
  {
    id: "stay",
    publicHeading: "Stay",
    anchorId: "stay",
    dashboardScreen: "/vendor-studio/profile#venue",
    surfaces: ["venue"],
    categories: "venues",
    visible: (v) => Boolean(v.venue?.roomTiers?.length),
    fields: [{ label: "Room tiers", path: "venue.roomTiers", dashboard: "/vendor-studio/profile#venue", status: "OK" }],
  },
  {
    id: "rules",
    publicHeading: "Food & rules",
    anchorId: "rules",
    dashboardScreen: "/vendor-studio/profile#venue",
    surfaces: ["venue"],
    categories: "venues",
    visible: (v) => Boolean(v.venue?.rules?.items?.length),
    fields: [{ label: "Rules", path: "venue.rules.items", dashboard: "/vendor-studio/profile#venue", status: "OK" }],
  },
  {
    id: "pricing",
    publicHeading: "Prices",
    anchorId: "pricing",
    dashboardScreen: "/vendor-studio/profile#pricing",
    surfaces: ["venue"],
    categories: "venues",
    visible: (v) =>
      v.packages.length > 0 ||
      Boolean(v.venue?.estimate && v.venue.food?.menus?.some((m) => m.pricePerGuestINR != null)),
    fields: [
      { label: "Packages", path: "packages", dashboard: "/vendor-studio/profile#pricing", status: "OK" },
      { label: "Menus", path: "venue.food.menus", dashboard: "/vendor-studio/profile#venue", status: "OK" },
      { label: "Estimate inputs", path: "venue.estimate", dashboard: "/vendor-studio/profile#venue", status: "OK" },
      { label: "Peak months", path: "venue.peakMonths", dashboard: "/vendor-studio/profile#venue", status: "OK" },
      { label: "Value months", path: "venue.valueMonths", dashboard: "/vendor-studio/profile#venue", status: "OK" },
      { label: "Closed months", path: "venue.closedMonths", dashboard: "/vendor-studio/profile#venue", status: "OK" },
    ],
  },
  {
    id: "gallery",
    publicHeading: "Gallery",
    anchorId: "gallery",
    dashboardScreen: "/vendor-studio/media",
    surfaces: ["venue"],
    categories: "venues",
    visible: (v) => v.portfolio.length > 0,
    fields: [{ label: "Portfolio", path: "portfolio", dashboard: "/vendor-studio/media", status: "OK" }],
  },
  {
    id: "kind-words",
    publicHeading: "Kind words",
    anchorId: "kind-words",
    dashboardScreen: "/vendor-studio/profile#kind",
    surfaces: ["venue"],
    categories: "venues",
    visible: (v) => Boolean(v.testimonials?.length || v.press?.length),
    fields: [
      { label: "Testimonials", path: "testimonials", dashboard: "/vendor-studio/profile#kind", status: "OK" },
      { label: "Press", path: "press", dashboard: "/vendor-studio/profile#basics", status: "OK" },
    ],
  },
  {
    id: "reach",
    publicHeading: "Getting there",
    anchorId: "reach",
    dashboardScreen: "/vendor-studio/profile#venue",
    surfaces: ["venue"],
    categories: "venues",
    visible: (v) => Boolean(v.venue?.location?.distances?.length || v.venue?.location?.address),
    fields: [
      { label: "Address", path: "venue.location.address", dashboard: "/vendor-studio/profile#venue", status: "OK" },
      { label: "Map link", path: "venue.location.mapUrl", dashboard: "/vendor-studio/profile#venue", status: "OK" },
      { label: "Distances", path: "venue.location.distances", dashboard: "/vendor-studio/profile#venue", status: "OK" },
    ],
  },
  {
    id: "enquire",
    publicHeading: "Enquire",
    anchorId: "enquire",
    dashboardScreen: "/vendor-studio/profile#contact",
    surfaces: ["venue"],
    categories: "venues",
    visible: () => true,
    fields: [
      { label: "WhatsApp", path: "contact.whatsapp", dashboard: "/vendor-studio/profile#contact", status: "OK" },
      { label: "Starting price", path: "startingPriceINR", dashboard: "/vendor-studio/profile#pricing", status: "OK" },
    ],
  },
];

/** Header / at-a-glance fields shared by both surfaces (not separate nav sections). */
export const PROFILE_CHROME_FIELDS: ProfileField[] = [
  { label: "Business name", path: "name", dashboard: "/vendor-studio/profile#basics", status: "OK" },
  { label: "Category", path: "category", dashboard: "/vendor-studio/profile#category", status: "OK" },
  { label: "Category display name", path: "categoryName", dashboard: "Derived from Category list", status: "DERIVED" },
  { label: "Base city", path: "baseCity", dashboard: "/vendor-studio/profile#locations", status: "OK" },
  { label: "City display name", path: "cityName", dashboard: "Derived from City list", status: "DERIVED" },
  { label: "Service-area / travels", path: "travels", dashboard: "/vendor-studio/profile#locations", status: "OK" },
  { label: "Cities served", path: "citiesServed", dashboard: "/vendor-studio/profile#locations", status: "OK" },
  { label: "Tagline", path: "tagline", dashboard: "/vendor-studio/profile#basics", status: "OK" },
  { label: "Avatar / logo", path: "avatar", dashboard: "/vendor-studio/media", status: "OK" },
  { label: "Cover photo", path: "cover", dashboard: "/vendor-studio/media", status: "OK" },
  { label: "Years active", path: "yearsActive", dashboard: "/vendor-studio/profile#basics", status: "OK" },
  { label: "Team", path: "team", dashboard: "/vendor-studio/profile#basics", status: "OK" },
  { label: "Starting price", path: "startingPriceINR", dashboard: "/vendor-studio/profile#pricing", status: "OK" },
  { label: "Category-specific facts", path: "categoryValues", dashboard: "/vendor-studio/profile#category", status: "OK" },
  { label: "Verified badge", path: "verified", dashboard: "Admin only (/demo)", status: "READ-ONLY" },
  { label: "Listing status", path: "status", dashboard: "Admin / submit flow", status: "READ-ONLY" },
];

const ALL_SECTIONS = [...VENDOR_PROFILE_SECTIONS, ...VENUE_PROFILE_SECTIONS];

/** Sections for one surface that apply to this listing and have content. */
export function visibleProfileSections(
  surface: ProfileSurface,
  vendor: VendorDetail,
): ProfileSectionDef[] {
  const list = surface === "venue" ? VENUE_PROFILE_SECTIONS : VENDOR_PROFILE_SECTIONS;
  const hasVenue = Boolean(vendor.venue);
  return list.filter(
    (section) =>
      section.surfaces.includes(surface) &&
      scopeMatches(section.categories, vendor.category, hasVenue) &&
      section.visible(vendor),
  );
}

/** Sticky subnav items from the registry. */
export function profileSubnav(surface: ProfileSurface, vendor: VendorDetail): ProfileSubnavItem[] {
  return visibleProfileSections(surface, vendor).map((section) => ({
    id: section.anchorId,
    label: section.publicHeading,
  }));
}

/** Every editable field path that must have a real dashboard screen. */
export function editableProfileFields(): ProfileField[] {
  const fields = [...PROFILE_CHROME_FIELDS, ...ALL_SECTIONS.flatMap((s) => s.fields)];
  return fields.filter((f) => f.status === "OK");
}
