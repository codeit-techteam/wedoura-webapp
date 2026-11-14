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
    cover: photos.p11,
  },
  {
    slug: "coorg",
    name: "Coorg",
    country: "India",
    bestMonths: "October to February",
    summary: "Sample copy. Coffee estates and cool mornings.",
    cover: photos.p13,
  },
  {
    slug: "iceland",
    name: "Iceland",
    country: "Iceland",
    bestMonths: "June to August",
    summary: "Sample copy. Black beaches and long light.",
    cover: photos.p16,
  },
];
