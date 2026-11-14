import { photos } from "./photos";
import type { Destination } from "./types";

export const destinations: Destination[] = [
  {
    slug: "kerala-backwaters",
    name: "Kerala backwaters",
    country: "India",
    bestMonths: "October to March",
    summary: "Sample copy. Slow houseboats, quiet evenings.",
    cover: photos.p12,
  },
  {
    slug: "maldives",
    name: "Maldives",
    country: "Maldives",
    bestMonths: "November to April",
    summary: "Sample copy. Overwater villas and very little to do.",
    cover: photos.p27,
  },
  {
    slug: "coorg",
    name: "Coorg",
    country: "India",
    bestMonths: "October to February",
    summary: "Sample copy. Coffee estates and cool mornings.",
    cover: photos.p15,
  },
  {
    slug: "rajasthan",
    name: "Rajasthan",
    country: "India",
    bestMonths: "October to March",
    summary: "Sample copy. Fort towns, carved courtyards and slow trains.",
    cover: photos.p26,
  },
];
