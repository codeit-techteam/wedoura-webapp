"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { BottomSheet } from "@/components/browse/BottomSheet";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { patchedHref, type ParamRecord } from "@/lib/url";

export type FilterOption = { value: string; label: string };

type SelectProps = {
  param: string;
  label: string;
  options: FilterOption[];
  allLabel?: string;
  /** The page's pathname and current query params, from the server component. */
  pathname: string;
  params: ParamRecord;
  className?: string;
};

/** One labelled select that patches its URL parameter on change. */
export function FilterSelect({ param, label, options, allLabel = "All", pathname, params, className }: SelectProps) {
  const router = useRouter();
  const value = params[param] ?? "";
  return (
    <label className={cn("relative flex min-w-0 flex-col gap-1", className)}>
      <span className="label text-mute">{label}</span>
      <select
        value={options.some((o) => o.value === value) ? value : ""}
        onChange={(e) =>
          router.replace(patchedHref(pathname, params, { [param]: e.target.value || null, show: null }), {
            scroll: false,
          })
        }
        className="tap w-full cursor-pointer appearance-none border-b border-line bg-transparent pr-7 pb-2 text-body text-ink outline-offset-4"
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon name="chevron-down" size={16} className="pointer-events-none absolute right-1 bottom-3 text-mute" />
    </label>
  );
}

type BarProps = {
  /** The selects, laid out in a row on desktop and in a sheet on mobile. */
  children: ReactNode;
  /** "24 vendors" etc. */
  count: string;
  /** How many filters are active, shown on the mobile button. */
  activeCount: number;
  /** Href that clears every filter (built on the server). */
  clearHref?: string;
  className?: string;
};

/**
 * The filter bar: sticky under the navbar on desktop; on mobile a single
 * button that opens the same controls in a bottom sheet.
 */
export function FilterBar({ children, count, activeCount, clearHref, className }: BarProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("border-b border-line bg-white", className)}>
      <div className="container-site flex items-center justify-between gap-6 py-3 md:py-4">
        {/* Mobile: one button into the sheet. */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="tap inline-flex items-center gap-2 text-label-lg font-medium text-ink md:hidden"
          aria-haspopup="dialog"
        >
          <Icon name="menu" size={18} />
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>

        {/* Desktop: the selects inline. */}
        <div className="hidden flex-1 items-end gap-8 md:flex xl:gap-12">{children}</div>

        <div className="flex shrink-0 items-center gap-5">
          <p className="text-small text-mute" aria-live="polite">
            {count}
          </p>
          {clearHref && activeCount > 0 && (
            <Link href={clearHref} scroll={false} className="link-draw hidden text-small text-ink md:inline">
              Clear
            </Link>
          )}
        </div>
      </div>

      <div className="md:hidden">
        <BottomSheet open={open} onClose={() => setOpen(false)} title="Filters">
          <div className="flex flex-col gap-7">{children}</div>
          {clearHref && activeCount > 0 && (
            <Link
              href={clearHref}
              scroll={false}
              onClick={() => setOpen(false)}
              className="link-draw mt-7 inline-block text-small text-ink"
            >
              Clear all filters
            </Link>
          )}
        </BottomSheet>
      </div>
    </div>
  );
}
