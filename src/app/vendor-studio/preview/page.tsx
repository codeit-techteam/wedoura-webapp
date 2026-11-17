"use client";

import { useEffect, useState } from "react";
import { VendorProfile } from "@/components/profile/VendorProfile";
import { ScreenSkeleton } from "@/components/studio/screen";
import type { Category, City } from "@/data/types";
import { listAllCategories, listAllCities } from "@/lib/api";
import { listingToDetail } from "@/lib/listing-view";
import { useMyListing } from "@/lib/vendor-api";

export default function PreviewPage() {
  const listing = useMyListing();
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  useEffect(() => {
    void listAllCategories().then(setCategories);
    void listAllCities().then(setCities);
  }, []);

  if (!listing || categories.length === 0 || cities.length === 0) return <ScreenSkeleton />;

  // The exact public mapper, including media still pending review.
  const detail = listingToDetail(listing, categories, cities, { includePending: true });

  return (
    <div className="-mx-gutter -my-8 lg:-mx-10 lg:-my-10">
      <div className="sticky top-0 z-40 border-b border-line bg-ivory px-gutter py-3" role="status">
        <p className="text-small text-mute">
          <span className="label text-ink">Preview</span> — this is your profile exactly as couples will see it.
          Media pending review is included here but hidden publicly.
        </p>
      </div>
      {/* Public components offset themselves against the site navbar; there is none here. */}
      <div style={{ "--nav-h": "0px" } as React.CSSProperties} className="bg-white">
        <VendorProfile
          vendor={detail}
          similar={[]}
          categoryFields={categories.find((c) => c.slug === listing.category)?.fields}
        />
      </div>
    </div>
  );
}
