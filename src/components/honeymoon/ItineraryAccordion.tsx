"use client";

import { useId, useState } from "react";
import type { ItineraryDay } from "@/data/types";

type Props = { days: ItineraryDay[] };

/**
 * The day-by-day accordion from the package reference: numbered day rows,
 * one open at first, plus an "Open all days" toggle. Every day's text stays
 * in the markup; closed days are hidden.
 */
export function ItineraryAccordion({ days }: Props) {
  const uid = useId();
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));
  const allOpen = open.size === days.length;

  function toggle(i: number) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className="itin">
      <div className="itools">
        <button type="button" onClick={() => setOpen(allOpen ? new Set() : new Set(days.map((_, i) => i)))}>
          {allOpen ? "Close all days" : "Open all days"}
        </button>
      </div>
      {days.map((day, i) => {
        const isOpen = open.has(i);
        const bodyId = `${uid}-day-${i}`;
        return (
          <div key={day.day} className={`day${isOpen ? " open" : ""}`}>
            <button type="button" className="dayh" aria-expanded={isOpen} aria-controls={bodyId} onClick={() => toggle(i)}>
              <span className="dn">
                Day<b>{String(day.day).padStart(2, "0")}</b>
              </span>
              <h3>
                {day.title}
                {day.place && <small>{day.place}</small>}
              </h3>
              <span className="pm" aria-hidden="true">
                +
              </span>
            </button>
            <div className="dayb" id={bodyId} hidden={!isOpen}>
              <span aria-hidden="true" />
              <div className="tx">
                <p>{day.text}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
