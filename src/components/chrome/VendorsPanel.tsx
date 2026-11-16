"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { NavCategory } from "@/components/chrome/Navbar";
import { Photo } from "@/components/media/Photo";
import { Icon } from "@/components/ui/Icon";
import { EASE } from "@/lib/motion";

type Props = { categories: NavCategory[]; onNavigate: () => void };

/**
 * Compact panel under the navbar: the categories as short photo tiles
 * (160px) with the name beneath, so the whole panel stays around 280px.
 */
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
      <div className="container-wide py-5">
        <ul className="grid grid-cols-3 gap-x-2 gap-y-4 xl:grid-cols-6">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/vendors?category=${category.slug}`}
                onClick={onNavigate}
                className="group block outline-offset-4"
              >
                <span className="relative block h-40 overflow-hidden bg-ivory">
                  <Photo
                    photo={category.cover}
                    mode="cover"
                    sizes="(min-width: 90rem) 16vw, 33vw"
                    className="transition-transform duration-1200 ease-wedoura group-hover:scale-104"
                  />
                </span>
                <span className="mt-2 block text-label-lg font-medium">{category.shortName}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
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
