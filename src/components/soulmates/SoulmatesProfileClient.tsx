"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { SoulmatesAuthGate } from "@/components/soulmates/SoulmatesAuthGate";
import { SoulmateProfileView } from "@/components/soulmates/SoulmateProfileView";
import { SoulmatesToast } from "@/components/soulmates/SoulmatesToast";
import { Container } from "@/components/ui/Container";
import {
  blockSoulmateProfile,
  reportSoulmateProfile,
  respondToIntroduction,
  undoIntroductionResponse,
  useMyIntroductionViews,
  useMySoulmateProfile,
} from "@/lib/soulmates-api";

function ProfileBody({ profileId }: { profileId: string }) {
  const router = useRouter();
  const mine = useMySoulmateProfile();
  const views = useMyIntroductionViews();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; introId?: string } | null>(null);
  const [blockedLocal, setBlockedLocal] = useState(false);

  const view = useMemo(
    () => views.find((v) => v.profile.id === profileId) ?? null,
    [views, profileId],
  );

  if (!mine) {
    return (
      <main className="bg-ivory pb-section-sm">
        <Container className="pt-12">
          <p className="text-body text-mute">Loading…</p>
        </Container>
      </main>
    );
  }

  if (profileId === mine.id) {
    return (
      <main className="bg-ivory pb-section-sm">
        <Container className="pt-8">
          <SoulmateProfileView profile={mine} preview />
        </Container>
      </main>
    );
  }

  if (!view || blockedLocal) {
    return (
      <main className="bg-ivory pb-section-sm">
        <Container className="pt-16">
          <h1 className="font-serif text-h2 text-ink">This profile isn’t available</h1>
          <p className="mt-3 max-w-prose text-body text-mute">
            Soulmates only shows people you have been introduced to.
          </p>
          <Link
            href="/soulmates/me"
            className="mt-8 inline-flex min-h-11 items-center border-b border-gold pb-1 font-sans text-[12px] font-medium tracking-[0.22em] uppercase"
          >
            Back to Soulmates
          </Link>
        </Container>
      </main>
    );
  }

  return (
    <main className="bg-ivory pb-section-sm">
      <Container className="pt-8 md:pt-12">
        <Link
          href="/soulmates/me"
          className="inline-flex min-h-11 items-center font-sans text-[11.5px] font-medium tracking-[0.22em] text-mute uppercase"
        >
          ← Soulmates
        </Link>
        <div className="mt-8">
          <SoulmateProfileView
            profile={view.profile}
            intro={view}
            viewer={mine}
            busy={busy}
            onInterested={async () => {
              setBusy(true);
              const result = await respondToIntroduction(view.introduction.id, "interested");
              setBusy(false);
              setToast({
                message:
                  result.ok && result.value.status === "mutual"
                    ? "It’s a mutual match."
                    : "Marked as interested.",
              });
            }}
            onNotForMe={async () => {
              setBusy(true);
              await respondToIntroduction(view.introduction.id, "not_for_me");
              setBusy(false);
              setToast({
                message: "Removed from your introductions.",
                introId: view.introduction.id,
              });
              window.setTimeout(() => router.push("/soulmates/me"), 1200);
            }}
            onReport={async (reason, note) => {
              await reportSoulmateProfile({
                reportedProfileId: view.profile.id,
                reason,
                note,
              });
              setToast({ message: "Report sent to our team." });
            }}
            onBlock={async () => {
              await blockSoulmateProfile(view.profile.id);
              setBlockedLocal(true);
              setToast({ message: "Blocked. They won’t appear in your introductions." });
              router.push("/soulmates/me");
            }}
          />
        </div>
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
                  router.push("/soulmates/me");
                }
              : undefined
          }
          onDismiss={() => setToast(null)}
        />
      ) : null}
    </main>
  );
}

export function SoulmatesProfileClient({ profileId }: { profileId: string }) {
  return (
    <SoulmatesAuthGate next={`/soulmates/profile/${profileId}`}>
      <ProfileBody profileId={profileId} />
    </SoulmatesAuthGate>
  );
}
