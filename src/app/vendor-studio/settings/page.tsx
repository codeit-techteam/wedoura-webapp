"use client";

import Link from "next/link";
import { useState } from "react";
import {
  IdentityDocumentFields,
  type IdentityDraft,
} from "@/components/profile/IdentityDocumentFields";
import { ScreenSkeleton } from "@/components/studio/screen";
import { idTypeNeedsBack, VENDOR_ID_TYPE_LABEL } from "@/lib/identity-document";
import {
  submitMyDocument,
  useMyAccount,
  useMyDocument,
  useMyListing,
  useSessionHydrated,
} from "@/lib/vendor-api";

const STATUS_LABEL = {
  submitted: "Submitted",
  approved: "Verified",
  rejected: "Rejected",
} as const;

/** Account settings: who is signed in, identity verification, public contact. */
export default function SettingsPage() {
  const hydrated = useSessionHydrated();
  const account = useMyAccount();
  const listing = useMyListing();
  const document = useMyDocument();
  const [reupload, setReupload] = useState(false);
  const [draft, setDraft] = useState<IdentityDraft>({
    type: "masked_aadhaar",
    front: null,
    back: null,
    consent: false,
  });
  const [errors, setErrors] = useState<Partial<Record<"type" | "front" | "back" | "consent", string>>>({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  if (!hydrated || !account) return <ScreenSkeleton />;

  async function onReupload() {
    const next: Partial<Record<"type" | "front" | "back" | "consent", string>> = {};
    if (!draft.front) next.front = "Upload the front of your ID.";
    if (idTypeNeedsBack(draft.type) && !draft.back) next.back = "Upload the back of your ID.";
    if (!draft.consent || !draft.consentAt) {
      next.consent = "Please agree so we can use this document to verify your identity.";
    }
    setErrors(next);
    setFormError("");
    if (Object.keys(next).length > 0 || !draft.front || !draft.consentAt) return;

    setBusy(true);
    const result = await submitMyDocument({
      type: draft.type,
      front: draft.front,
      back: draft.back,
      consent: true,
      consentAt: draft.consentAt,
    });
    setBusy(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setReupload(false);
    setDraft({ type: draft.type, front: null, back: null, consent: false });
  }

  const submittedLabel = document?.submittedAt
    ? new Date(document.submittedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

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

      <section className="studio-card" aria-label="Identity">
        <h2 className="studio-section-title">Identity</h2>
        <p className="mt-3 text-[length:var(--text-dash-help)] text-mute">
          Used only to verify you are a real wedding professional. Never shown on your public profile.
        </p>

        {!document ? (
          <p className="mt-5 text-[length:var(--text-dash-body)] text-mute">No identity document on file yet.</p>
        ) : (
          <dl className="mt-5 grid gap-4">
            <div>
              <dt className="label text-mute">Document type</dt>
              <dd className="mt-1 text-[length:var(--text-dash-body)] text-ink">
                {VENDOR_ID_TYPE_LABEL[document.type]}
              </dd>
            </div>
            <div>
              <dt className="label text-mute">Status</dt>
              <dd className="mt-1 text-[length:var(--text-dash-body)] text-ink">
                {STATUS_LABEL[document.status]}
              </dd>
            </div>
            {submittedLabel ? (
              <div>
                <dt className="label text-mute">Submitted</dt>
                <dd className="mt-1 text-[length:var(--text-dash-body)] text-ink">{submittedLabel}</dd>
              </div>
            ) : null}
            {document.status === "approved" ? (
              <p className="text-[length:var(--text-dash-help)] text-mute">
                Verified. File copies are kept privately for our records and are not shown here.
              </p>
            ) : null}
            {document.status === "rejected" && document.rejectReason ? (
              <div>
                <dt className="label text-mute">Reason</dt>
                <dd className="mt-1 text-[length:var(--text-dash-body)] text-ink">{document.rejectReason}</dd>
              </div>
            ) : null}
            {document.status === "submitted" ? (
              <p className="text-[length:var(--text-dash-help)] text-mute">
                Our team is reviewing your document. You will see the status update here.
              </p>
            ) : null}
          </dl>
        )}

        {document?.status === "rejected" ? (
          <div className="mt-8 border-t border-line pt-8">
            {!reupload ? (
              <button
                type="button"
                className="studio-btn"
                onClick={() => {
                  setReupload(true);
                  setDraft({
                    type: document.type,
                    front: null,
                    back: null,
                    consent: false,
                  });
                }}
              >
                Upload a new document
              </button>
            ) : (
              <div className="grid gap-6">
                <h3 className="font-serif text-[length:var(--text-dash-title)] text-ink">Upload a new document</h3>
                <IdentityDocumentFields value={draft} onChange={setDraft} errors={errors} />
                {formError ? (
                  <p className="text-small text-ink" role="alert">
                    {formError}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-4">
                  <button type="button" className="studio-btn" disabled={busy} onClick={() => void onReupload()}>
                    {busy ? "Uploading…" : "Submit for review"}
                  </button>
                  <button
                    type="button"
                    className="min-h-11 border-b border-line font-sans text-button tracking-[0.2em] text-mute uppercase"
                    disabled={busy}
                    onClick={() => {
                      setReupload(false);
                      setErrors({});
                      setFormError("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
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
        <Link href="/vendor-studio/profile/contact" className="studio-btn mt-6">
          Edit on Profile
        </Link>
      </section>
    </div>
  );
}
