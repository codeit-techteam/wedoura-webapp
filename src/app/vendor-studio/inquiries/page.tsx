"use client";

import { useState } from "react";
import { ScreenHeader } from "@/components/studio/Field";
import { ScreenSkeleton } from "@/components/studio/screen";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import type { InquiryStatus } from "@/data/types";
import { cn } from "@/lib/cn";
import { setInquiryStatus, useMyInquiries, useMyListing, useSessionHydrated } from "@/lib/vendor-api";

const STATUS: { value: InquiryStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "replied", label: "Replied" },
  { value: "closed", label: "Closed" },
];

const longDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" });

export default function InquiriesPage() {
  const hydrated = useSessionHydrated();
  const listing = useMyListing();
  const inquiries = useMyInquiries();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  if (!hydrated || !listing) return <ScreenSkeleton />;

  const selected = inquiries.find((i) => i.id === selectedId) ?? null;

  if (inquiries.length === 0) {
    return (
      <div className="max-w-3xl">
        <ScreenHeader title="Inquiries" text="Messages from couples land here and on your WhatsApp." />
        <div className="mt-8">
          <EmptyState title="No inquiries yet." text="Once your profile is live, messages from couples appear here." tone="white" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <ScreenHeader title="Inquiries" text={`${inquiries.filter((i) => i.status === "new").length} new of ${inquiries.length}.`} />
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* List */}
        <ul className="border-t border-line bg-white" aria-label="Inquiries">
          {inquiries.map((inquiry) => (
            <li key={inquiry.id} className="border-b border-line">
              <button
                type="button"
                onClick={() => setSelectedId(inquiry.id)}
                aria-expanded={selected?.id === inquiry.id}
                className={cn("tap block w-full px-4 py-3 text-left transition-chrome hover:bg-ivory", selected?.id === inquiry.id && "bg-ivory")}
              >
                <span className="flex items-baseline justify-between gap-4">
                  <span className={cn("truncate text-body", inquiry.status === "new" ? "font-medium text-ink" : "text-ink")}>
                    {inquiry.name}
                    {inquiry.partner ? ` & ${inquiry.partner}` : ""}
                  </span>
                  <span className={cn("label shrink-0", inquiry.status === "new" ? "text-ink" : "text-mute")}>{inquiry.status}</span>
                </span>
                <span className="mt-1 block truncate text-small text-mute">
                  {inquiry.city} · {inquiry.message}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* Detail */}
        {selected ? (
          <article className="border border-line bg-white p-5" aria-label={`Inquiry from ${selected.name}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-serif text-h3">
                  {selected.name}
                  {selected.partner ? ` & ${selected.partner}` : ""}
                </h2>
                <p className="mt-1 text-small text-mute">
                  {selected.city}
                  {selected.date ? ` · Wedding on ${longDate.format(new Date(selected.date))}` : ""} · received{" "}
                  {longDate.format(new Date(selected.createdAt))}
                </p>
              </div>
              <div className="flex gap-1.5" role="group" aria-label="Inquiry status">
                {STATUS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => void setInquiryStatus(selected.id, s.value)}
                    aria-pressed={selected.status === s.value}
                    className={cn(
                      "label tap border px-3 py-1.5 transition-chrome",
                      selected.status === s.value ? "border-ink bg-ink text-white" : "border-line text-mute hover:border-ink hover:text-ink",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-5 max-w-prose text-body">{selected.message}</p>
            <a
              href={`https://wa.me/${selected.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                `Hi ${selected.name}, thank you for writing to ${listing.name} on Wedoura.`,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="label tap mt-6 inline-flex items-center gap-2 bg-ink px-5 py-2.5 text-white transition-chrome hover:bg-black"
            >
              <Icon name="whatsapp" size={18} />
              Reply on WhatsApp
            </a>
          </article>
        ) : (
          <p className="hidden border border-line bg-white p-5 text-small text-mute lg:block">Choose an inquiry to read it.</p>
        )}
      </div>
    </div>
  );
}
