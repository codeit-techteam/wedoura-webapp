"use client";

import Image from "next/image";
import Link from "next/link";
import { Photo } from "@/components/media/Photo";
import type { CategoryWithCount } from "@/lib/api";
import { patchedHref, type ParamRecord } from "@/lib/url";

type Props = {
  pathname: string;
  params: ParamRecord;
  categories: CategoryWithCount[];
  activeCategory?: string;
  onOpenCategories?: () => void;
};

/**
 * Horizontally scrolling 4:5 category tiles for the vendors directory only.
 */
export function VendorsCategoryRail({
  pathname,
  params,
  categories,
  activeCategory,
  onOpenCategories,
}: Props) {
  const withVendors = categories.filter((c) => c.count > 0);
  const totalListed = withVendors.reduce((n, c) => n + c.count, 0);

  return (
    <div className="ctiles" role="group" aria-label="Browse by category">
      <Link
        href={patchedHref(pathname, params, { category: null, show: null })}
        scroll={false}
        className="ct"
        aria-pressed={!activeCategory}
      >
        <span className="im relative block">
          <Image
            src="/ref/vendors-final/image-01.webp"
            alt=""
            fill
            sizes="160px"
            className="object-cover"
          />
        </span>
        <b>All vendors</b>
        <small>{totalListed} listed</small>
      </Link>

      {withVendors.map((cat) => {
        const href = patchedHref(pathname, params, { category: cat.slug, show: null });
        const pressed = activeCategory === cat.slug;
        return (
          <Link key={cat.slug} href={href} scroll={false} className="ct" aria-pressed={pressed}>
            <span className="im relative block">
              {cat.cover ? (
                <Photo
                  photo={cat.cover}
                  mode="cover"
                  sizes="160px"
                  className="!absolute inset-0 h-full w-full object-cover"
                />
              ) : null}
            </span>
            <b>{cat.shortName || cat.name}</b>
            <small>{cat.count} listed</small>
          </Link>
        );
      })}

      <button type="button" className="ct more" onClick={onOpenCategories}>
        <span className="im" aria-hidden="true">
          +
        </span>
        <b>All categories</b>
        <small>Browse the list</small>
      </button>
    </div>
  );
}
