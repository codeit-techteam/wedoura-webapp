"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IntroductionCard } from "@/components/soulmates/IntroductionCard";
import { SoulmatesAuthGate } from "@/components/soulmates/SoulmatesAuthGate";
import { SoulmatesToast } from "@/components/soulmates/SoulmatesToast";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { coupleLogout, useCoupleAccount } from "@/lib/couple-auth";
import { SITE_EMAIL } from "@/lib/site-config";
import {
  ensureSoulmatesDemoSeed,
  markSoulmatesSeen,
  publicDisplayName,
  respondToIntroduction,
  setMySoulmateVisibility,
  undoIntroductionResponse,
  useInterestedInMe,
  useMutualIntroductions,
  useMySoulmateProfile,
  useThisWeekIntroductions,
  SOULMATES_DEMO_EMAIL,
} from "@/lib/soulmates-api";
import type { SoulmateProfileStatus } from "@/data/types";
import { useRouter } from "next/navigation";

function StatusCard({
  status,
  changeRequest,
  rejectReason,
  onResume,
  busy,
}: {
  status: SoulmateProfileStatus;
  changeRequest?: string;
  rejectReason?: string;
  onResume?: () => void;
  busy?: boolean;
}) {
  const base =
    "border border-line bg-white p-7 md:p-9";

  switch (status) {
    case "draft":
      return (
        <div className={base}>
          <Label>Status</Label>
          <h2 className="mt-2 font-serif text-h3 text-ink">Draft</h2>
          <p className="mt-2 text-body text-mute">Continue your profile when you are ready.</p>
          <Link
            href="/soulmates/create"
            className="mt-6 inline-flex min-h-12 items-center border border-ink bg-ink px-7 font-sans text-[12px] font-medium tracking-[0.24em] text-ivory uppercase"
          >
            Continue your profile
          </Link>
        </div>
      );
    case "in_review":
      return (
        <div className={base}>
          <Label>Status</Label>
          <h2 className="mt-2 font-serif text-h3 text-ink">With our team</h2>
          <p className="mt-2 text-body text-mute">
            Our team will call within a day to say hello and verify ID.
          </p>
        </div>
      );
    case "changes_requested":
      return (
        <div className={base}>
          <Label>Status</Label>
          <h2 className="mt-2 font-serif text-h3 text-ink">Changes requested</h2>
          {changeRequest ? <p className="mt-3 text-body text-mute">{changeRequest}</p> : null}
          <Link
            href="/soulmates/me/edit"
            className="mt-6 inline-flex min-h-12 items-center border border-ink bg-ink px-7 font-sans text-[12px] font-medium tracking-[0.24em] text-ivory uppercase"
          >
            Edit profile
          </Link>
        </div>
      );
    case "live":
      return (
        <div className={base}>
          <Label>Status</Label>
          <h2 className="mt-2 font-serif text-h3 text-ink">✓ Verified</h2>
          <p className="mt-2 text-body text-mute">
            Your profile is live. We suggest a few introductions each week.
          </p>
        </div>
      );
    case "paused":
    case "hidden":
      return (
        <div className={base}>
          <Label>Status</Label>
          <h2 className="mt-2 font-serif text-h3 text-ink">
            {status === "paused" ? "Paused" : "Hidden"}
          </h2>
          <p className="mt-2 text-body text-mute">
            Your profile is not shown in introductions right now.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={onResume}
            className="mt-6 inline-flex min-h-12 items-center border border-ink bg-ink px-7 font-sans text-[12px] font-medium tracking-[0.24em] text-ivory uppercase disabled:opacity-40"
          >
            Resume
          </button>
        </div>
      );
    case "rejected":
      return (
        <div className={base}>
          <Label>Status</Label>
          <h2 className="mt-2 font-serif text-h3 text-ink">Not approved</h2>
          {rejectReason ? <p className="mt-3 text-body text-[#9B2C2C]">{rejectReason}</p> : null}
          <p className="mt-3 text-body text-mute">
            Write to{" "}
            <a className="border-b border-gold" href={`mailto:${SITE_EMAIL}`}>
              {SITE_EMAIL}
            </a>{" "}
            if you would like to talk it through.
          </p>
        </div>
      );
    default:
      return (
        <div className={base}>
          <Label>Status</Label>
          <h2 className="mt-2 font-serif text-h3 text-ink">Suspended</h2>
          <p className="mt-2 text-body text-mute">
            Contact{" "}
            <a className="border-b border-gold" href={`mailto:${SITE_EMAIL}`}>
              {SITE_EMAIL}
            </a>
            .
          </p>
        </div>
      );
  }
}

