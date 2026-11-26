"use client";

import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/media/Photo";
import { useFocusTrap } from "@/lib/focus-trap";
import { useSavedVendors, toggleSaved } from "@/lib/saved";
import type { VendorSummary } from "@/data/types";
import type { EnquiryTarget } from "./enquiry-context";

interface Props {
  onEnquireAll: (targets: EnquiryTarget[]) => void;
}

async function fetchSummaries(slugs: string[]): Promise<VendorSummary[]> {
  if (!slugs.length) return [];
  const res = await fetch(`/api/vendors/by-slugs?slugs=${slugs.join(",")}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { vendors: VendorSummary[] };
  return data.vendors ?? [];
}

/** Bottom tray + right-side shortlist drawer for the vendors directory. */
export function ShortlistDrawer({ onEnquireAll }: Props) {
  const slugs = useSavedVendors();
  const [open, setOpen] = useState(false);
  const [summaries, setSummaries] = useState<VendorSummary[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open);

  useEffect(() => {
    if (!open) return;
    fetchSummaries([...slugs]).then(setSummaries);
  }, [open, slugs]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const n = slugs.length;
  const trayOn = n > 0 && !open;

  return (
    <div className="vendors-dir">
      <div className={trayOn ? "tray on" : "tray"} id="tray" role="status">
        <span>
          <b id="trN">{n}</b>
          <span id="trT">{n === 1 ? "vendor shortlisted" : "vendors shortlisted"}</span>
        </span>
        <button type="button" className="btn" onClick={() => setOpen(true)}>
          View shortlist
        </button>
      </div>

      {open ? (
        <div className="dw" id="sl" role="dialog" aria-modal="true" aria-labelledby="slT">
          <div className="bgx" onClick={() => setOpen(false)} aria-hidden />
          <div className="dwp" ref={ref} data-lenis-prevent>
            <div className="dwh">
              <div>
                <span className="cap gold">Your shortlist</span>
                <h2 id="slT">
                  {n} vendor{n === 1 ? "" : "s"}
                </h2>
              </div>
              <button type="button" className="dwx" onClick={() => setOpen(false)}>
                Close ✕
              </button>
            </div>
            <div className="dwb">
              {summaries.length === 0 ? (
                <p className="slempty">Loading your shortlist…</p>
              ) : (
                summaries.map((v) => {
                  const thumb = v.cardPhotos[0] ?? v.stripPhotos[0];
                  return (
                    <div key={v.slug} className="sl">
                      {thumb ? (
                        <Photo photo={thumb} mode="cover" sizes="84px" className="h-[84px] w-[84px]" />
                      ) : (
                        <span style={{ width: 84, height: 84, background: "#e7e1d6" }} />
                      )}
                      <div>
                        <b>{v.name}</b>
                        <small>
                          {v.categoryName} · {v.cityName}
                        </small>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleSaved(v.slug, "vendor")}
                        aria-label={`Remove ${v.name}`}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })
              )}
            </div>
            <div className="dwf">
              <button
                type="button"
                className="btn"
                disabled={summaries.length === 0}
                onClick={() => {
                  setOpen(false);
                  onEnquireAll(summaries.map((v) => ({ slug: v.slug, name: v.name })));
                }}
              >
                Enquire with all
              </button>
              <p>One message, sent to every vendor on your shortlist.</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
