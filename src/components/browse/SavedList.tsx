"use client";

import { AnimatePresence, motion } from "motion/react";
import { UnderlineTabs } from "@/components/browse/UnderlineTabs";
import { StoryCard } from "@/components/cards/StoryCard";
import { VendorCard, type VendorCardData } from "@/components/cards/VendorCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { RealWedding } from "@/data/types";
import { EASE } from "@/lib/motion";
import { useSavedStories, useSavedVendors } from "@/lib/saved";
import { useParamState } from "@/lib/url-state";

type Props = {
  vendors: VendorCardData[];
  weddings: RealWedding[];
  cityNames: Record<string, string>;
};

/** The /saved page body: vendors and stories in tabs, bookmark = remove. */
export function SavedList({ vendors, weddings, cityNames }: Props) {
  const [tab] = useParamState("tab");
  const savedVendors = useSavedVendors();
  const savedStories = useSavedStories();
  const shownVendors = vendors.filter((v) => savedVendors.includes(v.slug));
  const shownStories = weddings.filter((w) => savedStories.includes(w.slug));
  const showStories = tab === "stories";

  return (
    <div>
      <UnderlineTabs
        param="tab"
        label="Saved"
        allLabel={`Vendors (${shownVendors.length})`}
        tabs={[{ value: "stories", label: `Stories (${shownStories.length})` }]}
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
            shownStories.length === 0 ? (
              <EmptyState
                title="No stories saved yet."
                text="Tap the bookmark on any real wedding and it will wait for you here."
                action={{ label: "Read real weddings", href: "/real-weddings" }}
              />
            ) : (
              <ul className="grid grid-cols-1 gap-2 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
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
          ) : shownVendors.length === 0 ? (
            <EmptyState
              title="Nothing saved yet."
              text="Tap the bookmark on any vendor and they will wait for you here."
              action={{ label: "Browse vendors", href: "/vendors" }}
            />
          ) : (
            <ul className="grid grid-cols-2 gap-2 gap-y-8 xl:grid-cols-4">
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
