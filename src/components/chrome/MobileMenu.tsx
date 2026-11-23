"use client";

import Link from "next/link";
import { useRef } from "react";
import { NAV_LINKS, NAV_LIST } from "@/components/chrome/nav";
import { Wordmark } from "@/components/chrome/Wordmark";
import { useFocusTrap } from "@/lib/focus-trap";

type Props = {
  open: boolean;
  onClose: () => void;
};

/** Full-screen menu. Serif links, then Free planning help as the button and List your business under it. */
export function MobileMenu({ open, onClose }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useFocusTrap(rootRef, open, closeRef);

  if (!open) return null;

  const links = NAV_LINKS.filter((item) => item.href !== NAV_LIST.href && item.href !== "/contact");

  return (
    <div
      ref={rootRef}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-0 z-50 flex flex-col bg-ivory px-6 pb-8 text-ink"
    >
      <div className="flex h-nav shrink-0 items-center justify-between border-b border-line">
        <Wordmark size="menu" />
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="flex h-11 w-11 items-center justify-center"
        >
          <svg viewBox="0 0 24 24" className="size-5 stroke-ink" aria-hidden="true" fill="none">
            <path d="M5 5l14 14M19 5 5 19" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
      <nav aria-label="Mobile" className="mt-6 flex flex-1 flex-col overflow-auto">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="border-b border-line py-3.5 font-serif text-[2.25rem] leading-tight text-ink"
          >
            {item.label === "Real weddings" ? (
              <>
                Real <em className="text-gold">weddings</em>
              </>
            ) : (
              item.label
            )}
          </Link>
        ))}
      </nav>
      <div className="flex flex-col items-start gap-5 pt-6">
        <Link
          href="/contact"
          onClick={onClose}
          className="inline-flex min-h-12 w-full items-center justify-center bg-ink px-6 font-sans text-button font-medium tracking-button text-ivory uppercase"
        >
          Free planning help
        </Link>
        <Link
          href={NAV_LIST.href}
          onClick={onClose}
          className="font-sans text-button font-medium tracking-[0.26em] uppercase border-b border-gold pb-1"
        >
          {NAV_LIST.label}
        </Link>
      </div>
    </div>
  );
}
