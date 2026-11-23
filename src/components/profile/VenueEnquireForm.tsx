"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { Photo } from "@/components/media/Photo";
import type { Photo as PhotoData } from "@/data/types";
import { createInquiry } from "@/lib/vendor-api";

type MonthKind = "open" | "value" | "peak" | "closed";

type MonthOption = {
  key: string;
  label: string;
  year: number;
  monthIndex: number;
  kind: MonthKind;
};

type Props = {
  vendorSlug: string;
  vendorName: string;
  cityName: string;
  cover?: PhotoData;
  eventOptions: string[];
  peakMonths?: string[];
  valueMonths?: string[];
  closedMonths?: string[];
  defaultGuests?: number;
};

const MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const KIND_LABEL: Record<MonthKind, string> = {
  open: "Open",
  value: "Value",
  peak: "Peak",
  closed: "Closed",
};

function classifyMonth(
  abbr: string,
  peak: Set<string>,
  value: Set<string>,
  closed: Set<string>,
): MonthKind {
  if (closed.has(abbr)) return "closed";
  if (peak.has(abbr)) return "peak";
  if (value.has(abbr)) return "value";
  return "open";
}

function buildMonths(
  peakMonths: string[] | undefined,
  valueMonths: string[] | undefined,
  closedMonths: string[] | undefined,
): MonthOption[] {
  const peak = new Set((peakMonths ?? []).map((m) => m.slice(0, 3)));
  const value = new Set((valueMonths ?? []).map((m) => m.slice(0, 3)));
  const closed = new Set((closedMonths ?? []).map((m) => m.slice(0, 3)));
  const now = new Date();
  const out: MonthOption[] = [];
  for (let q = 0; q < 12; q++) {
    const d = new Date(now.getFullYear(), now.getMonth() + q, 1);
    const m = d.getMonth();
    const abbr = MN[m];
    const kind = classifyMonth(abbr, peak, value, closed);
    out.push({
      key: `${d.getFullYear()}-${String(m + 1).padStart(2, "0")}`,
      label: `${abbr} ${String(d.getFullYear()).slice(2)}`,
      year: d.getFullYear(),
      monthIndex: m,
      kind,
    });
  }
  return out;
}

/**
 * Month-based venue enquiry. Labels months open / value / peak / closed from
 * listing data only; closed months are disabled. Calls createInquiry.
 */
