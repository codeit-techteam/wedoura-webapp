import { photos } from "./photos";
import type { Destination } from "./types";

export const destinations: Destination[] = [
  {
    slug: "kerala-backwaters",
    name: "Kerala backwaters",
    country: "India",
    bestMonths: "October to March",
    summary: "Sample copy. Slow houseboats, quiet evenings.",
    highlights: ["A houseboat day with your own cook.", "Toddy-shop lunches and backwater villages.", "Ayurveda mornings, hammock afternoons."],
    cover: photos.p12,
  },
  {
    slug: "maldives",
    name: "Maldives",
    country: "Maldives",
    bestMonths: "November to April",
    summary: "Sample copy. Overwater villas and very little to do.",
    highlights: ["A villa over its own stretch of water.", "Snorkelling straight off the deck.", "Dinner on a sandbank, just the two of you."],
    cover: photos.p27,
  },
  {
    slug: "coorg",
    name: "Coorg",
    country: "India",
    bestMonths: "October to February",
    summary: "Sample copy. Coffee estates and cool mornings.",
    highlights: ["Coffee-estate walks at first light.", "Waterfalls an easy drive apart.", "Evenings around a fire with pandi curry."],
    cover: photos.p15,
  },
  {
    slug: "rajasthan",
    name: "Rajasthan",
    country: "India",
    bestMonths: "October to March",
    summary: "Sample copy. Fort towns, carved courtyards and slow trains.",
    highlights: ["Fort towns linked by slow trains.", "Courtyard havelis instead of hotels.", "Blue city mornings, desert-camp nights."],
    cover: photos.p26,
  },
];
