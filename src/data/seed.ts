import { categories } from "./categories";
import { cities } from "./cities";
import { photoList } from "./photos";
import type {
  Album,
  BlogPost,
  CategorySlug,
  Faq,
  Package,
  Photo,
  PriceUnit,
  RealWedding,
  VendorListing,
} from "./types";

/**
 * Deterministic seed data for testing the site at scale. Enabled by
 * WEDOURA_SEED=1 (see src/data/vendors.ts, real-weddings.ts, blogs.ts); the
 * generators are pure and reproducible, reuse the existing photographs, and
 * never ship to the browser (the flag is server-only). Names and prices are
 * invented; nothing is a real statistic. Delete with the backend.
 */

/* ------------------------------------------------------------------ rng */

/** mulberry32: a tiny deterministic PRNG. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T>(random: () => number, arr: readonly T[]): T => arr[Math.floor(random() * arr.length)];
const int = (random: () => number, min: number, max: number) => min + Math.floor(random() * (max - min + 1));
const chance = (random: () => number, p: number) => random() < p;

/** k photos starting at a deterministic offset, wrapping around the pool. */
function photosFrom(start: number, k: number): Photo[] {
  const result: Photo[] = [];
  for (let i = 0; i < k; i++) result.push(photoList[(start + i) % photoList.length]);
  return result;
}

function isoDate(daysAfterEpoch: number): string {
  const d = new Date(Date.UTC(2024, 0, 1));
  d.setUTCDate(d.getUTCDate() + daysAfterEpoch);
  return d.toISOString().slice(0, 10);
}

/* ------------------------------------------------------------ word pools */

const FIRST = [
  "Rosewood", "Juniper", "Tamarind", "Cedar", "Monsoon", "Jasmine", "Peacock", "Lotus",
  "Banyan", "Sandal", "Indigo", "Saffron", "Marble", "Champa", "Teak", "Koyal",
  "Mogra", "Neem", "Kesar", "Gulmohar", "Chandni", "Mehfil", "Zariya", "Raag",
  "Amaltas", "Verandah", "Patio", "Heirloom", "Velvet", "Noor", "Riwaaz", "Sitara",
] as const;

const SUFFIX: Record<CategorySlug, readonly string[]> = {
  "photography-films": ["Frames", "Films", "Stories", "Stills", "Studio"],
  venues: ["House", "Palace", "Gardens", "Court", "Retreat"],
  "makeup-beauty": ["Studio", "Artistry", "Beauty", "Looks"],
  "decor-styling": ["Decor", "Styling", "Settings", "Blooms"],
  "catering-cakes": ["Kitchen", "Table", "Catering", "Rasoi"],
  "entertainment-music": ["Collective", "Ensemble", "Beats", "Baraat"],
};

const TAGLINES: Record<CategorySlug, readonly string[]> = {
  "photography-films": [
    "Honest photographs of real days",
    "Films cut to the sound of the day",
    "Quiet coverage, whole weddings",
  ],
  venues: ["Courtyards, lawns and long evenings", "Room for every ritual", "One address for the whole week"],
  "makeup-beauty": ["Skin that looks like skin", "Looks that last the longest day", "Makeup for every ritual"],
  "decor-styling": ["Mandaps, florals and light", "Settings that fit the place", "Flowers first, plastic never"],
  "catering-cakes": ["Menus from home, cooked for a crowd", "Live counters and long tables", "Food people talk about after"],
  "entertainment-music": ["Music that moves a baraat", "From pheras to the last dance", "Sound for every function"],
};

const ABOUT_A = [
  "We have spent years doing weddings and nothing else, and it shows in how calmly the day runs.",
  "A small team handles everything, so the person you meet first is the person there on the day.",
  "We plan around the rituals, not against them, and keep setup out of everyone's way.",
  "Every wedding gets its own plan; nothing is copied from the last one.",
] as const;

