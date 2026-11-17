import { photos } from "./photos";
import type { Destination } from "./types";

export const destinations: Destination[] = [
  {
    slug: "kerala-backwaters",
    name: "Kerala backwaters",
    country: "India",
    bestMonths: "October to March",
    summary: "Slow houseboats, quiet evenings and a week that moves at the speed of the water.",
    highlights: ["A houseboat day with your own cook.", "Toddy-shop lunches and backwater villages.", "Ayurveda mornings, hammock afternoons."],
    overview: [
      "The backwaters are not a beach holiday. They are a sequence of still mornings, narrow canals and dinners cooked on the boat while the water goes dark.",
      "Most couples split the week between a houseboat night and a small stay on land—Alleppey or Kumarakom for the boat, a quieter homestay or shore resort for the rest. You do not need a packed itinerary; the point is to let days blur.",
    ],
    experiences: [
      {
        title: "Overnight houseboat",
        description: "A private kettuvallam with a bedroom, open deck and a cook who shops at village markets. Drift through paddy edges and coir villages without a fixed schedule.",
      },
      {
        title: "Village walks and toddy shops",
        description: "Short walks from a homestay to temples, coir weavers and small eateries. Lunch at a toddy shop is casual, local and very photogenic in the late afternoon light.",
      },
      {
        title: "Ayurveda and unhurried afternoons",
        description: "A paired massage or a single long treatment, then nothing until dinner. Many couples book one Ayurveda day and leave the rest open.",
      },
    ],
    gallery: [photos.p12, photos.p13, photos.p28, photos.p29, photos.p11, photos.p03],
    whyCouples: [
      "The pace suits anyone recovering from a loud wedding week—no dress codes, no guest lists, just water and birdsong.",
      "Houseboats feel private without the price of an international island. Food is included, views change slowly, and you can nap on deck.",
      "October to March keeps humidity manageable; evenings are cool enough for dinner outside.",
    ],
    practical: [
      { label: "Getting there", value: "Fly into Kochi (COK); Alleppey and Kumarakom are a two- to three-hour drive, often broken with tea in Fort Kochi." },
      { label: "How long", value: "Five to seven nights. One night on the boat, four or five on land." },
      { label: "Stay", value: "One houseboat booking plus a shore homestay or small resort with a canal view." },
      { label: "Pace", value: "Deliberately slow. Book experiences, not a minute-by-minute plan." },
    ],
    cover: photos.p03,
  },
  {
    slug: "maldives",
    name: "Maldives",
    country: "Maldives",
    bestMonths: "November to April",
    summary: "Overwater villas and very little to do, which is the point.",
    highlights: ["A villa over its own stretch of water.", "Snorkelling straight off the deck.", "Dinner on a sandbank, just the two of you."],
    overview: [
      "The Maldives works when you want absolute stillness after months of wedding planning. One resort, one lagoon, and days measured by tide and meal times.",
      "Pick one island and stay there. Transfer by seaplane or speedboat is part of the mood; splitting across multiple resorts rarely feels worth the packing.",
    ],
    experiences: [
      {
        title: "Snorkel from the villa deck",
        description: "Most reefs sit a short swim from overwater rooms. Go out at high tide when the light is clean; come back for coffee and nowhere to be.",
      },
      {
        title: "Private sandbank dinner",
        description: "The resort sets a table on a shallow bank for sunset. It is simple—fish, wine, sand underfoot—and the reason many couples remember the trip.",
      },
      {
        title: "Slow days with one excursion",
        description: "Choose one boat trip—dolphin watch, local island, or a diving intro—and let every other day stay empty except the pool and the sea.",
      },
    ],
    gallery: [photos.p27, photos.p26, photos.p30, photos.p31, photos.p32, photos.p03],
    whyCouples: [
      "Privacy is the product: detached villas, quiet service, and no city noise.",
      "Short flights from southern India make a five-night trip realistic without burning leave.",
      "Resorts handle meals and transfers, so you are not navigating a new country on day one.",
    ],
    practical: [
      { label: "Getting there", value: "Fly to Malé (MLE); resort transfers are seaplane or speedboat, arranged when you book." },
      { label: "How long", value: "Four to six nights on one island." },
      { label: "Stay", value: "Overwater villa if budget allows; beach villa is equally calm with easier swimming." },
      { label: "Pace", value: "Empty by design. One planned outing, the rest unscheduled." },
    ],
    cover: photos.p27,
  },
  {
    slug: "coorg",
    name: "Coorg",
    country: "India",
    bestMonths: "October to February",
    summary: "Coffee estates, cool mornings and long dinners by the fire.",
    highlights: ["Coffee-estate walks at first light.", "Waterfalls an easy drive apart.", "Evenings around a fire with pandi curry."],
    overview: [
      "Coorg is a hill escape for couples who want greenery and crisp air instead of sand. Estates open onto misty valleys; the food is hearty and the nights are quiet.",
      "Base in one estate or boutique stay and drive out to waterfalls and viewpoints. Monsoon is lush but wet; winter is the sweet spot for honeymoons right after a December wedding.",
    ],
    experiences: [
      {
        title: "Estate walk at dawn",
        description: "Walk the plantation rows while the mist lifts. Most estates offer a guided tour with tasting—enough activity for a morning, then breakfast on the verandah.",
      },
      {
        title: "Abbey and Iruppu falls",
        description: "Half-day loops to waterfalls and forest shrines. Pack a light jacket; spray and shade make it a gentle adventure.",
      },
      {
        title: "Fireside dinners",
        description: "Pandi curry, akki roti and coffee after dark. Coorg is at its best when you are not rushing back to a city schedule.",
      },
    ],
    gallery: [photos.p15, photos.p14, photos.p33, photos.p34, photos.p04, photos.p08],
    whyCouples: [
      "Cool weather feels like a reset after summer or destination weddings in hot cities.",
      "Driving distance from Bengaluru makes it workable for short honeymoons without flying.",
      "Estates feel intimate—few rooms, long views, no lobby crowds.",
    ],
    practical: [
      { label: "Getting there", value: "Drive from Bengaluru (five to six hours) or fly to Mangalore and drive two hours into the hills." },
      { label: "How long", value: "Four to five nights in one stay." },
      { label: "Stay", value: "Coffee estate homestay or boutique lodge with valley views." },
      { label: "Pace", value: "One outing a day, long evenings in." },
    ],
    cover: photos.p15,
  },
  {
    slug: "rajasthan",
    name: "Rajasthan",
    country: "India",
    bestMonths: "October to March",
    summary: "Fort towns, carved courtyards and slow trains between them.",
    highlights: ["Fort towns linked by slow trains.", "Courtyard havelis instead of hotels.", "Blue city mornings, desert-camp nights."],
    overview: [
      "Rajasthan after a wedding is for couples who want beauty with history attached—palace walls, mirror rooms, and sunsets from ramparts.",
      "A classic route strings Udaipur, Jodhpur and Jaisalmer with train legs in between. Stay in havelis where the architecture is the décor; let guides handle the folklore.",
    ],
    experiences: [
      {
        title: "Lake mornings in Udaipur",
        description: "Boat rides before the city wakes, palace views from the water, and lunch in the old city without a rigid timetable.",
      },
      {
        title: "Blue city and the fort in Jodhpur",
        description: "Walk the old quarter, then climb Mehrangarh for a long view. Evenings on a rooftop with thali and a cold drink.",
      },
      {
        title: "Desert night outside Jaisalmer",
        description: "A camp beyond the dunes—dinner, quiet stars, and none of the wedding-stage lighting you are trying to forget.",
      },
    ],
    gallery: [photos.p26, photos.p18, photos.p20, photos.p24, photos.p25, photos.p19],
    whyCouples: [
      "The palette—stone, mirror, marigold—feels celebratory without requiring another guest list.",
      "Trains between cities add romance and downtime instead of tight flight connections.",
      "Winter weather is dry and comfortable for walking and photography.",
    ],
    practical: [
      { label: "Getting there", value: "Fly into Udaipur, Jodhpur or Jaipur depending on your route; pre-book drivers for inter-city legs." },
      { label: "How long", value: "Eight to ten nights for a three-city arc without rushing." },
      { label: "Stay", value: "Havelis and palace hotels with courtyards; book Jaisalmer camp one or two nights only." },
      { label: "Pace", value: "Two nights per city minimum; travel days are part of the holiday." },
    ],
    cover: photos.p26,
  },
  {
    slug: "goa",
    name: "Goa",
    country: "India",
    bestMonths: "November to February",
    summary: "Quiet beaches in the north, Portuguese lanes in the south, and seafood every evening.",
    highlights: ["Beach shacks before the crowds arrive.", "Heritage stays in Fontainhas.", "Sunset on a less-busy stretch of sand."],
    overview: [
      "Goa works when you want sea air without leaving the country. The trick is season and neighbourhood—winter weekdays on north beaches, or south Goa's slower villages.",
      "Avoid trying to see the whole coast. Pick a base, walk the same stretch of sand daily, and explore one inland afternoon for spice farms or old churches.",
    ],
    experiences: [
      {
        title: "Morning on a quiet beach",
        description: "Walk north from your stay before breakfast shacks fill up. Swim, read, and let the afternoon be optional.",
      },
      {
        title: "Fontainhas and old Goa",
        description: "Colourful lanes, cafés and churches—a half-day change of scene from the coast.",
      },
      {
        title: "Seafood dinners by the water",
        description: "Reserve a table at a shack or bistro you like and return nightly. Repetition is part of the relaxation.",
      },
    ],
    gallery: [photos.p21, photos.p22, photos.p35, photos.p36, photos.p30, photos.p09],
    whyCouples: [
      "Short flights from most Indian metros; no visa friction for a first trip together abroad-style.",
      "A mix of beach laziness and café culture suits different energy levels on different days.",
      "Plenty of small boutique stays if big resorts feel too much like the wedding venue.",
    ],
    practical: [
      { label: "Getting there", value: "Fly to Goa (GOI); hire a car for south stays or use taxis in the north." },
      { label: "How long", value: "Five to six nights in one neighbourhood." },
      { label: "Stay", value: "Boutique guesthouse or beach resort on a quieter strip—ask how busy weekends get." },
      { label: "Pace", value: "Beach-first. One inland day, otherwise unplanned." },
    ],
    cover: photos.p08,
  },
  {
    slug: "andaman",
    name: "Andaman Islands",
    country: "India",
    bestMonths: "October to May",
    summary: "Clear water, empty beaches and forests that feel a world away from the mainland.",
    highlights: ["Snorkelling with little gear.", "Radhanagar at closing time.", "Ferry hops between quiet islands."],
    overview: [
      "The Andamans reward couples who want turquoise water without a passport stamp. Havelock and Neil still feel small; days revolve around tide, ferry times and one good meal.",
      "Plan around light and ferry schedules—not every beach is swimmable at every hour. Book a few fixed transfers, then leave the middle of each day open.",
    ],
    experiences: [
      {
        title: "Snorkelling and glass-bottom boats",
        description: "Gentle reefs close to shore. Go with a guide the first time, then return on your own if conditions allow.",
      },
      {
        title: "Radhanagar and quieter coves",
        description: "The famous beach is worth one sunset; explore neighbouring coves on weekday mornings when groups are thin.",
      },
      {
        title: "Neil Island slow day",
        description: "A ferry across for bicycle loops, lagoon swims and an early night—ideal mid-trip reset.",
      },
    ],
    gallery: [photos.p23, photos.p31, photos.p32, photos.p27, photos.p03, photos.p28],
    whyCouples: [
      "Feels genuinely remote while staying on Indian time and currency.",
      "Water clarity and forest cover make it memorable without luxury-only resorts.",
      "Works for shorter honeymoons when leave is tight but you still want sea.",
    ],
    practical: [
      { label: "Getting there", value: "Fly to Port Blair (IXZ); ferries or small planes to Havelock and Neil—book ahead in peak season." },
      { label: "How long", value: "Six nights: Port Blair brief, then island time." },
      { label: "Stay", value: "Beach cottages or small resorts; one property per island to avoid packing fatigue." },
      { label: "Pace", value: "Ferry days are fixed; beach days stay empty." },
    ],
    cover: photos.p27,
  },
];