export function VenueEnquireForm({
  vendorSlug,
  vendorName,
  cityName,
  cover,
  eventOptions,
  peakMonths,
  valueMonths,
  closedMonths,
  defaultGuests = 180,
}: Props) {
  const months = useMemo(
    () => buildMonths(peakMonths, valueMonths, closedMonths),
    [peakMonths, valueMonths, closedMonths],
  );

  const defaultEvents = useMemo(() => {
    const preferred = eventOptions.filter((e) => e === "Wedding" || e === "Reception");
    return preferred.length ? preferred : eventOptions.slice(0, 1);
  }, [eventOptions]);

  const [selectedMonth, setSelectedMonth] = useState<MonthOption | null>(null);
  const [exactDates, setExactDates] = useState("");
  const [days, setDays] = useState("2 days");
  const [events, setEvents] = useState<string[]>(defaultEvents);
  const [guests, setGuests] = useState(String(defaultGuests));
  const [rooms, setRooms] = useState("Not sure yet");
  const [names, setNames] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [notes, setNotes] = useState("");
  const [monthError, setMonthError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  function toggleEvent(name: string) {
    setEvents((prev) =>
      prev.includes(name) ? prev.filter((e) => e !== name) : [...prev, name],
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMonthError("");
    setDetailError("");
    setSubmitError("");

    let ok = true;
    if (!selectedMonth) {
      setMonthError("Please choose a month.");
      ok = false;
    }
    const nm = names.trim();
    const digits = whatsapp.replace(/\D/g, "").slice(0, 10);
    if (!nm) {
      setDetailError("Please add your names.");
      ok = false;
    } else if (digits.length !== 10) {
      setDetailError("Please enter a 10-digit mobile number.");
      ok = false;
    }
    if (!ok) return;

    const guestCount = Number(guests.replace(/\D/g, "")) || undefined;
    const messageParts = [
      notes.trim(),
      events.length ? `Events: ${events.join(", ")}` : "",
      `Days: ${days}`,
      `Rooms: ${rooms}`,
      exactDates.trim() ? `Exact dates: ${exactDates.trim()}` : "",
    ].filter(Boolean);

    setBusy(true);
    const result = await createInquiry({
      vendorSlug,
      name: nm,
      whatsapp: digits,
      city: cityName,
      weddingMonth: selectedMonth!.key,
      guests: guestCount,
      message:
        messageParts.join("\n") ||
        `Hi ${vendorName}, we would love to check availability.`,
    });
    setBusy(false);

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }
    setSent(true);
  }

  if (sent && selectedMonth) {
    return (
      <div className="bdone" role="status">
        <div className="seal" aria-hidden="true">
          ✓
        </div>
        <span className="vp-cap">Enquiry sent</span>
        <h2>
          We&apos;ve asked about your <em>dates</em>
        </h2>
        <p className="lead">
          {MN[selectedMonth.monthIndex]} {selectedMonth.year}
          {events.length ? ` · ${events.join(", ")}` : ""}
          {guests ? ` · ${guests} guests` : ""}. You&apos;ll hear back on
          WhatsApp at +91 {whatsapp.replace(/\D/g, "").slice(0, 10)}.
        </p>
        <div className="dnext">
          <div>
            <b>1</b>
            <h3>Open dates</h3>
            <p>The venue sends you available dates in your month.</p>
          </div>
          <div>
            <b>2</b>
            <h3>Your quote</h3>
            <p>A full quote for your events, menu and rooms.</p>
          </div>
          <div>
            <b>3</b>
            <h3>Visit or video call</h3>
            <p>See it in person, or walk through it on a video call.</p>
          </div>
        </div>
        <p>
          <Link className="vp-lnk" href="/vendors">
            Keep exploring vendors
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="bwrap">
      <form className="bform" onSubmit={onSubmit} noValidate>
        <fieldset className="bstep">
          <legend>
            <b>1</b>When
          </legend>
          <div className="avail" role="group" aria-label="Choose a month">
            {months.map((m) => {
              const disabled = m.kind === "closed";
              return (
                <button
                  key={m.key}
                  type="button"
                  className={`mo ${m.kind}`}
                  aria-pressed={selectedMonth?.key === m.key}
                  aria-disabled={disabled || undefined}
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return;
                    setSelectedMonth(m);
                    setMonthError("");
                  }}
                >
                  <b>{m.label}</b>
                  <small>{KIND_LABEL[m.kind]}</small>
                </button>
              );
            })}
          </div>
          <div className="row2" style={{ marginTop: 14 }}>
            <label className="bf">
              <span>
                Exact dates <small>optional</small>
              </span>
              <input
                value={exactDates}
                onChange={(e) => setExactDates(e.target.value)}
                placeholder="e.g. 12–14 Feb, or flexible"
              />
            </label>
            <label className="bf">
              <span>Days</span>
              <select value={days} onChange={(e) => setDays(e.target.value)}>
                <option>1 day</option>
                <option>2 days</option>
                <option>3 days</option>
                <option>4+ days</option>
              </select>
            </label>
          </div>
          {monthError ? <p className="berr">{monthError}</p> : null}
        </fieldset>

        <fieldset className="bstep">
          <legend>
            <b>2</b>Your events
          </legend>
          {eventOptions.length > 0 && (
            <div className="evck">
              {eventOptions.map((ev) => (
                <label key={ev}>
                  <input
                    type="checkbox"
                    value={ev}
                    checked={events.includes(ev)}
                    onChange={() => toggleEvent(ev)}
                  />
                  <span>{ev}</span>
                </label>
              ))}
            </div>
          )}
          <div className="row2" style={{ marginTop: 10 }}>
            <label className="bf">
              <span>Guests</span>
              <input
                inputMode="numeric"
                value={guests}
                onChange={(e) => setGuests(e.target.value.replace(/\D/g, ""))}
              />
            </label>
            <label className="bf">
              <span>Rooms needed</span>
              <select value={rooms} onChange={(e) => setRooms(e.target.value)}>
                <option>Not sure yet</option>
                <option>Just for family</option>
                <option>All rooms on site</option>
                <option>On site + nearby</option>
              </select>
            </label>
          </div>
        </fieldset>

        <fieldset className="bstep">
          <legend>
            <b>3</b>Your details
          </legend>
          <div className="row2">
            <label className="bf">
              <span>Your names</span>
              <input
                autoComplete="name"
                placeholder="Ananya & Kabir"
                value={names}
                onChange={(e) => setNames(e.target.value)}
              />
            </label>
            <label className="bf">
              <span>Mobile / WhatsApp</span>
              <div className="pre">
                <em>+91</em>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={whatsapp}
                  onChange={(e) =>
                    setWhatsapp(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                />
              </div>
            </label>
          </div>
          <label className="bf">
            <span>
              Anything else <small>optional</small>
            </span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Our own caterer, a horse for the baraat, Jain menu…"
            />
          </label>
          {detailError ? <p className="berr">{detailError}</p> : null}
          {submitError ? <p className="berr">{submitError}</p> : null}
        </fieldset>
      </form>

      <aside className="bsum" aria-label="Your enquiry">
        {cover && (
          <figure>
            <Photo photo={cover} mode="cover" sizes="400px" />
          </figure>
        )}
        <div className="bin">
          <span className="vp-cap">Your enquiry</span>
          <h3>{vendorName}</h3>
          <p className="bmeta">
            {selectedMonth
              ? `${MN[selectedMonth.monthIndex]} ${selectedMonth.year} · ${days}`
              : "Choose a month"}
          </p>
          <dl className="lines">
            <div>
              <dt>Events</dt>
              <dd>{events.length ? events.join(", ") : "—"}</dd>
            </div>
            <div>
              <dt>Guests</dt>
              <dd>{guests || "—"}</dd>
            </div>
            <div>
              <dt>Rooms</dt>
              <dd>{rooms}</dd>
            </div>
          </dl>
          <button
            className="vp-btn bpay"
            type="button"
            disabled={busy}
            onClick={(e) => {
              e.preventDefault();
              void onSubmit(e as unknown as FormEvent);
            }}
          >
            {busy ? "Sending…" : "Send enquiry"}
          </button>
          <p className="fine">Free, with no obligation. Usually replies within a day.</p>
        </div>
      </aside>
    </div>
  );
}
