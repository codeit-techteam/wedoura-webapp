"use client";

/**
 * Soulmates mock store (localStorage). Photos and identity documents use
 * IndexedDB via document-store.ts (`idb:…` URLs).
 */
import { useSyncExternalStore } from "react";
import type {
  Introduction,
  SoulmateBlock,
  SoulmateProfile,
  SoulmateReport,
} from "@/data/types";

const KEY = "wedoura:soulmates-db";
const EVENT = "wedoura:soulmates-change";
const VERSION = 1;

export interface SoulmatesDb {
  version: number;
  profiles: SoulmateProfile[];
  introductions: Introduction[];
  reports: SoulmateReport[];
  blocks: SoulmateBlock[];
}

const EMPTY: SoulmatesDb = Object.freeze({
  version: VERSION,
  profiles: [],
  introductions: [],
  reports: [],
  blocks: [],
});

let cacheRaw: string | null = null;
let cache: SoulmatesDb = EMPTY;

function parse(raw: string | null): SoulmatesDb {
  if (!raw) return EMPTY;
  try {
    const value = JSON.parse(raw) as SoulmatesDb;
    if (!value || !Array.isArray(value.profiles)) return EMPTY;
    return {
      version: VERSION,
      profiles: value.profiles,
      introductions: Array.isArray(value.introductions) ? value.introductions : [],
      reports: Array.isArray(value.reports) ? value.reports : [],
      blocks: Array.isArray(value.blocks) ? value.blocks : [],
    };
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): SoulmatesDb {
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

function getServerSnapshot(): SoulmatesDb {
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

export function readSoulmatesDb(): SoulmatesDb {
  if (typeof window === "undefined") return EMPTY;
  return getSnapshot();
}

export function writeSoulmatesDb(next: SoulmatesDb): void {
  const payload = JSON.stringify(next);
  try {
    window.localStorage.setItem(KEY, payload);
  } catch {
    /* private mode */
  }
  cacheRaw = payload;
  cache = next;
  window.dispatchEvent(new Event(EVENT));
}

export function updateSoulmatesDb(mutator: (db: SoulmatesDb) => SoulmatesDb): SoulmatesDb {
  const next = mutator(structuredClone(readSoulmatesDb()));
  writeSoulmatesDb(next);
  return next;
}

export function useSoulmatesDb(): SoulmatesDb {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10)}`;
}
