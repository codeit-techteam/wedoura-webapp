/**
 * Builds listings for the mapping tests "through the data functions": every
 * listing starts from emptyListing() in src/lib/mock-store.ts — the same
 * function the real approval flow uses to create a vendor's draft — and is
 * then filled and published exactly as the portal would fill it.
 */
import { emptyListing } from "@/lib/mock-store";
import { photos } from "@/data/photos";
import type { VendorListing } from "@/data/types";

/** Every single VendorListing field filled with distinctive values. */
export function makeFullListing(overrides: Partial<VendorListing> = {}): VendorListing {
  const draft = emptyListing({
    id: "test-full",
    accountId: "test-acc-full",
    status: "draft",
    name: "Test Atelier Nine",
    slug: "test-atelier-nine",
    category: "photography-films",
    baseCity: "udaipur",
  });
  const filled: VendorListing = {
    ...draft,
    // Admin fields the lifecycle sets
    status: "published",
    publishedAt: "2026-03-05",
    featured: true,
    featuredOrder: 1,
    verified: true,
    // Identity
    tagline: "A very distinctive tagline",
    about: ["First about paragraph, quite unique.", "Second about paragraph, also unique."],
    aboutPhoto: photos.p46,
    avatar: photos.p35,
    team: "Two photographers and a dog",
    yearsActive: 11,
    // Categorisation
    services: ["Wedding photography", "Wedding films"],
    styles: ["Editorial", "Candid"],
    categoryValues: { coverage: "Photography + film", secondShooter: true },
    // Where
    citiesServed: ["udaipur", "goa"],
    travels: "Across India and abroad",
    // Price
    startingPriceINR: 175000,
    priceUnit: "per_event",
    // Work
    cover: photos.p13,
    cardPhotos: [photos.p13, photos.p35, photos.p07],
    portfolio: [photos.p13, photos.p35, photos.p07, photos.p01, photos.p38, photos.p04],
    albums: [
      {
        slug: "test-album-one",
        title: "A test album",
        location: "Udaipur",
        date: "2026-01-15",
        photos: [photos.p24, photos.p18],
      },
    ],
    films: [
      {
        id: "test-film-1",
        title: "A test film",
        previewSrc: "/films/test-preview.mp4",
        fullSrc: "/films/test-full.mp4",
        poster: photos.p24,
        durationSec: 240,
      },
    ],
    packages: [
      { label: "One day", priceINR: 175000, unit: "per_event", note: "Two of us" },
      { label: "Full week", unit: "on_request" },
    ],
    faqs: [{ question: "A test question?", answer: "A test answer." }],
    contact: {
      whatsapp: "+911111111111",
      email: "studio@example.com",
      instagram: "https://instagram.com/example",
      website: "https://example.com/test-atelier-nine",
      phone: "+912222222222", // must never appear publicly
    },
  };
  return { ...filled, ...overrides };
}

/** The minimum a listing can carry and still publish. */
export function makeMinimalListing(overrides: Partial<VendorListing> = {}): VendorListing {
  const draft = emptyListing({
    id: "test-min",
    accountId: "test-acc-min",
    status: "published",
    name: "Bare Minimum Studio",
    slug: "bare-minimum-studio",
    category: "decor-styling",
    baseCity: "jaipur",
  });
  return {
    ...draft,
    publishedAt: "2026-02-01",
    tagline: "Just enough to publish",
    about: ["One paragraph only."],
    services: ["Mandap design"],
    citiesServed: ["jaipur"],
    cardPhotos: [photos.p28, photos.p05, photos.p09],
    cover: photos.p28,
    portfolio: [photos.p28, photos.p05, photos.p09, photos.p31],
    contact: { whatsapp: "+911111111111" },
    ...overrides,
  };
}

/** A full venue listing (category venues, with VenueDetails). */
export function makeVenueListing(overrides: Partial<VendorListing> = {}): VendorListing {
  return makeFullListing({
    id: "test-venue",
    accountId: "test-acc-venue",
    name: "Test Palace Gardens",
    slug: "test-palace-gardens",
    category: "venues",
    categoryValues: { venueType: "Heritage palace", roomsOnSite: 42 },
    priceUnit: "per_day",
    startingPriceINR: 400000,
    portfolio: [photos.p13, photos.p35, photos.p07, photos.p01, photos.pano01, photos.pano02],
    venue: {
      capacity: { min: 80, max: 600 },
      spaces: ["The courtyard", "The lawn"],
      spaceDetails: [
        {
          name: "The courtyard",
          kind: "Covered · heritage",
          ceremony: 120,
          dinner: 90,
          standing: 150,
          areaSqFt: 3200,
          photoId: photos.p13.id,
          sceneId: "courtyard",
        },
        {
          name: "The lawn",
          kind: "Outdoor · lawn",
          ceremony: 400,
          dinner: 350,
          standing: 600,
          areaSqFt: 12000,
          photoId: photos.p35.id,
          sceneId: "lawn",
        },
      ],
      rooms: { count: 42, types: "Palace rooms", rateFromINR: 12000 },
      overviewFacts: [
        { label: "Type", value: "Heritage palace" },
        { label: "Guests", value: "80 to 600 guests" },
        { label: "Stay", value: "42 rooms on site" },
      ],
      tour: {
        scenes: [
          { id: "courtyard", photoId: photos.pano01.id, name: "The courtyard", startYaw: 40 },
          { id: "lawn", photoId: photos.pano02.id, name: "The lawn" },
        ],
        links: [
          { from: "courtyard", to: "lawn", yaw: 120 },
          { from: "lawn", to: "courtyard", yaw: 300 },
        ],
        markers: [{ scene: "courtyard", yaw: 200, pitch: -10, label: "Mandap spot" }],
      },
    },
    ...overrides,
  });
}
