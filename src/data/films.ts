import { photos } from "./photos";
import type { Film } from "./types";

// Sample films. No real clips exist yet, so previews and full films are
// poster-only: empty srcs are handled by the film components. Drop local
// clips into public/films and point previewSrc/fullSrc at them.
export const films: Film[] = [
  {
    id: "film-udaipur-sample",
    title: "A lake-palace morning",
    previewSrc: "",
    fullSrc: "",
    poster: photos.p24,
    durationSec: 0,
  },
  {
    id: "film-goa-sample",
    title: "Barefoot in Goa",
    previewSrc: "",
    fullSrc: "",
    poster: photos.p21,
    durationSec: 0,
  },
  {
    id: "film-jaipur-sample",
    title: "Pheras at dusk",
    previewSrc: "",
    fullSrc: "",
    poster: photos.p28,
    durationSec: 0,
  },
];
