"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Wordmark } from "@/components/chrome/Wordmark";
import { Photo } from "@/components/media/Photo";
import { Button } from "@/components/ui/Button";
import type { InquiryStage, VendorSummary } from "@/data/types";
import {
  coupleLogout,
  markCoupleNotificationsRead,
  updateCoupleDetails,
  useCoupleAccount,
  useCoupleHydrated,
} from "@/lib/couple-auth";
import { cn } from "@/lib/cn";
import { formatINR, formatPrice } from "@/lib/format";
import { useSavedVendors, toggleSaved } from "@/lib/saved";
import { listCoupleInquiries, type CoupleInquiryView } from "@/lib/vendor-api";

type Tab = "overview" | "shortlist" | "enquiries" | "compare" | "details" | "notify";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "shortlist", label: "Shortlist" },
  { id: "enquiries", label: "Enquiries" },
  { id: "compare", label: "Compare" },
  { id: "details", label: "Details" },
  { id: "notify", label: "Alerts" },
];

const STAGE_LABEL: Record<InquiryStage, string> = {
  new: "New",
  contacted: "Contacted",
  quote_sent: "Quote sent",
  booked: "Booked",
  lost: "Closed",
};

function monthLabel(value: string) {
  if (!value) return "—";
  const [y, m] = value.split("-").map(Number);
  if (!y || !m) return value;
  return new Date(y, m - 1, 1).toLocaleString("en-IN", { month: "long", year: "numeric" });
}

