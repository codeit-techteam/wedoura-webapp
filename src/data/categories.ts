import { photos } from "./photos";
import type { Category } from "./types";

export const categories: Category[] = [
  {
    slug: "photography-films",
    name: "Photography & Films",
    shortName: "Photography",
    description: "Photographers and filmmakers for the whole day.",
    cover: photos.p13,
  },
  {
    slug: "venues",
    name: "Venues",
    shortName: "Venues",
    description: "Palaces, lawns, beaches and halls, with a 360° look inside.",
    cover: photos.p22,
  },
  {
    slug: "makeup-beauty",
    name: "Makeup & Beauty",
    shortName: "Makeup",
    description: "Bridal makeup, hair and grooming artists.",
    cover: photos.p01,
  },
  {
    slug: "decor-styling",
    name: "Decor & Styling",
    shortName: "Decor",
    description: "Mandaps, florals, lighting and tablescapes.",
    cover: photos.p28,
  },
  {
    slug: "catering-cakes",
    name: "Catering & Cakes",
    shortName: "Catering",
    description: "Regional menus, live counters and cakes.",
    cover: photos.p30,
  },
  {
    slug: "entertainment-music",
    name: "Entertainment & Music",
    shortName: "Entertainment",
    description: "Bands, DJs, dhol players and performers.",
    cover: photos.p42,
  },
];
