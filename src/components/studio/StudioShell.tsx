"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Camera,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { StudioSaveBar, SaveState, useDirty } from "@/components/studio/autosave";
import { checklistProgress, computeChecklist } from "@/components/studio/checklist";
import { StatusBadge } from "@/components/studio/status";
import type { VendorAccount, VendorListing } from "@/data/types";
import { cn } from "@/lib/cn";
import { logout, useMyInquiries } from "@/lib/vendor-api";

type NavItem = {
  href: string;
  label: string;
  short: string;
  icon: typeof LayoutDashboard;
  badge?: "enquiries";
  main?: boolean;
};

const NAV: NavItem[] = [
  { href: "/vendor-studio", label: "Overview", short: "Home", icon: LayoutDashboard, main: true },
  { href: "/vendor-studio/enquiries", label: "Enquiries", short: "Inbox", icon: MessageSquare, badge: "enquiries", main: true },
  { href: "/vendor-studio/profile", label: "Profile", short: "Profile", icon: UserRound, main: true },
  { href: "/vendor-studio/media", label: "Photos and videos", short: "Media", icon: Camera, main: true },
  { href: "/vendor-studio/weddings", label: "Real weddings", short: "Stories", icon: Heart, main: true },
  { href: "/vendor-studio/settings", label: "Settings", short: "Settings", icon: Settings },
];

const PAGE_TITLE: { match: (path: string) => boolean; title: string }[] = [
  { match: (p) => p === "/vendor-studio", title: "Overview" },
  { match: (p) => p.startsWith("/vendor-studio/enquiries"), title: "Enquiries" },
  { match: (p) => p.startsWith("/vendor-studio/profile"), title: "Profile" },
  { match: (p) => p.startsWith("/vendor-studio/media"), title: "Photos and videos" },
  { match: (p) => p.startsWith("/vendor-studio/weddings"), title: "Real weddings" },
  { match: (p) => p.startsWith("/vendor-studio/settings"), title: "Settings" },
];

function pageTitle(pathname: string): string {
  return PAGE_TITLE.find((row) => row.match(pathname))?.title ?? "Dashboard";
}

function isActivePath(pathname: string, href: string) {
  return href === "/vendor-studio" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function StudioNavLinks({
  pathname,
  dirty,
  newLeads,
  onNavigate,
}: {
  pathname: string;
  dirty: boolean;
  newLeads: number;
  onNavigate?: () => void;
}) {
  return (
    <>
      {NAV.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn("studio-nav-link", isActivePath(pathname, item.href) && "on")}
            onClick={(e) => {
              if (dirty && item.href !== pathname && !window.confirm("You have unsaved changes. Leave this page?")) {
                e.preventDefault();
                return;
              }
              onNavigate?.();
            }}
          >
            <Icon className="size-[1.125rem] shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.badge === "enquiries" && newLeads > 0 ? <span className="studio-bd">{newLeads}</span> : null}
          </Link>
        );
      })}
    </>
  );
}

/**
 * Vendor dashboard chrome: white sidebar, content top bar, drawer under lg,
 * bottom tabs under sm. Completeness and logout live in the sidebar footer.
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
  const { dirty, status, error } = useDirty();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const newLeads = inquiries.filter((i) => i.status === "new").length;
  const items = listing ? computeChecklist(listing) : [];
  const { done, total } = checklistProgress(items);
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const avatar = listing?.avatar ?? listing?.cardPhotos[0];
  const displayName = listing?.name ?? account.contactName;
  const initial = displayName.slice(0, 1).toUpperCase();
  const publicHref = listing?.slug
    ? listing.venue || listing.category === "venues"
      ? `/venues/${listing.slug}`
      : `/vendors/${listing.slug}`
    : "/vendors";
  const title = pageTitle(pathname);

  const signOut = () => {
    void logout().then(() => router.push("/vendor/login"));
  };

  const closeDrawer = () => setDrawerOpen(false);

  const who = (
    <div className="studio-who">
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar.src} alt="" className="studio-avatar" />
      ) : (
        <span className="studio-avatar mono" aria-hidden="true">
          {initial}
        </span>
      )}
      <span className="sname">{displayName}</span>
    </div>
  );

  const sideFooter = (
    <div className="studio-side-foot">
      <div className="studio-pc">
        <div className="flex items-baseline justify-between gap-2">
          <span>Profile completeness</span>
          <b>{pct}%</b>
        </div>
        <div className="bar" aria-hidden="true">
          <i style={{ width: `${pct}%` }} />
        </div>
      </div>
      <button type="button" onClick={signOut} className="studio-nav-link studio-logout">
        <LogOut className="size-[1.125rem] shrink-0" strokeWidth={1.5} aria-hidden="true" />
        <span>Log out</span>
      </button>
    </div>
  );

  return (
    <div className="studio-app">
      <aside className="studio-side" aria-label="Dashboard sidebar">
        <Link href="/" className="studio-mark" aria-label="Wedoura, home">
          Wedoura
        </Link>
        {who}
        <nav className="studio-nav" aria-label="Dashboard">
          <StudioNavLinks pathname={pathname} dirty={dirty} newLeads={newLeads} />
        </nav>
        {sideFooter}
      </aside>

      <div className="studio-stage">
        <header className="studio-top">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="studio-menu-btn"
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen((o) => !o)}
            >
              {drawerOpen ? <X className="size-5" strokeWidth={1.5} /> : <Menu className="size-5" strokeWidth={1.5} />}
            </button>
            <h1 className="studio-page-title truncate">{title}</h1>
          </div>
          <div className="studio-top-actions">
            {listing ? <StatusBadge status={listing.status} /> : null}
            <Link href={publicHref} target="_blank" rel="noopener noreferrer" className="studio-top-link">
              View public profile ↗
            </Link>
            <SaveState
              status={dirty && status === "idle" ? "saving" : status}
              error={error}
              className="hidden sm:inline-flex"
            />
          </div>
        </header>

        <main className="studio-main" id="view">
          {children}
        </main>
      </div>

      {drawerOpen ? (
        <div className="studio-drawer" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="studio-drawer-scrim" aria-label="Close menu" onClick={closeDrawer} />
          <div className="studio-drawer-panel">
            <Link href="/" className="studio-mark" aria-label="Wedoura, home" onClick={closeDrawer}>
              Wedoura
            </Link>
            {who}
            <nav className="studio-nav" aria-label="Dashboard">
              <StudioNavLinks pathname={pathname} dirty={dirty} newLeads={newLeads} onNavigate={closeDrawer} />
            </nav>
            {sideFooter}
          </div>
        </div>
      ) : null}

      <nav className="studio-bar" aria-label="Dashboard">
        {NAV.filter((item) => item.main).map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(isActivePath(pathname, item.href) && "on")}
              onClick={(e) => {
                if (dirty && item.href !== pathname && !window.confirm("You have unsaved changes. Leave this page?")) {
                  e.preventDefault();
                }
              }}
            >
              <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
              <span>{item.short}</span>
              {item.badge === "enquiries" && newLeads > 0 ? <span className="studio-bd">{newLeads}</span> : null}
            </Link>
          );
        })}
      </nav>

      <StudioSaveBar />
    </div>
  );
}
