"use client";

import { useMemo, useState } from "react";
import { ScreenSkeleton } from "@/components/studio/screen";
import type { Inquiry, InquiryStage } from "@/data/types";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/format";
import {
  createMyLead,
  updateInquiry,
  useMyInquiries,
  useMyListing,
  useSessionHydrated,
} from "@/lib/vendor-api";

const STAGES: { id: InquiryStage; label: string }[] = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "quote_sent", label: "Quote sent" },
  { id: "booked", label: "Booked" },
  { id: "lost", label: "Lost" },
];

function stageOf(i: Inquiry): InquiryStage {
  return i.stage ?? "new";
}

export default function LeadsPage() {
  const hydrated = useSessionHydrated();
  const listing = useMyListing();
  const inquiries = useMyInquiries();
  const [view, setView] = useState<"board" | "list">("board");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [dragOver, setDragOver] = useState<InquiryStage | null>(null);

  const selected = useMemo(
    () => inquiries.find((i) => i.id === selectedId) ?? null,
    [inquiries, selectedId],
  );

  if (!hydrated || !listing) return <ScreenSkeleton />;

  async function move(id: string, stage: InquiryStage) {
    await updateInquiry(id, { stage });
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-serif text-h1">Leads and pipeline</h1>
        <p className="mt-3 max-w-prose italic text-mute">
          Move each couple from first enquiry to booking. Drag cards between stages, or tap one for details.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2" role="group" aria-label="View">
          {(["board", "list"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={cn(
                "min-h-11 border px-4 font-sans text-button font-medium tracking-[0.2em] uppercase",
                view === v ? "border-ink bg-ink text-ivory" : "border-line bg-white",
              )}
            >
              {v === "board" ? "Board" : "List"}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="min-h-11 bg-ink px-5 font-sans text-button font-medium tracking-button text-ivory uppercase"
        >
          + Add lead
        </button>
      </div>

      {adding ? <AddLeadForm onClose={() => setAdding(false)} /> : null}

      {view === "board" ? (
        <div className="studio-board">
          {STAGES.map((col) => {
            const cards = inquiries.filter((i) => stageOf(i) === col.id);
            return (
              <div key={col.id} className="studio-col">
                <h3>
                  {col.label} · {cards.length}
                </h3>
                <div
                  className={cn("drop", dragOver === col.id && "on")}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(col.id);
                  }}
                  onDragLeave={() => setDragOver((d) => (d === col.id ? null : d))}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(null);
                    const id = e.dataTransfer.getData("text/lead-id");
                    if (id) void move(id, col.id);
                  }}
                >
                  {cards.map((lead) => (
                    <button
                      key={lead.id}
                      type="button"
                      className="lead-card"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/lead-id", lead.id)}
                      onClick={() => setSelectedId(lead.id)}
                    >
                      <p className="font-medium">
                        {lead.name}
                        {lead.partner ? ` & ${lead.partner}` : ""}
                      </p>
                      <p className="mt-1 text-small text-mute">{lead.city}</p>
                      {lead.quoteINR != null ? (
                        <p className="mt-2 text-small text-gold-deep">{formatINR(lead.quoteINR)}</p>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <ul className="divide-y divide-line border border-line bg-white">
          {inquiries.map((lead) => (
            <li key={lead.id}>
              <button
                type="button"
                className="flex w-full flex-wrap items-baseline justify-between gap-3 px-4 py-3 text-left hover:bg-ivory"
                onClick={() => setSelectedId(lead.id)}
              >
                <span>
                  {lead.name}
                  {lead.partner ? ` & ${lead.partner}` : ""} · {lead.city}
                </span>
                <span className="label text-mute">{stageOf(lead).replace("_", " ")}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected ? (
        <LeadDrawer
          lead={selected}
          onClose={() => setSelectedId(null)}
          onSave={async (patch) => {
            await updateInquiry(selected.id, patch);
          }}
        />
      ) : null}
    </div>
  );
}

function AddLeadForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [partner, setPartner] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="mb-8 grid gap-4 border border-line bg-white p-6 md:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!name.trim() || !whatsapp.trim() || !city.trim()) {
          setError("Name, WhatsApp and city are required.");
          return;
        }
        setBusy(true);
        const result = await createMyLead({ name, partner, whatsapp, city });
        setBusy(false);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        onClose();
      }}
    >
      <h2 className="font-serif text-h3 md:col-span-2">Add a lead</h2>
      <label className="block">
        <span className="label text-gold-deep">Name</span>
        <input className="mt-2 w-full border-b border-line bg-transparent pb-2" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="block">
        <span className="label text-gold-deep">Partner</span>
        <input className="mt-2 w-full border-b border-line bg-transparent pb-2" value={partner} onChange={(e) => setPartner(e.target.value)} />
      </label>
      <label className="block">
        <span className="label text-gold-deep">WhatsApp</span>
        <input className="mt-2 w-full border-b border-line bg-transparent pb-2" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
      </label>
      <label className="block">
        <span className="label text-gold-deep">City</span>
        <input className="mt-2 w-full border-b border-line bg-transparent pb-2" value={city} onChange={(e) => setCity(e.target.value)} />
      </label>
      {error ? (
        <p className="text-small text-ink md:col-span-2" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex gap-4 md:col-span-2">
        <button type="submit" disabled={busy} className="min-h-11 bg-ink px-5 text-button tracking-button text-ivory uppercase">
          Save lead
        </button>
        <button type="button" onClick={onClose} className="min-h-11 border-b border-gold text-button tracking-[0.2em] uppercase">
          Cancel
        </button>
      </div>
    </form>
  );
}

function LeadDrawer({
  lead,
  onClose,
  onSave,
}: {
  lead: Inquiry;
  onClose: () => void;
  onSave: (patch: Partial<Inquiry>) => Promise<void>;
}) {
  const [stage, setStage] = useState<InquiryStage>(stageOf(lead));
  const [quote, setQuote] = useState(lead.quoteINR != null ? String(lead.quoteINR) : "");
  const [followUp, setFollowUp] = useState(lead.followUpOn?.slice(0, 10) ?? "");
  const [notes, setNotes] = useState(lead.notes ?? "");
  const wa = lead.whatsapp.replace(/\D/g, "");

  return (
    <div className="drawer" role="dialog" aria-modal="true" aria-label="Lead details">
      <button type="button" className="flex-1" aria-label="Close" onClick={onClose} />
      <div className="drawer-panel">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-serif text-h2">
            {lead.name}
            {lead.partner ? ` & ${lead.partner}` : ""}
          </h2>
          <button type="button" onClick={onClose} className="min-h-11 text-button uppercase tracking-[0.2em]">
            Close
          </button>
        </div>
        <p className="mt-2 text-mute">
          {lead.city}
          {lead.date ? ` · ${lead.date}` : ""}
        </p>
        <p className="mt-4 whitespace-pre-wrap text-body">{lead.message}</p>

        <label className="mt-8 block">
          <span className="label text-gold-deep">Stage</span>
          <select
            className="mt-2 w-full border-b border-line bg-transparent pb-2"
            value={stage}
            onChange={(e) => setStage(e.target.value as InquiryStage)}
          >
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-6 block">
          <span className="label text-gold-deep">Quote (INR)</span>
          <input
            className="mt-2 w-full border-b border-line bg-transparent pb-2"
            inputMode="numeric"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
          />
        </label>
        <label className="mt-6 block">
          <span className="label text-gold-deep">Follow-up date</span>
          <input
            type="date"
            className="mt-2 w-full border-b border-line bg-transparent pb-2"
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
          />
        </label>
        <label className="mt-6 block">
          <span className="label text-gold-deep">Notes</span>
          <textarea
            className="mt-2 w-full border border-line p-3"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            className="min-h-12 bg-ink px-5 font-sans text-button font-medium tracking-button text-ivory uppercase"
            onClick={async () => {
              await onSave({
                stage,
                quoteINR: quote ? Number(quote.replace(/\D/g, "")) || undefined : undefined,
                followUpOn: followUp || undefined,
                notes: notes.trim() || undefined,
              });
              onClose();
            }}
          >
            Save
          </button>
          <a
            href={`https://wa.me/${wa.startsWith("91") ? wa : `91${wa}`}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center border border-ink px-5 font-sans text-button font-medium tracking-button uppercase"
          >
            Reply on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
