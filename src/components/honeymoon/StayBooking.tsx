"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { Photo } from "@/components/media/Photo";
import type { Experience, HotelRoom, Photo as PhotoType } from "@/data/types";
import { getCoupleEmail } from "@/lib/couple-auth";
import { formatINR } from "@/lib/format";
import { createInquiry } from "@/lib/vendor-api";

type Props = {
  slug: string;
  name: string;
  cityName: string;
  cover?: PhotoType;
  rooms: HotelRoom[];
  /** Photos for rooms, keyed by photoId (resolved on the server). */
  roomPhotos: Record<string, PhotoType>;
  /** Moments the hotel offers (vendor.experiences). */
  moments: Experience[];
};

function niceDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function nightsBetween(inDate: string, outDate: string): number {
  const ms = new Date(`${outDate}T00:00:00`).getTime() - new Date(`${inDate}T00:00:00`).getTime();
  return Math.round(ms / 86400000);
}

/**
 * "Request to book" for a honeymoon stay. Dates, guests, room and moments
 * become an Inquiry to the hotel; no payment is taken on Wedoura.
 */
export function StayBooking({ slug, name, cityName, cover, rooms, roomPhotos, moments }: Props) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [room, setRoom] = useState(rooms[0]?.name ?? "");
  const [picked, setPicked] = useState<string[]>([]);
  const [names, setNames] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [requests, setRequests] = useState("");
  const [dateError, setDateError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const chosenRoom = rooms.find((r) => r.name === room);
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const pickedMoments = moments.filter((m) => picked.includes(m.slug));
  const roomTotal = nights > 0 && chosenRoom?.rateFromINR ? nights * chosenRoom.rateFromINR : 0;
  const total = roomTotal + pickedMoments.reduce((sum, m) => sum + (m.priceFromINR ?? 0), 0);

  function toggleMoment(momentSlug: string) {
    setPicked((prev) => (prev.includes(momentSlug) ? prev.filter((s) => s !== momentSlug) : [...prev, momentSlug]));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    let ok = true;
    if (!checkIn || !checkOut) {
      setDateError("Please choose your check-in and check-out dates.");
      ok = false;
    } else if (nights < 1) {
      setDateError("Check-out must be after check-in.");
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
      `Request to book a honeymoon stay at ${name}`,
      `Dates: ${niceDate(checkIn)} to ${niceDate(checkOut)} (${nights} ${nights === 1 ? "night" : "nights"})`,
      `Guests: ${adults} ${adults === 1 ? "adult" : "adults"}`,
      chosenRoom
        ? `Room: ${chosenRoom.name}${chosenRoom.rateFromINR ? ` (from ${formatINR(chosenRoom.rateFromINR)} a night)` : ""}`
        : "",
      pickedMoments.length ? `Moments: ${pickedMoments.map((m) => m.name).join(", ")}` : "",
      email.trim() ? `Email: ${email.trim()}` : "",
      requests.trim() ? `Special requests: ${requests.trim()}` : "",
    ].filter(Boolean);

    setBusy(true);
    const result = await createInquiry({
      vendorSlug: slug,
      name: nm,
      whatsapp: digits,
      email: email.trim() || undefined,
      city: cityName,
      weddingMonth: checkIn.slice(0, 7),
      guests: adults,
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
    <section className="booksec" id="enquire">
      <div className="hd">
        <div>
          <span className="cap gold">Request to book</span>
          <h2>
            Your stay at <em>{name}</em>
          </h2>
          <p>
            Choose your dates and room, add a moment or two, and send the request. The hotel replies within a day with
            availability and the final rate — no payment is taken on Wedoura.
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
            See you soon, <em>{names.trim()}</em>
          </h2>
          <p className="lead">
            {niceDate(checkIn)} to {niceDate(checkOut)} · {chosenRoom?.name}
            {pickedMoments.length > 0 && ` · ${pickedMoments.length} ${pickedMoments.length === 1 ? "moment" : "moments"}`}
            . You’ll hear back on WhatsApp at +91 {phone.replace(/\D/g, "").slice(0, 10)}.
          </p>
          <div className="dnext">
            <div>
              <b>1</b>
              <h3>Confirmation on WhatsApp</h3>
              <p>Your request and stay outline arrive in a few minutes.</p>
            </div>
            <div>
              <b>2</b>
              <h3>The hotel confirms</h3>
              <p>Within a day, with availability and the exact rate for your dates.</p>
            </div>
            <div>
              <b>3</b>
              <h3>You book directly</h3>
              <p>Booking and payment happen with the hotel — nothing is charged here.</p>
            </div>
          </div>
          <p>
            <Link className="lnk" href="/honeymoon/stays">
              More honeymoon stays
            </Link>
          </p>
        </div>
      ) : (
        <div className="bwrap">
          <form className="bform" id="stay-book-form" onSubmit={onSubmit} noValidate>
            <fieldset className="bstep">
              <legend>
                <b>1</b>Your dates
              </legend>
              <div className="row2">
                <label className="bf">
                  <span>Check-in</span>
                  <input type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                </label>
                <label className="bf">
                  <span>Check-out</span>
                  <input type="date" min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                </label>
              </div>
              <div className="guests">
                <span className="gl">Guests</span>
                <div className="stp">
                  <button type="button" aria-label="Fewer guests" disabled={adults <= 1} onClick={() => setAdults((n) => n - 1)}>
                    −
                  </button>
                  <output>
                    {adults} {adults === 1 ? "adult" : "adults"}
                  </output>
                  <button type="button" aria-label="More guests" disabled={adults >= 4} onClick={() => setAdults((n) => n + 1)}>
                    +
                  </button>
                </div>
              </div>
              {dateError && <p className="berr">{dateError}</p>}
            </fieldset>

            {rooms.length > 0 && (
              <fieldset className="bstep">
                <legend>
                  <b>2</b>Choose your room
                </legend>
                <div className="rcards">
                  {rooms.map((r) => {
                    const photo = r.photoId ? roomPhotos[r.photoId] : undefined;
                    return (
                      <label className={`rc${photo ? "" : " noimg"}`} key={r.name}>
                        <input type="radio" name="room" checked={room === r.name} onChange={() => setRoom(r.name)} />
                        {photo && (
                          <span className="rim">
                            <Photo photo={photo} mode="cover" sizes="120px" className="absolute inset-0" />
                          </span>
                        )}
                        <span>
                          <b>{r.name}</b>
                          <small>{[r.size, r.view].filter(Boolean).join(" · ") || r.description}</small>
                        </span>
                        {r.rateFromINR !== undefined && (
                          <span className="rr">
                            <b>{formatINR(r.rateFromINR)}</b>
                            <br />
                            from, a night
                          </span>
                        )}
                      </label>
                    );
                  })}
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
                      <span className="ap">{moment.priceFromINR ? `+ ${formatINR(moment.priceFromINR)}` : "Included"}</span>
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
                  placeholder="Anniversary cake, late check-out, a quiet room…"
                  value={requests}
                  onChange={(e) => setRequests(e.target.value)}
                />
              </label>
              {detailError && <p className="berr">{detailError}</p>}
            </fieldset>
          </form>

          <aside className="bsum" aria-label="Your request">
            {cover && (
              <div className="bfig">
                <Photo photo={cover} mode="cover" sizes="400px" className="absolute inset-0" />
              </div>
            )}
            <div className="bin">
              <span className="cap gold">Your stay</span>
              <h3>{name}</h3>
              <p className="bmeta">
                {checkIn && checkOut && nights > 0
                  ? `${niceDate(checkIn)} – ${niceDate(checkOut)} · ${nights} ${nights === 1 ? "night" : "nights"}`
                  : "Choose your dates"}
              </p>
              <dl className="lines">
                {chosenRoom && (
                  <div>
                    <dt>Room</dt>
                    <dd>{chosenRoom.name}</dd>
                  </div>
                )}
                <div>
                  <dt>Guests</dt>
                  <dd>{adults}</dd>
                </div>
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
              <p className="due">
                {roomTotal > 0 ? `For ${nights} ${nights === 1 ? "night" : "nights"} · ` : ""}the hotel confirms the final
                rate
              </p>
              <button className="btn bpay" type="submit" form="stay-book-form" disabled={busy}>
                {busy ? "Sending…" : "Request to book"}
              </button>
              <p className="fine">No payment is taken on Wedoura. Free, with no obligation.</p>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
