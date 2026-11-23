"use client";

import type { VenueSpaceDetail } from "@/data/types";

export type CapacityLayout = "ceremony" | "dinner" | "standing";

type Props = {
  spaces: VenueSpaceDetail[];
  minGuests: number;
  maxGuests: number;
  guests: number;
  onGuestsChange: (n: number) => void;
  layout: CapacityLayout;
  onLayoutChange: (layout: CapacityLayout) => void;
};

const LAYOUTS: { key: CapacityLayout; label: string; sub: string }[] = [
  { key: "ceremony", label: "Ceremony", sub: "rows of chairs" },
  { key: "dinner", label: "Dinner", sub: "round tables" },
  { key: "standing", label: "Party", sub: "standing" },
];

function spaceCap(space: VenueSpaceDetail, layout: CapacityLayout): number {
  if (layout === "ceremony") return space.ceremony ?? 0;
  if (layout === "dinner") return space.dinner ?? 0;
  return space.standing ?? 0;
}

type FitClass = "ok" | "tight" | "no";

/** Same verdict logic as the venue-profile reference `fits()`. */
function fitFor(guests: number, cap: number): { cls: FitClass; verdict: string; sub: string; ratio: number } {
  if (!cap) {
    return { cls: "no", verdict: "Not for this", sub: "Use another space", ratio: 9 };
  }
  const ratio = guests / cap;
  if (ratio <= 0.85) {
    return {
      cls: "ok",
      verdict: "Fits well",
      sub: `${Math.max(cap - guests, 0)} seats spare`,
      ratio,
    };
  }
  if (ratio <= 1) {
    return {
      cls: "tight",
      verdict: "A snug fit",
      sub: `${Math.max(cap - guests, 0)} seats spare`,
      ratio,
    };
  }
  return { cls: "no", verdict: "Too small", sub: `Up to ${cap}`, ratio };
}

/**
 * Guest-count slider and ceremony / dinner / party layout. Shows which
 * spaces fit, matching the reference `fits()` logic.
 */
export function VenueCapacityPlanner({
  spaces,
  minGuests,
  maxGuests,
  guests,
  onGuestsChange,
  layout,
  onLayoutChange,
}: Props) {
  const step = 10;
  const lo = Math.max(20, Math.floor(minGuests / step) * step || 20);
  const hi = Math.max(lo + step, Math.ceil(maxGuests / step) * step);
  const mid = Math.round((lo + hi) / 2 / step) * step;

  return (
    <div className="plnr">
      <div className="plc">
        <h3>Your guests</h3>
        <div className="gn">
          <output id="gOut">{guests}</output>
          <span>guests</span>
        </div>
        <input
          className="rng"
          type="range"
          min={lo}
          max={hi}
          step={step}
          value={guests}
          aria-label="Number of guests"
          aria-valuetext={`${guests} guests`}
          onChange={(e) => onGuestsChange(Number(e.target.value))}
        />
        <div className="rlab">
          <span>{lo}</span>
          <span>{mid}</span>
          <span>{hi}</span>
        </div>
        <div className="seg" role="group" aria-label="Kind of event">
          {LAYOUTS.map((l) => (
            <button
              key={l.key}
              type="button"
              aria-pressed={layout === l.key}
              onClick={() => onLayoutChange(l.key)}
            >
              {l.label}
              <small>{l.sub}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="fits" aria-live="polite">
        {spaces.map((s) => {
          const cap = spaceCap(s, layout);
          const { cls, verdict, sub, ratio } = fitFor(guests, cap);
          return (
            <div key={s.name} className={`fit ${cls}`}>
              <div>
                <b>{s.name}</b>
                {s.kind ? <small>{s.kind}</small> : null}
                <div className="meter">
                  <i style={{ width: `${Math.min(ratio * 100, 100)}%` }} />
                </div>
              </div>
              <div className="verdict">
                {verdict}
                <small>{sub}</small>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
