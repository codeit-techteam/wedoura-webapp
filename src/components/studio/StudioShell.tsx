"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Wordmark } from "@/components/chrome/Wordmark";
import { StatusBadge } from "@/components/studio/status";
import { useDirty } from "@/components/studio/autosave";
import { Icon } from "@/components/ui/Icon";
import type { VendorAccount, VendorListing } from "@/data/types";
import { cn } from "@/lib/cn";
import { useFocusTrap } from "@/lib/focus-trap";
import { EASE } from "@/lib/motion";
import { logout } from "@/lib/vendor-api";

const NAV: { group: string; items: { href: string; label: string; when?: (listing: VendorListing) => boolean }[] }[] = [
  {
    group: "Studio",
    items: [{ href: "/vendor-studio", label: "Overview" }],
  },
  {
    group: "Profile",
    items: [
      { href: "/vendor-studio/business", label: "Business details" },
      { href: "/vendor-studio/category", label: "Category & services" },
      { href: "/vendor-studio/locations", label: "Locations" },
      { href: "/vendor-studio/contact", label: "Contact" },
    ],
  },
  {
    group: "Media",
    items: [
      { href: "/vendor-studio/photos", label: "Photos" },
      { href: "/vendor-studio/covers", label: "Cover & card photos" },
      { href: "/vendor-studio/albums", label: "Albums" },
      { href: "/vendor-studio/films", label: "Films" },
      { href: "/vendor-studio/tour", label: "360 tour", when: (l) => l.category === "venues" },
    ],
  },
  {
    group: "Business",
    items: [
      { href: "/vendor-studio/pricing", label: "Pricing" },
      { href: "/vendor-studio/faqs", label: "FAQs" },
      { href: "/vendor-studio/inquiries", label: "Inquiries" },
      { href: "/vendor-studio/submit", label: "Submit for review" },
      { href: "/vendor-studio/account", label: "Account" },
    ],
  },
];

const LEAVE_MESSAGE = "You have unsaved changes. Leave this screen anyway?";

/**
 * The portal chrome: a dense left sidebar on desktop, a top bar with a
 * slide-in menu on phones. Same tokens as the public site, calmer.
 */
export function StudioShell({
  account,
  listing,
  children,
}: {
  account: VendorAccount;
  listing: VendorListing | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { dirty, setDirty } = useDirty();
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(drawerRef, menuOpen);

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // The leave-warning for in-portal navigation; autosave keeps the window small.
  const guard = (e: React.MouseEvent) => {
    if (dirty && !window.confirm(LEAVE_MESSAGE)) {
      e.preventDefault();
    } else {
      setDirty(false);
    }
  };

  const signOut = () => {
    if (dirty && !window.confirm(LEAVE_MESSAGE)) return;
    void logout().then(() => router.push("/"));
  };

  const nav = (onNavigate?: () => void) => (
    <nav aria-label="Studio sections" className="flex flex-1 flex-col gap-7 overflow-y-auto py-6">
      {NAV.map((section) => (
        <div key={section.group}>
          <p className="label px-5 text-mute/70">{section.group}</p>
          <ul className="mt-2.5">
            {section.items
              .filter((item) => !item.when || (listing !== null && item.when(listing)))
              .map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={(e) => {
                      guard(e);
                      if (!e.defaultPrevented) onNavigate?.();
                    }}
                    className={cn(
                      "tap flex items-center border-l-2 px-5 py-2.5 text-label-lg transition-chrome",
                      active
                        ? "border-ink bg-ivory font-medium text-ink"
                        : "border-transparent text-mute hover:border-line hover:bg-ivory/60 hover:text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const header = (
    <div className="border-b border-line px-5 py-5">
      <Wordmark size="menu" />
      <p className="mt-4 truncate font-serif text-h3">{listing?.name ?? account.contactName}</p>
      {listing && <StatusBadge status={listing.status} className="mt-2" />}
    </div>
  );

  const footer = (
    <div className="border-t border-line p-5">
      <Link
        href="/vendor-studio/preview"
        onClick={guard}
        className="label tap flex items-center justify-center border border-ink px-4 py-2.5 text-ink transition-chrome hover:bg-ink hover:text-white"
      >
        View preview
      </Link>
      <button
        type="button"
        onClick={signOut}
        className="link-draw tap mt-4 text-small text-mute hover:text-ink"
      >
        Sign out
      </button>
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-ivory/60">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-white lg:flex">
        {header}
        {nav()}
        {footer}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-white px-gutter py-2.5 lg:hidden">
          <p className="min-w-0 truncate font-serif text-h3">{listing?.name ?? account.contactName}</p>
          <div className="flex shrink-0 items-center gap-3">
            {listing && <StatusBadge status={listing.status} className="hidden sm:inline-flex" />}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              className="tap inline-flex items-center gap-2 text-label-lg font-medium text-ink"
            >
              <Icon name="menu" size={20} />
              Menu
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-gutter py-8 lg:px-10 lg:py-10">{children}</main>
      </div>

      {/* Mobile slide-in menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <motion.div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Studio menu"
              className="relative flex h-full w-80 max-w-[85vw] flex-col bg-white"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <div className="border-b border-line px-5 py-4">
                <div className="flex items-center justify-between">
                  <Wordmark size="menu" />
                  <button
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close menu"
                    className="tap inline-flex items-center justify-center text-ink"
                  >
                    <Icon name="close" size={22} />
                  </button>
                </div>
                <p className="mt-3 truncate font-serif text-h3">{listing?.name ?? account.contactName}</p>
                {listing && <StatusBadge status={listing.status} className="mt-2" />}
              </div>
              {nav(() => setMenuOpen(false))}
              {footer}
            </motion.div>
            <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} className="flex-1 bg-ink/50" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
