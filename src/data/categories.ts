import { photos } from "./photos";
import type { Category } from "./types";

export const categories: Category[] = [
  {
    slug: "photography-films",
    name: "Photography & Films",
    shortName: "Photography",
    description: "Photographers and filmmakers who shoot the day whole.",
    cover: photos.p01,
  },
  {
    slug: "venues",
    name: "Venues",
    shortName: "Venues",
    description: "Palaces, lawns, beaches and halls, with a 360° look inside.",
    cover: photos.p04,
  },
  {
    slug: "makeup-beauty",
    name: "Makeup & Beauty",
    shortName: "Makeup",
    description: "Bridal makeup, hair and grooming artists.",
    cover: photos.p14,
  },
  {
    slug: "decor-styling",
    name: "Decor & Styling",
    shortName: "Decor",
    description: "Mandaps, florals, lighting and tablescapes.",
    cover: photos.p09,
  },
  {
    slug: "catering-cakes",
    name: "Catering & Cakes",
    shortName: "Catering",
    description: "Regional menus, live counters and cakes.",
    cover: photos.p05,
  },
  {
    slug: "entertainment-music",
    name: "Entertainment & Music",
    shortName: "Entertainment",
    description: "Bands, DJs, dhol players and performers.",
    cover: photos.p17,
  },
];
