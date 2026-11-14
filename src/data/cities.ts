import { photos } from "./photos";
import type { City } from "./types";

export const cities: City[] = [
  { slug: "udaipur", name: "Udaipur", state: "Rajasthan", cover: photos.p12 },
  { slug: "jaipur", name: "Jaipur", state: "Rajasthan", cover: photos.p09 },
  { slug: "goa", name: "Goa", state: "Goa", cover: photos.p11 },
  { slug: "bengaluru", name: "Bengaluru", state: "Karnataka", cover: photos.p04 },
  { slug: "mumbai", name: "Mumbai", state: "Maharashtra", cover: photos.p10 },
  { slug: "delhi", name: "Delhi", state: "Delhi", cover: photos.p03 },
];
