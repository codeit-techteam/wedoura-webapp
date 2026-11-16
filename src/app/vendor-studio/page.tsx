"use client";

import Link from "next/link";
import { ScreenHeader } from "@/components/studio/Field";
import { checklistProgress, computeChecklist } from "@/components/studio/checklist";
import { ScreenSkeleton } from "@/components/studio/screen";
import { STATUS_EXPLANATION, StatusBadge } from "@/components/studio/status";
import { useMyInquiries, useMyListing } from "@/lib/vendor-api";

const timeAgo = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return days <= 0 ? "Today" : days === 1 ? "Yesterday" : `${days} days ago`;
};

export default function OverviewPage() {
  const listing = useMyListing();
  const inquiries = useMyInquiries();
  if (!listing) return <ScreenSkeleton />;

  const items = computeChecklist(listing);
  const { done, total, complete } = checklistProgress(items);
  const pendingCount = listing.pendingMediaIds?.length ?? 0;
  const recent = inquiries.slice(0, 3);

  return (
    <div className="max-w-3xl">
      <ScreenHeader title="Overview" right={<StatusBadge status={listing.status} />} />

      <p className="mt-5 max-w-prose text-body text-mute">{STATUS_EXPLANATION[listing.status]}</p>

      {listing.status === "changes_requested" && listing.reviewNote && (
        <div className="mt-5 border border-gold bg-white p-5" role="status">
          <p className="label text-mute">Note from the review</p>
          <p className="mt-2 text-body">{listing.reviewNote}</p>
          <Link href="/vendor-studio/submit" className="link-draw mt-3 inline-block text-small text-ink">
            Make the changes, then submit again
          </Link>
        </div>
      )}

      {pendingCount > 0 && (
        <p className="mt-5 border border-line bg-white px-5 py-3 text-small text-mute">
          {pendingCount} new photo{pendingCount === 1 ? "" : "s"} or film{pendingCount === 1 ? " is" : "s are"} waiting
          for review and hidden from couples until approved.
        </p>
      )}

      {/* Checklist */}
      <section aria-label="Profile checklist" className="mt-10">
        <div className="flex items-baseline justify-between gap-6">
          <h2 className="font-serif text-h3">A complete profile</h2>
          <p className="label text-mute">
            {done} of {total}
          </p>
        </div>
        <div className="mt-3 h-1 w-full bg-line" aria-hidden="true">
          <div className="h-full bg-ink transition-all duration-700 ease-wedoura" style={{ width: `${(done / total) * 100}%` }} />
        </div>
        <ul className="mt-4 border-t border-line bg-white">
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
        {complete && (listing.status === "draft" || listing.status === "changes_requested") && (
          <Link
            href="/vendor-studio/submit"
            className="label tap mt-5 inline-flex items-center justify-center bg-ink px-6 py-3 text-white transition-chrome hover:bg-black"
          >
            Submit for review
          </Link>
        )}
      </section>

      {/* Recent inquiries */}
      <section aria-label="Recent inquiries" className="mt-12">
        <div className="flex items-baseline justify-between gap-6">
          <h2 className="font-serif text-h3">Recent inquiries</h2>
          <Link href="/vendor-studio/inquiries" className="link-draw label text-ink">
            All inquiries
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-4 text-small text-mute">Nothing yet. Inquiries from couples land here.</p>
        ) : (
          <ul className="mt-4 border-t border-line bg-white">
            {recent.map((inquiry) => (
              <li key={inquiry.id} className="border-b border-line">
                <Link href="/vendor-studio/inquiries" className="block px-4 py-3 transition-chrome hover:bg-ivory">
                  <span className="flex items-baseline justify-between gap-4">
                    <span className="text-body font-medium">
                      {inquiry.name}
                      {inquiry.partner ? ` & ${inquiry.partner}` : ""} · {inquiry.city}
                    </span>
                    <span className="label shrink-0 text-mute">{timeAgo(inquiry.createdAt)}</span>
                  </span>
                  <span className="mt-1 block truncate text-small text-mute">{inquiry.message}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
