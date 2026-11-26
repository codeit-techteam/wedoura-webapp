"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCoupleAccount, useCoupleHydrated } from "@/lib/couple-auth";
import {
  useMySoulmateProfile,
  useSoulmatesActivityDot,
} from "@/lib/soulmates-api";

/** Account menu for signed-in couples in the site header. Hidden when signed out. */
export function AccountNav() {
  const hydrated = useCoupleHydrated();
  const account = useCoupleAccount();
  const profile = useMySoulmateProfile();
  const dot = useSoulmatesActivityDot();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (!hydrated) return null;

  /* Signed-out: no header Sign in — use List your business / login pages. */
  if (!account) return null;

  const initial = (account.names || account.email || "?").slice(0, 1).toUpperCase();

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((v) => !v)}
        className="relative flex size-10 items-center justify-center border border-current/20 font-serif text-[1.1rem]"
      >
        {initial}
        {profile && dot ? (
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 size-2 rounded-full bg-gold-deep"
          />
        ) : null}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute top-full right-0 z-50 mt-2 min-w-[13rem] border border-line bg-white py-2 text-ink shadow-none"
        >
          <Link
            role="menuitem"
            href="/account"
            className="block px-4 py-2.5 font-sans text-[13px] hover:bg-sand"
            onClick={() => setOpen(false)}
          >
            Your wedding
          </Link>
          {profile ? (
            <Link
              role="menuitem"
              href="/soulmates/me"
              className="flex items-center justify-between gap-3 px-4 py-2.5 font-sans text-[13px] hover:bg-sand"
              onClick={() => setOpen(false)}
            >
              <span>Soulmates</span>
              {dot ? (
                <span className="size-2 rounded-full bg-gold-deep" aria-label="New activity" />
              ) : null}
            </Link>
          ) : (
            <Link
              role="menuitem"
              href="/soulmates"
              className="block px-4 py-2.5 font-sans text-[13px] hover:bg-sand"
              onClick={() => setOpen(false)}
            >
              Soulmates
            </Link>
          )}
          <Link
            role="menuitem"
            href="/saved"
            className="block px-4 py-2.5 font-sans text-[13px] hover:bg-sand"
            onClick={() => setOpen(false)}
          >
            Saved
          </Link>
        </div>
      ) : null}
    </div>
  );
}