const ABOUT_B = [
  "Couples usually find us through someone whose wedding we did, which is how we like it.",
  "We work across the city and travel often, with kit and crew of our own.",
  "You will always know what things cost before you commit to anything.",
  "Ask us for a full wedding's work, not a highlight reel, and judge from that.",
] as const;

const SERVICES: Record<CategorySlug, readonly string[]> = {
  "photography-films": ["Wedding photography", "Wedding films", "Pre-wedding shoots", "Albums"],
  venues: ["Wedding venue", "Rooms on site", "In-house catering", "Event lawns"],
  "makeup-beauty": ["Bridal makeup", "Hair", "Grooming", "Family makeup"],
  "decor-styling": ["Mandap design", "Florals", "Lighting", "Tablescapes"],
  "catering-cakes": ["Wedding catering", "Live counters", "Cakes", "Tasting sessions"],
  "entertainment-music": ["Baraat band", "Sangeet set", "DJ", "Live performers"],
};

const STYLES: Record<CategorySlug, readonly string[]> = {
  "photography-films": ["Editorial", "Candid", "Documentary", "Classic"],
  venues: ["Heritage", "Garden", "Waterfront", "Modern"],
  "makeup-beauty": ["Natural", "Classic", "Glam", "Minimal"],
  "decor-styling": ["Fresh florals", "Minimal", "Traditional", "Contemporary"],
  "catering-cakes": ["Traditional", "Modern plating", "Regional", "Fusion"],
  "entertainment-music": ["High energy", "Classical", "Contemporary", "Folk"],
};

const VENUE_SPACES = ["The courtyard", "The lawn", "The hall", "The terrace", "The poolside", "The pavilion"] as const;

