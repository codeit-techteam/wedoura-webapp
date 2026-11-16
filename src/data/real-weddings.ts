import { photos } from "./photos";
import type { RealWedding } from "./types";

export const realWeddings: RealWedding[] = [
  {
    slug: "udaipur-lake-wedding",
    title: "Three days by the lake",
    couple: "A. & R.",
    city: "udaipur",
    date: "2026-02-14",
    style: "Palace",
    filmId: "film-udaipur",
    excerpt: "A mehendi on the terrace, pheras at sunrise and a dinner that ran until the birds started.",
    cover: photos.p24,
    chapters: [
      {
        title: "The terrace",
        text: ["The mehendi took over the rooftop, with the city going gold behind it and the band warming up two floors down."],
        photos: [photos.p35, photos.p36],
      },
      {
        title: "Sunrise pheras",
        text: ["The ceremony began at six, before the heat, with the lake flat as glass and the pandit speaking just above a whisper."],
        photos: [photos.p19, photos.p33],
      },
      {
        title: "Dinner",
        text: ["Long tables in the courtyard, a brass band, and no speeches. The last guests left when the birds started."],
        photos: [photos.p09, photos.p42],
      },
    ],
    credits: [
      { role: "Photography", vendorSlug: "aperture-marigold", name: "Aperture & Marigold" },
      { role: "Decor", vendorSlug: "petal-and-thread", name: "Petal & Thread" },
    ],
    featured: true,
  },
  {
    slug: "goa-beach-wedding",
    title: "Barefoot in Goa",
    couple: "M. & S.",
    city: "goa",
    date: "2025-12-06",
    style: "Beach",
    excerpt: "Forty guests, one house, and a ceremony on the lawn as the tide came in.",
    cover: photos.p38,
    chapters: [
      {
        title: "The house",
        text: ["Everyone stayed under one roof for the week. Breakfast ran until noon and nobody wore shoes."],
        photos: [photos.p11, photos.p46],
      },
      {
        title: "The lawn",
        text: ["Vows at five, dinner at seven, dancing by nine, with the tide coming in behind the mandap."],
        photos: [photos.p27, photos.p08],
      },
    ],
    credits: [
      { role: "Venue", vendorSlug: "courtyard-house", name: "The Courtyard House" },
      { role: "Catering", vendorSlug: "coastal-table", name: "Coastal Table" },
    ],
  },
  {
    slug: "jaipur-dusk-wedding",
    title: "Pheras at dusk",
    couple: "N. & K.",
    city: "jaipur",
    date: "2025-11-22",
    style: "Heritage",
    filmId: "film-jaipur",
    excerpt: "A pink-and-white mandap, a baraat with twelve dhols and a very long night.",
    cover: photos.p21,
    chapters: [
      {
        title: "The baraat",
        text: ["It started two streets away and took an hour to arrive. The groom's uncles danced the whole way."],
        photos: [photos.p42, photos.p10],
      },
      {
        title: "The mandap",
        text: ["Built in a day from marigold and muslin, and lit for the hour the sun went down behind the fort wall."],
        photos: [photos.p20, photos.p29],
      },
    ],
    credits: [
      { role: "Films", vendorSlug: "saffron-frames", name: "Saffron Frames" },
      { role: "Music", vendorSlug: "dhol-and-brass", name: "Dhol & Brass" },
    ],
  },
  {
    slug: "bengaluru-garden-wedding",
    title: "A garden morning",
    couple: "T. & J.",
    city: "bengaluru",
    date: "2025-10-18",
    style: "Garden",
    excerpt: "A white canopy, filter coffee at seven and vows before the heat came in.",
    cover: photos.p40,
    chapters: [
      {
        title: "Under the canopy",
        text: ["Jasmine overhead, the grass still wet, and the nadaswaram carrying across three gardens."],
        photos: [photos.p40, photos.p08],
      },
      {
        title: "Lunch on the lawn",
        text: ["Banana leaves, three kinds of payasam, no speeches. Everyone went home before the afternoon rain."],
        photos: [photos.p30, photos.p09],
      },
    ],
    credits: [
      { role: "Decor", vendorSlug: "marigold-house", name: "Marigold House" },
      { role: "Catering", vendorSlug: "saffron-and-smoke", name: "Saffron & Smoke" },
    ],
  },
  {
    slug: "mumbai-ballroom-wedding",
    title: "One night in Mumbai",
    couple: "I. & F.",
    city: "mumbai",
    date: "2025-09-27",
    style: "City",
    excerpt: "A ballroom, two hundred guests and a dance floor that never quite emptied.",
    cover: photos.p06,
    chapters: [
      {
        title: "The ballroom",
        text: ["Chandeliers low, marigold high. The pheras happened at nine with the city lit up outside the windows."],
        photos: [photos.p06, photos.p28],
      },
      {
        title: "The last dance",
        text: ["The band played one more, three times. The caterers kept the midnight counter open until two."],
        photos: [photos.p42, photos.p10],
      },
    ],
    credits: [
      { role: "Photography", vendorSlug: "aperture-marigold", name: "Aperture & Marigold" },
      { role: "Music", vendorSlug: "baraat-collective", name: "The Baraat Collective" },
    ],
  },
  {
    slug: "delhi-winter-wedding",
    title: "A winter wedding in Delhi",
    couple: "S. & V.",
    city: "delhi",
    date: "2025-12-20",
    style: "Heritage",
    excerpt: "Fog on the lawns, shawls over sherwanis and pheras by the fire.",
    cover: photos.p44,
    chapters: [
      {
        title: "Getting ready",
        text: ["Hands hennaed a week early, nerves on the day, and the whole family crowded into one room for the last look."],
        photos: [photos.p01, photos.p11],
      },
      {
        title: "The pheras",
        text: ["Smoke from the havan and everyone leaning in, shawls over shoulders against the fog on the lawn."],
        photos: [photos.p33, photos.p34],
      },
    ],
    credits: [
      { role: "Makeup", vendorSlug: "kohl-and-rose", name: "Kohl & Rose" },
      { role: "Decor", vendorSlug: "marigold-house", name: "Marigold House" },
    ],
  },
];
