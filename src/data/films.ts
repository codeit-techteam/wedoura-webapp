import { photos } from "./photos";
import type { Film } from "./types";

// No real clips exist yet, so previews and full films are poster-only: empty
// srcs make the film components hide the player, and vendor profiles hide the
// films section entirely. Drop local clips into public/films and point
// previewSrc/fullSrc at them.
export const films: Film[] = [
  {
    id: "film-udaipur",
    title: "A lake-palace morning",
    previewSrc: "",
    fullSrc: "",
    poster: photos.p24,
    durationSec: 0,
  },
  {
    id: "film-goa",
    title: "Barefoot in Goa",
    previewSrc: "",
    fullSrc: "",
    poster: photos.p21,
    durationSec: 0,
  },
  {
    id: "film-jaipur",
    title: "Pheras at dusk",
    previewSrc: "",
    fullSrc: "",
    poster: photos.p28,
    durationSec: 0,
  },
];
