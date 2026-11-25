/**
 * Demo logins. Deletable when the real backend arrives.
 * Logging in with vendor@gmail.com seeds an approved account that OWNS the
 * published sample listing (Aperture & Marigold), so the studio and public
 * profile stay in sync for demos.
 */
import type { Inquiry, VendorAccount, VendorDocument, VendorListing } from "@/data/types";
import { sampleListings } from "@/data/vendors";

export const DEMO_EMAIL = "vendor@gmail.com";
export const DEMO_PASSWORD = "123456";
export const DEMO_ACCOUNT_ID = "acct-demo-vendor";
export const DEMO_LISTING_ID = "lst-01";
export const DEMO_DOCUMENT_ID = "doc-demo-vendor";

export const COUPLE_DEMO_EMAIL = "couple@gmail.com";
export const COUPLE_DEMO_PASSWORD = "123456";

/** Slim account for the demo vendor. */
export function demoAccount(): VendorAccount {
  return {
    id: DEMO_ACCOUNT_ID,
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    contactName: "Demo Vendor",
    whatsapp: "+919876543210",
    status: "approved",
    listingId: DEMO_LISTING_ID,
    documentId: DEMO_DOCUMENT_ID,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

/**
 * Approved sample identity document. The PNG blob (clearly marked SAMPLE)
 * is written into IndexedDB on first demo login — never a real ID image.
 */
export function demoDocument(fileUrl: string): VendorDocument {
  return {
    id: DEMO_DOCUMENT_ID,
    vendorId: DEMO_ACCOUNT_ID,
    type: "pan",
    files: [
      {
        name: "sample-id.png",
        mimeType: "image/png",
        size: 0,
        url: fileUrl,
        side: "front",
      },
    ],
    status: "approved",
    consentAt: "2026-01-01T00:00:00.000Z",
    submittedAt: "2026-01-01T00:00:00.000Z",
    reviewedAt: "2026-01-02T00:00:00.000Z",
  };
}

/** The sample listing the demo account owns (first published photography listing). */
export function demoListing(): VendorListing {
  const sample = sampleListings.find((l) => l.id === DEMO_LISTING_ID) ?? sampleListings[0];
  const copy = structuredClone(sample);
  return { ...copy, accountId: DEMO_ACCOUNT_ID };
}

/** Sample inquiries so the portal and the demo couple account have content. */
export function demoInquiries(): Inquiry[] {
  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();
  return [
    {
      id: "inq-demo-1",
      listingId: DEMO_LISTING_ID,
      name: "Ananya",
      partner: "Kabir",
      whatsapp: "+919876543210",
      email: "couple@gmail.com",
      date: "2026-12-12",
      city: "Mumbai",
      message: "We are planning two days in December, mostly outdoors. Are you free around the 12th?",
      status: "replied",
      source: "vendor_profile",
      coupleEmail: "couple@gmail.com",
      weddingMonth: "2026-12",
      guests: 120,
      createdAt: new Date(now - 2 * day).toISOString(),
      updatedAt: new Date(now - 1 * day).toISOString(),
    },
    {
      id: "inq-demo-2",
      listingId: DEMO_LISTING_ID,
      name: "Sana",
      whatsapp: "+919876500000",
      city: "Jaipur",
      message: "What does your one-day package cover, and do you travel to Jaipur?",
      status: "replied",
      source: "shortlist",
      createdAt: new Date(now - 6 * day).toISOString(),
      updatedAt: new Date(now - 5 * day).toISOString(),
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
      closeReason: "budget",
      source: "vendor_profile",
      guests: 20,
      createdAt: new Date(now - 20 * day).toISOString(),
      updatedAt: new Date(now - 18 * day).toISOString(),
    },
    {
      id: "inq-demo-5",
      listingId: DEMO_LISTING_ID,
      name: "Meera",
      partner: "Arjun",
      whatsapp: "+919811122233",
      date: "2026-11-28",
      city: "Udaipur",
      message: "Booked us for the Mehendi and the wedding day.",
      status: "booked",
      source: "package_book",
      collection: "Full day",
      createdAt: new Date(now - 14 * day).toISOString(),
      updatedAt: new Date(now - 10 * day).toISOString(),
    },
    {
      id: "inq-demo-6",
      listingId: DEMO_LISTING_ID,
      name: "Ishaan",
      partner: "Diya",
      whatsapp: "+919900011122",
      city: "Bengaluru",
      weddingMonth: "2027-01",
      message: "Checking availability for a January weekend.",
      status: "new",
      source: "vendor_profile",
      guests: 80,
      createdAt: new Date(now - 0.5 * day).toISOString(),
      updatedAt: new Date(now - 0.5 * day).toISOString(),
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
      source: "shortlist",
      coupleEmail: "couple@gmail.com",
      weddingMonth: "2026-12",
      createdAt: new Date(now - 4 * day).toISOString(),
      updatedAt: new Date(now - 4 * day).toISOString(),
    },
  ];
}
