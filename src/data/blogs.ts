import { photos } from "./photos";
import { generateSeedArticles } from "./seed";
import type { BlogPost } from "./types";

const sampleBlogPosts: BlogPost[] = [
  {
    slug: "how-to-choose-a-photographer",
    title: "How to choose a wedding photographer",
    excerpt:
      "Look at whole weddings, not highlight reels. Ask who shoots on the day, how they work in bad light, and what you get back afterwards.",
    category: "Planning",
    date: "2026-01-10",
    readMinutes: 8,
    cover: photos.p13,
    body: [
      {
        paragraphs: [
          "A three-minute film can hide a lot. The frames you see on Instagram are the ten best moments from fifty Saturdays. What you are buying is twelve hours of ordinary light, crowded rooms, and relatives who will not move.",
          "Ask for one full wedding, start to finish. Include the hour when nothing happens, the harsh afternoon on the lawn, and the last song when the flash is dying. If the work still feels calm and true, you are close.",
        ],
        photo: photos.p11,
      },
      {
        heading: "Ask who is shooting",
        paragraphs: [
          "Large studios book the name and send a team. That can work, but the person whose work you fell in love with should be the person in the contract—or you should love the team’s work on its own.",
          "On the call, ask how many weddings they take on a peak weekend and who holds the camera during each ritual. Note it in writing before you pay the advance.",
        ],
        photo: photos.p12,
      },
      {
        heading: "Light and backup",
        paragraphs: [
          "Most Indian weddings spend half the day in mixed light: tungsten halls, open sun, and night stages. You do not need to master the vocabulary, but do ask how they handle a dark mandap without turning skin orange.",
          "A second shooter is less about volume and more about coverage when you are on opposite sides of the room. One body on each of you during the pheras is worth more than six hundred similar close-ups.",
        ],
        photo: photos.p03,
      },
      {
        heading: "Deliverables and time",
        paragraphs: [
          "Agree on numbers: how many edited photographs, whether albums are included, and when you receive a first preview. Six to ten weeks is common; if they promise everything in two, ask what gets dropped.",
          "Raw files are rare and heavy. What matters is a consistent edit across the set and a gallery you can share with family without a login maze.",
        ],
      },
    ],
  },
  {
    slug: "udaipur-venue-guide",
    title: "A short guide to Udaipur venues",
    excerpt:
      "Lake palaces, havelis in the old city, and lawns outside town each ask for a different guest list, transit plan, and timetable.",
    category: "Venues",
    date: "2025-12-18",
    readMinutes: 7,
    cover: photos.p24,
    body: [
      {
        paragraphs: [
          "Udaipur can feel made for weddings until you try to move three hundred guests across the lake at sunset. The city works at every scale, but the venue should choose the list—not the other way around.",
          "Start with how people arrive: flights into Udaipur, road time from the airport, and whether older guests can manage steps, ghats, and boat transfers without a long walk at the end.",
        ],
        photo: photos.p18,
      },
      {
        heading: "On the lake",
        paragraphs: [
          "Island and lake properties are intimate and photogenic. They suit smaller lists and events spread over two or three days. Build boat timetables into the run sheet; one delayed baraat backs up the whole evening.",
          "Weather plans matter. A light breeze is lovely; a cranky monsoon afternoon is not. Ask where the mandap moves if the lake chop gets real.",
        ],
        photo: photos.p20,
      },
      {
        heading: "In the city and beyond",
        paragraphs: [
          "Havelis around the old city carry history in the walls. You trade lawn space for character. Processions are shorter; sound carries up stone lanes, so check local rules for music late at night.",
          "Properties outside town give you lawns, parking, and room for four hundred. You lose the boat, gain shuttles. Spread mehendi, pheras, and reception across days so no one event is only transit.",
        ],
        photo: photos.p08,
      },
    ],
  },
  {
    slug: "mehendi-decor-ideas",
    title: "Mehendi decor that photographs well",
    excerpt:
      "Afternoon sun is unforgiving. Shade first, then one or two colours, and flowers where faces actually sit.",
    category: "Decor",
    date: "2025-11-30",
    readMinutes: 5,
    cover: photos.p37,
    body: [
      {
        paragraphs: [
          "Mehendi is the longest afternoon your photographer will shoot. Guests are seated low, henna is dark on skin, and the sun is high. Decor that looks lush in the catalogue can read as clutter in the camera.",
          "Begin with shade: a sheer canopy, a row of trees, or a wall that blocks the direct beam. Once faces are even, colour does the rest.",
        ],
        photo: photos.p36,
      },
      {
        heading: "Colour and height",
        paragraphs: [
          "Two colours beat five. Marigold and green, blush and ivory, or indigo and white—pick a pair and repeat it. Hang the busier texture high; keep the zone around hands and faces plain.",
          "Low seating means florals should sit at eye level when guests lean in. Pillows in solid fabric photograph better than prints that fight the outfits.",
        ],
        photo: photos.p07,
      },
      {
        heading: "A simple floor plan",
        paragraphs: [
          "Carve a shallow U so the camera can see faces without standing on tables. Leave one open side for the photographer to move; they will thank you during the only hour nobody wants to retake.",
          "If you are using a stage, keep it low. A small platform for the bride is enough; tall stages put heads against the sky and rim-light everyone harshly.",
        ],
      },
    ],
  },
  {
    slug: "sangeet-timings-that-work",
    title: "Sangeet timings that actually work",
    excerpt:
      "Start late enough that everyone has eaten, end before the bar closes, and leave the photographer a clean hour in the middle.",
    category: "Planning",
    date: "2025-10-22",
    readMinutes: 6,
    cover: photos.p09,
    body: [
      {
        paragraphs: [
          "The sangeet is where energy peaks and schedules collapse. Guests arrive straight from work, elders get tired by ten, and the bar queue becomes the real headliner.",
          "A run sheet that respects hunger and sleep beats an extra dance number. The best evenings we see start with food visible—not canapés only—and end while people still want one more song.",
        ],
        photo: photos.p06,
      },
      {
        heading: "When to open the floor",
        paragraphs: [
          "Doors at seven, dinner service by eight-thirty. Family performances before the buffet opens, main DJ set after most plates are full. Cousins who insist on opening the show can go first while tables are still filling.",
          "If you are in a hotel ballroom, ask when staff need access to reset for the next day. A hard end at eleven beats angry housekeeping and blown sound limits.",
        ],
        photo: photos.p05,
      },
      {
        heading: "Light for photographs",
        paragraphs: [
          "Harsh overhead spots turn everyone shiny. Dim house lights, one follow spot for the stage, and warm wash on tables. Your photographer will move during the golden twenty minutes when performances and candid meet.",
          "Tell performers the photo window: one song fully lit, no phone flash from the front row if you want clean images.",
        ],
      },
    ],
  },
  {
    slug: "beach-wedding-weekend-packing",
    title: "Packing for a beach wedding weekend",
    excerpt:
      "One outfit per function, linen you can steam in the shower, and shoes you are willing to lose in the sand.",
    category: "Planning",
    date: "2025-09-14",
    readMinutes: 5,
    cover: photos.p30,
    body: [
      {
        paragraphs: [
          "Beach weekends punish over-packing. Salt, wind and shuttle bags destroy anything precious. Bring fewer things and plan to wear them twice with a rinse in between.",
          "Check whether venues allow heels on sand or boards only. That single answer saves you a duplicate shoe purchase on arrival.",
        ],
        photo: photos.p31,
      },
      {
        heading: "Fabrics that survive",
        paragraphs: [
          "Linen, light cotton and breathable silk blends dry overnight on a balcony. Avoid heavy brocade unless the ceremony is fully indoors.",
          "A small handheld steamer is lighter than an extra garment bag. Most seaside rooms have hooks; use the bathroom steam if you must.",
        ],
        photo: photos.p32,
      },
      {
        heading: "What guests forget",
        paragraphs: [
          "SPF, lip balm, a wrap for windy dinners, and sandals with grip for wet decks. Sunscreen in welcome bags saves a pharmacy run.",
          "If you are the couple, assign someone to hold rings and a backup speech printout off the beach—pockets and sand do not mix.",
        ],
      },
    ],
  },
  {
    slug: "morning-of-wedding-calm",
    title: "A calm morning on the wedding day",
    excerpt:
      "Eat something, protect the hour before hair and makeup, and keep vendors on one WhatsApp thread—not three.",
    category: "Planning",
    date: "2025-08-05",
    readMinutes: 4,
    cover: photos.p02,
    body: [
      {
        paragraphs: [
          "The morning sets the tone your face will carry in every photograph. Rush shows up as tight jawlines and glazed eyes; margin shows up as breath.",
          "Block ninety minutes before anyone with a brush arrives. Phone on silent except one group chat with your planner or sibling.",
        ],
        photo: photos.p01,
      },
      {
        heading: "Food and movement",
        paragraphs: [
          "Something warm and simple—upma, toast, fruit—not just coffee. A ten-minute walk or stretch keeps shoulders down before the saree or sherwani goes on.",
          "If tradition keeps you fasting until a ritual, agree on water and who breaks the fast with you after.",
        ],
      },
      {
        heading: "One thread for vendors",
        paragraphs: [
          "Photographer, makeup, and driver in a single chat reduces Chinese whispers. Your planner posts ETA updates; you do not manage traffic from the chair.",
          "Put cash tips and thank-you notes in one envelope the night before so you are not hunting drawers at noon.",
        ],
        photo: photos.p10,
      },
    ],
  },
];
/** With WEDOURA_SEED=1 extra articles are appended so the blog pages. */
export const blogPosts: BlogPost[] =
  process.env.WEDOURA_SEED === "1" ? [...sampleBlogPosts, ...generateSeedArticles()] : sampleBlogPosts;