const SEED_FAQ: Faq[] = [
  {
    question: "How far ahead should we book?",
    answer: "Winter weekends go eight to twelve months out. Write early even if your plans are loose.",
  },
  {
    question: "Do you travel for weddings?",
    answer: "Yes, across India. Travel and stay are billed at cost and agreed before you book.",
  },
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/* ------------------------------------------------------------- listings */

const LISTING_COUNT = 196; // 190 published + 6 spread over the other statuses

/** Statuses for the handful of deliberately non-published seeds. */
const OFF_STATUS: VendorListing["status"][] = ["draft", "in_review", "changes_requested", "unpublished"];

export function generateSeedListings(): VendorListing[] {
  const random = rng(20261116);
  const result: VendorListing[] = [];
  const usedSlugs = new Set<string>();
  let featuredOrder = 4; // sample data uses 1–3

  for (let i = 0; i < LISTING_COUNT; i++) {
    const category = categories[i % categories.length];
    const city = cities[(i + Math.floor(i / categories.length)) % cities.length];
    const n = String(i + 1).padStart(3, "0");

    const name = `${FIRST[i % FIRST.length]} ${pick(random, SUFFIX[category.slug])}`;
    let slug = slugify(name);
    if (usedSlugs.has(slug)) slug = `${slug}-${city.slug}`;
    if (usedSlugs.has(slug)) slug = `${slug}-${n}`;
    usedSlugs.add(slug);

    // Six seeds stay unpublished so lifecycle rules can be exercised at scale.
    const unpublished = i % 33 === 32;
    const status = unpublished ? OFF_STATUS[i % OFF_STATUS.length] : "published";

    // Varied completeness: every tenth listing is minimal but valid.
    const minimal = i % 10 === 7;
    const photoStart = (i * 7) % photoList.length;
    const cardPhotos = photosFrom(photoStart, 3);
    const portfolio = photosFrom(photoStart, minimal ? 4 : int(random, 8, 14));

    // Prices: per-plate catering, per-day venues, per-event otherwise; some on request.
    let priceUnit: PriceUnit;
    let startingPriceINR: number | undefined;
    if (chance(random, 0.12)) {
      priceUnit = "on_request";
      startingPriceINR = undefined;
    } else if (category.slug === "catering-cakes") {
      priceUnit = "per_plate";
      startingPriceINR = int(random, 9, 35) * 100;
    } else if (category.slug === "venues") {
      priceUnit = "per_day";
      startingPriceINR = int(random, 20, 150) * 10000;
    } else {
      priceUnit = "per_event";
      startingPriceINR = int(random, 4, 90) * 10000;
    }

    const categoryValues: VendorListing["categoryValues"] = {};
    for (const def of category.fields) {
      if (def.input === "select" && def.options?.length) categoryValues[def.key] = pick(random, def.options);
      else if (def.input === "toggle") categoryValues[def.key] = chance(random, 0.5);
      else if (def.input === "number") categoryValues[def.key] = int(random, 20, 400);
    }

    const served = new Set<string>([city.slug]);
    for (let k = 0; k < int(random, 1, 3); k++) served.add(pick(random, cities).slug);

    const albums: Album[] = minimal
      ? []
      : [1, 2].map((a) => ({
          slug: `${slug}-work-${a}`,
          title: a === 1 ? `A ${city.name} wedding` : "Two days, one family",
          location: city.name,
          photos: photosFrom(photoStart + a * 5, int(random, 4, 6)),
        }));

    const packages: Package[] = minimal
      ? []
      : [
          {
            label: category.slug === "catering-cakes" ? "Classic menu" : "One event",
            priceINR: startingPriceINR,
            unit: priceUnit,
            note: "The starting point; most couples build from here.",
          },
          {
            label: category.slug === "catering-cakes" ? "Extended menu" : "The full wedding",
            priceINR: startingPriceINR !== undefined ? Math.round(startingPriceINR * 2.2) : undefined,
            unit: priceUnit,
          },
          { label: "Something of your own", unit: "on_request" },
        ];

    const featured = !unpublished && featuredOrder <= 8 && i % 40 === 12;

    const listing: VendorListing = {
      id: `seed-${n}`,
      accountId: `seed-acc-${n}`,
      status,
      featured,
      ...(featured ? { featuredOrder: featuredOrder++ } : {}),
      verified: chance(random, 0.4),
      ...(status === "published" ? { publishedAt: isoDate(30 + ((i * 5) % 1000)) } : {}),
      name,
      slug,
      tagline: pick(random, TAGLINES[category.slug]),
      about: minimal ? [pick(random, ABOUT_A)] : [pick(random, ABOUT_A), pick(random, ABOUT_B)],
      ...(minimal ? {} : { aboutPhoto: photoList[(photoStart + 20) % photoList.length] }),
      ...(minimal ? {} : { team: pick(random, ["A team of two", "A small studio", "Family run"] as const) }),
      ...(minimal ? {} : { yearsActive: int(random, 2, 18) }),
      category: category.slug,
      services: [...SERVICES[category.slug]].slice(0, minimal ? 2 : int(random, 3, 4)),
      styles: [...STYLES[category.slug]].slice(0, minimal ? 1 : int(random, 2, 3)),
      categoryValues,
      baseCity: city.slug,
      citiesServed: [...served],
      ...(chance(random, 0.5) ? { travels: "Across India" } : {}),
      startingPriceINR,
      priceUnit,
      cover: cardPhotos[0],
      cardPhotos,
      portfolio,
      albums,
      films: [],
      packages,
      faqs: minimal ? [] : SEED_FAQ,
      contact: {
        whatsapp: "+910000000000",
        ...(chance(random, 0.6) ? { email: "hello@example.com" } : {}),
        ...(chance(random, 0.4) ? { website: `https://example.com/${slug}` } : {}),
      },
      ...(category.slug === "venues"
        ? {
            venue: {
              capacity: { min: int(random, 40, 120), max: int(random, 200, 900) },
              spaces: [...VENUE_SPACES].slice(0, int(random, 3, 4)),
            },
          }
        : {}),
    };
    result.push(listing);
  }
  return result;
}

/* ------------------------------------------------------------- weddings */

const WEDDING_COUNT = 24;
const WEDDING_STYLES = ["Palace", "Beach", "Garden", "Heritage", "City"] as const;

export function generateSeedWeddings(): RealWedding[] {
  const random = rng(411);
  const listings = generateSeedListings();
  const published = listings.filter((l) => l.status === "published");
  const offstage = listings.filter((l) => l.status !== "published");

  return Array.from({ length: WEDDING_COUNT }, (_, i) => {
    const city = cities[i % cities.length];
    const photoStart = (i * 11) % photoList.length;
    const photographer = published.filter((l) => l.category === "photography-films")[i % 20];
    const decorator = published.filter((l) => l.category === "decor-styling")[i % 20];
    // A few credits point at non-published seeds on purpose: the public
    // story must show the name without a link.
    const offVendor = offstage[i % offstage.length];
    return {
      slug: `${city.slug}-wedding-${String(i + 1).padStart(2, "0")}`,
      title: pick(random, [
        "Two mornings, one promise",
        "A week with everyone home",
        "Dancing until the lights came on",
        "Small rituals, big dinner",
      ] as const),
      couple: `${String.fromCharCode(65 + (i % 24))}. & ${String.fromCharCode(66 + ((i * 3) % 23))}.`,
      city: city.slug,
      date: isoDate(200 + i * 29),
      style: WEDDING_STYLES[i % WEDDING_STYLES.length],
      excerpt: "A wedding that kept its own pace, photographed as it happened.",
      cover: photoList[photoStart],
      chapters: [
        {
          title: "Getting ready",
          text: ["The house filled slowly through the morning, and the music started before the tea did."],
          photos: photosFrom(photoStart + 1, 2),
        },
        {
          title: "The ceremony",
          text: ["The pheras ran unhurried, and dinner afterwards went long into the night."],
          photos: photosFrom(photoStart + 4, 2),
        },
      ],
      credits: [
        { role: "Photography", vendorSlug: photographer.slug, name: photographer.name },
        { role: "Decor", vendorSlug: decorator.slug, name: decorator.name },
        { role: "Styling", vendorSlug: offVendor.slug, name: offVendor.name },
      ],
    };
  });
}

/* ------------------------------------------------------------- articles */

const ARTICLE_COUNT = 12;
const ARTICLE_CATEGORIES = ["Planning", "Venues", "Decor", "Beauty", "Food", "Music"] as const;

export function generateSeedArticles(): BlogPost[] {
  const random = rng(97);
  return Array.from({ length: ARTICLE_COUNT }, (_, i) => {
    const cat = ARTICLE_CATEGORIES[i % ARTICLE_CATEGORIES.length];
    const photoStart = (i * 13 + 3) % photoList.length;
    return {
      slug: `${cat.toLowerCase()}-notes-${String(i + 1).padStart(2, "0")}`,
      title: pick(random, [
        `${cat} decisions to make first`,
        `What to ask about ${cat.toLowerCase()} before you book`,
        `${cat}, planned without the panic`,
      ] as const),
      excerpt: "The questions that save money and arguments, asked in the right order.",
      category: cat,
      date: isoDate(300 + i * 23),
      readMinutes: int(random, 4, 9),
      cover: photoList[photoStart],
      body: [
        {
          paragraphs: [
            "Start with the decisions that lock other decisions: the date, the city and the guest count. Everything else bends around those three.",
            "Write down what matters most to you both, in one sentence each. When budgets get tight later, that sentence settles the argument.",
          ],
          photo: photoList[(photoStart + 2) % photoList.length],
        },
        {
          heading: "Before you pay an advance",
          paragraphs: [
            "Ask to see one whole wedding's work, not a highlight reel, and ask who exactly turns up on the day.",
            "Get the full price in writing, including travel, taxes and overtime, before any money moves.",
          ],
        },
      ],
    };
  });
}
