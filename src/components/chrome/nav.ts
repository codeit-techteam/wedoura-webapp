/** Public navigation, from the client's header. Routes point at pages that exist. */
export const NAV_LEFT = [
  { href: "/vendors", label: "Find vendors" },
  { href: "/real-weddings", label: "Real weddings" },
  { href: "/soulmates", label: "Soulmates" },
] as const;

export const NAV_RIGHT = [
  { href: "/honeymoon", label: "Honeymoon" },
  { href: "/blogs", label: "Journal" },
  { href: "/contact", label: "Free planning help" },
] as const;

export const NAV_LIST = { href: "/list-your-business", label: "List your business" } as const;

export const NAV_LINKS = [...NAV_LEFT, ...NAV_RIGHT, NAV_LIST] as const;
