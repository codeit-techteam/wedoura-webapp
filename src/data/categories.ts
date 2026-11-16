import { photos } from "./photos";
import type { Category } from "./types";

/**
 * The six categories, each with its own extra listing fields. Filterable
 * fields become filter controls on /vendors; keys must not collide with the
 * reserved params (q, category, city, budget, sort, show).
 */
export const categories: Category[] = [
  {
    slug: "photography-films",
    name: "Photography & Films",
    shortName: "Photography",
    description: "Photographers and filmmakers for the whole day.",
    cover: photos.p13,
    fields: [
      {
        key: "coverage",
        label: "Coverage",
        input: "select",
        options: ["Photography", "Film", "Photography + film"],
        filterable: true,
      },
      { key: "secondShooter", label: "Second shooter included", input: "toggle", filterable: false },
    ],
  },
  {
    slug: "venues",
    name: "Venues",
    shortName: "Venues",
    description: "Palaces, lawns, beaches and halls, with a 360° look inside.",
    cover: photos.p22,
    fields: [
      {
        key: "venueType",
        label: "Venue type",
        input: "select",
        options: ["Heritage palace", "Beach house", "Lawn", "Hall"],
        filterable: true,
      },
      { key: "roomsOnSite", label: "Rooms on site", input: "number", filterable: false },
    ],
  },
  {
    slug: "makeup-beauty",
    name: "Makeup & Beauty",
    shortName: "Makeup",
    description: "Bridal makeup, hair and grooming artists.",
    cover: photos.p01,
    fields: [
      {
        key: "where",
        label: "Where they work",
        input: "select",
        options: ["Comes to you", "At the studio", "Both"],
        filterable: true,
      },
      { key: "trialIncluded", label: "Trial included", input: "toggle", filterable: false },
    ],
  },
  {
    slug: "decor-styling",
    name: "Decor & Styling",
    shortName: "Decor",
    description: "Mandaps, florals, lighting and tablescapes.",
    cover: photos.p28,
    fields: [
      {
        key: "specialty",
        label: "Specialty",
        input: "select",
        options: ["Fresh florals", "Lighting", "Mandaps", "Full styling"],
        filterable: true,
      },
      { key: "ownWorkshop", label: "Own workshop", input: "toggle", filterable: false },
    ],
  },
  {
    slug: "catering-cakes",
    name: "Catering & Cakes",
    shortName: "Catering",
    description: "Regional menus, live counters and cakes.",
    cover: photos.p30,
    fields: [
      {
        key: "cuisine",
        label: "Cuisine",
        input: "select",
        options: ["North Indian", "Coastal", "South Indian", "Multi-cuisine"],
        filterable: true,
      },
      { key: "minGuests", label: "Minimum guests", input: "number", filterable: false },
    ],
  },
  {
    slug: "entertainment-music",
    name: "Entertainment & Music",
    shortName: "Entertainment",
    description: "Bands, DJs, dhol players and performers.",
    cover: photos.p42,
    fields: [
      {
        key: "act",
        label: "Act",
        input: "select",
        options: ["Dhol and brass", "Live band", "DJ", "Full collective"],
        filterable: true,
      },
      { key: "ownSound", label: "Own sound rig", input: "toggle", filterable: false },
    ],
  },
];