function MeHome() {
  const router = useRouter();
  const account = useCoupleAccount()!;
  const profile = useMySoulmateProfile();
  const thisWeek = useThisWeekIntroductions();
  const interested = useInterestedInMe();
  const mutual = useMutualIntroductions();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; introId?: string } | null>(null);

  useEffect(() => {
    if (account.email === SOULMATES_DEMO_EMAIL) {
      void ensureSoulmatesDemoSeed();
    }
    markSoulmatesSeen();
  }, [account.email]);

  async function respond(introId: string, response: "interested" | "not_for_me") {
    setBusy(true);
    const result = await respondToIntroduction(introId, response);
    setBusy(false);
    if (!result.ok) {
      setToast({ message: result.error });
      return;
    }
    if (response === "not_for_me") {
      setToast({
        message: "Removed from your introductions.",
        introId,
      });
    } else if (result.value.status === "mutual") {
      setToast({ message: "It’s a mutual match." });
    } else {
      setToast({ message: "Marked as interested." });
    }
  }

  if (!profile) {
    return (
      <main className="bg-ivory pb-section-sm">
        <Container className="pt-10 md:pt-14">
          <Label>Soulmates</Label>
          <h1 className="mt-3 font-serif text-h2 text-ink">Your space</h1>
          <p className="mt-3 max-w-prose text-body text-mute">
            Signed in as {account.email}. Create a profile to receive thoughtful introductions.
          </p>
          <Link
            href="/soulmates/create"
            className="mt-8 inline-flex min-h-12 items-center border border-ink bg-ink px-8 font-sans text-[12.5px] font-medium tracking-[0.28em] text-ivory uppercase"
          >
            Create a profile
          </Link>
        </Container>
      </main>
    );
  }

  const live = profile.status === "live";

  return (
    <main className="bg-ivory pb-section-sm">
      <Container className="pt-10 md:pt-14">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Label>Soulmates</Label>
            <h1 className="mt-3 font-serif text-h2 text-ink">{publicDisplayName(profile)}</h1>
            <p className="mt-2 text-body text-mute">Signed in as {account.email}</p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await coupleLogout();
              router.push("/soulmates");
            }}
            className="tap border-b border-line pb-1 font-sans text-[12px] font-medium tracking-[0.22em] text-mute uppercase"
          >
            Sign out
          </button>
        </div>

        <div className="mt-10">
          <StatusCard
            status={profile.status}
            changeRequest={profile.changeRequest}
            rejectReason={profile.rejectReason}
            busy={busy}
            onResume={async () => {
              setBusy(true);
              await setMySoulmateVisibility("live");
              setBusy(false);
            }}
          />
        </div>

        <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-b border-line pb-5">
          <Link
            href="/soulmates/me/profile"
            className="font-sans text-[11.5px] font-medium tracking-[0.22em] uppercase border-b border-gold pb-1"
          >
            View my profile
          </Link>
          <Link
            href="/soulmates/me/edit"
            className="font-sans text-[11.5px] font-medium tracking-[0.22em] text-mute uppercase hover:text-ink"
          >
            Edit profile
          </Link>
          <Link
            href="/soulmates/me/settings"
            className="font-sans text-[11.5px] font-medium tracking-[0.22em] text-mute uppercase hover:text-ink"
          >
            Privacy &amp; settings
          </Link>
        </nav>

        {live ? (
          <>
            <section className="mt-14">
              <Label>This week</Label>
              <h2 className="mt-3 font-serif text-h3 text-ink">Introductions</h2>
              {thisWeek.length === 0 ? (
                <p className="mt-5 text-body text-mute">
                  No new introductions yet. We will write when we have a few thoughtful ones.
                </p>
              ) : (
                <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {thisWeek.map((view) => (
                    <IntroductionCard
                      key={view.introduction.id}
                      view={view}
                      busy={busy}
                      onInterested={() => void respond(view.introduction.id, "interested")}
                      onNotForMe={() => void respond(view.introduction.id, "not_for_me")}
                    />
                  ))}
                </div>
              )}
            </section>

            {interested.length > 0 ? (
              <section className="mt-14">
                <Label>Interested in you</Label>
                <h2 className="mt-3 font-serif text-h3 text-ink">They said yes first</h2>
                <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {interested.map((view) => (
                    <IntroductionCard
                      key={view.introduction.id}
                      view={view}
                      badge="Waiting on you"
                      busy={busy}
                      onInterested={() => void respond(view.introduction.id, "interested")}
                      onNotForMe={() => void respond(view.introduction.id, "not_for_me")}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="mt-14">
              <Label>Mutual</Label>
              <h2 className="mt-3 font-serif text-h3 text-ink">Both said yes</h2>
              {mutual.length === 0 ? (
                <p className="mt-5 text-body text-mute">
                  When both of you are interested, WhatsApp opens here.
                </p>
              ) : (
                <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {mutual.map((view) => (
                    <IntroductionCard key={view.introduction.id} view={view} />
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </Container>

      {toast ? (
        <SoulmatesToast
          message={toast.message}
          actionLabel={toast.introId ? "Undo" : undefined}
          onAction={
            toast.introId
              ? async () => {
                  await undoIntroductionResponse(toast.introId!);
                  setToast(null);
                }
              : undefined
          }
          onDismiss={() => setToast(null)}
        />
      ) : null}
    </main>
  );
}

export function SoulmatesMeClient() {
  return (
    <SoulmatesAuthGate next="/soulmates/me">
      <MeHome />
    </SoulmatesAuthGate>
  );
}
