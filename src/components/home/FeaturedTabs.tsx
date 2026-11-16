"use client";

import { AnimatePresence, motion } from "motion/react";
import { UnderlineTabs } from "@/components/browse/UnderlineTabs";
import { VendorCard, type VendorCardData } from "@/components/cards/VendorCard";
import { EASE } from "@/lib/motion";
import { useParamState } from "@/lib/url-state";

type Props = {
  vendors: VendorCardData[];
  tabs: { slug: string; name: string }[];
};

/** Home: category tabs (URL-driven) over a near-edge-to-edge vendor grid. */
export function FeaturedTabs({ vendors, tabs }: Props) {
  const [category] = useParamState("category");
  const shown = category ? vendors.filter((v) => v.category === category) : vendors;

  return (
    <div>
      <UnderlineTabs
        param="category"
        label="Vendor categories"
        tabs={tabs.map((t) => ({ value: t.slug, label: t.name }))}
      />
      <AnimatePresence mode="wait" initial={false}>
        <motion.ul
          key={category || "all"}
          className="mt-6 grid grid-cols-2 gap-2 gap-y-8 md:mt-8 xl:grid-cols-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          {shown.map((vendor) => (
            <li key={vendor.slug}>
              <VendorCard vendor={vendor} />
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>
    </div>
  );
}
