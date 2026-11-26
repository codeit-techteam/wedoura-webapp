"use client";

import { cn } from "@/lib/cn";
import { toggleSaved, useSaved } from "@/lib/saved";

type Props = {
  slug: string;
  name: string;
  className?: string;
};

/** Heart save control for the vendors directory only. */
export function VendorsHeartButton({ slug, name, className }: Props) {
  const saved = useSaved();
  const isSaved = saved.includes(slug);
  return (
    <button
      type="button"
      className={cn("ib svb", className)}
      aria-pressed={isSaved}
      aria-label={isSaved ? `Remove ${name} from shortlist` : `Save ${name} to shortlist`}
      onClick={() => toggleSaved(slug, "vendor")}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" />
      </svg>
    </button>
  );
}
