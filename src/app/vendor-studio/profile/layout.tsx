"use client";

import type { ReactNode } from "react";
import { ProfileSubnav } from "@/components/studio/ProfileSubnav";
import { ScreenSkeleton } from "@/components/studio/screen";
import { useMyListing } from "@/lib/vendor-api";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  const listing = useMyListing();

  if (!listing) return <ScreenSkeleton />;

  return (
    <div>
      <p className="mb-4 max-w-prose text-[length:var(--text-dash-body)] text-mute">
        Everything couples see on your Wedoura page. Complete each section below.
      </p>
      <ProfileSubnav listing={listing} />
      {children}
    </div>
  );
}