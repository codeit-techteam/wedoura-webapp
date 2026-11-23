import { photos } from "./photos";
import type {
  CoupleAccount,
  Experience,
  HoneymoonPackage,
  PlanningRequest,
  SoulmatesWaitlist,
  Subscriber,
} from "./types";

/** Sample records for the v2 additions. Nothing here is a rating or a count. */

export const coupleAccount: CoupleAccount = {
  id: "couple-demo",
  names: "A. & R.",
  email: "couple@gmail.com",
  weddingMonth: "2026-02",
  city: "udaipur",
  shortlist: ["aperture-marigold"],
};

export const planningRequests: PlanningRequest[] = [
  {
    id: "plan-01",
    name: "A. & R.",
    email: "couple@example.com",
    city: "udaipur",
    weddingMonth: "2026-02",
    note: "A photographer and a venue, and someone to hold the week together.",
    createdAt: "2026-11-01T10:00:00.000Z",
  },
];

export const subscribers: Subscriber[] = [
  { id: "sub-01", email: "letter@example.com", createdAt: "2026-11-01T10:00:00.000Z" },
];

export const soulmatesWaitlist: SoulmatesWaitlist[] = [
  { id: "soul-01", name: "A.", email: "waitlist@example.com", city: "mumbai", createdAt: "2026-11-01T10:00:00.000Z" },
];

export const experiences: Experience[] = [
  {
    slug: "couple-spa",
    name: "Couple spa ritual",
    description: "A slow ayurvedic massage for two, with warm oils and herbal tea.",
    priceFromINR: 12000,
    cover: photos.p15,
    moods: ["Hills", "Beach", "Backwaters"],
  },
  {
    slug: "candlelight-dinner",
    name: "Candlelight dinner",
    description: "A private table, lit by lanterns, with a chef’s menu.",
    priceFromINR: 18000,
    cover: photos.p09,
    moods: ["Hills", "Heritage", "Beach", "Overseas"],
  },
  {
    slug: "sunset-cruise",
    name: "Sunset cruise",
    description: "A quiet evening on a private boat, with sparkling wine and music.",
    priceFromINR: 22000,
    cover: photos.p38,
    moods: ["Beach", "Backwaters", "Overseas"],
  },
  {
    slug: "rose-petal-suite",
    name: "Rose petal suite evening",
    description: "Flowers, candles and a surprise dessert, set up before you arrive.",
    priceFromINR: 8000,
    cover: photos.p35,
    moods: ["Hills", "Heritage", "Beach", "Overseas"],
  },
  {
    slug: "hot-air-balloon",
    name: "Sunrise hot air balloon",
    description: "Drift over the valley at dawn, then breakfast in the fields.",
    priceFromINR: 45000,
    cover: photos.p21,
    moods: ["Heritage", "Hills"],
  },
  {
    slug: "stargazing-picnic",
    name: "Stargazing picnic",
    description: "A hilltop blanket, a telescope guide and a hamper for two.",
    priceFromINR: 15000,
    cover: photos.p19,
    moods: ["Hills", "Heritage"],
  },
];

