"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Photo } from "@/components/media/Photo";
import type { Experience, HoneymoonPackage } from "@/data/types";
import { getCoupleEmail } from "@/lib/couple-auth";
import { formatINR } from "@/lib/format";
import { createInquiry } from "@/lib/vendor-api";

type Props = {
  pkg: HoneymoonPackage;
  /** Resolved moments (from the package's momentSlugs). */
  moments: Experience[];
  /** Sections rendered between the moments grid and the booking form. */
  children?: ReactNode;
};

function niceDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * "Moments for two" + "Request to book" for a honeymoon package, sharing one
 * selection state. No payment: the request becomes an Inquiry to the agency
 * (dates, collection and chosen moments); the planner confirms the quote.
 */
export function PackageBooking({ pkg, moments, children }: Props) {
  const [picked, setPicked] = useState<string[]>([]);
  const [collection, setCollection] = useState(pkg.collections[0]?.name ?? "");
  const [arrival, setArrival] = useState("");
  const [names, setNames] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [requests, setRequests] = useState("");
  const [dateError, setDateError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const chosen = pkg.collections.find((c) => c.name === collection);
  const pickedMoments = moments.filter((m) => picked.includes(m.slug));
  const total =
    (chosen?.pricePerCoupleINR ?? 0) + pickedMoments.reduce((sum, m) => sum + (m.priceFromINR ?? 0), 0);

  function toggleMoment(slug: string) {
    setPicked((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    let ok = true;
    if (!arrival) {
      setDateError("Please choose your arrival date.");
      ok = false;
    } else {
      setDateError("");
    }
    const nm = names.trim();
    const digits = phone.replace(/\D/g, "").slice(0, 10);
    if (!nm) {
      setDetailError("Please add your names.");
      ok = false;
    } else if (digits.length !== 10) {
      setDetailError("Please enter a 10-digit mobile number.");
      ok = false;
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setDetailError("Please enter a valid email address.");
      ok = false;
    } else {
      setDetailError("");
    }
    if (!ok) return;

    const lines = [
      `Request to book: ${pkg.name} (${pkg.nights} nights, ${pkg.destination})`,
      `Arrival: ${niceDate(arrival)} · Fly home: ${niceDate(addDays(arrival, pkg.nights))}`,
      chosen
        ? `Collection: ${chosen.name}${chosen.pricePerCoupleINR ? ` (from ${formatINR(chosen.pricePerCoupleINR)} per couple)` : ""}`
        : "",
      pickedMoments.length ? `Moments: ${pickedMoments.map((m) => m.name).join(", ")}` : "",
      email.trim() ? `Email: ${email.trim()}` : "",
      requests.trim() ? `Special requests: ${requests.trim()}` : "",
    ].filter(Boolean);

    setBusy(true);
    const result = await createInquiry({
      vendorSlug: pkg.vendorSlug ?? "wedoura-journeys",
      name: nm,
      whatsapp: digits,
      email: email.trim() || undefined,
      city: pkg.destination,
      weddingMonth: arrival.slice(0, 7),
      guests: 2,
      collection: chosen?.name,
      message: lines.join("\n"),
      source: "package_book",
      coupleEmail: getCoupleEmail() ?? undefined,
    });
    setBusy(false);
    if (!result.ok) {
      setDetailError(result.error);
      return;
    }
    setSent(true);
  }

  return (
    <>
      {moments.length > 0 && (
        <section className="sec" id="moments">
          <div className="hd">
            <div>
              <span className="cap gold">Make it yours</span>
              <h2>
                Moments <em>for two</em>
              </h2>
              <p>Add any of these to your trip. We’ll fit them into the days where they work best.</p>
            </div>
            <a className="lnk" href="#enquire">
              Go to booking
            </a>
          </div>
          <div className="moms">
            {moments.map((moment) => (
              <article className="mom" key={moment.slug}>
                {moment.cover && (
                  <div className="im zoom">
                    <Photo photo={moment.cover} mode="cover" sizes="(min-width: 64rem) 30vw, 84vw" className="absolute inset-0" />
                  </div>
                )}
                <div className="t">
                  <h3>{moment.name}</h3>
                  <p>{moment.description}</p>
                  <div className="mp">
                    <span>{moment.priceFromINR ? `From ${formatINR(moment.priceFromINR)}` : "On request"}</span>
                    <button type="button" aria-pressed={picked.includes(moment.slug)} onClick={() => toggleMoment(moment.slug)}>
                      {picked.includes(moment.slug) ? "Added" : "Add to trip"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {children}

      <section className="booksec" id="enquire">
        <div className="hd">
          <div>
            <span className="cap gold">Request to book</span>
            <h2>
              Your honeymoon in <em>{pkg.destination}</em>
            </h2>
            <p>
              Pick your arrival date and collection, add a few moments, and send the request. Your planner calls within
              a day to confirm availability and the final quote — no payment is taken on Wedoura.
            </p>
          </div>
        </div>

        {sent ? (
          <div className="bdone" role="status">
            <div className="seal" aria-hidden="true">
              ✓
            </div>
            <span className="cap gold">Request sent</span>
            <h2>
              See you in <em>{pkg.destination}</em>, {names.trim()}
            </h2>
            <p className="lead">
              {arrival && `${niceDate(arrival)} · `}
              {chosen?.name} collection
              {pickedMoments.length > 0 && ` · ${pickedMoments.length} ${pickedMoments.length === 1 ? "moment" : "moments"}`}
              . You’ll hear back on WhatsApp at +91 {phone.replace(/\D/g, "").slice(0, 10)}.
            </p>
            <div className="dnext">
              <div>
                <b>1</b>
                <h3>Confirmation on WhatsApp</h3>
                <p>Your request and trip outline arrive in a few minutes.</p>
              </div>
              <div>
                <b>2</b>
                <h3>Your planner calls</h3>
                <p>Within a day, to fine-tune the days and the moments you added.</p>
              </div>
              <div>
                <b>3</b>
                <h3>You confirm directly</h3>
                <p>Booking and payment happen with the agency — nothing is charged here.</p>
              </div>
            </div>
            <p>
              <Link className="lnk" href="/honeymoon">
                More honeymoon ideas
              </Link>
            </p>
          </div>
        ) : (
          <div className="bwrap">
            <form className="bform" id="pkg-book-form" onSubmit={onSubmit} noValidate>
              <fieldset className="bstep">
                <legend>
                  <b>1</b>When you arrive
                </legend>
                <div className="row2">
                  <label className="bf">
                    <span>Arrive in {pkg.destination}</span>
                    <input type="date" min={today} value={arrival} onChange={(e) => setArrival(e.target.value)} />
                  </label>
                  <label className="bf">
                    <span>Fly home</span>
                    <input readOnly value={arrival ? niceDate(addDays(arrival, pkg.nights)) : `${pkg.nights} nights later`} />
                  </label>
                </div>
                <div className="guests">
                  <span className="gl">Travellers</span>
                  <output>2 adults · one couple</output>
                </div>
                {dateError && <p className="berr">{dateError}</p>}
              </fieldset>

              {pkg.collections.length > 0 && (
                <fieldset className="bstep">
                  <legend>
                    <b>2</b>Choose your collection
                  </legend>
                  <div className="rcards">
                    {pkg.collections.map((c) => (
                      <label className="rc noimg" key={c.name}>
                        <input
                          type="radio"
                          name="collection"
                          checked={collection === c.name}
                          onChange={() => setCollection(c.name)}
                        />
                        <span>
                          <b>{c.name}</b>
                          {c.note && <small>{c.note}</small>}
                        </span>
                        {c.pricePerCoupleINR !== undefined && (
                          <span className="rr">
                            <b>{formatINR(c.pricePerCoupleINR)}</b>
                            <br />
                            from, per couple
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              {moments.length > 0 && (
                <fieldset className="bstep">
                  <legend>
                    <b>3</b>Add moments for two <small>optional</small>
                  </legend>
                  <div className="addons">
                    {moments.map((moment) => (
                      <label className="ao" key={moment.slug}>
                        <input type="checkbox" checked={picked.includes(moment.slug)} onChange={() => toggleMoment(moment.slug)} />
                        <span>
                          <b>{moment.name}</b>
                          <small>{moment.description}</small>
                        </span>
                        <span className="ap">{moment.priceFromINR ? `+ ${formatINR(moment.priceFromINR)}` : "On request"}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              <fieldset className="bstep">
                <legend>
                  <b>{moments.length > 0 ? 4 : 3}</b>Your details
                </legend>
                <div className="row2">
                  <label className="bf">
                    <span>Your names</span>
                    <input autoComplete="name" placeholder="Ananya & Kabir" value={names} onChange={(e) => setNames(e.target.value)} />
                  </label>
                  <label className="bf">
                    <span>Mobile / WhatsApp</span>
                    <div className="pre">
                      <em>+91</em>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        autoComplete="tel-national"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      />
                    </div>
                  </label>
                </div>
                <label className="bf">
                  <span>Email</span>
                  <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <label className="bf">
                  <span>
                    Special requests <small>optional</small>
                  </span>
                  <input
                    placeholder="Jain meals, anniversary surprise, extra night…"
                    value={requests}
                    onChange={(e) => setRequests(e.target.value)}
                  />
                </label>
                {detailError && <p className="berr">{detailError}</p>}
              </fieldset>
            </form>

            <aside className="bsum" aria-label="Your request">
              <div className="bfig">
                <Photo photo={pkg.cover} mode="cover" sizes="400px" className="absolute inset-0" />
              </div>
              <div className="bin">
                <span className="cap gold">Your trip</span>
                <h3>{pkg.name}</h3>
                <p className="bmeta">
                  {arrival ? `${niceDate(arrival)} · ${pkg.nights} nights` : "Choose your arrival date"}
                </p>
                {pkg.stays && pkg.stays.length > 0 && (
                  <div className="bpath">
                    {pkg.stays.map((s) => (
                      <span key={s.name}>
                        {s.name}
                        {s.nights ? ` · ${s.nights} nights` : ""}
                      </span>
                    ))}
                  </div>
                )}
                <dl className="lines">
                  {chosen && (
                    <div>
                      <dt>Collection</dt>
                      <dd>{chosen.name}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Moments</dt>
                    <dd>{pickedMoments.length || "—"}</dd>
                  </div>
                </dl>
                {total > 0 && (
                  <div className="tot">
                    <span>From</span>
                    <b>{formatINR(total)}</b>
                  </div>
                )}
                <p className="due">Per couple · your planner confirms the final quote</p>
                <button className="btn bpay" type="submit" form="pkg-book-form" disabled={busy}>
                  {busy ? "Sending…" : "Request to book"}
                </button>
                <p className="fine">No payment is taken on Wedoura. Free, with no obligation.</p>
              </div>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}
