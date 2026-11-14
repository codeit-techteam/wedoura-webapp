import { photos } from "./photos";
import type { Film } from "./types";

// Sample films. Preview and full film point at a CC0 sample clip until
// vendors supply their own. Replace both URLs per film.
const SAMPLE_CLIP = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

export const films: Film[] = [
  {
    id: "film-udaipur-sample",
    title: "A lake-palace morning (sample film)",
    previewSrc: SAMPLE_CLIP,
    fullSrc: SAMPLE_CLIP,
    poster: photos.p24,
    durationSec: 15,
  },
  {
    id: "film-goa-sample",
    title: "Barefoot in Goa (sample film)",
    previewSrc: SAMPLE_CLIP,
    fullSrc: SAMPLE_CLIP,
    poster: photos.p08,
    durationSec: 15,
  },
  {
    id: "film-jaipur-sample",
    title: "Pheras at dusk (sample film)",
    previewSrc: SAMPLE_CLIP,
    fullSrc: SAMPLE_CLIP,
    poster: photos.p21,
    durationSec: 15,
  },
];
