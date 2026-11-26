"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SoulmateProfile } from "@/data/types";
import { getDocumentObjectUrl } from "@/lib/document-store";
import { SITE_EMAIL } from "@/lib/site-config";
import {
  ageFromDob,
  formatHeightCm,
  isFamilyLed,
  preferencesFitBothWays,
  publicDisplayName,
  sharedValues,
  whatsappForProfile,
  type SoulmateIntroView,
} from "@/lib/soulmates-api";
import { TINTS } from "@/components/soulmates/soulmates-create-constants";

const REPORT_REASONS = [
  "Inappropriate photos or text",
  "Suspected fake profile",
  "Harassment or unsafe behaviour",
  "Spam or solicitation",
  "Other",
];

type Props = {
  profile: SoulmateProfile;
  /** When viewing another member via an introduction. */
  intro?: SoulmateIntroView;
  /** Own profile preview. */
  preview?: boolean;
  viewer?: SoulmateProfile | null;
  onInterested?: () => void;
  onNotForMe?: () => void;
  onReport?: (reason: string, note: string) => Promise<void>;
  onBlock?: () => Promise<void>;
  busy?: boolean;
};

export function SoulmateProfileView({
  profile,
  intro,
  preview,
  viewer,
  onInterested,
  onNotForMe,
  onReport,
  onBlock,
  busy,
}: Props) {
  const mutual = intro?.mutual ?? false;
  const revealPhotos = preview || intro?.revealPhotos || false;
  const revealContact = preview ? false : mutual;
  const name = publicDisplayName(profile);
  const age = ageFromDob(profile.basics.dateOfBirth);
  const tint = TINTS[(profile.basics.firstName.charCodeAt(0) || 0) % 4]!;
  const initial = (profile.basics.firstName[0] || "W").toUpperCase();
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [reportOpen, setReportOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0]!);
  const [note, setNote] = useState("");

  useEffect(() => {
    const revoked: string[] = [];
    let cancelled = false;
    (async () => {
      if (!revealPhotos || !profile.photos.length) {
        if (!cancelled) setPhotoUrls([]);
        return;
      }
      const urls: string[] = [];
      for (const ph of [...profile.photos].sort((a, b) => a.order - b.order)) {
        if (ph.url.startsWith("idb:")) {
          const obj = await getDocumentObjectUrl(ph.url);
          if (obj) {
            urls.push(obj);
            revoked.push(obj);
          }
        } else if (ph.url) urls.push(ph.url);
      }
      if (!cancelled) setPhotoUrls(urls);
    })();
    return () => {
      cancelled = true;
      revoked.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [profile.photos, revealPhotos]);

  const shared = viewer ? sharedValues(viewer, profile) : [];
  const fit = viewer ? preferencesFitBothWays(viewer, profile) : null;
  const wa = whatsappForProfile(profile).replace(/\D/g, "");
  const showIncome = mutual && profile.work.incomeBand && !profile.work.incomePrivate;

  return (
    <div className="mx-auto max-w-[920px]">
      <div className="grid gap-10 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:gap-14">
        <div>
          <div
            className="relative flex aspect-[4/4.6] items-center justify-center overflow-hidden"
            style={
              revealPhotos && photoUrls[0]
                ? undefined
                : { background: tint[0], color: tint[1] }
            }
          >
            {profile.status === "live" || preview ? (
              <span className="absolute top-0 left-0 z-[2] bg-white px-3 py-2 font-sans text-[10.5px] font-medium tracking-[0.18em] text-gold-deep uppercase">
                ✓ Verified
              </span>
            ) : (
              <span className="absolute top-0 left-0 z-[2] bg-white px-3 py-2 font-sans text-[10.5px] font-medium tracking-[0.18em] text-[#A39C8F] uppercase">
                Verification pending
              </span>
            )}
            {revealPhotos && photoUrls[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrls[0]} alt="" className="absolute inset-0 size-full object-cover" />
            ) : (
              <>
                <span
                  className="italic leading-none"
                  style={{
                    fontFamily: '"Bodoni Moda", Didot, serif',
                    fontSize: "clamp(6rem, 14vw, 9rem)",
                  }}
                >
                  {initial}
                </span>
                <span className="absolute inset-x-0 bottom-5 z-[2] text-center font-sans text-[10.5px] font-medium tracking-[0.18em] uppercase">
                  Photo shared after mutual interest
                </span>
              </>
            )}
          </div>
          {revealPhotos && photoUrls.length > 1 ? (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {photoUrls.slice(1).map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" className="aspect-[4/5] w-full object-cover" />
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <p className="font-sans text-[11.5px] font-medium tracking-[0.26em] text-gold-deep uppercase">
            {preview ? "How others see you" : mutual ? "Mutual match" : "Introduction"}
          </p>
          <h1 className="mt-2 font-serif text-[clamp(2.4rem,4vw,3.4rem)] leading-[1.05] text-ink">
            {name}
            {age ? <span className="text-mute">, {age}</span> : null}
          </h1>
          <p className="mt-2 font-sans text-[11px] tracking-[0.2em] text-gold-deep uppercase">
            {[profile.basics.city, profile.work.profession].filter(Boolean).join(" · ")}
          </p>

          <dl className="mt-8 grid gap-3 border-t border-line pt-6 text-[16px] sm:grid-cols-2">
            <div>
              <dt className="text-mute">Height</dt>
              <dd className="text-ink">{formatHeightCm(profile.basics.heightCm)}</dd>
            </div>
            <div>
              <dt className="text-mute">Marital status</dt>
              <dd className="text-ink">{profile.basics.maritalStatus}</dd>
            </div>
            <div>
              <dt className="text-mute">Education</dt>
              <dd className="text-ink">
                {[profile.work.education, profile.work.fieldOfStudy].filter(Boolean).join(", ")}
              </dd>
            </div>
            <div>
              <dt className="text-mute">Profession</dt>
              <dd className="text-ink">{profile.work.profession}</dd>
            </div>
            {showIncome ? (
              <div>
                <dt className="text-mute">Income</dt>
                <dd className="text-ink">{profile.work.incomeBand}</dd>
              </div>
            ) : null}
            <div className="sm:col-span-2">
              <dt className="text-mute">Languages</dt>
              <dd className="text-ink">{profile.basics.languages.join(", ")}</dd>
            </div>
          </dl>

          {profile.about.text ? (
            <div className="mt-8">
              <p className="font-sans text-[11.5px] font-medium tracking-[0.26em] text-gold-deep uppercase">
                About
              </p>
              <p className="mt-3 whitespace-pre-wrap text-[18px] leading-relaxed text-char">
                {profile.about.text}
              </p>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-2">
            <span className="border border-line bg-ivory px-3 py-1.5 font-sans text-[12.5px]">
              {profile.about.familyType}
            </span>
            <span className="border border-line bg-ivory px-3 py-1.5 font-sans text-[12.5px]">
              {profile.about.familyOutlook}
            </span>
            {isFamilyLed(profile) ? (
              <span className="border border-line bg-ivory px-3 py-1.5 font-sans text-[12.5px]">
                Family-led profile
              </span>
            ) : null}
            {profile.about.familyCanJoin ? (
              <span className="border border-line bg-ivory px-3 py-1.5 font-sans text-[12.5px]">
                Family can join conversations
              </span>
            ) : null}
          </div>

          {!preview && viewer && (shared.length > 0 || fit) ? (
            <div className="mt-10 border border-line bg-sand/60 p-5">
              <p className="font-sans text-[11.5px] font-medium tracking-[0.26em] text-gold-deep uppercase">
                What you share
              </p>
              {shared.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {shared.map((v) => (
                    <span key={v} className="border border-line bg-white px-3 py-1.5 font-sans text-[13px]">
                      {v}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-[15px] text-mute">No overlapping values listed yet.</p>
              )}
              {fit ? (
                <ul className="mt-4 space-y-1 text-[15px] text-mute">
                  <li>{fit.ageFits ? "Age preferences fit both ways." : "Age preferences do not fully overlap."}</li>
                  <li>
                    {fit.locationOverlap
                      ? "Location preferences can work for both of you."
                      : "Location preferences may not overlap."}
                  </li>
                </ul>
              ) : null}
            </div>
          ) : null}

          {revealContact ? (
            <div className="mt-10 border border-ink p-5">
              <p className="font-sans text-[11.5px] font-medium tracking-[0.26em] text-gold-deep uppercase">
                Contact
              </p>
              <p className="mt-2 font-serif text-[1.4rem] text-ink">
                {isFamilyLed(profile) ? `${profile.creator.name} (family)` : name}
              </p>
              <p className="mt-1 text-[16px] text-mute">{whatsappForProfile(profile)}</p>
              {wa ? (
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex min-h-12 items-center border border-ink bg-ink px-6 font-sans text-[12px] font-medium tracking-[0.24em] text-ivory uppercase"
                >
                  Message on WhatsApp
                </a>
              ) : null}
              <p className="mt-5 text-[14px] leading-relaxed text-mute">
                Meet in public, tell family where you are going, and never send money to someone you
                have only met here.
              </p>
            </div>
          ) : null}

          {preview ? (
            <div className="mt-10">
              <Link
                href="/soulmates/me/edit"
                className="inline-flex min-h-12 items-center border border-ink bg-ink px-8 font-sans text-[12.5px] font-medium tracking-[0.28em] text-ivory uppercase"
              >
                Edit
              </Link>
            </div>
          ) : intro && intro.myResponse === "pending" && intro.introduction.status === "pending" ? (
            <div className="mt-10 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={onInterested}
                className="inline-flex min-h-12 items-center border border-ink bg-ink px-8 font-sans text-[12.5px] font-medium tracking-[0.28em] text-ivory uppercase disabled:opacity-40"
              >
                Interested
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={onNotForMe}
                className="inline-flex min-h-12 items-center border border-line px-8 font-sans text-[12.5px] font-medium tracking-[0.28em] uppercase disabled:opacity-40"
              >
                Not for me
              </button>
            </div>
          ) : null}

          {!preview ? (
            <div className="mt-10 flex flex-wrap gap-5 border-t border-line pt-6">
              <button
                type="button"
                className="font-sans text-[11.5px] font-medium tracking-[0.22em] text-mute uppercase underline-offset-4 hover:text-ink hover:underline"
                onClick={() => setReportOpen(true)}
              >
                Report
              </button>
              <button
                type="button"
                className="font-sans text-[11.5px] font-medium tracking-[0.22em] text-mute uppercase underline-offset-4 hover:text-ink hover:underline"
                onClick={() => setBlockOpen(true)}
              >
                Block
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {reportOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-4 md:items-center">
          <div className="w-full max-w-md border border-line bg-ivory p-6" role="dialog" aria-modal="true">
            <h2 className="font-serif text-h3 text-ink">Report this profile</h2>
            <label className="mt-5 block">
              <span className="font-sans text-[11px] font-medium tracking-[0.22em] text-gold-deep uppercase">
                Reason
              </span>
              <select
                className="mt-2 w-full border border-line bg-white px-3 py-3 font-sans text-[15px]"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <label className="mt-4 block">
              <span className="font-sans text-[11px] font-medium tracking-[0.22em] text-gold-deep uppercase">
                Note
              </span>
              <textarea
                className="mt-2 w-full border border-line bg-white px-3 py-3 font-sans text-[15px]"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="min-h-11 flex-1 border border-ink bg-ink font-sans text-[11.5px] font-medium tracking-[0.22em] text-ivory uppercase"
                onClick={async () => {
                  await onReport?.(reason, note);
                  setReportOpen(false);
                  setNote("");
                }}
              >
                Submit report
              </button>
              <button
                type="button"
                className="min-h-11 px-4 font-sans text-[11.5px] tracking-[0.2em] uppercase"
                onClick={() => setReportOpen(false)}
              >
                Cancel
              </button>
            </div>
            <p className="mt-4 text-[13px] text-mute">
              Our team reads every report. Write to {SITE_EMAIL} if you need urgent help.
            </p>
          </div>
        </div>
      ) : null}

      {blockOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-4 md:items-center">
          <div className="w-full max-w-md border border-line bg-ivory p-6" role="dialog" aria-modal="true">
            <h2 className="font-serif text-h3 text-ink">Block {name}?</h2>
            <p className="mt-3 text-[16px] text-mute">
              They will be removed from your introductions both ways. You can unblock later in
              Privacy &amp; settings.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="min-h-11 flex-1 border border-ink bg-ink font-sans text-[11.5px] font-medium tracking-[0.22em] text-ivory uppercase"
                onClick={async () => {
                  await onBlock?.();
                  setBlockOpen(false);
                }}
              >
                Block
              </button>
              <button
                type="button"
                className="min-h-11 px-4 font-sans text-[11.5px] tracking-[0.2em] uppercase"
                onClick={() => setBlockOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
