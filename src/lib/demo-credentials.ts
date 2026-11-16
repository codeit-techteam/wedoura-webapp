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
import type { VendorAccount, VendorListing } from "@/data/types";
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
