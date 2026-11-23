"use client";

import type { PlanningRequest } from "@/data/types";

const KEY = "wedoura:journey";

interface JourneyStore {
  planningRequests: PlanningRequest[];
}

function readStore(): JourneyStore {
  if (typeof window === "undefined") return { planningRequests: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { planningRequests: [] };
    return JSON.parse(raw) as JourneyStore;
  } catch {
    return { planningRequests: [] };
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
    createdAt: new Date().toISOString(),
  };
  store.planningRequests.push(record);
  writeStore(store);
  return record;
}

/** Debug helper. */
export function listLocalPlanningRequests(): PlanningRequest[] {
  return readStore().planningRequests;
}
