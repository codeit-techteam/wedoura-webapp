"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { useFocusTrap } from "@/lib/focus-trap";
import { EASE } from "@/lib/motion";
import { useSavedVendors, toggleSaved } from "@/lib/saved";
import type { VendorSummary } from "@/data/types";
import type { EnquiryTarget } from "./enquiry-context";

interface Props {
  onEnquireAll: (targets: EnquiryTarget[]) => void;
}

/** Fetches saved vendor summaries from /api/vendors/by-slugs. */
async function fetchSummaries(slugs: string[]): Promise<VendorSummary[]> {
  if (!slugs.length) return [];
  const res = await fetch(`/api/vendors/by-slugs?slugs=${slugs.join(",")}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { vendors: VendorSummary[] };
  return data.vendors ?? [];
}

export function ShortlistDrawer({ onEnquireAll }: Props) {
  const slugs = useSavedVendors();
  const [open, setOpen] = useState(false);
  const [summaries, setSummaries] = useState<VendorSummary[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open);

  // Re-fetch when drawer opens or slugs change
  useEffect(() => {
    if (!open) return;
    fetchSummaries([...slugs]).then(setSummaries);
  }, [open, slugs]);

  if (slugs.length === 0) return null;

  return (
    <>
      {/* Tray pill */}
      <AnimatePresence>
        {!open && (
          <motion.div
            className="fixed bottom-6 right-4 z-40 md:bottom-8 md:right-8"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="tap flex items-center gap-3 border border-line bg-white px-5 py-3 shadow-[0_8px_32px_rgba(20,14,12,0.14)] transition-chrome hover:bg-ivory"
            >
              <Icon name="bookmark" size={18} className="fill-current text-gold" />
              <span className="font-sans text-small font-medium text-ink">
                View shortlist
              </span>
              <span className="flex size-5 items-center justify-center bg-ink font-sans text-[11px] font-medium text-ivory">
                {slugs.length}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <button
              type="button"
              aria-label="Close shortlist"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-ink/40"
            />
            <motion.div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-label="Your shortlist"
              className="relative flex h-full w-full max-w-sm flex-col bg-white"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <div>
                  <p className="label text-mute">Your shortlist</p>
                  <p className="font-serif text-lead text-ink">{slugs.length} vendor{slugs.length !== 1 ? "s" : ""}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close shortlist"
                  className="tap flex size-10 items-center justify-center text-mute hover:text-ink"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>

              {/* Vendor list */}
              <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                {summaries.length === 0 ? (
                  <div className="flex h-32 items-center justify-center">
                    <div className="size-5 animate-spin rounded-full border-2 border-line border-t-ink" />
                  </div>
                ) : (
                  <ul className="divide-y divide-line">
                    {summaries.map((v) => (
                      <li key={v.slug} className="flex items-center gap-4 px-6 py-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-ink truncate">{v.name}</p>
                          <p className="text-small text-mute">
                            {v.categoryName} · {v.cityName}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleSaved(v.slug, "vendor")}
                          aria-label={`Remove ${v.name} from shortlist`}
                          className="tap flex size-9 shrink-0 items-center justify-center text-mute hover:text-ink"
                        >
                          <Icon name="close" size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-line px-6 py-5">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    const targets: EnquiryTarget[] = summaries.map((v) => ({ slug: v.slug, name: v.name }));
                    onEnquireAll(targets);
                  }}
                  disabled={summaries.length === 0}
                  className={cn(
                    "tap w-full min-h-12 bg-ink font-sans text-button font-medium tracking-button uppercase text-ivory transition-chrome hover:bg-gold-deep disabled:opacity-50",
                  )}
                >
                  Enquire with all
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
