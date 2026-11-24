"use client";

import Link from "next/link";
import { Inbox, MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/studio/EmptyState";
import { checklistProgress, computeChecklist } from "@/components/studio/checklist";
import { ScreenSkeleton } from "@/components/studio/screen";
import { STATUS_EXPLANATION, StatusBadge } from "@/components/studio/status";
import type { Inquiry } from "@/data/types";
import { INQUIRY_STATUS_LABEL, inquiryWeddingLabel } from "@/lib/inquiry";
import { useMyInquiries, useMyListing } from "@/lib/vendor-api";

function daysAgo(iso: string): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY;
  return (Date.now() - then) / (1000 * 60 * 60 * 24);
}

function timeReceived(iso: string): string {
  const days = daysAgo(iso);
  if (days < 1) return "Today";
  if (days < 2) return "Yesterday";
  if (days < 7) return `${Math.floor(days)} days ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function whatsappHref(inquiry: Inquiry): string | undefined {
  const digits = inquiry.whatsapp.replace(/\D/g, "");
  if (!digits) return undefined;
  const phone = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${phone}`;
}

function ProgressRing({ pct }: { pct: number }) {
  const size = 72;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(100, Math.max(0, pct)) / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

export default function OverviewPage() {
  const listing = useMyListing();
  const inquiries = useMyInquiries();
  if (!listing) return <ScreenSkeleton />;

  const items = computeChecklist(listing);
  const { done, total, complete } = checklistProgress(items);
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const unfinished = items.filter((item) => !item.done);

  const year = new Date().getFullYear();
  const newLast7 = inquiries.filter((i) => daysAgo(i.createdAt) <= 7).length;
  const awaitingReply = inquiries.filter((i) => i.status === "new").length;
  const bookedThisYear = inquiries.filter((i) => {
    if (i.status !== "booked") return false;
    const y = new Date(i.updatedAt || i.createdAt).getFullYear();
    return y === year;
  }).length;

  const latest = [...inquiries]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const stats = [
    { label: "New enquiries", hint: "Last 7 days", value: String(newLast7) },
    { label: "Awaiting your reply", hint: "New", value: String(awaitingReply) },
    { label: "Booked this year", hint: String(year), value: String(bookedThisYear) },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h2 className="font-serif text-[length:var(--text-dash-title)] leading-[var(--text-dash-title--line-height)] text-ink">
          Welcome back, <em className="text-gold">{listing.name}</em>
        </h2>
      </header>

      <section className="studio-card" aria-label="Listing status">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={listing.status} />
        </div>
        <p className="mt-3 max-w-prose text-[length:var(--text-dash-body)] text-mute">
          {STATUS_EXPLANATION[listing.status]}
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="studio-card">
            <p className="font-serif text-[2rem] leading-none text-ink">{s.value}</p>
            <p className="mt-3 font-sans text-[length:var(--text-dash-body)] text-ink">{s.label}</p>
            <p className="mt-1 text-[length:var(--text-dash-help)] text-mute">{s.hint}</p>
          </div>
        ))}
      </div>

      <section className="studio-card" aria-label="Latest enquiries">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="studio-section-title">Latest enquiries</h3>
          <Link href="/vendor-studio/enquiries" className="studio-top-link">
            View all
          </Link>
        </div>
        {latest.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No enquiries yet. Couples will appear here when they write to you."
            action={
              <Link href="/vendor-studio/profile" className="studio-btn">
                Finish your profile
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {latest.map((inquiry) => {
              const wa = whatsappHref(inquiry);
              return (
                <li
                  key={inquiry.id}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-ink">
                      {inquiry.name}
                      {inquiry.partner ? ` & ${inquiry.partner}` : ""}
                    </p>
                    <p className="mt-1 text-[length:var(--text-dash-help)] text-mute">
                      {[
                        inquiryWeddingLabel(inquiry) !== "—"
                          ? `Wedding ${inquiryWeddingLabel(inquiry)}`
                          : null,
                        inquiry.city,
                        timeReceived(inquiry.createdAt),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p className="mt-1 label text-mute">{INQUIRY_STATUS_LABEL[inquiry.status]}</p>
                  </div>
                  {wa ? (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="studio-btn shrink-0"
                    >
                      Reply on WhatsApp
                    </a>
                  ) : (
                    <Link href="/vendor-studio/enquiries" className="studio-btn-ghost shrink-0">
                      Open enquiry
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="studio-card" aria-label="Complete your profile">
        <div className="mb-5 flex items-center gap-5">
          <ProgressRing pct={pct} />
          <div>
            <p className="font-serif text-[2rem] leading-none text-ink">{pct}%</p>
            <p className="mt-2 text-[length:var(--text-dash-help)] text-mute">Profile complete</p>
          </div>
        </div>
        {complete ? (
          <p className="text-[length:var(--text-dash-body)] text-ink">Your profile is complete</p>
        ) : (
          <ul className="divide-y divide-line" aria-label="Unfinished items">
            {unfinished.map((item) => (
              <li key={item.key} className="flex items-center justify-between gap-3 py-3">
                <span className="text-[length:var(--text-dash-body)] text-ink">{item.label}</span>
                <Link href={item.href} className="studio-top-link shrink-0">
                  Complete
                </Link>
              </li>
            ))}
          </ul>
        )}
        {complete && (listing.status === "draft" || listing.status === "changes_requested") ? (
          <Link href="/vendor-studio/profile#submit" className="studio-btn mt-6">
            Submit for review
          </Link>
        ) : null}
        {!complete && unfinished.length === 0 ? (
          <EmptyState icon={MessageSquare} title="Nothing left on the checklist." />
        ) : null}
      </section>
    </div>
  );
}
