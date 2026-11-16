import { photos } from "./photos";
import type { Destination } from "./types";

export const destinations: Destination[] = [
  {
    slug: "kerala-backwaters",
    name: "Kerala backwaters",
    country: "India",
    bestMonths: "October to March",
    summary: "Slow houseboats, quiet evenings and a week that moves at the speed of the water.",
    highlights: ["A houseboat day with your own cook.", "Toddy-shop lunches and backwater villages.", "Ayurveda mornings, hammock afternoons."],
    cover: photos.p12,
  },
  {
    slug: "maldives",
    name: "Maldives",
    country: "Maldives",
    bestMonths: "November to April",
    summary: "Overwater villas and very little to do, which is the point.",
    highlights: ["A villa over its own stretch of water.", "Snorkelling straight off the deck.", "Dinner on a sandbank, just the two of you."],
    cover: photos.p27,
  },
  {
    slug: "coorg",
    name: "Coorg",
    country: "India",
    bestMonths: "October to February",
    summary: "Coffee estates, cool mornings and long dinners by the fire.",
    highlights: ["Coffee-estate walks at first light.", "Waterfalls an easy drive apart.", "Evenings around a fire with pandi curry."],
    cover: photos.p15,
  },
  {
    slug: "rajasthan",
    name: "Rajasthan",
    country: "India",
    bestMonths: "October to March",
    summary: "Fort towns, carved courtyards and slow trains between them.",
    highlights: ["Fort towns linked by slow trains.", "Courtyard havelis instead of hotels.", "Blue city mornings, desert-camp nights."],
    cover: photos.p26,
  },
];
