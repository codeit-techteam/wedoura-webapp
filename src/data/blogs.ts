import { photos } from "./photos";
import type { BlogPost } from "./types";

export const blogPosts: BlogPost[] = [
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
];