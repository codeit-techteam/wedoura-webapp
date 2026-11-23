"use client";

import Link from "next/link";
import { checklistProgress, computeChecklist } from "@/components/studio/checklist";
import { ScreenSkeleton } from "@/components/studio/screen";
import { STATUS_EXPLANATION, StatusBadge } from "@/components/studio/status";
import type { InquiryStage } from "@/data/types";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/format";
import { useMyInquiries, useMyListing } from "@/lib/vendor-api";

const STAGE: InquiryStage[] = ["new", "contacted", "quote_sent", "booked", "lost"];

function DoneMark({ done }: { done: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full border",
        done ? "border-ink bg-ink text-white" : "border-ink bg-white",
      )}
    >
      {done ? "✓" : ""}
    </span>
  );
}

export default function OverviewPage() {
  const listing = useMyListing();
  const inquiries = useMyInquiries();
  if (!listing) return <ScreenSkeleton />;

  const items = computeChecklist(listing);
  const { done, total, complete } = checklistProgress(items);
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const byStage = (s: InquiryStage) => inquiries.filter((i) => (i.stage ?? "new") === s);
  const open = inquiries.filter((i) => (i.stage ?? "new") !== "lost" && (i.stage ?? "new") !== "booked");
  const due = open
    .filter((i) => i.followUpOn && i.followUpOn <= new Date().toISOString().slice(0, 10))
    .sort((a, b) => (a.followUpOn ?? "").localeCompare(b.followUpOn ?? ""));
  const quoteSum = inquiries
    .filter((i) => (i.stage ?? "new") === "quote_sent" || (i.stage ?? "new") === "booked")
    .reduce((a, i) => a + (i.quoteINR ?? 0), 0);

  const stats = [
    { label: "New enquiries", value: String(byStage("new").length) },
    { label: "Open pipeline", value: String(open.length) },
    { label: "Booked", value: String(byStage("booked").length) },
    { label: "Quotes sent", value: quoteSum > 0 ? formatINR(quoteSum) : String(byStage("quote_sent").length) },
  ];

  return (
    <div>
      <header className="mb-10">
        <p className="label text-gold-deep">Overview</p>
        <h1 className="mt-3 font-serif text-h1 text-ink">
          Welcome back, <em>{listing.name.split(" ")[0]}</em>
        </h1>
        <p className="mt-4 max-w-prose italic text-mute">
          Your enquiries, calendar and profile — in one place.
        </p>
        <div className="mt-4">
          <StatusBadge status={listing.status} />
          <p className="mt-3 max-w-prose text-small text-mute">{STATUS_EXPLANATION[listing.status]}</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="border border-line bg-white p-5">
            <b className="block font-serif text-[clamp(2rem,4vw,3rem)] font-normal leading-tight">{s.value}</b>
            <span className="mt-2 block text-small text-mute">{s.label}</span>
          </div>
        ))}
      </div>

      {due.length > 0 ? (
        <section className="mt-8 border border-line bg-sand/60 p-6" aria-label="Needs attention">
          <h2 className="font-serif text-h3">Needs attention</h2>
          <ul className="mt-4 divide-y divide-line">
            {due.map((i) => (
              <li key={i.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                <span>
                  {i.name}
                  {i.partner ? ` & ${i.partner}` : ""} · follow up {i.followUpOn}
                </span>
                <Link href="/vendor-studio/leads" className="border-b border-gold pb-0.5 text-small">
                  Open lead
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="border border-line bg-sand/40 p-6">
          <div className="mb-4 flex items-center gap-5">
            <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r="28" fill="none" stroke="var(--color-line)" strokeWidth="4" />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="var(--color-gold)"
                strokeWidth="4"
                strokeDasharray={`${(pct / 100) * 176} 176`}
                strokeLinecap="round"
                transform="rotate(-90 32 32)"
              />
            </svg>
            <div>
              <b className="font-serif text-[2.5rem] font-normal">{pct}%</b>
              <p className="text-small text-mute">Profile complete</p>
            </div>
          </div>
          <ul className="divide-y divide-line" aria-label="Profile checklist">
            {items.map((item) => (
              <li key={item.key} className="flex items-center gap-3 py-3">
                <DoneMark done={item.done} />
                <span className={cn("flex-1", item.done && "text-mute line-through")}>{item.label}</span>
                {!item.done ? (
                  <Link href={item.href} className="border-b border-gold pb-0.5 text-small">
                    Do this
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
          {complete && (listing.status === "draft" || listing.status === "changes_requested") ? (
            <Link
              href="/vendor-studio/profile#submit"
              className="mt-6 inline-flex min-h-12 items-center bg-ink px-6 font-sans text-button font-medium tracking-button text-ivory uppercase"
            >
              Submit for review
            </Link>
          ) : null}
        </section>

        <section className="border border-line bg-white p-6">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-serif text-h3">Pipeline</h2>
            <Link href="/vendor-studio/leads" className="border-b border-gold pb-0.5 text-small">
              All leads
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {STAGE.map((s) => (
              <li key={s} className="flex justify-between py-3 text-small">
                <span className="capitalize text-mute">{s.replace("_", " ")}</span>
                <span>{byStage(s).length}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
