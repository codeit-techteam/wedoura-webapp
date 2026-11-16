"use client";

import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import type { ListingStatus } from "@/data/types";
import { cn } from "@/lib/cn";
import { useHydrated, useMockDb } from "@/lib/mock-store";
import { logout, submitListingForReview } from "@/lib/vendor-api";

const STATUS_LABEL: Record<ListingStatus, string> = {
  draft: "Draft",
  in_review: "In review",
  changes_requested: "Changes requested",
  published: "Published",
  unpublished: "Unpublished",
};

/**
 * The studio entry: renders by account status. The full editing portal is
 * the next session; for now the approved view shows the listing status and
 * a checklist of what a complete profile needs.
 */
export function StudioGate() {
  const db = useMockDb();
  const hydrated = useHydrated();
  const account = db.accounts.find((a) => a.id === db.sessionAccountId) ?? null;
  const listing = account?.listingId ? (db.listings.find((l) => l.id === account.listingId) ?? null) : null;

  // Neutral frame until client state is live, so a signed-in vendor never
  // flashes the logged-out screen.
  if (!hydrated) {
    return <div aria-hidden="true" className="min-h-64" />;
  }

  if (!account) {
    return (
      <div className="max-w-xl border border-line bg-white p-8 md:p-12">
        <p className="font-serif text-h2">Log in to manage your profile.</p>
        <p className="mt-4 text-mute">
          The studio is where vendors build their listing, set pricing and read inquiries.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button href="/login">Log in</Button>
          <Button href="/list-your-business" variant="outline">
            List your business
          </Button>
        </div>
      </div>
    );
  }

  if (account.status === "applied") {
    return (
      <div className="max-w-xl border border-line bg-white p-8 md:p-12" role="status">
        <Label>Application received</Label>
        <p className="mt-3 font-serif text-h2">Your application is under review.</p>
        <p className="mt-4 text-mute">
          We look at every application by hand, usually within a few days. Once you are approved, this page
          becomes your studio: you build your profile here and submit it for review.
        </p>
        <SignOut />
      </div>
    );
  }

  if (account.status === "rejected") {
    return (
      <div className="max-w-xl border border-line bg-white p-8 md:p-12" role="status">
        <Label>Application update</Label>
        <p className="mt-3 font-serif text-h2">We could not approve this application.</p>
        <p className="mt-4 text-mute">{account.rejectionNote || "Write to us if you think we got this wrong."}</p>
        <div className="mt-8">
          <Button href="/contact" variant="outline">
            Contact us
          </Button>
        </div>
        <SignOut />
      </div>
    );
  }

  if (account.status === "suspended") {
    return (
      <div className="max-w-xl border border-line bg-white p-8 md:p-12" role="status">
        <p className="font-serif text-h2">This account is suspended.</p>
        <p className="mt-4 text-mute">Your listing is not shown to couples right now. Write to us to sort it out.</p>
        <div className="mt-8">
          <Button href="/contact" variant="outline">
            Contact us
          </Button>
        </div>
        <SignOut />
      </div>
    );
  }

  // Approved.
  const checklist = listing
    ? [
        { label: "Add your photographs", done: listing.portfolio.length > 0 || listing.cardPhotos.length > 0 },
        { label: "Write your about", done: listing.about.length > 0 },
        { label: "Set your packages", done: listing.packages.length > 0 },
        { label: "Add albums and FAQs", done: listing.albums.length > 0 && listing.faqs.length > 0 },
        { label: "Submit for review", done: listing.status !== "draft" },
      ]
    : [];
  const canSubmit = listing && (listing.status === "draft" || listing.status === "changes_requested");

  return (
    <div className="max-w-2xl">
      <div className="border border-line bg-white p-8 md:p-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Label>Your listing</Label>
            <p className="mt-1 font-serif text-h2">{listing?.name ?? account.contactName}</p>
          </div>
          {listing && (
            <span className="label border border-line px-4 py-2" data-status={listing.status}>
              {STATUS_LABEL[listing.status]}
            </span>
          )}
        </div>

        {listing && (
          <ul className="mt-8 border-t border-line" aria-label="Profile checklist">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-6 border-b border-line py-4">
                <span className={cn("text-body", item.done ? "text-mute line-through" : "text-ink")}>{item.label}</span>
                <span className="label text-mute">{item.done ? "Done" : "To do"}</span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 text-small text-mute">
          Editing your profile here arrives with the full studio in the next build step.
        </p>

        {canSubmit && (
          <div className="mt-8">
            <Button onClick={() => void submitListingForReview()}>Submit for review</Button>
          </div>
        )}
        {listing?.status === "in_review" && (
          <p className="mt-8 text-mute" role="status">
            Submitted. We review listings within a few days; you will see the status change here.
          </p>
        )}
      </div>
      <SignOut />
    </div>
  );
}

function SignOut() {
  return (
    <p className="mt-6">
      <button type="button" onClick={() => void logout()} className="link-draw tap text-small text-mute hover:text-ink">
        Sign out
      </button>
    </p>
  );
}
