"use client";

import { ScreenHeader } from "@/components/studio/Field";
import { PhotoManager } from "@/components/studio/PhotoManager";
import { SaveState } from "@/components/studio/autosave";
import { ScreenSkeleton, useListingForm } from "@/components/studio/screen";
import type { Photo } from "@/data/types";

export default function PhotosPage() {
  const { listing, form, apply, status, error } = useListingForm<{ portfolio: Photo[] }>((l) => ({
    portfolio: l.portfolio,
  }));
  if (!form || !listing) return <ScreenSkeleton />;

  return (
    <div className="max-w-4xl">
      <ScreenHeader
        title="Photos"
        text={`Your portfolio, shown whole on your profile. ${form.portfolio.length} of at least 12. The first photos are what couples see first.`}
        right={<SaveState status={status} error={error} />}
      />
      <div className="mt-8">
        <PhotoManager
          photos={form.portfolio}
          onChange={(portfolio) => apply({ portfolio }, { portfolio })}
          pendingIds={listing.pendingMediaIds}
          hint="JPEG or PNG, at least 800px on the long edge. Aim for 12 or more."
        />
      </div>
    </div>
  );
}
