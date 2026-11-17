/**
 * The one place for site-wide facts: name, contact and social links.
 * Components read from here; leave a social entry empty ("") and its icon
 * disappears everywhere it is rendered.
 */

export const SITE_NAME = "Wedoura";

export const SITE_TAGLINE = "Wedding vendors across India";

/** Absolute origin for canonicals, OG images and the sitemap. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Shown on /contact and in structured data. */
export const SITE_EMAIL = "hello@wedoura.com";

/** Placeholder handles until the client confirms theirs; set to "" to hide
 *  a network everywhere (footer, structured data). */
export const SOCIALS: { label: string; href: string }[] = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Pinterest", href: "https://pinterest.com" },
  { label: "YouTube", href: "https://youtube.com" },
].filter((s) => s.href !== "");

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString();
