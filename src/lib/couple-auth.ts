"use client";

import { useSyncExternalStore } from "react";

/**
 * Couple session (localStorage mock). Separate from the vendor mock-store
 * session. Demo: couple@gmail.com / 123456.
 */
export const COUPLE_DEMO_EMAIL = "couple@gmail.com";
export const COUPLE_DEMO_PASSWORD = "123456";

const KEY = "wedoura:couple-session";
const EVENT = "wedoura:couple-change";

export type CoupleNotification = {
  id: string;
  text: string;
  read: boolean;
  at: string;
};

export type CoupleAccount = {
  email: string;
  password: string;
  names: string;
  weddingMonth: string;
  city: string;
  onboarded: boolean;
  notifications: CoupleNotification[];
};

const EMPTY: CoupleAccount | null = null;

let cacheRaw: string | null = null;
let cache: CoupleAccount | null = EMPTY;

function demoCouple(): CoupleAccount {
  const day = 24 * 60 * 60 * 1000;
  return {
    email: COUPLE_DEMO_EMAIL,
    password: COUPLE_DEMO_PASSWORD,
    names: "Ananya & Kabir",
    weddingMonth: "2026-12",
    city: "Mumbai",
    onboarded: true,
    notifications: [
      {
        id: "n1",
        text: "Aperture & Marigold replied to your December enquiry.",
        read: false,
        at: new Date(Date.now() - 1 * day).toISOString(),
      },
      {
        id: "n2",
        text: "Welcome to Wedoura. Your shortlist and enquiries live here.",
        read: true,
        at: new Date(Date.now() - 3 * day).toISOString(),
      },
    ],
  };
}

function parse(raw: string | null): CoupleAccount | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as CoupleAccount;
    if (!value || typeof value.email !== "string") return null;
    return value;
  } catch {
    return null;
  }
}

function getSnapshot(): CoupleAccount | null {
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

function getServerSnapshot(): CoupleAccount | null {
  return EMPTY;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

function write(next: CoupleAccount | null) {
  try {
    if (next) window.localStorage.setItem(KEY, JSON.stringify(next));
    else window.localStorage.removeItem(KEY);
  } catch {
    /* private mode */
  }
  cacheRaw = next ? JSON.stringify(next) : null;
  cache = next;
  window.dispatchEvent(new Event(EVENT));
}

export function useCoupleAccount(): CoupleAccount | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useCoupleHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function getCoupleEmail(): string | null {
  if (typeof window === "undefined") return null;
  return getSnapshot()?.email ?? null;
}

export type CoupleAuthResult =
  | { ok: true; value: CoupleAccount }
  | { ok: false; error: string };

/** Email/password login. Demo credentials always work and seed the sample couple. */
export async function coupleLogin(emailRaw: string, password: string): Promise<CoupleAuthResult> {
  const email = emailRaw.trim().toLowerCase();
  if (email === COUPLE_DEMO_EMAIL && password === COUPLE_DEMO_PASSWORD) {
    const existing = getSnapshot();
    if (existing?.email === COUPLE_DEMO_EMAIL) {
      write(existing);
      return { ok: true, value: existing };
    }
    const account = demoCouple();
    write(account);
    return { ok: true, value: account };
  }

  // Any other email+password creates a new (not yet onboarded) session for the demo.
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "An email address, please." };
  if (password.length < 6) return { ok: false, error: "That password does not match." };

  const account: CoupleAccount = {
    email,
    password,
    names: "",
    weddingMonth: "",
    city: "",
    onboarded: false,
    notifications: [],
  };
  write(account);
  return { ok: true, value: account };
}

/** Mock Google: signs in as the demo couple. */
export async function coupleLoginWithGoogle(): Promise<CoupleAuthResult> {
  return coupleLogin(COUPLE_DEMO_EMAIL, COUPLE_DEMO_PASSWORD);
}

export async function coupleLogout(): Promise<void> {
  write(null);
}

export async function completeCoupleOnboarding(input: {
  names: string;
  weddingMonth: string;
  city: string;
}): Promise<CoupleAuthResult> {
  const current = getSnapshot();
  if (!current) return { ok: false, error: "Please log in first." };
  const next: CoupleAccount = {
    ...current,
    names: input.names.trim(),
    weddingMonth: input.weddingMonth,
    city: input.city,
    onboarded: true,
    notifications:
      current.notifications.length > 0
        ? current.notifications
        : [
            {
              id: "n-welcome",
              text: "Welcome to Wedoura. Your shortlist and enquiries live here.",
              read: false,
              at: new Date().toISOString(),
            },
          ],
  };
  write(next);
  return { ok: true, value: next };
}

export async function updateCoupleDetails(input: {
  names: string;
  weddingMonth: string;
  city: string;
}): Promise<CoupleAuthResult> {
  const current = getSnapshot();
  if (!current) return { ok: false, error: "Please log in first." };
  const next: CoupleAccount = {
    ...current,
    names: input.names.trim(),
    weddingMonth: input.weddingMonth,
    city: input.city,
  };
  write(next);
  return { ok: true, value: next };
}

export function markCoupleNotificationsRead(): void {
  const current = getSnapshot();
  if (!current) return;
  write({
    ...current,
    notifications: current.notifications.map((n) => ({ ...n, read: true })),
  });
}
