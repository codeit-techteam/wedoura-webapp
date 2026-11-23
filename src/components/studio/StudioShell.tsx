"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/chrome/Wordmark";
import { checklistProgress, computeChecklist } from "@/components/studio/checklist";
import type { VendorAccount, VendorListing } from "@/data/types";
import { cn } from "@/lib/cn";
import { logout, useMyInquiries } from "@/lib/vendor-api";

const NAV: { href: string; label: string; short: string; badge?: "leads" }[] = [
  { href: "/vendor-studio", label: "Overview", short: "Home" },
  { href: "/vendor-studio/leads", label: "Leads and pipeline", short: "Leads", badge: "leads" },
  { href: "/vendor-studio/calendar", label: "Calendar", short: "Cal" },
  { href: "/vendor-studio/media", label: "Photos and videos", short: "Media" },
  { href: "/vendor-studio/profile", label: "Profile", short: "Profile" },
  { href: "/vendor-studio/weddings", label: "Real weddings", short: "Stories" },
];

/**
 * Vendor dashboard chrome: sidebar on desktop, bottom tab bar on mobile,
 * View my profile, completeness meter and log out — matching the reference.
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
  const inquiries = useMyInquiries();
  const newLeads = inquiries.filter((i) => (i.stage ?? "new") === "new").length;
  const items = listing ? computeChecklist(listing) : [];
  const { done, total } = checklistProgress(items);
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const initial = (listing?.name ?? account.contactName).slice(0, 1).toUpperCase();
  const publicHref = listing?.slug ? `/vendors/${listing.slug}` : "/vendors";

  const isActive = (href: string) =>
    href === "/vendor-studio" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const signOut = () => {
    void logout().then(() => router.push("/vendor/login"));
  };

  return (
    <div className="studio-app">
      <aside className="studio-side">
        <Wordmark size="menu" />
        <Link
          href={publicHref}
          target="_blank"
          rel="noopener noreferrer"
          className="border-b border-gold pb-1 font-sans text-button font-medium tracking-[0.2em] uppercase self-start"
        >
          View my profile ↗
        </Link>
        <div className="studio-who">
          <i className="mono" aria-hidden="true">
            {initial}
          </i>
          <div>
            <span className="sname block font-serif text-[1.375rem] leading-tight">
              {listing?.name ?? account.contactName}
            </span>
            <small className="text-mute">Vendor dashboard</small>
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="self-start border-b border-gold pb-0.5 font-sans text-[0.6875rem] font-medium tracking-[0.2em] text-mute uppercase"
        >
          Log out
        </button>
        <nav className="studio-nav" id="nav" aria-label="Dashboard">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={cn(isActive(item.href) && "on")}>
              <span>{item.label}</span>
              {item.badge === "leads" && newLeads > 0 ? <span className="studio-bd">{newLeads}</span> : null}
            </Link>
          ))}
        </nav>
        <div className="studio-pc">
          Profile <b>{pct}%</b> complete
          <div className="bar" aria-hidden="true">
            <i style={{ width: `${pct}%` }} />
          </div>
        </div>
      </aside>

      <main className="studio-main" id="view">
        {children}
      </main>

      <nav className="studio-bar" aria-label="Dashboard">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className={cn(isActive(item.href) && "on")}>
            <span>{item.short}</span>
            {item.badge === "leads" && newLeads > 0 ? <span className="studio-bd">{newLeads}</span> : null}
          </Link>
        ))}
      </nav>
    </div>
  );
}
