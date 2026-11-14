import { photos } from "./photos";
import type { RealWedding } from "./types";

export const realWeddings: RealWedding[] = [
  {
    slug: "sample-udaipur-lake-wedding",
    title: "Three days by the lake",
    couple: "A. & R.",
    city: "udaipur",
    date: "2026-02-14",
    style: "Palace",
    filmId: "film-udaipur-sample",
    excerpt: "Sample story. A mehendi on the terrace, pheras at sunrise and a dinner that ran until the birds started.",
    cover: photos.p24,
    chapters: [
      {
        title: "The terrace",
        text: ["Sample copy. The mehendi took over the rooftop, with the city going gold behind it."],
        photos: [photos.p35, photos.p36],
      },
      {
        title: "Sunrise pheras",
        text: ["Sample copy. The ceremony began at six, before the heat, with the lake flat as glass."],
        photos: [photos.p19, photos.p33],
      },
      {
        title: "Dinner",
        text: ["Sample copy. Long tables in the courtyard, a brass band, and no speeches."],
        photos: [photos.p09, photos.p42],
      },
    ],
    credits: [
      { role: "Photography", vendorSlug: "aperture-marigold-sample", name: "Aperture & Marigold" },
      { role: "Decor", vendorSlug: "petal-and-thread-sample", name: "Petal & Thread" },
    ],
    featured: true,
  },
  {
    slug: "sample-goa-beach-wedding",
    title: "Barefoot in Goa",
    couple: "M. & S.",
    city: "goa",
    date: "2025-12-06",
    style: "Beach",
    excerpt: "Sample story. Forty guests, one house, and a ceremony on the lawn as the tide came in.",
    cover: photos.p38,
    chapters: [
      { title: "The house", text: ["Sample copy. Everyone stayed under one roof for the week."], photos: [photos.p11, photos.p46] },
      { title: "The lawn", text: ["Sample copy. Vows at five, dinner at seven, dancing by nine."], photos: [photos.p27, photos.p08] },
    ],
    credits: [
      { role: "Venue", vendorSlug: "courtyard-house-sample", name: "The Courtyard House" },
      { role: "Catering", vendorSlug: "coastal-table-sample", name: "Coastal Table" },
    ],
  },
  {
    slug: "sample-jaipur-dusk-wedding",
    title: "Pheras at dusk",
    couple: "N. & K.",
    city: "jaipur",
    date: "2025-11-22",
    style: "Heritage",
    filmId: "film-jaipur-sample",
    excerpt: "Sample story. A pink-and-white mandap, a baraat with twelve dhols and a very long night.",
    cover: photos.p21,
    chapters: [
      { title: "The baraat", text: ["Sample copy. It started two streets away and took an hour to arrive."], photos: [photos.p42, photos.p10] },
      { title: "The mandap", text: ["Sample copy. Built in a day from marigold and muslin."], photos: [photos.p20, photos.p29] },
    ],
    credits: [
      { role: "Films", vendorSlug: "saffron-frames-sample", name: "Saffron Frames" },
      { role: "Music", vendorSlug: "dhol-and-brass-sample", name: "Dhol & Brass" },
    ],
  },
  {
    slug: "sample-bengaluru-garden-wedding",
    title: "A garden morning",
    couple: "T. & J.",
    city: "bengaluru",
    date: "2025-10-18",
    style: "Garden",
    excerpt: "Sample story. A white canopy, filter coffee at seven and vows before the heat came in.",
    cover: photos.p40,
    chapters: [
      { title: "Under the canopy", text: ["Sample copy. Jasmine overhead, the grass still wet."], photos: [photos.p40, photos.p08] },
      { title: "Lunch on the lawn", text: ["Sample copy. Banana leaves, three kinds of payasam, no speeches."], photos: [photos.p30, photos.p09] },
    ],
    credits: [
      { role: "Decor", vendorSlug: "marigold-house", name: "Marigold House" },
      { role: "Catering", vendorSlug: "saffron-and-smoke", name: "Saffron & Smoke" },
    ],
  },
  {
    slug: "sample-mumbai-ballroom-wedding",
    title: "One night in Mumbai",
    couple: "I. & F.",
    city: "mumbai",
    date: "2025-09-27",
    style: "City",
    excerpt: "Sample story. A ballroom, two hundred guests and a dance floor that never quite emptied.",
    cover: photos.p06,
    chapters: [
      { title: "The ballroom", text: ["Sample copy. Chandeliers low, marigold high."], photos: [photos.p06, photos.p28] },
      { title: "The last dance", text: ["Sample copy. The band played one more, three times."], photos: [photos.p42, photos.p10] },
    ],
    credits: [
      { role: "Photography", vendorSlug: "aperture-marigold-sample", name: "Aperture & Marigold" },
      { role: "Music", vendorSlug: "baraat-collective", name: "The Baraat Collective" },
    ],
  },
  {
    slug: "sample-delhi-winter-wedding",
    title: "A winter wedding in Delhi",
    couple: "S. & V.",
    city: "delhi",
    date: "2025-12-20",
    style: "Heritage",
    excerpt: "Sample story. Fog on the lawns, shawls over sherwanis and pheras by the fire.",
    cover: photos.p44,
    chapters: [
      { title: "Getting ready", text: ["Sample copy. Hands hennaed a week early, nerves on the day."], photos: [photos.p01, photos.p11] },
      { title: "The pheras", text: ["Sample copy. Smoke from the havan and everyone leaning in."], photos: [photos.p33, photos.p34] },
    ],
    credits: [
      { role: "Makeup", vendorSlug: "kohl-and-rose", name: "Kohl & Rose" },
      { role: "Decor", vendorSlug: "marigold-house", name: "Marigold House" },
    ],
  },
];