export function AccountSpace() {
  const router = useRouter();
  const hydrated = useCoupleHydrated();
  const account = useCoupleAccount();
  const savedSlugs = useSavedVendors();
  const [tab, setTab] = useState<Tab>("overview");
  const savedKey = savedSlugs.join(",");
  const [fetchedVendors, setFetchedVendors] = useState<{ key: string; items: VendorSummary[] }>({
    key: "",
    items: [],
  });
  const vendors = savedKey === "" ? [] : fetchedVendors.key === savedKey ? fetchedVendors.items : [];
  const [inquiries, setInquiries] = useState<CoupleInquiryView[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!account) {
      router.replace("/login");
      return;
    }
    if (!account.onboarded) {
      router.replace("/login");
    }
  }, [hydrated, account, router]);

  useEffect(() => {
    if (!account?.email) return;
    let cancelled = false;
    (async () => {
      const list = await listCoupleInquiries(account.email);
      if (!cancelled) setInquiries(list);
    })();
    return () => {
      cancelled = true;
    };
  }, [account?.email]);

  useEffect(() => {
    if (!savedKey) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/vendors/by-slugs?slugs=${encodeURIComponent(savedKey)}`);
      if (!res.ok || cancelled) return;
      const data = (await res.json()) as { vendors?: VendorSummary[] };
      if (!cancelled) setFetchedVendors({ key: savedKey, items: data.vendors ?? [] });
    })();
    return () => {
      cancelled = true;
    };
  }, [savedKey]);

  useEffect(() => {
    if (tab === "notify") markCoupleNotificationsRead();
  }, [tab]);

  const unread = useMemo(
    () => account?.notifications.filter((n) => !n.read).length ?? 0,
    [account?.notifications],
  );

  function toggleCompare(slug: string) {
    setCompare((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 3) return prev;
      return [...prev, slug];
    });
  }

  if (!hydrated || !account?.onboarded) {
    return (
      <div className="flex min-h-[50svh] items-center justify-center bg-ivory text-mute">
        Opening your wedding space…
      </div>
    );
  }

  const compareVendors = vendors.filter((v) => compare.includes(v.slug));

  return (
    <div className="acct-shell">
      <header className="acct-h">
        <Wordmark />
        <nav aria-label="Your wedding">
          <ul className="acct-tabs">
            {TABS.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={cn(tab === t.id && "on")}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                  {t.id === "notify" && unread > 0 ? ` (${unread})` : ""}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="acct-right relative">
          <Link href="/vendors" className="hidden border-b border-gold pb-1 font-sans text-button font-medium tracking-[0.22em] uppercase md:inline">
            Find vendors
          </Link>
          <button
            type="button"
            className="tap flex size-11 items-center justify-center border border-line bg-white font-serif text-h3"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Account menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {(account.names || "?").slice(0, 1)}
          </button>
          {menuOpen ? (
            <div
              className="absolute top-full right-0 z-40 mt-2 min-w-[12rem] border border-line bg-white py-2"
              role="menu"
            >
              <button type="button" role="menuitem" className="block w-full px-4 py-2 text-left text-small hover:bg-sand" onClick={() => { setTab("details"); setMenuOpen(false); }}>
                Wedding details
              </button>
              <button type="button" role="menuitem" className="block w-full px-4 py-2 text-left text-small hover:bg-sand" onClick={() => { setTab("notify"); setMenuOpen(false); }}>
                Notifications
              </button>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-4 py-2 text-left text-small hover:bg-sand"
                onClick={async () => {
                  await coupleLogout();
                  router.push("/login");
                }}
              >
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <main className="acct-main" id="view" tabIndex={-1}>
        {tab === "overview" && (
          <Overview
            names={account.names}
            city={account.city}
            month={account.weddingMonth}
            shortlistCount={vendors.length}
            enquiryCount={inquiries.length}
            unread={unread}
            onTab={setTab}
          />
        )}
        {tab === "shortlist" && (
          <Shortlist
            vendors={vendors}
            compare={compare}
            onCompare={toggleCompare}
          />
        )}
        {tab === "enquiries" && <Enquiries items={inquiries} />}
        {tab === "compare" && (
          <Compare vendors={compareVendors} onClear={() => setCompare([])} />
        )}
        {tab === "details" && (
          <Details
            names={account.names}
            weddingMonth={account.weddingMonth}
            city={account.city}
          />
        )}
        {tab === "notify" && <Notifications items={account.notifications} />}
      </main>

      <nav className="acct-bar" aria-label="Your wedding">
        {TABS.filter((t) => t.id !== "notify").map((t) => (
          <button key={t.id} type="button" className={cn(tab === t.id && "on")} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function Overview({
  names,
  city,
  month,
  shortlistCount,
  enquiryCount,
  unread,
  onTab,
}: {
  names: string;
  city: string;
  month: string;
  shortlistCount: number;
  enquiryCount: number;
  unread: number;
  onTab: (t: Tab) => void;
}) {
  return (
    <div>
      <p className="label text-gold-deep">Your wedding space</p>
      <h1 className="mt-3 font-serif text-h1 text-ink">
        {names || "Your wedding"}, in <em>one</em> place
      </h1>
      <p className="mt-4 max-w-prose text-mute">
        {monthLabel(month)}
        {city ? ` · ${city}` : ""}
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <button type="button" className="acct-card text-left tap" onClick={() => onTab("shortlist")}>
          <p className="label text-gold-deep">Shortlist</p>
          <p className="mt-3 font-serif text-h2">{shortlistCount}</p>
          <p className="mt-2 text-small text-mute">Vendors you&apos;ve saved</p>
        </button>
        <button type="button" className="acct-card text-left tap" onClick={() => onTab("enquiries")}>
          <p className="label text-gold-deep">Enquiries</p>
          <p className="mt-3 font-serif text-h2">{enquiryCount}</p>
          <p className="mt-2 text-small text-mute">Stage and quote from each vendor</p>
        </button>
        <button type="button" className="acct-card text-left tap" onClick={() => onTab("notify")}>
          <p className="label text-gold-deep">Notifications</p>
          <p className="mt-3 font-serif text-h2">{unread}</p>
          <p className="mt-2 text-small text-mute">Unread updates</p>
        </button>
      </div>
      <div className="mt-10">
        <Button href="/vendors" variant="outline">
          Find more vendors
        </Button>
      </div>
    </div>
  );
}

function Shortlist({
  vendors,
  compare,
  onCompare,
}: {
  vendors: VendorSummary[];
  compare: string[];
  onCompare: (slug: string) => void;
}) {
  if (vendors.length === 0) {
    return (
      <div>
        <h1 className="font-serif text-h2">Your shortlist</h1>
        <p className="mt-4 text-mute">Nothing saved yet. Browse vendors and tap the bookmark.</p>
        <Button href="/vendors" className="mt-6">
          Find vendors
        </Button>
      </div>
    );
  }
  return (
    <div>
      <h1 className="font-serif text-h2">Your shortlist</h1>
      <p className="mt-3 text-mute">Synced with Saved. Select up to three to compare.</p>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {vendors.map((v) => {
          const inCompare = compare.includes(v.slug);
          return (
            <li key={v.slug} className="acct-card">
              {v.cardPhotos[0] ? (
                <div className="relative aspect-4/5 overflow-hidden bg-sand">
                  <Photo photo={v.cardPhotos[0]} sizes="(min-width: 64rem) 25vw, 50vw" mode="cover" />
                </div>
              ) : null}
              <p className="mt-4 font-serif text-h3">{v.name}</p>
              <p className="mt-1 text-small text-gold-deep">{v.categoryName}</p>
              <p className="mt-2 text-small text-mute">
                {formatPrice(v.startingPriceINR, v.priceUnit)}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={`/vendors/${v.slug}`} className="border-b border-gold pb-1 font-sans text-button font-medium tracking-[0.2em] uppercase">
                  View
                </Link>
                <button
                  type="button"
                  className="border-b border-line pb-1 font-sans text-button font-medium tracking-[0.2em] uppercase"
                  onClick={() => onCompare(v.slug)}
                  disabled={!inCompare && compare.length >= 3}
                >
                  {inCompare ? "In compare" : "Compare"}
                </button>
                <button
                  type="button"
                  className="border-b border-line pb-1 font-sans text-button font-medium tracking-[0.2em] uppercase"
                  onClick={() => toggleSaved(v.slug, "vendor")}
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Enquiries({ items }: { items: CoupleInquiryView[] }) {
  if (items.length === 0) {
    return (
      <div>
        <h1 className="font-serif text-h2">Enquiries</h1>
        <p className="mt-4 text-mute">When you enquire with a vendor, the stage and quote appear here. Replies stay on WhatsApp.</p>
      </div>
    );
  }
  return (
    <div>
      <h1 className="font-serif text-h2">Enquiries</h1>
      <p className="mt-3 text-mute">Stage and quote from each Inquiry. No in-app chat.</p>
      <ul className="mt-8 grid gap-4">
        {items.map((inq) => {
          const stage = (inq.stage ?? "new") as InquiryStage;
          return (
            <li key={inq.id} className="acct-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-h3">
                    {inq.vendorSlug ? (
                      <Link href={`/vendors/${inq.vendorSlug}`} className="link-draw">
                        {inq.vendorName ?? "Vendor"}
                      </Link>
                    ) : (
                      inq.vendorName ?? "Vendor"
                    )}
                  </p>
                  <p className="mt-2 text-small text-mute">
                    {inq.city}
                    {inq.weddingMonth ? ` · ${monthLabel(inq.weddingMonth)}` : ""}
                  </p>
                </div>
                <span className="acct-pill">{STAGE_LABEL[stage]}</span>
              </div>
              <p className="mt-4 max-w-prose text-mute">{inq.message}</p>
              {inq.quoteINR != null ? (
                <p className="mt-4 font-sans text-body font-medium text-gold-deep">
                  Quote {formatINR(inq.quoteINR)}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Compare({ vendors, onClear }: { vendors: VendorSummary[]; onClear: () => void }) {
  if (vendors.length === 0) {
    return (
      <div>
        <h1 className="font-serif text-h2">Compare</h1>
        <p className="mt-4 text-mute">Pick up to three vendors from your shortlist to compare side by side.</p>
      </div>
    );
  }
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-h2">Compare</h1>
        <button type="button" className="border-b border-gold pb-1 font-sans text-button font-medium tracking-[0.2em] uppercase" onClick={onClear}>
          Clear
        </button>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {vendors.map((v) => (
          <div key={v.slug} className="acct-card">
            {v.cardPhotos[0] ? (
              <div className="relative aspect-4/5 overflow-hidden bg-sand">
                <Photo photo={v.cardPhotos[0]} sizes="(min-width: 48rem) 30vw, 90vw" mode="cover" />
              </div>
            ) : null}
            <p className="mt-4 font-serif text-h3">{v.name}</p>
            <dl className="mt-4 grid gap-3 text-small">
              <div>
                <dt className="label text-gold-deep">Category</dt>
                <dd className="mt-1">{v.categoryName}</dd>
              </div>
              <div>
                <dt className="label text-gold-deep">City</dt>
                <dd className="mt-1">{v.cityName}</dd>
              </div>
              <div>
                <dt className="label text-gold-deep">From</dt>
                <dd className="mt-1">{formatPrice(v.startingPriceINR, v.priceUnit)}</dd>
              </div>
            </dl>
            <Link href={`/vendors/${v.slug}`} className="mt-6 inline-block border-b border-gold pb-1 font-sans text-button font-medium tracking-[0.2em] uppercase">
              View profile
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function Details({
  names,
  weddingMonth,
  city,
}: {
  names: string;
  weddingMonth: string;
  city: string;
}) {
  const [values, setValues] = useState({ names, weddingMonth, city });
  const [saved, setSaved] = useState(false);

  const months = Array.from({ length: 24 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + i);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-IN", { month: "long", year: "numeric" });
    return { value, label };
  });

  const cities = [
    "Bengaluru",
    "Mumbai",
    "Delhi NCR",
    "Chennai",
    "Hyderabad",
    "Kolkata",
    "Pune",
    "Jaipur",
    "Udaipur",
    "Goa",
    "Kochi",
    "Mysuru",
    "Destination abroad",
    "Not decided yet",
  ];

  return (
    <div className="max-w-lg">
      <h1 className="font-serif text-h2">Wedding details</h1>
      <form
        className="mt-8 grid gap-6"
        onSubmit={async (e) => {
          e.preventDefault();
          await updateCoupleDetails(values);
          setSaved(true);
        }}
      >
        <label className="block">
          <span className="label text-gold-deep">Your names</span>
          <input
            className="mt-2 w-full border-b border-line bg-transparent pb-2 text-body outline-offset-4 focus:border-ink"
            value={values.names}
            onChange={(e) => setValues((v) => ({ ...v, names: e.target.value }))}
          />
        </label>
        <label className="block">
          <span className="label text-gold-deep">Wedding month</span>
          <select
            className="mt-2 w-full border-b border-line bg-transparent pb-2 text-body outline-offset-4 focus:border-ink"
            value={values.weddingMonth}
            onChange={(e) => setValues((v) => ({ ...v, weddingMonth: e.target.value }))}
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label text-gold-deep">City</span>
          <select
            className="mt-2 w-full border-b border-line bg-transparent pb-2 text-body outline-offset-4 focus:border-ink"
            value={values.city}
            onChange={(e) => setValues((v) => ({ ...v, city: e.target.value }))}
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <div>
          <Button type="submit">Save details</Button>
          {saved ? (
            <p className="mt-3 text-small text-mute" role="status">
              Saved.
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}

function Notifications({
  items,
}: {
  items: { id: string; text: string; read: boolean; at: string }[];
}) {
  if (items.length === 0) {
    return (
      <div>
        <h1 className="font-serif text-h2">Notifications</h1>
        <p className="mt-4 text-mute">You&apos;re all caught up.</p>
      </div>
    );
  }
  return (
    <div>
      <h1 className="font-serif text-h2">Notifications</h1>
      <ul className="mt-8 grid gap-3">
        {items.map((n) => (
          <li key={n.id} className={cn("acct-card", !n.read && "border-gold")}>
            <p className="text-body">{n.text}</p>
            <p className="mt-2 text-small text-mute">
              {new Date(n.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
