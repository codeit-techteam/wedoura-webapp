"use client";

/**
 * ------------------------------------------------------------------
 * DEMO ONLY — DELETE THIS FILE WHEN THE BACKEND IS CONNECTED.
 * ------------------------------------------------------------------
 * A walk-in demo login that always works: vendor@gmail.com / 123456.
 * Logging in with it seeds an approved account with a partly filled
 * draft listing, so the studio shows a realistic mid-setup state.
 * src/lib/vendor-api.ts special-cases these credentials in login().
 */
import { photos } from "@/data/photos";
import type { Inquiry, VendorAccount, VendorListing } from "@/data/types";
import { emptyListing } from "@/lib/mock-store";

export const DEMO_EMAIL = "vendor@gmail.com";
export const DEMO_PASSWORD = "123456";
export const DEMO_ACCOUNT_ID = "acc-demo";
export const DEMO_LISTING_ID = "lst-demo";

export function demoAccount(): VendorAccount {
  return {
    id: DEMO_ACCOUNT_ID,
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    contactName: "Demo Vendor",
    whatsapp: "+910000000000",
    status: "approved",
    listingId: DEMO_LISTING_ID,
    createdAt: new Date().toISOString(),
  };
}

/** Partly filled on purpose: photos and a package exist, about/albums/FAQs
 *  do not, so the studio checklist shows real gaps. */
export function demoListing(): VendorListing {
  return {
    ...emptyListing({
      id: DEMO_LISTING_ID,
      accountId: DEMO_ACCOUNT_ID,
      status: "draft",
      name: "Demo Studio",
      slug: "demo-studio",
      category: "photography-films",
      baseCity: "mumbai",
    }),
    tagline: "Weddings, photographed quietly",
    services: ["Wedding photography"],
    categoryValues: { coverage: "Photography" },
    citiesServed: ["mumbai"],
    startingPriceINR: 90000,
    priceUnit: "per_event",
    cover: photos.p13,
    cardPhotos: [photos.p13, photos.p38, photos.p07],
    portfolio: [photos.p13, photos.p38, photos.p07, photos.p12],
    packages: [{ label: "One day, photography", priceINR: 90000, unit: "per_event" }],
    contact: { whatsapp: "+910000000000", email: DEMO_EMAIL },
  };
}

/** Sample inquiries so the portal's inquiries screen has content. */
export function demoInquiries(): Inquiry[] {
  const day = 24 * 60 * 60 * 1000;
  return [
    {
      id: "inq-demo-1",
      listingId: DEMO_LISTING_ID,
      name: "Ananya",
      partner: "Dev",
      whatsapp: "+919876543210",
      date: "2026-12-12",
      city: "Mumbai",
      message: "We are planning two days in December, mostly outdoors. Are you free around the 12th?",
      status: "new",
      createdAt: new Date(Date.now() - 2 * day).toISOString(),
    },
    {
      id: "inq-demo-2",
      listingId: DEMO_LISTING_ID,
      name: "Sana",
      whatsapp: "+919876500000",
      city: "Pune",
      message: "What does your one-day package cover, and do you travel to Pune?",
      status: "replied",
      createdAt: new Date(Date.now() - 6 * day).toISOString(),
    },
    {
      id: "inq-demo-3",
      listingId: DEMO_LISTING_ID,
      name: "Rhea",
      whatsapp: "+919876511111",
      date: "2026-02-02",
      city: "Mumbai",
      message: "Looking for a small registry shoot, about twenty guests.",
      status: "closed",
      createdAt: new Date(Date.now() - 20 * day).toISOString(),
    },
  ];
}
