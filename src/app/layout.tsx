import type { Metadata, Viewport } from "next";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, webSiteSchema } from "@/lib/schema";
import { SITE_URL } from "@/lib/site-config";
import { dmSans, instrument } from "@/styles/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Wedoura · Wedding vendors across India",
    template: "%s · Wedoura",
  },
  description:
    "Find wedding photographers, venues, makeup artists, decorators, caterers and musicians across India. See their real work, then talk to them directly.",
  openGraph: {
    type: "website",
    siteName: "Wedoura",
    // The share image for every page that sets none of its own.
    images: [{ url: "/photos/p23.jpg" }],
  },
  twitter: { card: "summary_large_image" },
};

// viewportFit=cover lets the bottom bar pad for the home indicator.
export const viewport: Viewport = {
  themeColor: "#ffffff",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

/**
 * The bare shell: fonts, providers, global styles. The public chrome lives
 * in (site)/layout.tsx; the vendor portal brings its own in vendor-studio/.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${instrument.variable} ${dmSans.variable} h-full`}>
      <head>
        {/* Motion components server-render their hidden initial state (opacity,
            transforms, masks). Without JS nothing would animate in, so undo it. */}
        <noscript>
          <style>{`[style]{opacity:1!important;transform:none!important;clip-path:none!important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-full flex-col bg-white text-ink">
        <JsonLd schema={[organizationSchema(), webSiteSchema()]} />
        <MotionProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </MotionProvider>
      </body>
    </html>
  );
}
