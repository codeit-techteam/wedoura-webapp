"use client";

import type { PlanningRequest, SoulmatesWaitlist } from "@/data/types";

const KEY = "wedoura:journey";

interface JourneyStore {
  planningRequests: PlanningRequest[];
  soulmatesWaitlist: SoulmatesWaitlist[];
}

function readStore(): JourneyStore {
  if (typeof window === "undefined") return { planningRequests: [], soulmatesWaitlist: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { planningRequests: [], soulmatesWaitlist: [] };
    const parsed = JSON.parse(raw) as Partial<JourneyStore>;
    return {
      planningRequests: parsed.planningRequests ?? [],
      soulmatesWaitlist: parsed.soulmatesWaitlist ?? [],
    };
  } catch {
    return { planningRequests: [], soulmatesWaitlist: [] };
  }
}

function writeStore(store: JourneyStore) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* quota / private mode */
  }
}

function randomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export interface PlanningRequestInput {
  name: string;
  whatsapp?: string;
  weddingDate?: string;
  city?: string;
  budget?: string;
  /** Honeymoon planning: travel month (YYYY-MM) and mood. */
  weddingMonth?: string;
  mood?: string;
  note?: string;
}

export function createPlanningRequest(input: PlanningRequestInput): PlanningRequest {
  const store = readStore();
  const record: PlanningRequest = {
    id: randomId(),
    name: input.name,
    whatsapp: input.whatsapp,
    weddingDate: input.weddingDate,
    city: input.city,
    budget: input.budget,
    weddingMonth: input.weddingMonth,
    mood: input.mood,
    note: input.note,
    createdAt: new Date().toISOString(),
  };
  store.planningRequests.push(record);
  writeStore(store);
  return record;
}

export interface SoulmatesWaitlistInput {
  name: string;
  email: string;
  city?: string;
}

/** Waiting-list signup for Soulmates. No matrimony fields. */
export function createSoulmatesWaitlist(input: SoulmatesWaitlistInput): SoulmatesWaitlist {
  const store = readStore();
  const record: SoulmatesWaitlist = {
    id: randomId(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    city: input.city?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  store.soulmatesWaitlist.push(record);
  writeStore(store);
  return record;
}

/** Debug helper. */
export function listLocalPlanningRequests(): PlanningRequest[] {
  return readStore().planningRequests;
}

export function listLocalSoulmatesWaitlist(): SoulmatesWaitlist[] {
  return readStore().soulmatesWaitlist;
}
