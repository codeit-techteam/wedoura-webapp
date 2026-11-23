"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export type SearchDestination = { slug: string; name: string; country: string };

type Props = {
  destinations: SearchDestination[];
  moods: string[];
  /** Current values from the URL, so the pill reflects the page state. */
  initialWhere?: string;
  initialMood?: string;
};

const MOOD_HINTS: Record<string, string> = {
  Beach: "Sand, sea and slow mornings",
  Hills: "Tea estates and log fires",
  Heritage: "Palaces, courtyards, old stories",
  Backwaters: "Houseboats and lake views",
  Overseas: "Islands and far-away cities",
};

const SearchIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

/**
 * The honeymoon "Where to / Your mood" search pill from the landing
 * reference. Choosing values and pressing "Find escapes" writes them to the
 * URL (?where= & ?mood=), so the server filters the stays and packages and
 * every state stays linkable.
 */
export function HoneymoonSearch({ destinations, moods, initialWhere = "", initialMood = "" }: Props) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<"where" | "mood" | null>(null);
  const [where, setWhere] = useState(initialWhere);
  const [mood, setMood] = useState(initialMood);
  const [qWhere, setQWhere] = useState("");
  const [qMood, setQMood] = useState("");

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const whereName = destinations.find((d) => d.slug === where)?.name ?? "Anywhere";
  const india = destinations.filter((d) => d.country === "India");
  const overseas = destinations.filter((d) => d.country !== "India");

  const filterQ = (name: string, q: string) => !q.trim() || name.toLowerCase().includes(q.trim().toLowerCase());

  function go() {
    const search = new URLSearchParams();
    if (where) search.set("where", where);
    if (mood) search.set("mood", mood);
    const query = search.toString();
    router.push(`/honeymoon${query ? `?${query}` : ""}#stay`);
    setOpen(null);
  }

  function destGroup(label: string, list: SearchDestination[]) {
    const items = list.filter((d) => filterQ(d.name, qWhere));
    if (items.length === 0) return null;
    return (
      <>
        <h4>{label}</h4>
        {items.map((d) => (
          <button
            key={d.slug}
            type="button"
            className={`opt${where === d.slug ? " on" : ""}`}
            onClick={() => {
              setWhere(d.slug);
              setOpen("mood");
            }}
          >
            <span>{d.name}</span>
          </button>
        ))}
      </>
    );
  }

  return (
    <div className="srch" role="search" ref={rootRef}>
      {/* Where to */}
      <div className="dd">
        <button
          type="button"
          className="trig"
          aria-haspopup="dialog"
          aria-expanded={open === "where"}
          onClick={() => {
            setQWhere("");
            setOpen(open === "where" ? null : "where");
          }}
        >
          <span className="lbl">Where to</span>
          <span className="val">{whereName}</span>
          <svg className="chev" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {open === "where" && (
          <div className="panel pl" role="dialog" aria-label="Choose a destination">
            <div className="ps">
              {SearchIcon}
              <input
                type="text"
                value={qWhere}
                onChange={(e) => setQWhere(e.target.value)}
                placeholder="Search a destination"
                aria-label="Search a destination"
                autoComplete="off"
              />
            </div>
            <div className="pgrid">
              <button
                type="button"
                className={`opt${where === "" ? " on" : ""}`}
                onClick={() => {
                  setWhere("");
                  setOpen("mood");
                }}
              >
                <span>Anywhere</span>
              </button>
              {destGroup("In India", india)}
              {destGroup("Overseas", overseas)}
            </div>
          </div>
        )}
      </div>

      {/* Mood */}
      <div className="dd">
        <button
          type="button"
          className="trig"
          aria-haspopup="dialog"
          aria-expanded={open === "mood"}
          onClick={() => {
            setQMood("");
            setOpen(open === "mood" ? null : "mood");
          }}
        >
          <span className="lbl">Your mood</span>
          <span className="val">{mood || "Any mood"}</span>
          <svg className="chev" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {open === "mood" && (
          <div className="panel pc" role="dialog" aria-label="Choose a honeymoon mood">
            <div className="ps">
              {SearchIcon}
              <input
                type="text"
                value={qMood}
                onChange={(e) => setQMood(e.target.value)}
                placeholder="Search moods"
                aria-label="Search moods"
                autoComplete="off"
              />
            </div>
            <div className="pgrid">
              <button
                type="button"
                className={`opt${mood === "" ? " on" : ""}`}
                onClick={() => {
                  setMood("");
                  setOpen(null);
                }}
              >
                <span>Any mood</span>
              </button>
              {moods.filter((m) => filterQ(m, qMood)).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`opt${mood === m ? " on" : ""}`}
                  onClick={() => {
                    setMood(m);
                    setOpen(null);
                  }}
                >
                  <span>
                    {m}
                    {MOOD_HINTS[m] && <small>{MOOD_HINTS[m]}</small>}
                  </span>
                </button>
              ))}
              {moods.filter((m) => filterQ(m, qMood)).length === 0 && (
                <p className="pempty">No mood matches that. Try another word.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <button className="btn" type="button" onClick={go}>
        Find escapes
      </button>
    </div>
  );
}
