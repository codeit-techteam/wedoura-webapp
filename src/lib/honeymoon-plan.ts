"use client";

import { useSyncExternalStore } from "react";

/**
 * The honeymoon plan tray: experiences a couple adds from the honeymoon
 * landing ("Add to my plan"). Client-only, localStorage-backed, mirrored by
 * the planning form which folds the picked moments into the request note.
 */
export interface PlanItem {
  slug: string;
  name: string;
  priceFromINR?: number;
}

const KEY = "wedoura:honeymoon-plan";
const EMPTY: PlanItem[] = [];

let cache: PlanItem[] | null = null;
const listeners = new Set<() => void>();

function read(): PlanItem[] {
  if (typeof window === "undefined") return EMPTY;
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as PlanItem[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(items: PlanItem[]) {
  cache = items;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* quota / private mode */
  }
  listeners.forEach((fn) => fn());
}

export function getPlan(): PlanItem[] {
  return read();
}

export function isInPlan(slug: string): boolean {
  return read().some((i) => i.slug === slug);
}

export function togglePlan(item: PlanItem) {
  const items = read();
  write(items.some((i) => i.slug === item.slug) ? items.filter((i) => i.slug !== item.slug) : [...items, item]);
}

export function clearPlan() {
  write([]);
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Reactive plan list; empty on the server so hydration matches. */
export function usePlan(): PlanItem[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
