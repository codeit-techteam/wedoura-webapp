import type { SoulmateCreatedFor } from "@/data/types";

export const STEPS = 7;
export const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"] as const;
export const STEP_NAMES = [
  "Who it’s for",
  "The basics",
  "Education & work",
  "About",
  "Looking for",
  "Photos & privacy",
  "Review",
] as const;

export const STEP_SHORT = [
  "For",
  "Basics",
  "Work",
  "About",
  "Seeking",
  "Photos",
  "Review",
] as const;

export const STEP_CAPS = [
  "Step one",
  "Step two",
  "Step three",
  "Step four",
  "Step five",
  "Step six",
  "Last step",
] as const;

export const STEP_IMAGES: { src: string; alt: string; pos: string }[] = [
  {
    src: "/ref/soulmates-create/image-07.webp",
    alt: "A couple sharing a quiet moment on a carved bench",
    pos: "50% 32%",
  },
  {
    src: "/ref/soulmates-create/image-02.webp",
    alt: "A bride with a jasmine braid in a lavender silk saree",
    pos: "50% 28%",
  },
  {
    src: "/ref/soulmates-create/image-06.webp",
    alt: "A groom holding white bougainvillea",
    pos: "50% 30%",
  },
  {
    src: "/ref/soulmates-create/image-03.webp",
    alt: "Jasmine strands and lotus buds on a cane chair",
    pos: "50% 45%",
  },
  {
    src: "/ref/soulmates-create/image-08.webp",
    alt: "A couple in temple jewellery, close together",
    pos: "50% 30%",
  },
  {
    src: "/ref/soulmates-create/image-09.webp",
    alt: "A henna-painted hand with bangles and jasmine",
    pos: "50% 50%",
  },
  {
    src: "/ref/soulmates-create/image-05.webp",
    alt: "A couple laughing together in silk and gold",
    pos: "40% 35%",
  },
];

export const FOR_OPTIONS: {
  value: SoulmateCreatedFor;
  label: string;
  sub: string;
  path: string;
}[] = [
  {
    value: "myself",
    label: "Myself",
    sub: "I’m creating my own profile",
    path: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
  },
  {
    value: "my_son",
    label: "My son",
    sub: "As a parent",
    path: '<circle cx="9" cy="7" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 21c0-3.3 2.7-6 6-6s6 2.7 6 6M14 21c0-2.2 1.3-4 3-4s3 1.8 3 4"/>',
  },
  {
    value: "my_daughter",
    label: "My daughter",
    sub: "As a parent",
    path: '<circle cx="9" cy="7" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 21c0-3.3 2.7-6 6-6s6 2.7 6 6M14 21c0-2.2 1.3-4 3-4s3 1.8 3 4"/>',
  },
  {
    value: "my_sibling",
    label: "My sibling",
    sub: "Brother or sister",
    path: '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2 20c0-3.3 2.7-6 6-6s6 2.7 6 6M10 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/>',
  },
  {
    value: "other_relative_or_friend",
    label: "A relative or friend",
    sub: "With their blessing",
    path: '<path d="M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z"/>',
  },
];

export const LANGUAGES = [
  "Kannada",
  "Tamil",
  "Malayalam",
  "Telugu",
  "Hindi",
  "Marathi",
  "Gujarati",
  "Bengali",
  "Punjabi",
  "English",
  "Urdu",
  "Konkani",
];

export const PREF_CITIES = [
  "Same city",
  "Anywhere in India",
  "South India",
  "North India",
  "West India",
  "Open to abroad",
];

export const VALUES = [
  "Kindness",
  "Family closeness",
  "Shared faith",
  "Ambition",
  "Humour",
  "Same language",
  "Travel",
  "Fitness",
  "Music & arts",
  "Food & cooking",
];

export const PROMPTS = [
  "A perfect Sunday looks like…",
  "My family would describe me as…",
  "I’m happiest when…",
  "Something I’m learning…",
  "I’m looking for someone who…",
];

export const CITIES = [
  "Bengaluru",
  "Mumbai",
  "Delhi NCR",
  "Chennai",
  "Hyderabad",
  "Kochi",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Mysuru",
  "Outside India",
];

export const EDUCATION = [
  "Doctorate",
  "Master’s degree",
  "Bachelor’s degree",
  "Diploma",
  "School",
];

export const INCOME = [
  "Under ₹10 lakh",
  "₹10 to 25 lakh",
  "₹25 to 50 lakh",
  "₹50 lakh to 1 crore",
  "Above ₹1 crore",
];

export const MARITAL = ["Never married", "Divorced", "Widowed", "Awaiting divorce"] as const;

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const TINTS: [string, string][] = [
  ["#EFE9DE", "#9A7A42"],
  ["#1d1b19", "#C8A96A"],
  ["#0E3B3E", "#D9C8A0"],
  ["#E9DCD5", "#7A4A44"],
];

export function heightOptions(): { label: string; cm: number }[] {
  const out: { label: string; cm: number }[] = [];
  for (let i = 54; i <= 78; i++) {
    const ft = Math.floor(i / 12);
    const inch = i % 12;
    const cm = Math.round(i * 2.54);
    out.push({ label: `${ft}′ ${inch}″ · ${cm} cm`, cm });
  }
  return out;
}

export function forRelation(createdFor: SoulmateCreatedFor): string {
  switch (createdFor) {
    case "myself":
      return "self";
    case "my_son":
      return "parent";
    case "my_daughter":
      return "parent";
    case "my_sibling":
      return "sibling";
    default:
      return "relative_or_friend";
  }
}

export function forLabel(createdFor: SoulmateCreatedFor): string {
  return FOR_OPTIONS.find((o) => o.value === createdFor)?.label ?? "";
}
