"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { NavCategory } from "@/components/chrome/Navbar";
import { CardRow } from "@/components/media/CardRow";
import { PhotoCard } from "@/components/media/PhotoCard";
import { Icon } from "@/components/ui/Icon";
import { EASE } from "@/lib/motion";

type Props = { categories: NavCategory[]; onNavigate: () => void };

/** Full-width panel under the navbar: the six categories as photo tiles. */
export function VendorsPanel({ categories, onNavigate }: Props) {
  return (
    <motion.div
      id="vendors-panel"
      role="region"
      aria-label="Vendor categories"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="absolute inset-x-0 top-full border-b border-line bg-white text-ink"
    >
      <div className="container-wide py-8 xl:py-10">
        <CardRow ratio="4/5" columns={6} mobileColumns={2} className="gap-y-6">
          {categories.map((category) => (
            <li key={category.slug}>
              <PhotoCard
                photo={category.cover}
                sizes="(min-width: 90rem) 16vw, 33vw"
                href={`/vendors?category=${category.slug}`}
                compact
                title={category.name}
              />
            </li>
          ))}
        </CardRow>
        <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
          <p className="text-small text-mute">Browse by category, or see everyone in one place.</p>
          <Link
            href="/vendors"
            onClick={onNavigate}
            className="nav-link inline-flex tap items-center gap-2 border-b border-transparent transition-chrome hover:border-current"
          >
            See all vendors
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
