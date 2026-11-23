"use client";

import { useMemo, useState } from "react";
import { ScreenSkeleton } from "@/components/studio/screen";
import { cn } from "@/lib/cn";
import { updateMyListing, useMyInquiries, useMyListing, useSessionHydrated } from "@/lib/vendor-api";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const hydrated = useSessionHydrated();
  const listing = useMyListing();
  const inquiries = useMyInquiries();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [space, setSpace] = useState("");

  const isVenue = listing?.category === "venues";
  const spaces =
    listing?.venue?.spaceDetails?.map((s) => s.name).filter(Boolean) ??
    (listing?.venue?.spaces ?? []).map(String);

  const blocked = useMemo(() => {
    const av = listing?.availability;
    if (!av) return new Set<string>();
    if (isVenue && space) {
      const row = av.spaces?.find((s) => s.space === space);
      return new Set(row?.blockedDates ?? []);
    }
    return new Set(av.blockedDates ?? []);
  }, [listing?.availability, isVenue, space]);

  const booked = useMemo(() => {
    const set = new Set<string>();
    for (const i of inquiries) {
      if ((i.stage ?? "new") === "booked" && i.date) set.add(i.date.slice(0, 10));
    }
    return set;
  }, [inquiries]);

  const open = useMemo(() => {
    const set = new Set<string>();
    for (const i of inquiries) {
      const st = i.stage ?? "new";
      if (st !== "booked" && st !== "lost" && i.date) set.add(i.date.slice(0, 10));
    }
    return set;
  }, [inquiries]);

  if (!hydrated || !listing) return <ScreenSkeleton />;

  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const title = first.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  async function toggle(iso: string) {
    const av = listing!.availability ?? { blockedDates: [] };
    if (isVenue && space) {
      const spacesRows = [...(av.spaces ?? [])];
      const idx = spacesRows.findIndex((s) => s.space === space);
      const current = idx >= 0 ? spacesRows[idx].blockedDates : [];
      const nextDates = current.includes(iso) ? current.filter((d) => d !== iso) : [...current, iso];
      if (idx >= 0) spacesRows[idx] = { space, blockedDates: nextDates };
      else spacesRows.push({ space, blockedDates: nextDates });
      await updateMyListing({ availability: { ...av, spaces: spacesRows } });
      return;
    }
    const next = blocked.has(iso)
      ? av.blockedDates.filter((d) => d !== iso)
      : [...av.blockedDates, iso];
    await updateMyListing({ availability: { ...av, blockedDates: next } });
  }

  function shift(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  const cells: { iso: string; day: number; muted: boolean }[] = [];
  for (let i = 0; i < startPad; i++) {
    const d = new Date(year, month, -startPad + i + 1);
    cells.push({
      iso: d.toISOString().slice(0, 10),
      day: d.getDate(),
      muted: true,
    });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ iso, day, muted: false });
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-serif text-h1">Calendar</h1>
        <p className="mt-3 max-w-prose italic text-mute">
          Booked weddings, open enquiries and dates you are not available. Tap a date to block or unblock it.
        </p>
      </header>

      {isVenue && spaces.length > 1 ? (
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Space">
          <button
            type="button"
            className={cn("min-h-11 border px-3 text-button tracking-[0.16em] uppercase", !space ? "border-ink bg-ink text-ivory" : "border-line")}
            onClick={() => setSpace("")}
          >
            All spaces
          </button>
          {spaces.map((n) => (
            <button
              key={n}
              type="button"
              className={cn("min-h-11 border px-3 text-button tracking-[0.16em] uppercase", space === n ? "border-ink bg-ink text-ivory" : "border-line")}
              onClick={() => setSpace(n)}
            >
              {n}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-serif text-h2">{title}</h2>
        <div className="flex gap-2">
          <button type="button" className="min-h-11 border border-line px-3" aria-label="Previous month" onClick={() => shift(-1)}>
            ←
          </button>
          <button type="button" className="min-h-11 border border-line px-3" aria-label="Next month" onClick={() => shift(1)}>
            →
          </button>
        </div>
      </div>

      <div className="cal" role="grid" aria-label={title}>
        {WEEKDAYS.map((d) => (
          <div key={d} className="hd" role="columnheader">
            {d}
          </div>
        ))}
        {cells.map((c) => {
          const isBlocked = blocked.has(c.iso);
          return (
            <button
              key={c.iso + (c.muted ? "-m" : "")}
              type="button"
              role="gridcell"
              className={cn("cell", c.muted && "muted", isBlocked && "blocked")}
              onClick={() => {
                if (!c.muted) void toggle(c.iso);
              }}
              aria-label={`${c.iso}${isBlocked ? ", blocked" : ", available"}`}
            >
              <span>{c.day}</span>
              <div className="mt-1">
                {booked.has(c.iso) ? <span className="dot booked" title="Booked" /> : null}
                {open.has(c.iso) ? <span className="dot open" title="Open enquiry" /> : null}
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-small text-mute">
        <span className="dot booked" /> Booked · <span className="dot open" /> Open enquiry · shaded days are blocked
        {space ? ` for ${space}` : ""}.
      </p>
    </div>
  );
}
