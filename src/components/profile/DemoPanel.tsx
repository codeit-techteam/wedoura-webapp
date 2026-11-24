"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import type { AccountStatus } from "@/data/types";
import { cn } from "@/lib/cn";
import { useHydrated, useMockDb } from "@/lib/mock-store";
import {
  demoApprove,
  demoApproveInterview,
  demoApproveMedia,
  demoPublish,
  demoReject,
  demoRequestChanges,
  demoReset,
  demoUnpublish,
} from "@/lib/vendor-api";

const ACCOUNT_LABEL: Record<AccountStatus, string> = {
  applied: "Applied",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
};

const field =
  "w-full border-b border-line bg-transparent pb-1 text-small text-ink outline-offset-4 placeholder:text-mute/60 focus:border-ink";

/**
 * The demo control panel: a stand-in for the separate admin app, working on
 * this browser's mock store. Lists applications and listings; approve,
 * reject, publish and unpublish.
 */
export function DemoPanel() {
  const db = useMockDb();
  const hydrated = useHydrated();
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [requesting, setRequesting] = useState<string | null>(null);
  const [changeNote, setChangeNote] = useState("");

  if (!hydrated) return <div aria-hidden="true" className="min-h-64" />;

  return (
    <div className="flex flex-col gap-14">
      {/* Applications */}
      <section aria-label="Applications">
        <Label>Applications</Label>
        {db.applications.length === 0 ? (
          <p className="mt-4 max-w-prose text-mute">
            None yet. Submit one on <span className="text-ink">/list-your-business</span> and it appears here.
          </p>
        ) : (
          <ul className="mt-4 border-t border-line">
            {db.applications.map((app) => {
              const account = db.accounts.find((a) => a.id === app.accountId);
              const status = account?.status ?? "applied";
              return (
                <li key={app.id} className="border-b border-line py-4">
                  <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
                    <div className="min-w-0">
                      <p className="font-serif text-h3">{app.businessName}</p>
                      <p className="mt-1 text-small text-mute">
                        {app.contactName} · {app.email} · {app.category} · {app.baseCity}
                      </p>
                      {status === "rejected" && account?.rejectionNote && (
                        <p className="mt-1 text-small text-mute">Note: {account.rejectionNote}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="label border border-line px-3 py-1.5">{ACCOUNT_LABEL[status]}</span>
                      {status !== "approved" && (
                        <button
                          type="button"
                          onClick={() => void demoApprove(app.accountId)}
                          className="label tap bg-ink px-4 py-2 text-white transition-chrome hover:bg-black"
                        >
                          Approve
                        </button>
                      )}
                      {status !== "rejected" && (
                        <button
                          type="button"
                          onClick={() => {
                            setRejecting(rejecting === app.accountId ? null : app.accountId);
                            setNote("");
                          }}
                          className="label tap border border-line px-4 py-2 text-ink transition-chrome hover:border-ink"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                  {rejecting === app.accountId && (
                    <div className="mt-4 flex max-w-xl items-end gap-4">
                      <label className="min-w-0 flex-1">
                        <span className="label text-mute">Note to the vendor</span>
                        <input
                          type="text"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="We need a link to full, recent work."
                          className={cn(field, "mt-2")}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          void demoReject(app.accountId, note.trim() || "We could not verify the work submitted.");
                          setRejecting(null);
                        }}
                        className="label tap shrink-0 border border-ink px-4 py-2 text-ink transition-chrome hover:bg-ink hover:text-white"
                      >
                        Confirm reject
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Listings */}
      <section aria-label="Listings">
        <Label>Listings</Label>
        <p className="mt-2 max-w-prose text-small text-mute">
          The sample listings appear here as status rows. The public site reads the static sample dataset, so
          publishing or unpublishing here changes the demo store (this panel and the studio), not the
          server-rendered pages — the backend makes that real.
        </p>
        <ul className="mt-4 border-t border-line">
          {db.listings.map((listing) => {
            const pendingCount = listing.pendingMediaIds?.length ?? 0;
            const pendingInterview = Boolean(listing.pendingInterview);
            const hasContent = listing.cardPhotos.length > 0 || listing.portfolio.length > 0;
            const publicPath =
              listing.venue || listing.category === "venues"
                ? `/venues/${listing.slug}`
                : `/vendors/${listing.slug}`;
            return (
              <li key={listing.id} className="border-b border-line py-4">
                <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
                  <div className="min-w-0">
                    <p className="font-serif text-h3">{listing.name}</p>
                    <p className="mt-1 text-small text-mute">
                      {listing.category} · {listing.baseCity} ·{" "}
                      {listing.status === "published" && hasContent ? (
                        <a href={publicPath} className="link-draw text-ink">
                          {publicPath}
                        </a>
                      ) : (
                        <>{publicPath}</>
                      )}
                    </p>
                    {listing.status === "changes_requested" && listing.reviewNote && (
                      <p className="mt-1 text-small text-mute">Note: {listing.reviewNote}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-3">
                    <span className="label border border-line px-3 py-1.5">{listing.status.replace("_", " ")}</span>
                    {pendingCount > 0 && (
                      <button
                        type="button"
                        onClick={() => void demoApproveMedia(listing.id)}
                        className="label tap border border-gold px-4 py-2 text-ink transition-chrome hover:border-ink"
                      >
                        Approve {pendingCount} pending
                      </button>
                    )}
                    {pendingInterview && (
                      <button
                        type="button"
                        onClick={() => void demoApproveInterview(listing.id)}
                        className="label tap border border-gold px-4 py-2 text-ink transition-chrome hover:border-ink"
                      >
                        Approve interview
                      </button>
                    )}
                    {(listing.status === "in_review" || listing.status === "published") && (
                      <button
                        type="button"
                        onClick={() => {
                          setRequesting(requesting === listing.id ? null : listing.id);
                          setChangeNote("");
                        }}
                        className="label tap border border-line px-4 py-2 text-ink transition-chrome hover:border-ink"
                      >
                        Request changes
                      </button>
                    )}
                    {listing.status === "published" ? (
                      <button
                        type="button"
                        onClick={() => void demoUnpublish(listing.id)}
                        className="label tap border border-line px-4 py-2 text-ink transition-chrome hover:border-ink"
                      >
                        Unpublish
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void demoPublish(listing.id)}
                        className="label tap bg-ink px-4 py-2 text-white transition-chrome hover:bg-black"
                      >
                        Publish
                      </button>
                    )}
                  </div>
                </div>
                {requesting === listing.id && (
                  <div className="mt-4 flex max-w-xl items-end gap-4">
                    <label className="min-w-0 flex-1">
                      <span className="label text-mute">What should they change?</span>
                      <input
                        type="text"
                        value={changeNote}
                        onChange={(e) => setChangeNote(e.target.value)}
                        placeholder="e.g. The cover photo is too dark; pick a brighter one."
                        className={cn(field, "mt-2")}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        void demoRequestChanges(listing.id, changeNote.trim() || "Please revisit the photos and about text.");
                        setRequesting(null);
                      }}
                      className="label tap shrink-0 border border-ink px-4 py-2 text-ink transition-chrome hover:bg-ink hover:text-white"
                    >
                      Send note
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-label="Reset">
        <Button variant="outline" onClick={() => void demoReset()}>
          Reset demo data
        </Button>
        <p className="mt-3 text-small text-mute">Clears this browser&apos;s applications, accounts and sessions.</p>
      </section>
    </div>
  );
}
