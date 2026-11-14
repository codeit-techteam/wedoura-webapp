import { photos } from "./photos";
import type { RealWedding } from "./types";

export const realWeddings: RealWedding[] = [
  {
    slug: "sample-udaipur-lake-wedding",
    title: "Three days by the lake",
    couple: "A. & R. (sample story)",
    city: "udaipur",
    date: "2026-02-14",
    excerpt: "Sample story. A mehendi on the terrace, pheras at sunrise and a dinner that ran until the birds started.",
    cover: photos.p12,
    chapters: [
      {
        title: "The terrace",
        text: ["Sample copy. The mehendi took over the rooftop, with the city going gold behind it."],
        photos: [photos.p02, photos.p01],
      },
      {
        title: "Sunrise pheras",
        text: ["Sample copy. The ceremony began at six, before the heat, with the lake flat as glass."],
        photos: [photos.p09, photos.p10],
      },
      {
        title: "Dinner",
        text: ["Sample copy. Long tables in the courtyard, a brass band, and no speeches."],
        photos: [photos.p17, photos.p06],
      },
    ],
    credits: [
      { role: "Photography", vendorSlug: "aperture-marigold-sample", name: "Aperture & Marigold (sample)" },
      { role: "Decor", vendorSlug: "petal-and-thread-sample", name: "Petal & Thread (sample)" },
    ],
    featured: true,
  },
  {
    slug: "sample-goa-beach-wedding",
    title: "Barefoot in Goa",
    couple: "M. & S. (sample story)",
    city: "goa",
    date: "2025-12-06",
    excerpt: "Sample story. Forty guests, one house, and a ceremony on the lawn as the tide came in.",
    cover: photos.p11,
    chapters: [
      { title: "The house", text: ["Sample copy. Everyone stayed under one roof for the week."], photos: [photos.p14, photos.p04] },
      { title: "The lawn", text: ["Sample copy. Vows at five, dinner at seven, dancing by nine."], photos: [photos.p16, photos.p06] },
    ],
    credits: [
      { role: "Venue", vendorSlug: "courtyard-house-sample", name: "The Courtyard House (sample)" },
      { role: "Catering", vendorSlug: "coastal-table-sample", name: "Coastal Table (sample)" },
    ],
  },
  {
    slug: "sample-jaipur-dusk-wedding",
    title: "Pheras at dusk",
    couple: "N. & K. (sample story)",
    city: "jaipur",
    date: "2025-11-22",
    excerpt: "Sample story. A pink-and-white mandap, a baraat with twelve dhols and a very long night.",
    cover: photos.p10,
    chapters: [
      { title: "The baraat", text: ["Sample copy. It started two streets away and took an hour to arrive."], photos: [photos.p17, photos.p03] },
      { title: "The mandap", text: ["Sample copy. Built in a day from marigold and muslin."], photos: [photos.p09, photos.p05] },
    ],
    credits: [
      { role: "Films", vendorSlug: "saffron-frames-sample", name: "Saffron Frames (sample)" },
      { role: "Music", vendorSlug: "dhol-and-brass-sample", name: "Dhol & Brass (sample)" },
    ],
  },
];
