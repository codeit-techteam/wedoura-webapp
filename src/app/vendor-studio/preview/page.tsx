"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScreenSkeleton } from "@/components/studio/screen";
import { useMyListing, useSessionHydrated } from "@/lib/vendor-api";

export default function PreviewRedirectPage() {
  const hydrated = useSessionHydrated();
  const listing = useMyListing();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (listing?.slug) {
      const path =
        listing.venue || listing.category === "venues"
          ? `/venues/${listing.slug}`
          : `/vendors/${listing.slug}`;
      router.replace(path);
    } else router.replace("/vendor-studio");
  }, [hydrated, listing, router]);

  return <ScreenSkeleton />;
}
