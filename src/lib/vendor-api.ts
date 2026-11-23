"use client";

/**
 * Vendor-side functions: the authenticated half of the contract
 * (docs/api-contract.md). Every function is async and returns plain data,
 * so swapping the mock store for fetch calls changes only this file.
 * Admin (demo*) functions stand in for the separate admin app at /demo.
 */
import {
  DEMO_EMAIL,
  DEMO_LISTING_ID,
  DEMO_PASSWORD,
  demoAccount,
  demoInquiries,
  demoListing,
} from "@/lib/demo-credentials";
import { listingMediaIds } from "@/lib/listing-view";
import { emptyListing, readDb, resetDb, useHydrated, useMockDb, writeDb, type MockDb } from "@/lib/mock-store";
import type {
  CategorySlug,
  Inquiry,
  InquiryStatus,
  VendorAccount,
  VendorApplication,
  VendorListing,
} from "@/data/types";

/* ------------------------------------------------------------- helpers */

const id = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

function slugify(name: string, taken: Set<string>): string {
  const base =
    name
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "vendor";
  let slug = base;
  let n = 2;
  while (taken.has(slug)) slug = `${base}-${n++}`;
  return slug;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

/* ------------------------------------------------- reactive client hooks
 * Frontend conveniences over the GET endpoints, so screens re-render when
 * the store changes without touching it directly. Each pairs with the
 * matching async function (getMyAccount, getMyListing, listMyInquiries). */

export function useSessionHydrated(): boolean {
  return useHydrated();
}

export function useMyAccount(): VendorAccount | null {
  const db = useMockDb();
  return db.accounts.find((a) => a.id === db.sessionAccountId) ?? null;
}

export function useMyListing(): VendorListing | null {
  const db = useMockDb();
  const account = db.accounts.find((a) => a.id === db.sessionAccountId);
  if (!account?.listingId) return null;
  return db.listings.find((l) => l.id === account.listingId) ?? null;
}

export function useMyInquiries(): Inquiry[] {
  const db = useMockDb();
  const account = db.accounts.find((a) => a.id === db.sessionAccountId);
  const inquiries = account?.listingId ? db.inquiries.filter((i) => i.listingId === account.listingId) : [];
  return inquiries.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Store-published listings with actual content: what the public overlay
 *  renders for demo-created vendors (the seeded sample rows are empty). */
export function useDemoPublishedListings(): VendorListing[] {
  const db = useMockDb();
  return db.listings.filter(
    (l) => l.status === "published" && (l.cardPhotos.length > 0 || l.portfolio.length > 0),
  );
}

/* ------------------------------------------------------- applications */

export interface ApplicationInput {
  businessName: string;
  category: CategorySlug;
  baseCity: string;
  contactName: string;
  whatsapp: string;
  email: string;
  password: string;
  workLink: string;
  consent: true;
}

/** POST /vendor/applications — creates the application and an account in
 *  status "applied". Rejects an email that already has an account. */
export async function submitApplication(input: ApplicationInput): Promise<Result<{ accountId: string }>> {
  const db = readDb();
  const email = input.email.trim().toLowerCase();
  if (email === DEMO_EMAIL || db.accounts.some((a) => a.email.toLowerCase() === email)) {
    return { ok: false, error: "An account with this email already exists. Log in instead." };
  }
  const accountId = id();
  const account: VendorAccount = {
    id: accountId,
    email,
    password: input.password,
    contactName: input.contactName.trim(),
    whatsapp: input.whatsapp.trim(),
    status: "applied",
    createdAt: new Date().toISOString(),
  };
  const application: VendorApplication = {
    id: id(),
    accountId,
    businessName: input.businessName.trim(),
    category: input.category,
    baseCity: input.baseCity,
    contactName: input.contactName.trim(),
    whatsapp: input.whatsapp.trim(),
    email,
    workLink: input.workLink.trim(),
    consent: true,
    submittedAt: new Date().toISOString(),
  };
  writeDb({ ...db, accounts: [...db.accounts, account], applications: [...db.applications, application] });
  return { ok: true, value: { accountId } };
}

/* ---------------------------------------------------------------- auth */

/** POST /auth/login — starts the session. The demo credentials
 *  (vendor@gmail.com / 123456) always work and seed the demo vendor. */
export async function login(emailRaw: string, password: string): Promise<Result<VendorAccount>> {
  let db = readDb();
  const email = emailRaw.trim().toLowerCase();

  if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
    let account = db.accounts.find((a) => a.id === demoAccount().id);
    if (!account) {
      account = demoAccount();
      db = {
        ...db,
        accounts: [...db.accounts, account],
        inquiries: [...db.inquiries, ...demoInquiries().filter((i) => !db.inquiries.some((e) => e.id === i.id))],
      };
    }
    // The demo vendor owns the Aperture & Marigold sample row (lst-01). The
    // seed mirrors it slim (no content), so on login we upgrade it in place
    // to the full listing — keeping any status the admin set since, and any
    // edits the vendor already made (a row with content is left alone).
    const existing = db.listings.find((l) => l.id === DEMO_LISTING_ID);
    if (!existing || (existing.portfolio.length === 0 && existing.about.length === 0)) {
      const full: VendorListing = { ...demoListing(), ...(existing ? { status: existing.status } : {}) };
      db = {
        ...db,
        listings: existing
          ? db.listings.map((l) => (l.id === DEMO_LISTING_ID ? full : l))
          : [...db.listings, full],
      };
    } else if (existing.accountId !== account.id) {
      db = {
        ...db,
        listings: db.listings.map((l) => (l.id === DEMO_LISTING_ID ? { ...l, accountId: account.id } : l)),
      };
    }
    writeDb({ ...db, sessionAccountId: account.id });
    return { ok: true, value: account };
  }

  const account = db.accounts.find((a) => a.email.toLowerCase() === email);
  if (!account) return { ok: false, error: "No account with that email. Apply on List Your Business first." };
  if (account.password !== password) return { ok: false, error: "That password does not match." };
  writeDb({ ...db, sessionAccountId: account.id });
  return { ok: true, value: account };
}

/** POST /auth/logout */
export async function logout(): Promise<void> {
  writeDb({ ...readDb(), sessionAccountId: null });
}

/** GET /me */
export async function getMyAccount(): Promise<VendorAccount | null> {
  const db = readDb();
  return db.accounts.find((a) => a.id === db.sessionAccountId) ?? null;
}

/* ------------------------------------------------------------- listing */

function myListing(db: MockDb): VendorListing | null {
  const account = db.accounts.find((a) => a.id === db.sessionAccountId);
  if (!account?.listingId) return null;
  return db.listings.find((l) => l.id === account.listingId) ?? null;
}

/** GET /me/listing */
export async function getMyListing(): Promise<VendorListing | null> {
  return myListing(readDb());
}

/** PATCH /me/listing. While the listing is published, newly added photos and
 *  films go into pendingMediaIds: text edits go live at once, new media stays
 *  hidden publicly until the admin approves it. */
export async function updateMyListing(patch: Partial<VendorListing>): Promise<Result<VendorListing>> {
  const db = readDb();
  const listing = myListing(db);
  if (!listing) return { ok: false, error: "No listing on this account yet." };
  // Status and admin flags move only through their own endpoints.
  const { status: _s, featured: _f, featuredOrder: _o, verified: _v, id: _i, accountId: _a, reviewNote: _r, pendingMediaIds: _p, ...safe } = patch;
  void _s; void _f; void _o; void _v; void _i; void _a; void _r; void _p;
  const next: VendorListing = { ...listing, ...safe };
  if (listing.status === "published") {
    const before = listingMediaIds(listing);
    const after = listingMediaIds(next);
    const pending = new Set(listing.pendingMediaIds ?? []);
    for (const id of after) if (!before.has(id)) pending.add(id);
    // Media that was removed again needs no approval.
    for (const id of [...pending]) if (!after.has(id)) pending.delete(id);
    next.pendingMediaIds = [...pending];
  }
  const saved = writeDb({ ...db, listings: db.listings.map((l) => (l.id === listing.id ? next : l)) });
  if (!saved) return { ok: false, error: "Could not save in this browser (storage is full or blocked)." };
  return { ok: true, value: next };
}

/** POST /me/listing/submit — draft or changes_requested becomes in_review. */
export async function submitListingForReview(): Promise<Result<VendorListing>> {
  const db = readDb();
  const listing = myListing(db);
  if (!listing) return { ok: false, error: "No listing on this account yet." };
  if (listing.status !== "draft" && listing.status !== "changes_requested") {
    return { ok: false, error: `A listing in ${listing.status} cannot be submitted.` };
  }
  const next: VendorListing = { ...listing, status: "in_review", reviewNote: undefined };
  writeDb({ ...db, listings: db.listings.map((l) => (l.id === listing.id ? next : l)) });
  return { ok: true, value: next };
}

/** GET /me/inquiries */
export async function listMyInquiries(): Promise<Inquiry[]> {
  const db = readDb();
  const listing = myListing(db);
  return listing ? db.inquiries.filter((i) => i.listingId === listing.id) : [];
}

/** POST /inquiries — a couple enquiry against one listing (by slug).
 *  Resolves listingId from the mock store (sample rows are always seeded). */
export async function createInquiry(input: {
  vendorSlug: string;
  name: string;
  whatsapp: string;
  city: string;
  message: string;
  weddingMonth?: string;
  guests?: number;
}): Promise<Result<Inquiry>> {
  const db = readDb();
  const listing = db.listings.find((l) => l.slug === input.vendorSlug);
  const listingId = listing?.id;
  if (!listingId) return { ok: false, error: "That vendor is not available." };

  const inquiry: Inquiry = {
    id: id(),
    listingId,
    name: input.name.trim(),
    whatsapp: input.whatsapp.trim(),
    city: input.city.trim(),
    message: input.message.trim(),
    weddingMonth: input.weddingMonth,
    guests: input.guests,
    status: "new",
    stage: "new",
    createdAt: new Date().toISOString(),
  };
  writeDb({ ...db, inquiries: [...db.inquiries, inquiry] });
  return { ok: true, value: inquiry };
}

/** PATCH /me/inquiries/{id} */
export async function setInquiryStatus(id: string, status: InquiryStatus): Promise<Result<Inquiry>> {
  const db = readDb();
  const listing = myListing(db);
  const inquiry = db.inquiries.find((i) => i.id === id);
  if (!listing || !inquiry || inquiry.listingId !== listing.id) {
    return { ok: false, error: "No such inquiry on this account." };
  }
  const next = { ...inquiry, status };
  writeDb({ ...db, inquiries: db.inquiries.map((i) => (i.id === id ? next : i)) });
  return { ok: true, value: next };
}

/* ------------------------------------------- demo admin (/demo only) */

/** GET /admin/applications */
export async function demoListApplications(): Promise<VendorApplication[]> {
  return readDb().applications;
}

/** GET /admin/listings */
export async function demoListListings(): Promise<VendorListing[]> {
  return readDb().listings;
}

/** POST /admin/accounts/{id}/approve — approval creates the empty draft
 *  listing linked to the account. */
export async function demoApprove(accountId: string): Promise<void> {
  const db = readDb();
  const account = db.accounts.find((a) => a.id === accountId);
  if (!account) return;
  let listings = db.listings;
  let listingId = account.listingId;
  if (!listingId) {
    const application = db.applications.find((a) => a.accountId === accountId);
    listingId = id();
    listings = [
      ...listings,
      emptyListing({
        id: listingId,
        accountId,
        status: "draft",
        name: application?.businessName ?? account.contactName,
        slug: slugify(application?.businessName ?? account.contactName, new Set(listings.map((l) => l.slug))),
        category: application?.category ?? "photography-films",
        baseCity: application?.baseCity ?? "mumbai",
      }),
    ];
  }
  writeDb({
    ...db,
    listings,
    accounts: db.accounts.map((a) =>
      a.id === accountId ? { ...a, status: "approved", listingId, rejectionNote: undefined } : a,
    ),
  });
}

/** POST /admin/accounts/{id}/reject */
export async function demoReject(accountId: string, note: string): Promise<void> {
  const db = readDb();
  writeDb({
    ...db,
    accounts: db.accounts.map((a) => (a.id === accountId ? { ...a, status: "rejected", rejectionNote: note } : a)),
  });
}

/** POST /admin/listings/{id}/publish */
export async function demoPublish(listingId: string): Promise<void> {
  const db = readDb();
  writeDb({
    ...db,
    listings: db.listings.map((l) => (l.id === listingId ? { ...l, status: "published" } : l)),
  });
}

/** POST /admin/listings/{id}/unpublish */
export async function demoUnpublish(listingId: string): Promise<void> {
  const db = readDb();
  writeDb({
    ...db,
    listings: db.listings.map((l) => (l.id === listingId ? { ...l, status: "unpublished" } : l)),
  });
}

/** POST /admin/listings/{id}/request-changes */
export async function demoRequestChanges(listingId: string, note: string): Promise<void> {
  const db = readDb();
  writeDb({
    ...db,
    listings: db.listings.map((l) =>
      l.id === listingId ? { ...l, status: "changes_requested", reviewNote: note } : l,
    ),
  });
}

/** POST /admin/listings/{id}/approve-media — pending photos/films go live. */
export async function demoApproveMedia(listingId: string): Promise<void> {
  const db = readDb();
  writeDb({
    ...db,
    listings: db.listings.map((l) => (l.id === listingId ? { ...l, pendingMediaIds: [] } : l)),
  });
}

/** Clears the browser's demo data back to the seed state. */
export async function demoReset(): Promise<void> {
  resetDb();
}
