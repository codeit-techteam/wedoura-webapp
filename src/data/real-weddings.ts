import { photos } from "./photos";
import { generateSeedWeddings } from "./seed";
import type { Photo, RealWedding } from "./types";

/** 1×1 transparent placeholder; the reference extracts carry no blur data. */
const REF_BLUR = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

/** Photographs extracted from the real-wedding reference (scripts/extract-reference.mjs). */
function refPhoto(n: number, width: number, height: number, alt: string): Photo {
  const id = `rw-ref-${String(n).padStart(2, "0")}`;
  return {
    id,
    src: `/ref/real-wedding/image-${String(n).padStart(2, "0")}.webp`,
    width,
    height,
    alt,
    blurDataURL: REF_BLUR,
  };
}

/* The sixteen photographs of the coastal story, in shoot order. */
const rw = {
  hero: refPhoto(1, 1500, 1000, "Mira and Sahil at the flower arch on the rock above the sea"),
  chairs: refPhoto(2, 1500, 1000, "Rows of wooden chairs facing the sea, with the flower arch ahead"),
  aerial: refPhoto(3, 1500, 1000, "View from above of the ceremony deck, guests and flower arch on the cliff"),
  bride: refPhoto(4, 1500, 1771, "Mira standing in her gown on a deck over turquoise water"),
  groom: refPhoto(5, 1500, 1875, "Sahil waving to guests in a garden"),
  walkIn: refPhoto(6, 1500, 999, "Mira walking toward the ceremony as guests watch"),
  firstLook: refPhoto(7, 1500, 1000, "Sahil turning to see Mira arrive"),
  standing: refPhoto(8, 1500, 999, "Sahil waiting at the flower arch as guests stand"),
  climb: refPhoto(9, 1000, 1499, "Mira and Sahil climbing the flower-covered rocks"),
  reading: refPhoto(10, 1500, 1000, "The officiant reading as the couple stand at the arch"),
  backRow: refPhoto(11, 1500, 999, "Guests seated either side of a flower-lined aisle as the couple read vows"),
  recessional: refPhoto(12, 1500, 1000, "Mira and Sahil walking back down the aisle under falling white petals"),
  confetti: refPhoto(13, 1277, 1596, "Mira and Sahil walking through a shower of petals"),
  laugh: refPhoto(14, 1000, 667, "Mira and Sahil laughing as petals fall"),
  lantern: refPhoto(15, 1500, 1000, "Guests taking photos in front of the sea under a rattan lantern"),
  gownBack: refPhoto(16, 1016, 1523, "Back of Mira's gown with pearl-detailed cape sleeves among tropical flowers"),
};

