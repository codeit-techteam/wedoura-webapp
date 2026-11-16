"use client";

import Link from "next/link";
import { useState } from "react";
import { ScreenHeader } from "@/components/studio/Field";
import { checklistProgress, computeChecklist } from "@/components/studio/checklist";
import { ScreenSkeleton } from "@/components/studio/screen";
import { STATUS_EXPLANATION, StatusBadge } from "@/components/studio/status";
import { submitListingForReview, useMyListing } from "@/lib/vendor-api";

export default function SubmitPage() {
  const listing = useMyListing();
  const [error, setError] = useState<string | null>(null);
  if (!listing) return <ScreenSkeleton />;

  const items = computeChecklist(listing);
  const { done, total, complete } = checklistProgress(items);
  const canSubmit = complete && (listing.status === "draft" || listing.status === "changes_requested");

  return (
    <div className="max-w-2xl">
      <ScreenHeader title="Submit for review" right={<StatusBadge status={listing.status} />} />
      <p className="mt-5 max-w-prose text-body text-mute">{STATUS_EXPLANATION[listing.status]}</p>

      {listing.status === "changes_requested" && listing.reviewNote && (
        <div className="mt-5 border border-gold bg-white p-5" role="status">
          <p className="label text-mute">What the review asked for</p>
          <p className="mt-2 text-body">{listing.reviewNote}</p>
        </div>
      )}

      {(listing.status === "draft" || listing.status === "changes_requested") && (
        <>
          <ul className="mt-8 border-t border-line bg-white" aria-label="Checklist">
            {items.map((item) => (
              <li key={item.key} className="flex items-center justify-between gap-6 border-b border-line px-4 py-3">
                <span className={item.done ? "text-small text-mute line-through" : "text-small text-ink"}>{item.label}</span>
                {item.done ? (
                  <span className="label text-mute">Done</span>
                ) : (
                  <Link href={item.href} className="link-draw label text-ink">
                    Add
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-5 max-w-prose text-small text-mute">
            {complete
              ? "Everything is in place. We review profiles by hand, usually within a few days, and nothing locks while you wait — you can keep editing."
              : `${total - done} item${total - done === 1 ? "" : "s"} left before you can submit.`}
          </p>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => {
              void submitListingForReview().then((r) => setError(r.ok ? null : r.error));
            }}
            className="label tap mt-6 inline-flex items-center justify-center bg-ink px-7 py-3.5 text-white transition-chrome hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            Submit for review
          </button>
          {error && (
            <p className="mt-3 text-small text-ink" role="alert">
              {error}
            </p>
          )}
        </>
      )}

      {listing.status === "in_review" && (
        <p className="mt-8 border border-line bg-white p-5 text-body text-mute" role="status">
          Submitted. You will see the result here — published, or a note with what to change.
        </p>
      )}

      {listing.status === "published" && (
        <p className="mt-8 border border-line bg-white p-5 text-body text-mute">
          Your profile is live at <span className="text-ink">/vendors/{listing.slug}</span>. Text edits go live at
          once; new photos and films are reviewed first.
        </p>
      )}
    </div>
  );
}
