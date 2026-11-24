"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EmptyState } from "@/components/studio/EmptyState";
import { Inbox } from "lucide-react";
import type { Inquiry, InquiryCloseReason, InquiryStatus } from "@/data/types";
import { cn } from "@/lib/cn";
import { useFocusTrap } from "@/lib/focus-trap";
import {
  INQUIRY_CLOSE_LABEL,
  INQUIRY_SOURCE_LABEL,
  INQUIRY_STATUS_LABEL,
  inquiryWeddingLabel,
  inquiryWhatsAppMessage,
} from "@/lib/inquiry";
import { updateInquiry, useMyInquiries, useMyListing } from "@/lib/vendor-api";

type Tab = "all" | InquiryStatus;

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "replied", label: "Replied" },
  { id: "booked", label: "Booked" },
  { id: "closed", label: "Closed" },
];

const CLOSE_REASONS: InquiryCloseReason[] = [
  "not_available",
  "budget",
  "no_response",
  "booked_elsewhere",
];

function coupleLabel(inquiry: Inquiry): string {
  return inquiry.partner ? `${inquiry.name} & ${inquiry.partner}` : inquiry.name;
}

function receivedLabel(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const days = (Date.now() - then) / (1000 * 60 * 60 * 24);
  if (days < 1) return "Today";
  if (days < 2) return "Yesterday";
  if (days < 7) return `${Math.floor(days)} days ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function waHref(inquiry: Inquiry, vendorName: string): string | null {
  const digits = inquiry.whatsapp.replace(/\D/g, "");
  if (!digits) return null;
  const phone = digits.length === 10 ? `91${digits}` : digits;
  const text = encodeURIComponent(inquiryWhatsAppMessage(inquiry, vendorName));
  return `https://wa.me/${phone}?text=${text}`;
}

function telHref(inquiry: Inquiry): string | null {
  const digits = inquiry.whatsapp.replace(/\D/g, "");
  return digits ? `tel:+${digits.length === 10 ? `91${digits}` : digits}` : null;
}

function mailHref(inquiry: Inquiry, vendorName: string): string | null {
  if (!inquiry.email) return null;
  const subject = encodeURIComponent(`Your Wedoura enquiry with ${vendorName}`);
  const body = encodeURIComponent(
    `Hi ${inquiry.name},\n\nThank you for your enquiry${
      inquiryWeddingLabel(inquiry) !== "—" ? ` about ${inquiryWeddingLabel(inquiry)}` : ""
    }. Happy to help with your wedding plans.\n\n— ${vendorName}`,
  );
  return `mailto:${inquiry.email}?subject=${subject}&body=${body}`;
}

