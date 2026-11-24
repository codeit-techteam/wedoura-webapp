"use client";

import { useEffect, useId, useRef, useState } from "react";
import { InquiryForm } from "@/components/profile/InquiryForm";
import { useFocusTrap } from "@/lib/focus-trap";

type Props = {
  vendorName: string;
  vendorSlug: string;
  packageLabel: string;
  packageLabels: string[];
};

/**
 * "Book now" on a pricing card: opens a contact drawer that creates an Inquiry
 * for that collection. No payment — same path as Check availability.
 */
export function PackageBookButton({ vendorName, vendorSlug, packageLabel, packageLabels }: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="label tap mt-auto inline-flex min-h-12 w-full items-center justify-center border border-ink bg-ink px-5 text-ivory transition-chrome hover:bg-transparent hover:text-ink"
      >
        Book now
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <button
            type="button"
            aria-label="Close booking form"
            className="absolute inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-lenis-prevent
            className="relative z-10 max-h-[92svh] w-full overflow-y-auto overscroll-contain border border-line bg-ivory p-6 shadow-none md:max-w-lg md:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label text-gold-deep">Book {packageLabel}</p>
                <h2 id={titleId} className="mt-2 font-serif text-h3 text-ink">
                  Leave your details
                </h2>
                <p className="mt-2 text-small text-mute">
                  We pass your note to {vendorName}. No payment on Wedoura — they reply on WhatsApp.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="tap shrink-0 px-2 py-1 text-button tracking-button uppercase text-mute hover:text-ink"
              >
                Close
              </button>
            </div>
            <div className="mt-8">
              <InquiryForm
                vendorName={vendorName}
                vendorSlug={vendorSlug}
                packageLabels={packageLabels}
                defaultCollection={packageLabel}
                source="package_book"
                submitLabel="Request to book"
                compact
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
