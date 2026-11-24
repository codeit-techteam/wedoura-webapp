"use client";

import Link from "next/link";
import { SectionCard } from "@/components/studio/SectionCard";
import { VenueFields } from "@/components/studio/VenueFields";
import { ScreenSkeleton, useListingForm } from "@/components/studio/screen";
import type { VenueDetails } from "@/data/types";
import { publicProfileHref } from "@/lib/studio-profile-nav";

type Form = {
  category: string;
  venue?: VenueDetails;
};

export default function ProfileVenuePage() {
  const { listing, form, apply } = useListingForm<Form>((l) => ({
    category: l.category,
    venue: l.venue,
  }));

  if (!form || !listing) return <ScreenSkeleton />;

  if (form.category !== "venues") {
    return (
      <section className="studio-card">
        <h2 className="studio-section-title">Venue details</h2>
        <p className="mt-2 max-w-prose text-[length:var(--text-dash-body)] text-mute">
          Your listing is not in the Venues category. Change your category under Business details to unlock
          capacity, spaces, food, rules and the 360° tour.
        </p>
        <Link href="/vendor-studio/profile/business" className="studio-btn mt-6 inline-flex">
          Business details
        </Link>
      </section>
    );
  }

  return (
    <SectionCard
      title="Venue details"
      help="Capacity, spaces, stay, food, rules, seasons, location and your 360° tour."
      shownOnProfile={Boolean(
        listing.venue?.spaceDetails?.length || listing.venue?.spaces?.length,
      )}
      seeOnProfileHref={publicProfileHref(listing, "spaces")}
    >
      <VenueFields
        venue={form.venue ?? { capacity: { min: 50, max: 200 }, spaces: [] }}
        portfolio={listing.portfolio}
        onChange={(venue) => apply({ venue }, { venue })}
      />
    </SectionCard>
  );
}