"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useCoupleAccount, useCoupleHydrated } from "@/lib/couple-auth";

type Props = {
  next: string;
  children: ReactNode;
};

/** Redirects signed-out visitors to /login?next=… */
export function SoulmatesAuthGate({ next, children }: Props) {
  const router = useRouter();
  const hydrated = useCoupleHydrated();
  const account = useCoupleAccount();

  useEffect(() => {
    if (!hydrated) return;
    if (!account) {
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [hydrated, account, router, next]);

  if (!hydrated || !account) {
    return (
      <main className="bg-ivory px-5 py-16 md:px-10">
        <p className="font-sans text-body text-mute">Loading…</p>
      </main>
    );
  }

  return <>{children}</>;
}
