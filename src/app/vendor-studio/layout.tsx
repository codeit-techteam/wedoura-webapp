import type { Metadata } from "next";
import type { ReactNode } from "react";
import { StudioLayoutClient } from "@/components/studio/StudioLayoutClient";

/** Server wrapper so the portal can carry metadata: the studio is private
 *  and never indexed (robots.txt excludes it too). The gate and shell live
 *  in the client component. */
export const metadata: Metadata = {
  title: "Vendor Studio",
  robots: { index: false, follow: false },
};

export default function VendorStudioLayout({ children }: { children: ReactNode }) {
  return <StudioLayoutClient>{children}</StudioLayoutClient>;
}
