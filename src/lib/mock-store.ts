"use client";

/**
 * The mock backend store: one JSON blob in localStorage holding accounts,
 * applications, listings, inquiries and the session. It exists so the
 * vendor lifecycle (apply, approve, log in, studio, /demo) can be
 * demonstrated before the backend exists; src/lib/vendor-api.ts is the only
 * module that should write to it. The empty store *is* the seed state: the
 * 12 sample listings appear as slim rows (identity + status, no content) so
 * /demo can list and toggle them.
 *
 * Note: public pages are server-rendered from the static sample data and
 * cannot see this store. Status changes here affect /demo and the studio.
 */
import { useSyncExternalStore } from "react";
import type {
  Inquiry,
  ListingStatus,
  VendorAccount,
  VendorApplication,
  VendorListing,
} from "@/data/types";
// The hand-written sample rows only — never the seeded dataset, which would
// blow the localStorage quota and clutter /demo.
import { sampleListings } from "@/data/vendors";

const KEY = "wedoura:mock-db";
const EVENT = "wedoura:mock-db-change";
// v2: VenueDetails.tour became { scenes, links, markers } over portfolio photo ids.
const VERSION = 2;

export interface MockDb {
  version: number;
  accounts: VendorAccount[];
  applications: VendorApplication[];
  listings: VendorListing[];
  inquiries: Inquiry[];
  sessionAccountId: string | null;
}

/** A listing with no content yet: what approval creates, and how the sample
 *  listings are mirrored into the store (slim, no photos). */
export function emptyListing(init: {
  id: string;
  accountId: string;
  status: ListingStatus;
  name: string;
  slug: string;
  category: VendorListing["category"];
  baseCity: string;
}): VendorListing {
  return {
    ...init,
    featured: false,
    verified: false,
    tagline: "",
    about: [],
    services: [],
    styles: [],
    categoryValues: {},
    citiesServed: [],
    priceUnit: "on_request",
    cardPhotos: [],
    portfolio: [],
    albums: [],
    films: [],
    packages: [],
    faqs: [],
    contact: {},
  };
}

/** Marks rows mirrored from the static sample dataset. */
export const SAMPLE_ID_PREFIX = "lst-";

const SEED: MockDb = Object.freeze({
  version: VERSION,
  accounts: [],
  applications: [],
  listings: sampleListings.map((l) =>
    emptyListing({
      id: l.id,
      accountId: l.accountId,
      status: l.status,
      name: l.name,
      slug: l.slug,
      category: l.category,
      baseCity: l.baseCity,
    }),
  ),
  inquiries: [],
  sessionAccountId: null,
});

let cacheRaw: string | null = null;
let cache: MockDb = SEED;

function parse(raw: string | null): MockDb {
  if (!raw) return SEED;
  try {
    const value = JSON.parse(raw) as MockDb;
    if (!value || value.version !== VERSION || !Array.isArray(value.accounts)) return SEED;
    return value;
  } catch {
    return SEED;
  }
}

function getSnapshot(): MockDb {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    cache = parse(raw);
  }
  return cache;
}

function getServerSnapshot(): MockDb {
  return SEED;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

/** Imperative read for the async vendor-api functions. */
export function readDb(): MockDb {
  return getSnapshot();
}

/** Imperative write; notifies every subscribed screen. Returns false when
 *  the write failed (private mode, quota) so saves can surface an error. */
export function writeDb(next: MockDb): boolean {
  let ok = true;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    ok = false;
  }
  window.dispatchEvent(new Event(EVENT));
  return ok;
}

/** Back to the seed state (the sample rows reappear). */
export function resetDb(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Reactive store for /demo and the studio. */
export function useMockDb(): MockDb {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** False during SSR and hydration, true once client state is live; gates
 *  use it so logged-in screens do not flash their logged-out state. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
