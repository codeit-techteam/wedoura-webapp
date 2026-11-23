import { photos } from "./photos";
import type {
  CoupleAccount,
  Experience,
  HoneymoonPackage,
  PlanningRequest,
  SoulmatesWaitlist,
  Subscriber,
} from "./types";

/** Sample records for the v2 additions. Nothing here is a rating or a count. */

export const coupleAccount: CoupleAccount = {
  id: "couple-demo",
  names: "A. & R.",
  email: "couple@gmail.com",
  weddingMonth: "2026-02",
  city: "udaipur",
  shortlist: ["aperture-marigold"],
};

export const planningRequests: PlanningRequest[] = [
  {
    id: "plan-01",
    name: "A. & R.",
    email: "couple@example.com",
    city: "udaipur",
    weddingMonth: "2026-02",
    note: "A photographer and a venue, and someone to hold the week together.",
    createdAt: "2026-11-01T10:00:00.000Z",
  },
];

export const subscribers: Subscriber[] = [
  { id: "sub-01", email: "letter@example.com", createdAt: "2026-11-01T10:00:00.000Z" },
];

export const soulmatesWaitlist: SoulmatesWaitlist[] = [
  { id: "soul-01", name: "A.", email: "waitlist@example.com", city: "mumbai", createdAt: "2026-11-01T10:00:00.000Z" },
];

export const experiences: Experience[] = [
  {
    slug: "slow-breakfast",
    name: "A slow breakfast",
    description: "Breakfast on the verandah, later than the hotel usually serves it.",
    priceFromINR: 3500,
  },
];

export const honeymoonPackages: HoneymoonPackage[] = [
  {
    slug: "seven-nights-in-the-hills",
    name: "Seven nights in the hills",
    destination: "Coorg",
    nights: 7,
    summary: "A week between two houses, with the drives already planned.",
    collections: [
      { name: "The house", pricePerCoupleINR: 180000 },
      { name: "The house and a guide", pricePerCoupleINR: 240000 },
    ],
    inclusions: ["Seven nights", "Breakfast", "One guided walk"],
    exclusions: ["Flights", "Lunch and dinner"],
    itinerary: [
      { day: 1, title: "Arrive", text: "The drive from the city, then the house." },
      { day: 2, title: "The walk", text: "A morning in the coffee, and the rest of the day free." },
    ],
    goodToKnow: ["The roads are slow after rain.", "Ask before you arrive if you want a room with a view."],
    cover: photos.p27,
  },
];
