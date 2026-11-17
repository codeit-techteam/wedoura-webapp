"use client";

import Link from "next/link";
import { ScreenHeader, StudioCard } from "@/components/studio/Field";
import { checklistProgress, computeChecklist } from "@/components/studio/checklist";
import { ScreenSkeleton } from "@/components/studio/screen";
import { STATUS_EXPLANATION, StatusBadge } from "@/components/studio/status";
import { cn } from "@/lib/cn";
import { useMyInquiries, useMyListing } from "@/lib/vendor-api";

const timeAgo = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return days <= 0 ? "Today" : days === 1 ? "Yesterday" : `${days} days ago`;
};

/** A small done/open mark for checklist rows. */
function DoneMark({ done }: { done: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-5 shrink-0 items-center justify-center border transition-chrome",
        done ? "border-ink bg-ink text-white" : "border-line bg-white",
      )}
    >
      {done && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-3">
          <path d="m5 13 4.5 4.5L19 7" />
        </svg>
      )}
    </span>
  );
}

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
      <ScreenHeader
        title="Overview"
        text="Where your profile stands, what is left to do and who has written."
        right={<StatusBadge status={listing.status} />}
      />

      <div className="mt-8 grid gap-6">
        {/* Status */}
        <StudioCard title="Status" right={<StatusBadge status={listing.status} />}>
          <p className="max-w-prose text-body text-mute">{STATUS_EXPLANATION[listing.status]}</p>

          {listing.status === "changes_requested" && listing.reviewNote && (
            <div className="mt-5 border border-gold bg-ivory/60 p-4" role="status">
              <p className="label text-mute">Note from the review</p>
              <p className="mt-2 text-body">{listing.reviewNote}</p>
              <Link href="/vendor-studio/submit" className="link-draw mt-3 inline-block text-small text-ink">
                Make the changes, then submit again
              </Link>
            </div>
          )}

          {pendingCount > 0 && (
            <p className="mt-5 flex items-start gap-2.5 border-t border-line pt-4 text-small text-mute">
              <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
              <span>
                {pendingCount} new photo{pendingCount === 1 ? "" : "s"} or film{pendingCount === 1 ? " is" : "s are"}{" "}
                waiting for review and hidden from couples until approved.{" "}
                <Link href="/vendor-studio/photos" className="link-draw text-ink">
                  See photos
                </Link>
              </span>
            </p>
          )}
        </StudioCard>

        {/* Checklist */}
        <StudioCard
          title="A complete profile"
          right={
            <p className="label text-mute">
              {done} of {total}
            </p>
          }
        >
          <div aria-label={`${done} of ${total} checklist items done`} className="h-1 w-full bg-line" role="img">
            <div
              className="h-full bg-ink transition-all duration-700 ease-wedoura"
              style={{ width: `${(done / total) * 100}%` }}
            />
          </div>
          <ul className="mt-5 divide-y divide-line border-t border-line" aria-label="Profile checklist">
            {items.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="tap group flex items-center gap-3.5 py-3 transition-chrome hover:bg-ivory/60"
                >
                  <DoneMark done={item.done} />
                  <span className={cn("min-w-0 flex-1 text-body", item.done ? "text-mute" : "text-ink")}>
                    {item.label}
                  </span>
                  <span className={cn("label shrink-0", item.done ? "text-mute" : "text-ink")}>
                    {item.done ? "Edit" : "Add"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {complete && (listing.status === "draft" || listing.status === "changes_requested") && (
            <Link
              href="/vendor-studio/submit"
              className="label tap mt-6 inline-flex items-center justify-center bg-ink px-6 py-3 text-white transition-chrome hover:bg-black"
            >
              Submit for review
            </Link>
          )}
        </StudioCard>

        {/* Recent inquiries */}
        <StudioCard
          title="Recent inquiries"
          right={
            <Link href="/vendor-studio/inquiries" className="link-draw label text-ink">
              All inquiries
            </Link>
          }
        >
          {recent.length === 0 ? (
            <p className="text-small text-mute">Nothing yet. Inquiries from couples land here.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((inquiry) => (
                <li key={inquiry.id}>
                  <Link
                    href="/vendor-studio/inquiries"
                    className="block py-3 transition-chrome hover:bg-ivory/60"
                  >
                    <span className="flex items-baseline justify-between gap-4">
                      <span className="min-w-0 truncate text-body font-medium">
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
        </StudioCard>
      </div>
    </div>
  );
}
