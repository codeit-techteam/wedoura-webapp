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
    // Public sample: "Big Buck Bunny" trailer — replace with a real wedding film before launch.
    youtubeUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
    poster: photos.p24,
    durationSec: 240,
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
    // Public sample trailer — replace with a real wedding film before launch.
    youtubeUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    poster: photos.p28,
    durationSec: 180,
  },
];