export const honeymoonPackages: HoneymoonPackage[] = [
  {
    slug: "bali-slowly",
    name: "Bali, slowly",
    destination: "Bali",
    nights: 7,
    days: 8,
    vendorSlug: "wedoura-journeys",
    featured: true,
    moods: ["Overseas"],
    heroEyebrow: "Honeymoon package · Bali, Indonesia",
    summary:
      "Three nights in the jungle of Ubud, four on the cliffs of Uluwatu — rice terraces at dawn, temples by the sea, and whole days with nothing to do but be together.",
    overviewHeadline: "Two Balis in one week",
    overview: [
      "Most couples see Bali in a rush. This trip is built the other way round: fewer places, longer stays, and a private car and guide so you never wait for a tour bus.",
      "You start in Ubud, among rice fields, temples and green valleys. Then you move to Uluwatu in the south, where villas sit on cliffs above the ocean and every evening ends with a sunset.",
    ],
    glance: [
      { label: "Duration", value: "7 nights · 8 days" },
      { label: "Route", value: "Denpasar → Ubud → Uluwatu → Denpasar" },
      { label: "Stays", value: "Private pool villas, in three collections" },
      { label: "Best time", value: "April to October, the dry season" },
      { label: "Flights", value: "Direct from Bengaluru, or via a connection" },
      { label: "Visa", value: "Visa on arrival or e-visa for Indian passports" },
    ],
    routeLabel: "Denpasar → Ubud (3 nights) → Uluwatu (4 nights) → Denpasar",
    collections: [
      { name: "Classic", pricePerCoupleINR: 145000, note: "Boutique pool villas" },
      { name: "Signature", pricePerCoupleINR: 195000, note: "Larger villas, private dinners" },
      { name: "Grand", pricePerCoupleINR: 275000, note: "Cliff-edge suites, butler" },
    ],
    inclusions: [
      "Seven nights in private pool villas",
      "Daily breakfast",
      "Private car and guide on touring days",
      "Airport transfers",
      "One floating breakfast and one couple massage",
    ],
    exclusions: ["International flights", "Lunch and dinner (unless noted)", "Visa and tourism levy", "Travel insurance"],
    itinerary: [
      {
        day: 1,
        title: "Arrive in Bali",
        place: "Denpasar → Ubud",
        text: "Met at the airport, a quiet transfer into the hills, and a late lunch at the villa.",
      },
      {
        day: 2,
        title: "Rice terraces & a water temple",
        place: "Ubud",
        text: "A morning among the terraces, then a temple visit at your own pace.",
      },
      {
        day: 3,
        title: "A lake temple & jungle falls",
        place: "Ubud → the highlands",
        text: "A day trip north: a lake temple, a short walk to the falls, back before dusk.",
      },
      {
        day: 4,
        title: "From the jungle to the cliffs",
        place: "Ubud → Uluwatu",
        text: "Checkout after breakfast; the cliff villa waits with a sunset welcome drink.",
      },
      {
        day: 5,
        title: "A day on Nusa Penida",
        place: "Day trip by boat",
        text: "Optional boat day — or stay at the villa if you prefer the pool.",
      },
      {
        day: 6,
        title: "Beaches & the fire dance",
        place: "Uluwatu",
        text: "A free morning, a beach afternoon, and the kecak dance at dusk if you want it.",
      },
      {
        day: 7,
        title: "A day just for two",
        place: "Uluwatu",
        text: "Nothing planned. Spa, swim, or a long lunch — your planner stays a message away.",
      },
      {
        day: 8,
        title: "Until next time",
        place: "Uluwatu → Denpasar",
        text: "A late checkout where possible, then the airport transfer.",
      },
    ],
    stays: [
      {
        name: "Jungle pool villa",
        description: "Three nights among rice terraces and palms, with a private pool.",
        nights: 3,
        photoId: photos.p03.id,
      },
      {
        name: "Cliff-top pool villa",
        description: "Four nights above the Indian Ocean, sunset every evening.",
        nights: 4,
        photoId: photos.p38.id,
      },
    ],
    momentSlugs: ["couple-spa", "candlelight-dinner", "rose-petal-suite", "sunset-cruise"],
    goodToKnow: [
      "The tourism levy is paid on arrival or online before you fly.",
      "Dry season runs roughly April to October; evenings can still be warm.",
      "Direct flights from Bengaluru are seasonal — your planner confirms options when you enquire.",
    ],
    faqs: [
      {
        question: "Are flights included?",
        answer: "No. We quote stays, transfers and experiences; you book flights, or we can suggest options.",
      },
      {
        question: "Can we add nights?",
        answer: "Yes. Most couples add a night in Ubud or Uluwatu — ask when you request to book.",
      },
      {
        question: "Is this a payment checkout?",
        answer: "No. “Request to book” sends your dates to the planner. You confirm and pay with them directly — no GST or TCS checkout on Wedoura.",
      },
    ],
    gallery: [photos.p03, photos.p38, photos.p27, photos.p08, photos.p11, photos.p12, photos.p09, photos.p30],
    cover: photos.p38,
  },
  {
    slug: "seven-nights-in-the-hills",
    name: "Seven nights in the hills",
    destination: "Coorg",
    nights: 7,
    days: 8,
    vendorSlug: "wedoura-journeys",
    moods: ["Hills"],
    featured: true,
    heroEyebrow: "Honeymoon package · Coorg, India",
    summary: "A week between Mistwood Estate and a quieter coffee house, with the drives already planned.",
    overviewHeadline: "Coffee hills, unhurried",
    overview: [
      "A week for couples who want greenery and cool nights after the wedding. Two houses, short drives, and mornings that start late.",
    ],
    glance: [
      { label: "Duration", value: "7 nights" },
      { label: "Route", value: "Bengaluru → Mistwood → coffee estate → Bengaluru" },
      { label: "Best time", value: "October to February" },
    ],
    routeLabel: "Bengaluru → Mistwood Estate (4 nights) → coffee estate (3 nights)",
    collections: [
      { name: "The houses", pricePerCoupleINR: 180000, staySlugs: ["mistwood-estate-coorg"] },
      { name: "The houses and a guide", pricePerCoupleINR: 240000, staySlugs: ["mistwood-estate-coorg"] },
    ],
    inclusions: ["Seven nights", "Breakfast daily", "One guided forest walk", "Private transfers between stays"],
    exclusions: ["Flights", "Lunch and dinner", "Experiences not listed"],
    itinerary: [
      { day: 1, title: "Arrive", place: "Bengaluru → Mistwood", text: "The drive from the city, then the forest house." },
      { day: 2, title: "The falls", place: "Mistwood", text: "A morning at the estate waterfall; afternoon free." },
      { day: 3, title: "Forest walk", place: "Mistwood", text: "Birdwatching at first light, then nothing until dinner." },
      { day: 4, title: "A slow day", place: "Mistwood", text: "Pool, spa, or a book on the verandah." },
      { day: 5, title: "Move house", place: "Mistwood → coffee estate", text: "A short drive to a quieter coffee house." },
      { day: 6, title: "Estate walk", place: "Coffee estate", text: "Walk the plantation rows while the mist lifts." },
      { day: 7, title: "Waterfalls nearby", place: "Coffee estate", text: "An optional drive to Abbey or Iruppu falls." },
      { day: 8, title: "Homeward", place: "→ Bengaluru", text: "Checkout and the drive back." },
    ],
    stays: [
      {
        name: "Mistwood Estate",
        description: "Four nights by a private waterfall.",
        nights: 4,
        staySlug: "mistwood-estate-coorg",
        photoId: photos.p12.id,
      },
      {
        name: "Coffee estate house",
        description: "Three quieter nights among the bushes.",
        nights: 3,
        photoId: photos.p03.id,
      },
    ],
    momentSlugs: ["couple-spa", "candlelight-dinner", "stargazing-picnic"],
    goodToKnow: ["The roads are slow after rain.", "Ask before you arrive if you want a room with a falls view."],
    faqs: [
      {
        question: "Can we stay only at Mistwood?",
        answer: "Yes — request a Mistwood-only week when you enquire, and we will requote.",
      },
    ],
    gallery: [photos.p12, photos.p03, photos.p27, photos.p11],
    cover: photos.p12,
  },
  {
    slug: "rajasthan-royal-romance",
    name: "Rajasthan Royal Romance",
    destination: "Rajasthan",
    nights: 6,
    vendorSlug: "wedoura-journeys",
    moods: ["Heritage"],
    summary: "6 nights, Udaipur, Jodhpur and Jaipur. Palace stays, a private lake dinner and a desert sunset.",
    collections: [{ name: "Palace circuit", pricePerCoupleINR: 220000 }],
    inclusions: ["Six nights", "Breakfast", "Private car between cities"],
    exclusions: ["Flights", "Monument tickets"],
    itinerary: [
      { day: 1, title: "Udaipur", text: "Arrive by the lake." },
      { day: 3, title: "Jodhpur", text: "The blue city and a fort evening." },
      { day: 5, title: "Jaipur", text: "Palaces by day, dinner under the stars." },
    ],
    goodToKnow: ["Winter evenings are cold — pack a shawl."],
    cover: photos.p21,
    gallery: [photos.p21, photos.p26, photos.p29],
  },
  {
    slug: "maldives-overwater",
    name: "Maldives Overwater Escape",
    destination: "Maldives",
    nights: 5,
    vendorSlug: "wedoura-journeys",
    moods: ["Beach", "Overseas"],
    summary: "5 nights, one island. Seaplane arrival, an overwater villa and a sandbank picnic.",
    collections: [{ name: "Overwater villa", pricePerCoupleINR: 380000 }],
    inclusions: ["Five nights", "Half board", "Speedboat or seaplane transfer as quoted"],
    exclusions: ["International flights", "Spa"],
    itinerary: [{ day: 1, title: "Arrive", text: "Transfer to the island and nothing else planned." }],
    goodToKnow: ["One resort for the whole stay keeps packing light."],
    cover: photos.p27,
    gallery: [photos.p27, photos.p30],
  },
];
