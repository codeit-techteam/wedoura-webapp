import { photos } from "./photos";
import type { Partner } from "./types";

/**
 * Brand partnerships, shown as a quiet editorial band after the hero.
 * Managed from the admin app later. The one entry is a clearly generic
 * placeholder — swap in the real brand's name, logo and image when the
 * partnership and its assets are supplied.
 */
export const partners: Partner[] = [
  {
    id: "partner-01",
    name: "Maison Example",
    // No logo yet: the name renders as a serif wordmark until assets land.
    image: photos.p30,
    headline: "Celebrations set beautifully.",
    line: "Fine wedding stationery and table settings, made to order across India.",
    placement: "home",
    active: false,
  },
];
