import { photos } from "./photos";
import type { City } from "./types";

export const cities: City[] = [
  { slug: "udaipur", name: "Udaipur", state: "Rajasthan", cover: photos.p24 },
  { slug: "jaipur", name: "Jaipur", state: "Rajasthan", cover: photos.p29 },
  { slug: "goa", name: "Goa", state: "Goa", cover: photos.p27 },
  { slug: "bengaluru", name: "Bengaluru", state: "Karnataka", cover: photos.p40 },
  { slug: "mumbai", name: "Mumbai", state: "Maharashtra", cover: photos.p45 },
  { slug: "delhi", name: "Delhi", state: "Delhi", cover: photos.p44 },
];
