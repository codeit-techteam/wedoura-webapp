"use client";

import { useMemo, useState } from "react";
import type { VenueEstimate, VenueMenu } from "@/data/types";
import { formatINR } from "@/lib/format";

type Props = {
  estimate: VenueEstimate;
  menus: VenueMenu[];
  guests: number;
};

/** Round to nearest 10,000 like the reference `est()`. */
function band(total: number): string {
  const low = Math.round((total * 0.95) / 10000) * 10000;
  const high = Math.round((total * 1.1) / 10000) * 10000;
  return `${formatINR(low)} – ${formatINR(high)}`;
}

/**
 * Rough estimate calculator: event pills, menu segment, optional rooms
 * package toggle. Totals use the reference ± band.
 */
export function VenuePriceEstimate({ estimate, menus, guests }: Props) {
  const pricedMenus = menus.filter((m) => typeof m.pricePerGuestINR === "number");
  const defaultMenu = pricedMenus[0]?.pricePerGuestINR ?? 0;

  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(() => {
    const initial = estimate.events.filter(
      (e) => e === "Wedding" || e === "Reception",
    );
    return new Set(initial.length ? initial : estimate.events.slice(0, 1));
  });
  const [menuPrice, setMenuPrice] = useState(defaultMenu);
  const [roomsOn, setRoomsOn] = useState(false);

  const lines = useMemo(() => {
    const n = selectedEvents.size;
    if (n === 0) return { rows: [] as { label: string; value: string }[], total: 0 };

    const venue = estimate.venueHireINR * n;
    const food = menuPrice * guests * n;
    const rooms =
      roomsOn && estimate.roomsPackageINR ? estimate.roomsPackageINR : 0;
    const rows = [
      {
        label: `Venue · ${n} event${n === 1 ? "" : "s"}`,
        value: formatINR(venue),
      },
      {
        label: `Food · ${guests} guests × ${n}`,
        value: formatINR(food),
      },
    ];
    if (rooms && estimate.roomsPackageLabel) {
      rows.push({
        label: estimate.roomsPackageLabel,
        value: formatINR(rooms),
      });
    }
    return { rows, total: venue + food + rooms };
  }, [selectedEvents, estimate, menuPrice, guests, roomsOn]);

  function toggleEvent(name: string) {
    setSelectedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  if (estimate.events.length === 0 && pricedMenus.length === 0) return null;

  return (
    <aside className="calc" aria-label="Estimate">
      <span className="vp-cap">Rough estimate</span>
      <h3>Your wedding here</h3>

      {estimate.events.length > 0 && (
        <>
          <span className="gl">Events</span>
          <div className="evs">
            {estimate.events.map((e) => (
              <button
                key={e}
                type="button"
                className="pill"
                aria-pressed={selectedEvents.has(e)}
                onClick={() => toggleEvent(e)}
              >
                {e}
              </button>
            ))}
          </div>
        </>
      )}

      {pricedMenus.length > 0 && (
        <>
          <span className="gl">Menu</span>
          <div className="seg" role="group" aria-label="Menu">
            {pricedMenus.map((m) => (
              <button
                key={m.name}
                type="button"
                data-m={m.pricePerGuestINR}
                aria-pressed={menuPrice === m.pricePerGuestINR}
                onClick={() => setMenuPrice(m.pricePerGuestINR!)}
              >
                {m.name}
              </button>
            ))}
          </div>
        </>
      )}

      {estimate.roomsPackageINR != null && estimate.roomsPackageLabel && (
        <button
          type="button"
          className="tog"
          aria-pressed={roomsOn}
          onClick={() => setRoomsOn((v) => !v)}
        >
          {estimate.roomsPackageLabel}
          <i aria-hidden="true" />
        </button>
      )}

      <dl className="lines">
        {lines.rows.length === 0 ? (
          <div>
            <dt>Choose at least one event</dt>
            <dd />
          </div>
        ) : (
          lines.rows.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))
        )}
      </dl>
      <div className="tot">
        <span>Estimate</span>
        <b>{lines.rows.length ? band(lines.total) : "—"}</b>
      </div>
      <p className="fine">
        For {guests} guests (from the slider above). Taxes extra. Your final
        quote comes from the venue.
      </p>
    </aside>
  );
}
