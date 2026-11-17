"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { UnderlineTabs } from "@/components/browse/UnderlineTabs";
import { StoryCard } from "@/components/cards/StoryCard";
import { VendorCard } from "@/components/cards/VendorCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCardGrid } from "@/components/ui/Skeleton";
import type { RealWedding, VendorSummary } from "@/data/types";
import { EASE } from "@/lib/motion";
import { useSavedStories, useSavedVendors } from "@/lib/saved";
import { useParamState } from "@/lib/url-state";

type Props = {
  cityNames: Record<string, string>;
};

/** The /saved page body: vendors and stories in tabs, bookmark = remove.
 *  Only the shortlisted slugs are fetched (by-slugs endpoints), so the page
 *  stays the same size at any vendor count. */
export function SavedList({ cityNames }: Props) {
  const [tab] = useParamState("tab");
  const savedVendors = useSavedVendors();
  const savedStories = useSavedStories();
  // Fetched results are tagged with the slug list they answer; loading is
  // derived, never set synchronously.
  const [vendorData, setVendorData] = useState<{ key: string; items: VendorSummary[] } | null>(null);
  const [storyData, setStoryData] = useState<{ key: string; items: RealWedding[] } | null>(null);
  const showStories = tab === "stories";

  const vendorKey = savedVendors.join(",");
  const storyKey = savedStories.join(",");

  useEffect(() => {
    if (!vendorKey) return;
    const controller = new AbortController();
    fetch(`/api/vendors/by-slugs?slugs=${encodeURIComponent(vendorKey)}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { vendors: VendorSummary[] }) => setVendorData({ key: vendorKey, items: data.vendors }))
      .catch(() => {});
    return () => controller.abort();
  }, [vendorKey]);

  useEffect(() => {
    if (!storyKey) return;
    const controller = new AbortController();
    fetch(`/api/weddings/by-slugs?slugs=${encodeURIComponent(storyKey)}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { weddings: RealWedding[] }) => setStoryData({ key: storyKey, items: data.weddings }))
      .catch(() => {});
    return () => controller.abort();
  }, [storyKey]);

  // Saved order, like the store keeps it; removals apply instantly because
  // the saved slugs drive the list and stale fetches only ever shrink it.
  const vendorItems = vendorKey ? (vendorData?.items ?? null) : [];
  const storyItems = storyKey ? (storyData?.items ?? null) : [];
  const shownVendors = savedVendors
    .map((slug) => vendorItems?.find((v) => v.slug === slug))
    .filter((v): v is VendorSummary => v !== undefined);
  const shownStories = savedStories
    .map((slug) => storyItems?.find((w) => w.slug === slug))
    .filter((w): w is RealWedding => w !== undefined);
  const vendorsLoading = vendorItems === null;
  const storiesLoading = storyItems === null;

  return (
    <div>
      <UnderlineTabs
        param="tab"
        label="Saved"
        allLabel={`Vendors (${vendorsLoading ? savedVendors.length : shownVendors.length})`}
        tabs={[{ value: "stories", label: `Stories (${storiesLoading ? savedStories.length : shownStories.length})` }]}
      />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={showStories ? "stories" : "vendors"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="mt-8"
        >
          {showStories ? (
            storiesLoading ? (
              <SkeletonCardGrid count={Math.min(savedStories.length, 6)} />
            ) : shownStories.length === 0 ? (
              <EmptyState
                title="No stories saved yet."
                text="Tap the bookmark on any real wedding and it will wait for you here."
                action={{ label: "Read real weddings", href: "/real-weddings" }}
              />
            ) : (
              <ul className="grid grid-cols-1 gap-card-gap gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                {shownStories.map((wedding) => (
                  <li key={wedding.slug}>
                    <StoryCard
                      wedding={wedding}
                      cityName={cityNames[wedding.city]}
                      sizes="(min-width: 48rem) 33vw, 100vw"
                      variant="small"
                    />
                  </li>
                ))}
              </ul>
            )
          ) : vendorsLoading ? (
            <SkeletonCardGrid count={Math.min(savedVendors.length, 8)} />
          ) : shownVendors.length === 0 ? (
            <EmptyState
              title="Nothing saved yet."
              text="Tap the bookmark on any vendor and they will wait for you here."
              action={{ label: "Browse vendors", href: "/vendors" }}
            />
          ) : (
            <ul className="grid grid-cols-1 gap-card-gap gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {shownVendors.map((vendor) => (
                <li key={vendor.slug}>
                  <VendorCard vendor={vendor} />
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
