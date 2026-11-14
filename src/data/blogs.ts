import { photos } from "./photos";
import type { BlogPost } from "./types";

export const blogPosts: BlogPost[] = [
  {
    slug: "sample-how-to-choose-a-photographer",
    title: "How to choose a wedding photographer",
    excerpt: "Sample article. Look at whole weddings, not highlight reels, and ask who will actually be there on the day.",
    category: "Planning",
    date: "2026-01-10",
    readMinutes: 6,
    cover: photos.p13,
    body: [
      {
        paragraphs: [
          "Sample copy. Highlight reels show the ten best frames from fifty weddings. Ask to see one full wedding instead.",
        ],
      },
      {
        heading: "Ask who is shooting",
        paragraphs: [
          "Sample copy. Studios send different teams. Make sure the person whose work you liked is the person who turns up.",
        ],
        photo: photos.p14,
      },
    ],
  },
  {
    slug: "sample-udaipur-venue-guide",
    title: "A short guide to Udaipur venues",
    excerpt: "Sample article. Lake palaces, havelis and lawns, and what each one needs from your guest list.",
    category: "Venues",
    date: "2025-12-18",
    readMinutes: 8,
    cover: photos.p24,
    body: [{ paragraphs: ["Sample copy. Udaipur works for eighty guests or eight hundred, but not with the same venue."] }],
  },
  {
    slug: "sample-mehendi-decor-ideas",
    title: "Mehendi decor that photographs well",
    excerpt: "Sample article. Fewer colours, more shade, and flowers at eye level.",
    category: "Decor",
    date: "2025-11-30",
    readMinutes: 4,
    cover: photos.p37,
    body: [{ paragraphs: ["Sample copy. Afternoon light is hard. Shade first, then colour."], photo: photos.p36 }],
  },
];
