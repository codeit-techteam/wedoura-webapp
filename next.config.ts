import type { NextConfig } from "next";

// Slugs lost their "sample" markers in round 3; the old URLs keep working.
const RENAMED_VENDORS = [
  "aperture-marigold",
  "saffron-frames",
  "courtyard-house",
  "mehr-studio",
  "petal-and-thread",
  "coastal-table",
  "dhol-and-brass",
];
const RENAMED_WEDDINGS = [
  "udaipur-lake-wedding",
  "goa-beach-wedding",
  "jaipur-dusk-wedding",
  "bengaluru-garden-wedding",
  "mumbai-ballroom-wedding",
  "delhi-winter-wedding",
];
const RENAMED_BLOGS = ["how-to-choose-a-photographer", "udaipur-venue-guide", "mehendi-decor-ideas"];

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Placeholder photographs live in /public/photos. Remote hosts are added
    // here when the real backend/CDN exists.
    qualities: [60, 75, 90],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "img.youtube.com", pathname: "/vi/**" }],
  },
  async redirects() {
    return [
      ...RENAMED_VENDORS.flatMap((slug) => [
        { source: `/vendors/${slug}-sample`, destination: `/vendors/${slug}`, permanent: true },
        { source: `/venues/${slug}-sample`, destination: `/venues/${slug}`, permanent: true },
      ]),
      ...RENAMED_WEDDINGS.map((slug) => ({
        source: `/real-weddings/sample-${slug}`,
        destination: `/real-weddings/${slug}`,
        permanent: true,
      })),
      ...RENAMED_BLOGS.map((slug) => ({
        source: `/blogs/sample-${slug}`,
        destination: `/blogs/${slug}`,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
