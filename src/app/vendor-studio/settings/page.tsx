"use client";

import Link from "next/link";
import { ScreenSkeleton } from "@/components/studio/screen";
import { useMyAccount, useMyListing, useSessionHydrated } from "@/lib/vendor-api";

/** Account settings: who is signed in, and where to edit public contact. */
export default function SettingsPage() {
  const hydrated = useSessionHydrated();
  const account = useMyAccount();
  const listing = useMyListing();

  if (!hydrated || !account) return <ScreenSkeleton />;

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <p className="max-w-prose text-[length:var(--text-dash-body)] text-mute">
        Your Wedoura vendor account. Listing contact details for couples live on the Profile screen.
      </p>

      <section className="studio-card">
        <h2 className="studio-section-title">Account</h2>
        <dl className="mt-5 grid gap-4">
          <div>
            <dt className="label text-mute">Signed in as</dt>
            <dd className="mt-1 text-[length:var(--text-dash-body)] text-ink">{account.email}</dd>
          </div>
          <div>
            <dt className="label text-mute">Contact person</dt>
            <dd className="mt-1 text-[length:var(--text-dash-body)] text-ink">{account.contactName}</dd>
          </div>
          <div>
            <dt className="label text-mute">Account WhatsApp</dt>
            <dd className="mt-1 text-[length:var(--text-dash-body)] text-ink">{account.whatsapp}</dd>
          </div>
        </dl>
      </section>

      <section className="studio-card">
        <h2 className="studio-section-title">Public contact</h2>
        <p className="mt-3 text-[length:var(--text-dash-help)] text-mute">
          WhatsApp, enquiry email, Instagram and website on your live profile.
        </p>
        <dl className="mt-5 grid gap-3 text-[length:var(--text-dash-body)]">
          <div className="flex justify-between gap-4">
            <dt className="text-mute">WhatsApp</dt>
            <dd className="text-ink">{listing?.contact.whatsapp || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-mute">Email</dt>
            <dd className="text-ink">{listing?.contact.email || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-mute">Instagram</dt>
            <dd className="text-ink">{listing?.contact.instagram || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-mute">Website</dt>
            <dd className="text-ink">{listing?.contact.website || "—"}</dd>
          </div>
        </dl>
        <Link href="/vendor-studio/profile#contact" className="studio-btn mt-6">
          Edit on Profile
        </Link>
      </section>
    </div>
  );
}
