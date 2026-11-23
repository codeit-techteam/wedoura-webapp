"use client";

/**
 * ------------------------------------------------------------------
 * DEMO ONLY — DELETE THIS FILE WHEN THE BACKEND IS CONNECTED.
 * ------------------------------------------------------------------
 * A walk-in demo login that always works: vendor@gmail.com / 123456.
 * Logging in with it seeds an approved account that OWNS the published
 * "Aperture & Marigold" sample listing (lst-01), fully filled in, so the
 * studio opens on a real, live profile instead of an empty draft.
 * src/lib/vendor-api.ts special-cases these credentials in login().
 */
import type { Inquiry, VendorAccount, VendorListing } from "@/data/types";
import { sampleListings } from "@/data/vendors";

export const DEMO_EMAIL = "vendor@gmail.com";
export const DEMO_PASSWORD = "123456";
export const DEMO_ACCOUNT_ID = "acc-demo";
/** The demo vendor owns the first sample listing: Aperture & Marigold. */
export const DEMO_LISTING_ID = "lst-01";

export function demoAccount(): VendorAccount {
  return {
    id: DEMO_ACCOUNT_ID,
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    contactName: "Aperture & Marigold",
    whatsapp: "+910000000000",
    status: "approved",
    listingId: DEMO_LISTING_ID,
    createdAt: new Date().toISOString(),
  };
}

/** The full Aperture & Marigold listing, reassigned to the demo account.
 *  A deep copy, so studio edits never mutate the static sample data. */
export function demoListing(): VendorListing {
  const source = sampleListings.find((l) => l.id === DEMO_LISTING_ID) ?? sampleListings[0];
  const copy = JSON.parse(JSON.stringify(source)) as VendorListing;
  return { ...copy, accountId: DEMO_ACCOUNT_ID };
}

/** Sample inquiries so the portal and the demo couple account have content. */
export function demoInquiries(): Inquiry[] {
  const day = 24 * 60 * 60 * 1000;
  return [
    {
      id: "inq-demo-1",
      listingId: DEMO_LISTING_ID,
      name: "Ananya",
      partner: "Kabir",
      whatsapp: "+919876543210",
      date: "2026-12-12",
      city: "Mumbai",
      message: "We are planning two days in December, mostly outdoors. Are you free around the 12th?",
      status: "replied",
      stage: "quote_sent",
      quoteINR: 185000,
      coupleEmail: "couple@gmail.com",
      weddingMonth: "2026-12",
      createdAt: new Date(Date.now() - 2 * day).toISOString(),
    },
    {
      id: "inq-demo-2",
      listingId: DEMO_LISTING_ID,
      name: "Sana",
      whatsapp: "+919876500000",
      city: "Jaipur",
      message: "What does your one-day package cover, and do you travel to Jaipur?",
      status: "replied",
      stage: "contacted",
      createdAt: new Date(Date.now() - 6 * day).toISOString(),
    },
    {
      id: "inq-demo-3",
      listingId: DEMO_LISTING_ID,
      name: "Rhea",
      whatsapp: "+919876511111",
      date: "2026-02-02",
      city: "Goa",
      message: "Looking for a small registry shoot, about twenty guests.",
      status: "closed",
      stage: "lost",
      createdAt: new Date(Date.now() - 20 * day).toISOString(),
    },
    {
      id: "inq-demo-4",
      listingId: "lst-02",
      name: "Ananya",
      partner: "Kabir",
      whatsapp: "+919876543210",
      city: "Mumbai",
      message: "Would love a quote for florals for a December wedding in Mumbai.",
      status: "new",
      stage: "new",
      coupleEmail: "couple@gmail.com",
      weddingMonth: "2026-12",
      createdAt: new Date(Date.now() - 4 * day).toISOString(),
    },
  ];
}
