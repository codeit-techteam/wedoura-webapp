import { photos } from "./photos";
import type { BlogPost } from "./types";

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-choose-a-photographer",
    title: "How to choose a wedding photographer",
    excerpt: "Look at whole weddings, not highlight reels, and ask who will actually be there on the day.",
    category: "Planning",
    date: "2026-01-10",
    readMinutes: 6,
    cover: photos.p13,
    body: [
      {
        paragraphs: [
          "Highlight reels show the ten best frames from fifty weddings. Ask to see one full wedding instead: the getting-ready hour, the dull middle of the afternoon, the last dance in bad light. That is what you are paying for.",
        ],
      },
      {
        heading: "Ask who is shooting",
        paragraphs: [
          "Studios send different teams. Make sure the person whose work you liked is the person who turns up, and that their name is in the contract.",
        ],
        photo: photos.p14,
      },
    ],
  },
  {
    slug: "udaipur-venue-guide",
    title: "A short guide to Udaipur venues",
    excerpt: "Lake palaces, havelis and lawns, and what each one needs from your guest list.",
    category: "Venues",
    date: "2025-12-18",
    readMinutes: 8,
    cover: photos.p24,
    body: [
      {
        paragraphs: [
          "Udaipur works for eighty guests or eight hundred, but not with the same venue. Lake palaces want a boat schedule and a small list; the havelis in the old city take a few hundred if you spread the events; the lawns outside town take everyone.",
        ],
      },
    ],
  },
  {
    slug: "mehendi-decor-ideas",
    title: "Mehendi decor that photographs well",
    excerpt: "Fewer colours, more shade, and flowers at eye level.",
    category: "Decor",
    date: "2025-11-30",
    readMinutes: 4,
    cover: photos.p37,
    body: [
      {
        paragraphs: [
          "Afternoon light is hard. Shade first, then colour: a canopy or a wall of trees, then two colours at most, then flowers where the faces are.",
        ],
        photo: photos.p36,
      },
    ],
  },
];
