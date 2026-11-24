/**
 * Second-level Profile screens in the vendor dashboard.
 * Paths must stay aligned with profile-sections.ts dashboard fields.
 */
import type { VendorListing } from "@/data/types";

export type ProfileNavId =
  | "business"
  | "contact"
  | "about"
  | "pricing"
  | "faqs"
  | "kind-words"
  | "interview"
  | "venue";

export type ProfileNavItem = {
  id: ProfileNavId;
  href: string;
  label: string;
  help: string;
  /** Public profile anchor for "See on profile". */
  publicAnchor: string;
  /** Whether this sub-page applies to the listing. */
  show: (listing: VendorListing) => boolean;
  /** Whether the matching public section currently has content. */
  visibleOnProfile: (listing: VendorListing) => boolean;
};

export const PROFILE_NAV: ProfileNavItem[] = [
  {
    id: "business",
    href: "/vendor-studio/profile/business",
    label: "Business details",
    help: "Name, tagline, at-a-glance facts, category fields and locations.",
    publicAnchor: "",
    show: () => true,
    visibleOnProfile: (l) => Boolean(l.name.trim() && l.tagline.trim()),
  },
  {
    id: "contact",
    href: "/vendor-studio/profile/contact",
    label: "Contact",
    help: "WhatsApp, enquiry email, Instagram and website.",
    publicAnchor: "inquire",
    show: () => true,
    visibleOnProfile: (l) => Boolean(l.contact.whatsapp),
  },
  {
    id: "about",
    href: "/vendor-studio/profile/about",
    label: "About and founder",
    help: "Studio story and the founder band.",
    publicAnchor: "about",
    show: () => true,
    visibleOnProfile: (l) => l.about.length > 0 || Boolean(l.founder),
  },
  {
    id: "pricing",
    href: "/vendor-studio/profile/pricing",
    label: "Pricing",
    help: "Starting price and collections couples can book from.",
    publicAnchor: "pricing",
    show: () => true,
    visibleOnProfile: (l) => l.packages.length > 0 || l.startingPriceINR != null,
  },
  {
    id: "faqs",
    href: "/vendor-studio/profile/faqs",
    label: "FAQs",
    help: "Questions couples ask before they write.",
    publicAnchor: "faq",
    show: () => true,
    visibleOnProfile: (l) => l.faqs.length > 0,
  },
  {
    id: "kind-words",
    href: "/vendor-studio/profile/kind-words",
    label: "Kind words and press",
    help: "Testimonials and publication names.",
    publicAnchor: "kind-words",
    show: () => true,
    visibleOnProfile: (l) => Boolean(l.testimonials?.length || l.press?.length),
  },
  {
    id: "interview",
    href: "/vendor-studio/profile/interview",
    label: "Interview",
    help: "Voices section. Edits go live after approval when you are published.",
    publicAnchor: "voices",
    show: () => true,
    visibleOnProfile: (l) => Boolean(l.interview || l.pendingInterview),
  },
  {
    id: "venue",
    href: "/vendor-studio/profile/venue",
    label: "Venue details",
    help: "Spaces, stay, food, rules, seasons, location and 360° tour.",
    publicAnchor: "spaces",
    show: (l) => l.category === "venues",
    visibleOnProfile: (l) => Boolean(l.venue?.spaceDetails?.length || l.venue?.spaces?.length),
  },
];

export function profileNavFor(listing: VendorListing): ProfileNavItem[] {
  return PROFILE_NAV.filter((item) => item.show(listing));
}

/** Public profile URL for a listing section. */
export function publicProfileHref(listing: VendorListing, anchor?: string): string {
  const base =
    listing.venue || listing.category === "venues"
      ? `/venues/${listing.slug}`
      : `/vendors/${listing.slug}`;
  if (!anchor) return base;
  // Venue enquire vs vendor inquire
  if (anchor === "inquire" && (listing.venue || listing.category === "venues")) {
    return `${base}#enquire`;
  }
  return `${base}#${anchor}`;
}
