"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CoupleOnboarding, LoginCard } from "@/components/auth/LoginCard";
import { LoginShell } from "@/components/auth/LoginShell";
import {
  completeCoupleOnboarding,
  coupleLogin,
  coupleLoginWithGoogle,
  useCoupleAccount,
  useCoupleHydrated,
  COUPLE_DEMO_EMAIL,
  COUPLE_DEMO_PASSWORD,
  SOULMATES_DEMO_EMAIL,
  SOULMATES_DEMO_PASSWORD,
} from "@/lib/couple-auth";

function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/account";
  return raw;
}

export function CoupleLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const hydrated = useCoupleHydrated();
  const account = useCoupleAccount();
  const [justLoggedInNeedsOnboard, setJustLoggedInNeedsOnboard] = useState(false);

  const showOnboard =
    justLoggedInNeedsOnboard || Boolean(hydrated && account && !account.onboarded);

  useEffect(() => {
    if (!hydrated || !account?.onboarded || showOnboard) return;
    router.replace(next);
  }, [hydrated, account, showOnboard, router, next]);

  return (
    <LoginShell
      imageSrc="/ref/couple-account/image-01.webp"
      imageAlt=""
      credit="Photograph from a wedding on Wedoura"
      topRight={{ href: "/vendors", label: "Find vendors" }}
    >
      {showOnboard ? (
        <CoupleOnboarding
          onDone={async (values) => {
            const result = await completeCoupleOnboarding(values);
            if (result.ok) {
              setJustLoggedInNeedsOnboard(false);
              router.push(next);
            }
          }}
        />
      ) : (
        <LoginCard
          eyebrow="Couple login"
          title={
            <>
              Your wedding, in <em>one</em> place
            </>
          }
          lead="Keep your shortlist, vendor replies and bookings together — on your phone and your laptop."
          demoHint={`Demo: ${COUPLE_DEMO_EMAIL} / ${COUPLE_DEMO_PASSWORD} · Soulmates: ${SOULMATES_DEMO_EMAIL} / ${SOULMATES_DEMO_PASSWORD}`}
          successMessage="Opening your space…"
          redirectTo={next}
          onLogin={async (email, password) => {
            const result = await coupleLogin(email, password);
            if (!result.ok) return result;
            if (!result.value.onboarded) {
              setJustLoggedInNeedsOnboard(true);
              return { ok: true, skipSuccess: true };
            }
            return { ok: true };
          }}
          onGoogle={async () => {
            const result = await coupleLoginWithGoogle();
            if (!result.ok) return result;
            return { ok: true };
          }}
          footer={
            <>
              <p>New here? Enter any email and password — we&apos;ll set up your account.</p>
              <p className="mt-2 text-small">
                A wedding professional? <Link href="/vendor/login">Vendor login</Link>
                {" · "}
                Need help?{" "}
                <a href="https://wa.me/910000000000" rel="noreferrer">
                  WhatsApp us
                </a>
              </p>
            </>
          }
        />
      )}
    </LoginShell>
  );
}
