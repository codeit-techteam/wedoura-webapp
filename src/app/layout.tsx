import type { Metadata, Viewport } from "next";
import { BottomBar } from "@/components/chrome/BottomBar";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { dmSans, instrument } from "@/styles/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Wedoura · Wedding vendors across India",
    template: "%s · Wedoura",
  },
  description:
    "Find wedding photographers, venues, makeup artists, decorators, caterers and musicians across India. See their real work, then talk to them directly.",
  openGraph: {
    type: "website",
    siteName: "Wedoura",
  },
};

// viewportFit=cover lets the bottom bar pad for the home indicator.
export const viewport: Viewport = {
  themeColor: "#ffffff",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${instrument.variable} ${dmSans.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-white text-ink">
        <MotionProvider>
          <SmoothScroll>
            <SiteHeader />
            <div className="flex flex-1 flex-col pb-bottombar">
              <div className="flex flex-1 flex-col">{children}</div>
              <SiteFooter />
            </div>
            <BottomBar />
          </SmoothScroll>
        </MotionProvider>
      </body>
    </html>
  );
}
