"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/studio/Field";
import { SaveState } from "@/components/studio/autosave";
import { ScreenSkeleton, useListingForm } from "@/components/studio/screen";
import type { WeddingSubmission } from "@/data/types";

const STATUS_LABEL: Record<WeddingSubmission["status"], string> = {
  pending: "Pending review",
  featured: "Featured",
  declined: "Declined",
};

export default function WeddingsPage() {
  const { form, apply, status, error } = useListingForm<{ weddingSubmissions: WeddingSubmission[] }>((l) => ({
    weddingSubmissions: l.weddingSubmissions ?? [],
  }));
  const [open, setOpen] = useState(false);
  const [coupleNames, setCoupleNames] = useState("");
  const [weddingMonth, setWeddingMonth] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");
  const [permission, setPermission] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!form) return <ScreenSkeleton />;

  function submit() {
    if (!coupleNames.trim() || !weddingMonth || !venue.trim() || !city.trim()) {
      setFormError("Names, month, venue and city are required.");
      return;
    }
    if (!permission) {
      setFormError("Please confirm the couple gave permission.");
      return;
    }
    setFormError(null);
    const row: WeddingSubmission = {
      id: `ws-${Date.now().toString(36)}`,
      coupleNames: coupleNames.trim(),
      weddingMonth,
      venue: venue.trim(),
      city: city.trim(),
      note: note.trim() || undefined,
      permission: true,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
    const weddingSubmissions = [...form!.weddingSubmissions, row];
    apply({ weddingSubmissions }, { weddingSubmissions });
    setOpen(false);
    setCoupleNames("");
    setWeddingMonth("");
    setVenue("");
    setCity("");
    setNote("");
    setPermission(false);
  }

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-h1">Real weddings</h1>
          <p className="mt-3 max-w-prose italic text-mute">
            Be featured on Wedoura Real Weddings, our editorial section read by couples planning their own.
          </p>
        </div>
        <SaveState status={status} error={error} />
      </header>

      <button
        type="button"
        className="min-h-12 bg-ink px-6 font-sans text-button font-medium tracking-button text-ivory uppercase"
        onClick={() => setOpen(true)}
      >
        Add a real wedding
      </button>

      {open ? (
        <form
          className="mt-8 grid gap-5 border border-line bg-white p-6 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <h2 className="font-serif text-h3 md:col-span-2">Submit a wedding</h2>
          <Field id="ws-names" label="Couple names">
            <input id="ws-names" className={inputClass} value={coupleNames} onChange={(e) => setCoupleNames(e.target.value)} />
          </Field>
          <Field id="ws-month" label="Wedding month">
            <input
              id="ws-month"
              type="month"
              className={inputClass}
              value={weddingMonth}
              onChange={(e) => setWeddingMonth(e.target.value)}
            />
          </Field>
          <Field id="ws-venue" label="Venue">
            <input id="ws-venue" className={inputClass} value={venue} onChange={(e) => setVenue(e.target.value)} />
          </Field>
          <Field id="ws-city" label="City">
            <input id="ws-city" className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} />
          </Field>
          <div className="md:col-span-2">
            <Field id="ws-note" label="Note (optional)">
              <textarea id="ws-note" className={inputClass + " resize-y"} rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
          </div>
          <label className="tap flex items-start gap-3 md:col-span-2">
            <input
              type="checkbox"
              checked={permission}
              onChange={(e) => setPermission(e.target.checked)}
              className="mt-1 size-4 accent-ink"
            />
            <span className="text-small text-mute">
              The couple has given permission for Wedoura to feature their wedding photographs and story.
            </span>
          </label>
          {formError ? (
            <p className="text-small text-ink md:col-span-2" role="alert">
              {formError}
            </p>
          ) : null}
          <div className="flex gap-4 md:col-span-2">
            <button type="submit" className="min-h-11 bg-ink px-5 text-button tracking-button text-ivory uppercase">
              Submit
            </button>
            <button type="button" className="min-h-11 border-b border-gold text-button tracking-[0.2em] uppercase" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <ul className="mt-10 grid gap-4">
        {form.weddingSubmissions.length === 0 ? (
          <li className="border border-line bg-white p-6 text-mute">No submissions yet.</li>
        ) : (
          form.weddingSubmissions.map((w) => (
            <li key={w.id} className="border border-line bg-white p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-serif text-h3">{w.coupleNames}</h2>
                <span className="label text-gold-deep">{STATUS_LABEL[w.status]}</span>
              </div>
              <p className="mt-2 text-small text-mute">
                {w.weddingMonth} · {w.venue}, {w.city}
              </p>
              {w.note ? <p className="mt-3 text-mute">{w.note}</p> : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