export default function EnquiriesPage() {
  const inquiries = useMyInquiries();
  const listing = useMyListing();
  const vendorName = listing?.name ?? "Wedoura vendor";

  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const base: Record<Tab, number> = { all: inquiries.length, new: 0, replied: 0, booked: 0, closed: 0 };
    for (const i of inquiries) base[i.status] += 1;
    return base;
  }, [inquiries]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return inquiries
      .filter((i) => (tab === "all" ? true : i.status === tab))
      .filter((i) => {
        if (!needle) return true;
        const hay = `${i.name} ${i.partner ?? ""} ${i.city}`.toLowerCase();
        return hay.includes(needle);
      })
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [inquiries, tab, q]);

  const open = openId ? inquiries.find((i) => i.id === openId) ?? null : null;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="font-serif text-[length:var(--text-dash-title)] leading-[var(--text-dash-title--line-height)] text-ink">
          Enquiries
        </h2>
        <p className="mt-2 max-w-prose text-[length:var(--text-dash-body)] text-mute">
          Couples who wrote from your public profile or shortlist. Reply on WhatsApp, call or email.
        </p>
      </header>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <nav className="flex flex-wrap gap-1 border-b border-line" aria-label="Enquiry status">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={cn(
                "min-h-11 px-3 font-sans text-[length:var(--text-dash-help)] tracking-[0.12em] uppercase",
                tab === t.id ? "border-b-2 border-ink text-ink" : "text-mute hover:text-ink",
              )}
              aria-current={tab === t.id ? "page" : undefined}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              <span className="ml-2 tabular-nums text-mute">{counts[t.id]}</span>
            </button>
          ))}
        </nav>
        <label className="block w-full max-w-sm">
          <span className="sr-only">Search by name</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name"
            className="w-full border-b border-line bg-transparent pb-2 text-[length:var(--text-dash-body)] text-ink outline-offset-4 placeholder:text-mute/60"
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={
            inquiries.length === 0
              ? "No enquiries yet. Couples will appear here when they write from your profile."
              : "No enquiries match this filter."
          }
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="enq-table w-full min-w-[40rem] text-left">
              <thead>
                <tr>
                  <th scope="col">Couple</th>
                  <th scope="col">Wedding date</th>
                  <th scope="col">City</th>
                  <th scope="col">Guests</th>
                  <th scope="col">Received</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inquiry) => (
                  <tr
                    key={inquiry.id}
                    className={cn("enq-row", inquiry.status === "new" && "is-new")}
                    onClick={() => setOpenId(inquiry.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpenId(inquiry.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Open enquiry from ${coupleLabel(inquiry)}`}
                  >
                    <td>
                      <span className="enq-couple">
                        {inquiry.status === "new" ? <span className="enq-dot" aria-hidden="true" /> : null}
                        {coupleLabel(inquiry)}
                      </span>
                    </td>
                    <td>{inquiryWeddingLabel(inquiry)}</td>
                    <td>{inquiry.city || "—"}</td>
                    <td>{inquiry.guests != null ? inquiry.guests : "—"}</td>
                    <td>{receivedLabel(inquiry.createdAt)}</td>
                    <td>{INQUIRY_STATUS_LABEL[inquiry.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="grid gap-3 md:hidden">
            {filtered.map((inquiry) => (
              <li key={inquiry.id}>
                <button
                  type="button"
                  className={cn(
                    "studio-card w-full text-left",
                    inquiry.status === "new" && "font-medium",
                  )}
                  onClick={() => setOpenId(inquiry.id)}
                >
                  <span className="enq-couple">
                    {inquiry.status === "new" ? <span className="enq-dot" aria-hidden="true" /> : null}
                    {coupleLabel(inquiry)}
                  </span>
                  <p className="mt-2 text-[length:var(--text-dash-help)] text-mute">
                    {[inquiryWeddingLabel(inquiry), inquiry.city, receivedLabel(inquiry.createdAt)]
                      .filter((x) => x && x !== "—")
                      .join(" · ")}
                  </p>
                  <p className="mt-2 label text-mute">{INQUIRY_STATUS_LABEL[inquiry.status]}</p>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {open ? (
        <EnquiryDrawer
          key={open.id}
          inquiry={open}
          vendorName={vendorName}
          onClose={() => setOpenId(null)}
        />
      ) : null}
    </div>
  );
}

function EnquiryDrawer({
  inquiry,
  vendorName,
  onClose,
}: {
  inquiry: Inquiry;
  vendorName: string;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const noteTimer = useRef<number | null>(null);
  const savedNotes = useRef((inquiry.notes ?? "").trim());
  useFocusTrap(panelRef, true);

  const [notes, setNotes] = useState(inquiry.notes ?? "");
  const [noteStatus, setNoteStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [closePick, setClosePick] = useState(false);
  const [markRepliedPrompt, setMarkRepliedPrompt] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (noteTimer.current != null) window.clearTimeout(noteTimer.current);
    };
  }, [onClose]);

  function onNotesChange(value: string) {
    setNotes(value);
    const trimmed = value.trim();
    if (trimmed === savedNotes.current) {
      setNoteStatus("idle");
      if (noteTimer.current != null) window.clearTimeout(noteTimer.current);
      return;
    }
    setNoteStatus("saving");
    if (noteTimer.current != null) window.clearTimeout(noteTimer.current);
    noteTimer.current = window.setTimeout(() => {
      void updateInquiry(inquiry.id, { notes: trimmed || undefined }).then((r) => {
        if (r.ok) {
          savedNotes.current = trimmed;
          setNoteStatus("saved");
        } else {
          setNoteStatus("idle");
        }
      });
    }, 600);
  }

  async function setStatus(status: InquiryStatus, closeReason?: InquiryCloseReason) {
    setBusy(true);
    await updateInquiry(inquiry.id, { status, closeReason });
    setBusy(false);
    setClosePick(false);
    setMarkRepliedPrompt(false);
  }

  const wa = waHref(inquiry, vendorName);
  const tel = telHref(inquiry);
  const mail = mailHref(inquiry, vendorName);

  const rows: { label: string; value: string }[] = [
    { label: "Phone / WhatsApp", value: inquiry.whatsapp },
    ...(inquiry.email ? [{ label: "Email", value: inquiry.email }] : []),
    { label: "Wedding date", value: inquiryWeddingLabel(inquiry) },
    { label: "City or venue", value: inquiry.city || "—" },
    ...(inquiry.guests != null ? [{ label: "Guests", value: String(inquiry.guests) }] : []),
    ...(inquiry.budget ? [{ label: "Budget", value: inquiry.budget }] : []),
    ...(inquiry.collection ? [{ label: "Collection", value: inquiry.collection }] : []),
    { label: "Form", value: INQUIRY_SOURCE_LABEL[inquiry.source] },
    { label: "Received", value: new Date(inquiry.createdAt).toLocaleString("en-IN") },
    { label: "Last updated", value: new Date(inquiry.updatedAt).toLocaleString("en-IN") },
  ];

  return (
    <div className="drawer" role="dialog" aria-modal="true" aria-label="Enquiry details">
      <button type="button" className="drawer-scrim" aria-label="Close" onClick={onClose} />
      <div ref={panelRef} className="drawer-panel enq-drawer-panel">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="label text-gold-deep">{INQUIRY_STATUS_LABEL[inquiry.status]}</p>
            <h2 className="mt-2 font-serif text-h2 text-ink">{coupleLabel(inquiry)}</h2>
            {inquiry.closeReason ? (
              <p className="mt-2 text-small text-mute">
                Closed · {INQUIRY_CLOSE_LABEL[inquiry.closeReason]}
              </p>
            ) : null}
          </div>
          <button type="button" onClick={onClose} className="studio-top-link shrink-0">
            Close
          </button>
        </div>

        <dl className="mt-8 grid gap-4">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="label text-mute">{row.label}</dt>
              <dd className="mt-1 text-[length:var(--text-dash-body)] text-ink">{row.value}</dd>
            </div>
          ))}
          <div>
            <dt className="label text-mute">Message</dt>
            <dd className="mt-2 whitespace-pre-wrap text-[length:var(--text-dash-body)] text-ink">
              {inquiry.message || "—"}
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-col gap-3">
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="studio-btn"
              onClick={() => {
                if (inquiry.status === "new") setMarkRepliedPrompt(true);
              }}
            >
              Reply on WhatsApp
            </a>
          ) : null}
          {tel ? (
            <a href={tel} className="studio-btn-ghost">
              Call
            </a>
          ) : null}
          {mail ? (
            <a href={mail} className="studio-btn-ghost">
              Email
            </a>
          ) : null}
        </div>

        {markRepliedPrompt && inquiry.status === "new" ? (
          <div className="mt-4 border border-line p-4" role="status">
            <p className="text-[length:var(--text-dash-body)] text-ink">
              Mark this enquiry as Replied?
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                className="studio-btn"
                disabled={busy}
                onClick={() => void setStatus("replied")}
              >
                Yes, mark Replied
              </button>
              <button type="button" className="studio-btn-ghost" onClick={() => setMarkRepliedPrompt(false)}>
                Not yet
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-8">
          <p className="label text-gold-deep">Status</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className={cn("studio-btn-ghost", inquiry.status === "replied" && "border-ink")}
              disabled={busy || inquiry.status === "replied"}
              onClick={() => void setStatus("replied")}
            >
              Replied
            </button>
            <button
              type="button"
              className={cn("studio-btn-ghost", inquiry.status === "booked" && "border-ink")}
              disabled={busy || inquiry.status === "booked"}
              onClick={() => void setStatus("booked")}
            >
              Booked
            </button>
            <button
              type="button"
              className={cn("studio-btn-ghost", inquiry.status === "closed" && "border-ink")}
              disabled={busy}
              onClick={() => setClosePick((v) => !v)}
            >
              Closed
            </button>
          </div>
          {closePick ? (
            <div className="mt-4 grid gap-2">
              <p className="text-small text-mute">Why are you closing this enquiry?</p>
              {CLOSE_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  className="studio-btn-ghost justify-start"
                  disabled={busy}
                  onClick={() => void setStatus("closed", reason)}
                >
                  {INQUIRY_CLOSE_LABEL[reason]}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <label className="mt-8 block">
          <span className="label text-gold-deep">Private note</span>
          <textarea
            className="mt-2 w-full border border-line bg-transparent p-3 text-[length:var(--text-dash-body)] text-ink outline-offset-4"
            rows={4}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Only you can see this."
          />
          <span className="mt-2 block text-small text-mute">
            {noteStatus === "saving" ? "Saving…" : noteStatus === "saved" ? "Saved" : "Autosaves as you type"}
          </span>
        </label>
      </div>
    </div>
  );
}
