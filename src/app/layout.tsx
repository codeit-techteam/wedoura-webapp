import type { Metadata } from "next";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { cormorant, jost } from "@/styles/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Wedoura · Wedding vendors across India",
    template: "%s · Wedoura",
  },
  description:
    "Photographers, films, venues, makeup, decor, catering and entertainment for weddings across India. Browse the work, then send an inquiry.",
  openGraph: {
    type: "website",
    siteName: "Wedoura",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-white text-ink">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
