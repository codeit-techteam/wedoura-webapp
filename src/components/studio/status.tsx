"use client";

import type { ListingStatus } from "@/data/types";
import { cn } from "@/lib/cn";

export const STATUS_LABEL: Record<ListingStatus, string> = {
  draft: "Draft",
  in_review: "In review",
  changes_requested: "Changes requested",
  published: "Published",
  unpublished: "Unpublished",
};

/** Plain-words explanation shown on the overview. */
export const STATUS_EXPLANATION: Record<ListingStatus, string> = {
  draft: "Only you can see this profile. Finish the checklist, then submit it for review.",
  in_review: "Wedoura is reviewing your profile. You will see the result here, usually within a few days.",
  changes_requested: "We looked at your profile and need a few changes before it can go live. See the note below, make the edits, then submit again.",
  published: "Your profile is live. Text edits go live at once; new photos and films are checked before couples see them.",
  unpublished: "Your profile has been taken off the public site. Write to us if this is unexpected.",
};

export function StatusBadge({ status, className }: { status: ListingStatus; className?: string }) {
  return (
    <span
      className={cn(
        "label inline-flex items-center gap-2 border px-3 py-1.5",
        status === "published" ? "border-ink text-ink" : "border-line text-mute",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          status === "published" ? "bg-ink" : status === "changes_requested" ? "bg-gold" : "bg-line",
        )}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}
