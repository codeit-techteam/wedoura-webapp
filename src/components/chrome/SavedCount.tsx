"use client";

import { useSavedCount } from "@/lib/saved";

/** Small count beside "Saved". Hidden at zero. */
export function SavedCount({ className }: { className?: string }) {
  const count = useSavedCount();
  if (count === 0) return null;
  return (
    <span
      aria-label={`${count} saved`}
      className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-current px-1 text-label tracking-normal ${className ?? ""}`}
    >
      {count}
    </span>
  );
}
