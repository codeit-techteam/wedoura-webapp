"use client";

import { useSyncExternalStore } from "react";

/**
 * The shortlist, kept on the device in localStorage. Slugs only; the /saved
 * page resolves them through the api. Shared across tabs via the storage event.
 */
const KEY = "wedoura:saved";
const EVENT = "wedoura:saved-change";
const EMPTY: readonly string[] = [];

let cacheRaw: string | null = null;
let cache: readonly string[] = EMPTY;

function parse(raw: string | null): readonly string[] {
  if (!raw) return EMPTY;
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((v) => typeof v === "string") : EMPTY;
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): readonly string[] {
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

function getServerSnapshot(): readonly string[] {
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

function write(next: readonly string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode or quota: the shortlist is a convenience, not critical */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useSaved(): readonly string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useSavedCount(): number {
  return useSaved().length;
}

export function toggleSaved(slug: string) {
  const current = getSnapshot();
  write(current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug]);
}
