"use client";

import { AnimatePresence, motion } from "motion/react";
import { UnderlineTabs } from "@/components/browse/UnderlineTabs";
import { PhotoGrid, type PhotoLink } from "@/components/media/PhotoGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import type { CategorySlug, Photo } from "@/data/types";
import { EASE } from "@/lib/motion";
import { useParamState } from "@/lib/url-state";

export type WallItem = {
  photo: Photo;
  category?: CategorySlug;
  link?: PhotoLink;
};

type Props = {
  items: WallItem[];
  categories: { value: string; label: string }[];
};

/** The /gallery wall: category tabs over the uncropped grid with viewer. */
export function GalleryWall({ items, categories }: Props) {
  const [category, setCategory] = useParamState("category");
  const shown = category ? items.filter((i) => i.category === category) : items;
  const links: Record<string, PhotoLink> = {};
  for (const item of shown) if (item.link) links[item.photo.id] = item.link;

  return (
    <div>
      <UnderlineTabs param="category" label="Photo categories" tabs={categories} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={category || "all"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="mt-10"
        >
          {shown.length === 0 ? (
            <EmptyState
              title="No photographs here yet."
              action={{ label: "Show everything", onClick: () => setCategory(null) }}
            />
          ) : (
            <PhotoGrid photos={shown.map((i) => i.photo)} links={links} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
