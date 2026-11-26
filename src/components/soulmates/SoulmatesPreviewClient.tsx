"use client";

import Link from "next/link";
import { SoulmatesAuthGate } from "@/components/soulmates/SoulmatesAuthGate";
import { SoulmateProfileView } from "@/components/soulmates/SoulmateProfileView";
import { Container } from "@/components/ui/Container";
import { useMySoulmateProfile } from "@/lib/soulmates-api";

function Preview() {
  const profile = useMySoulmateProfile();

  if (!profile) {
    return (
      <main className="bg-ivory pb-section-sm">
        <Container className="pt-12">
          <p className="text-body text-mute">No profile yet.</p>
          <Link href="/soulmates/create" className="mt-4 inline-block border-b border-gold pb-1">
            Create a profile
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
          <SoulmateProfileView profile={profile} preview />
        </div>
      </Container>
    </main>
  );
}

export function SoulmatesPreviewClient() {
  return (
    <SoulmatesAuthGate next="/soulmates/me/profile">
      <Preview />
    </SoulmatesAuthGate>
  );
}
