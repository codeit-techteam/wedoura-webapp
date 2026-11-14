"use client";

import { AnimatePresence, motion } from "motion/react";
import { UnderlineTabs } from "@/components/browse/UnderlineTabs";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { BlogPost } from "@/data/types";
import { EASE } from "@/lib/motion";
import { useParamState } from "@/lib/url-state";

type Props = {
  posts: BlogPost[];
  categories: string[];
};

/** The /blogs listing: category tabs over article cards, URL-driven. */
export function BlogBrowser({ posts, categories }: Props) {
  const [category, setCategory] = useParamState("category");
  const shown = category ? posts.filter((p) => p.category.toLowerCase() === category.toLowerCase()) : posts;

  return (
    <div>
      <UnderlineTabs
        param="category"
        label="Article categories"
        tabs={categories.map((c) => ({ value: c.toLowerCase(), label: c }))}
      />
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
              title="Nothing written here yet."
              text="More articles are on the way. Read everything in the meantime."
              action={{ label: "All articles", onClick: () => setCategory(null) }}
            />
          ) : (
            <ul className="grid grid-cols-1 gap-2 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((post, i) => (
                <li key={post.slug}>
                  <ArticleCard post={post} delay={(i % 3) * 0.08} />
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
