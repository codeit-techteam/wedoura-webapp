"use client";

/**
 * Vendor-side functions: the authenticated half of the contract
 * (docs/api-contract.md). Every function is async and returns plain data,
 * so swapping the mock store for fetch calls changes only this file.
 * Admin (demo*) functions stand in for the separate admin app at /demo.
 */
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  demoAccount,
  demoListing,
} from "@/lib/demo-credentials";
import { emptyListing, readDb, resetDb, writeDb, type MockDb } from "@/lib/mock-store";
import type {
  CategorySlug,
  Inquiry,
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
        listings: [...db.listings, demoListing()],
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

/** PATCH /me/listing */
export async function updateMyListing(patch: Partial<VendorListing>): Promise<Result<VendorListing>> {
  const db = readDb();
  const listing = myListing(db);
  if (!listing) return { ok: false, error: "No listing on this account yet." };
  // Status and admin flags move only through their own endpoints.
  const { status: _s, featured: _f, featuredOrder: _o, verified: _v, id: _i, accountId: _a, ...safe } = patch;
  void _s; void _f; void _o; void _v; void _i; void _a;
  const next = { ...listing, ...safe };
  writeDb({ ...db, listings: db.listings.map((l) => (l.id === listing.id ? next : l)) });
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
  const next: VendorListing = { ...listing, status: "in_review" };
  writeDb({ ...db, listings: db.listings.map((l) => (l.id === listing.id ? next : l)) });
  return { ok: true, value: next };
}

/** GET /me/inquiries */
export async function listMyInquiries(): Promise<Inquiry[]> {
  const db = readDb();
  const listing = myListing(db);
  return listing ? db.inquiries.filter((i) => i.listingId === listing.id) : [];
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

/** Clears the browser's demo data back to the seed state. */
export async function demoReset(): Promise<void> {
  resetDb();
}