const sampleWeddings: RealWedding[] = [
  {
    slug: "udaipur-lake-wedding",
    title: "Three days by the lake",
    couple: "A. & R.",
    city: "udaipur",
    date: "2026-02-14",
    style: "Palace",
    filmId: "film-udaipur",
    excerpt: "A mehendi on the terrace, pheras at sunrise and a dinner that ran until the birds started.",
    cover: photos.p24,
    chapters: [
      {
        numeral: "I",
        title: "The terrace",
        text: ["The mehendi took over the rooftop, with the city going gold behind it and the band warming up two floors down."],
        photos: [photos.p35, photos.p36],
      },
      {
        numeral: "II",
        title: "Sunrise pheras",
        text: ["The ceremony began at six, before the heat, with the lake flat as glass and the pandit speaking just above a whisper."],
        photos: [photos.p19, photos.p33],
      },
      {
        numeral: "III",
        title: "Dinner",
        text: ["Long tables in the courtyard, a brass band, and no speeches. The last guests left when the birds started."],
        photos: [photos.p09, photos.p42],
      },
    ],
    credits: [
      { role: "Photography", vendorSlug: "aperture-marigold", name: "Aperture & Marigold" },
      { role: "Decor", vendorSlug: "petal-and-thread", name: "Petal & Thread" },
    ],
    editorNote: "We kept the order the day actually happened in, and left the speeches out.",
    palette: [
      { name: "Ivory", hex: "#FAF7F2" },
      { name: "Marigold", hex: "#C8A96A" },
      { name: "Lake", hex: "#4F4A42" },
      { name: "Ink", hex: "#111111" },
    ],
    details: [
      { label: "City", value: "Udaipur" },
      { label: "Days", value: "Three" },
      { label: "Setting", value: "Palace" },
    ],
    getTheLook: [
      { label: "Photographers", href: "/vendors?category=photography-films" },
      { label: "Décor & florals", href: "/vendors?category=decor-styling" },
    ],
    featured: true,
  },
  {
    slug: "goa-beach-wedding",
    title: "Vows at the edge of the sea",
    couple: "Mira & Sahil",
    city: "goa",
    date: "2025-12-06",
    style: "Beach",
    excerpt:
      "A timber deck at the cliff's edge, tropical florals against open blue, and a walk back up the aisle under a storm of white petals.",
    cover: rw.hero,
    featured: true,
    heroEyebrow: "Real Wedding · The Courtyard House",
    heroSubtitle: "Vows at the edge of the sea",
    storyHeadline: "Some venues need dressing. This one only needed framing.",
    intro: [
      "At The Courtyard House, Mira and Sahil chose a deck of weathered timber that runs right to the edge of the rock, where the land drops away and the sea takes over the view. The guests sat facing the water; the couple stood with their backs to it.",
      "Against that much blue, the florals had to hold their own — and they did. Orchids, heliconia, anthurium and monstera climbed the ceremony arch and spilled down the rocks, in the same saturated colours the guests wore: coral, emerald, fuchsia, cobalt.",
      "Sahil waited in emerald. Mira arrived in tiered tulle with pearl-detailed cape sleeves. And when it was over, they walked back up the aisle through a storm of white petals.",
    ],
    creditStrip: [
      { label: "Venue", value: "The Courtyard House" },
      { label: "Photography", value: "Aperture & Marigold" },
      { label: "Florals", value: "Petal & Thread" },
      { label: "Makeup", value: "Mehr Studio" },
    ],
    glance: [
      { label: "Couple", value: "Mira & Sahil" },
      { label: "Venue", value: "The Courtyard House", href: "/venues/courtyard-house" },
      { label: "Setting", value: "Timber deck on a cliff above the sea" },
      { label: "Palette", value: "Emerald, orchid, heliconia, sea glass" },
      { label: "Photography", value: "Aperture & Marigold", href: "/vendors/aperture-marigold" },
    ],
    pullQuote: "Nothing in front of them but open sky and water.",
    chapters: [
      {
        numeral: "I",
        title: "The Setting",
        intro: "Cross-back chairs in rows, an aisle lined with flowers, and the horizon doing the rest.",
        text: [],
        photos: [rw.chairs, rw.aerial],
        figures: [
          { photo: rw.chairs, caption: "Before the guests", aspect: "3/2" },
          { photo: rw.aerial, caption: "From above", aspect: "3/2" },
        ],
        rows: ["single", "single"],
      },
      {
        numeral: "II",
        title: "The Arrival",
        intro: "A quiet moment alone on the deck for Mira; a wave to the room from Sahil.",
        text: [],
        photos: [rw.bride, rw.groom, rw.walkIn],
        figures: [
          { photo: rw.bride, caption: "Mira, before the aisle", aspect: "4/5" },
          { photo: rw.groom, caption: "Sahil, greeting the room", aspect: "4/5" },
          { photo: rw.walkIn, caption: "The walk in", aspect: "3/2" },
        ],
        rows: ["pair", "single"],
      },
      {
        numeral: "III",
        title: "The Vows",
        intro: "Sahil turns. Then the two of them climb the flowered rock together, and the officiant begins.",
        text: [],
        photos: [rw.firstLook, rw.standing, rw.climb, rw.reading, rw.backRow],
        figures: [
          { photo: rw.firstLook, caption: "The first look", aspect: "3/2" },
          { photo: rw.standing, caption: "Everyone on their feet", aspect: "3/2" },
          { photo: rw.climb, caption: "Up to the arch", aspect: "2/3" },
          { photo: rw.reading, caption: "The reading", aspect: "3/2" },
          { photo: rw.backRow, caption: "From the back row", aspect: "3/2" },
        ],
        rows: ["single", "single", "mosaic"],
      },
      {
        numeral: "IV",
        title: "The Petals",
        intro: "Married, and back down the aisle under a storm of white — then the phones come out by the sea.",
        text: [],
        photos: [rw.recessional, rw.confetti, rw.laugh, rw.lantern],
        figures: [
          { photo: rw.recessional, caption: "The recessional", aspect: "3/2" },
          { photo: rw.confetti, caption: "Through the confetti" },
          { photo: rw.laugh, caption: "Mid-laugh" },
          { photo: rw.lantern, caption: "Under the rattan lantern", aspect: "3/2" },
        ],
        rows: ["single", "petals", "single"],
      },
      {
        numeral: "V",
        title: "The Details",
        intro: "What they wore, and what surrounded them",
        text: [],
        photos: [rw.gownBack],
        figures: [{ photo: rw.gownBack, caption: "Cape sleeves, from behind", aspect: "2/3" }],
        variant: "details",
      },
      {
        numeral: "VI",
        title: "The Night",
        intro: "Dinner under rattan lanterns, then the lights turned violet and nobody sat down again.",
        text: [],
        photos: [],
        variant: "night",
      },
    ],
    nightClips: [
      {
        src: "/ref/real-wedding/video-01.mp4",
        alt: "Guests at a long candlelit dinner table under rattan lanterns",
        aspectRatio: "1100/734",
      },
      { src: "/ref/real-wedding/video-02.mp4", alt: "Guests dancing on a mosaic floor under violet light", aspectRatio: "2/3" },
      { src: "/ref/real-wedding/video-03.mp4", alt: "Two guests laughing as they dance", aspectRatio: "2/3" },
      { src: "/ref/real-wedding/video-04.mp4", alt: "The bride and a guest dancing back to back", aspectRatio: "2/3" },
      { src: "/ref/real-wedding/video-05.mp4", alt: "The couple laughing together against a pillar", aspectRatio: "2/3" },
      {
        src: "/ref/real-wedding/video-06.mp4",
        alt: "The groom on the dance floor as the bride laughs and guests cheer",
        aspectRatio: "1100/734",
      },
    ],
    palette: [
      { name: "Emerald", hex: "#2F4A3E", note: "The groom's suit" },
      { name: "Orchid", hex: "#B0457F", note: "The bouquet" },
      { name: "Heliconia", hex: "#D3632D", note: "The arch" },
      { name: "Sea glass", hex: "#5F9EA3", note: "The water" },
      { name: "Tulle", hex: "#EFE9DE", note: "The gown" },
    ],
    details: [
      { label: "The gown", value: "Tiered tulle with pearl-detailed cape sleeves" },
      { label: "The suit", value: "Emerald green three-piece" },
      { label: "Florals", value: "Orchid, heliconia, anthurium and monstera arch, with matching aisle clusters, by Petal & Thread" },
      { label: "Bouquet", value: "Orchids with heliconia, tied in cream ribbon" },
      { label: "Seating", value: "Wooden cross-back chairs" },
      { label: "Finale", value: "White petal toss down the aisle" },
    ],
    credits: [
      { role: "Photography", vendorSlug: "aperture-marigold", name: "Aperture & Marigold" },
      { role: "Venue", venueSlug: "courtyard-house", name: "The Courtyard House" },
      { role: "Florals & styling", vendorSlug: "petal-and-thread", name: "Petal & Thread" },
      { role: "Bridal makeup", vendorSlug: "mehr-studio", name: "Mehr Studio" },
    ],
    getTheLook: [
      { label: "Tropical floral installations", href: "/vendors?category=decor-styling", note: "Explore florists" },
      { label: "Clifftop & seaside venues", href: "/vendors?category=venues", note: "Explore venues" },
      { label: "Editorial wedding photography", href: "/vendors?category=photography-films", note: "Explore photographers" },
      { label: "Bridal hair & makeup", href: "/vendors?category=makeup-beauty", note: "Explore makeup artists" },
    ],
    editorNote: "We kept the order the day actually happened in, and left the speeches out.",
  },
  {
    slug: "jaipur-dusk-wedding",
    title: "Pheras at dusk",
    couple: "N. & K.",
    city: "jaipur",
    date: "2025-11-22",
    style: "Heritage",
    filmId: "film-jaipur",
    excerpt: "A pink-and-white mandap, a baraat with twelve dhols and a very long night.",
    cover: photos.p21,
    chapters: [
      {
        title: "The baraat",
        text: ["It started two streets away and took an hour to arrive. The groom's uncles danced the whole way."],
        photos: [photos.p42, photos.p10],
      },
      {
        title: "The mandap",
        text: ["Built in a day from marigold and muslin, and lit for the hour the sun went down behind the fort wall."],
        photos: [photos.p20, photos.p29],
      },
    ],
    credits: [
      { role: "Films", vendorSlug: "saffron-frames", name: "Saffron Frames" },
      { role: "Music", vendorSlug: "dhol-and-brass", name: "Dhol & Brass" },
    ],
  },
  {
    slug: "bengaluru-garden-wedding",
    title: "A garden morning",
    couple: "T. & J.",
    city: "bengaluru",
    date: "2025-10-18",
    style: "Garden",
    excerpt: "A white canopy, filter coffee at seven and vows before the heat came in.",
    cover: photos.p40,
    chapters: [
      {
        title: "Under the canopy",
        text: ["Jasmine overhead, the grass still wet, and the nadaswaram carrying across three gardens."],
        photos: [photos.p40, photos.p08],
      },
      {
        title: "Lunch on the lawn",
        text: ["Banana leaves, three kinds of payasam, no speeches. Everyone went home before the afternoon rain."],
        photos: [photos.p30, photos.p09],
      },
    ],
    credits: [
      { role: "Decor", vendorSlug: "marigold-house", name: "Marigold House" },
      { role: "Catering", vendorSlug: "saffron-and-smoke", name: "Saffron & Smoke" },
    ],
  },
  {
    slug: "mumbai-ballroom-wedding",
    title: "One night in Mumbai",
    couple: "I. & F.",
    city: "mumbai",
    date: "2025-09-27",
    style: "City",
    excerpt: "A ballroom, two hundred guests and a dance floor that never quite emptied.",
    cover: photos.p06,
    chapters: [
      {
        title: "The ballroom",
        text: ["Chandeliers low, marigold high. The pheras happened at nine with the city lit up outside the windows."],
        photos: [photos.p06, photos.p28],
      },
      {
        title: "The last dance",
        text: ["The band played one more, three times. The caterers kept the midnight counter open until two."],
        photos: [photos.p42, photos.p10],
      },
    ],
    credits: [
      { role: "Photography", vendorSlug: "aperture-marigold", name: "Aperture & Marigold" },
      { role: "Music", vendorSlug: "baraat-collective", name: "The Baraat Collective" },
    ],
  },
  {
    slug: "delhi-winter-wedding",
    title: "A winter wedding in Delhi",
    couple: "S. & V.",
    city: "delhi",
    date: "2025-12-20",
    style: "Heritage",
    excerpt: "Fog on the lawns, shawls over sherwanis and pheras by the fire.",
    cover: photos.p44,
    chapters: [
      {
        title: "Getting ready",
        text: ["Hands hennaed a week early, nerves on the day, and the whole family crowded into one room for the last look."],
        photos: [photos.p01, photos.p11],
      },
      {
        title: "The pheras",
        text: ["Smoke from the havan and everyone leaning in, shawls over shoulders against the fog on the lawn."],
        photos: [photos.p33, photos.p34],
      },
    ],
    credits: [
      { role: "Makeup", vendorSlug: "kohl-and-rose", name: "Kohl & Rose" },
      { role: "Decor", vendorSlug: "marigold-house", name: "Marigold House" },
    ],
  },
];

/** With WEDOURA_SEED=1 extra stories are appended so the list pages page. */
export const realWeddings: RealWedding[] =
  process.env.WEDOURA_SEED === "1" ? [...sampleWeddings, ...generateSeedWeddings()] : sampleWeddings;
