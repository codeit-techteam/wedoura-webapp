import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site-config";

/** Default share image when a page has no cover of its own. */
export const DEFAULT_OG_IMAGE = "/photos/p23.jpg";

/** Title + description + canonical + Open Graph / Twitter image for a public page. */
export function pageMeta(input: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  noIndex?: boolean;
}): Metadata {
  const image = absoluteUrl(input.image || DEFAULT_OG_IMAGE);
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: absoluteUrl(input.path) },
    openGraph: {
      title: input.title,
      description: input.description,
      url: absoluteUrl(input.path),
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
    ...(input.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
