"use client";

import Link from "next/link";
import { LoginCard } from "@/components/auth/LoginCard";
import { LoginShell } from "@/components/auth/LoginShell";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo-credentials";
import { login } from "@/lib/vendor-api";

export function VendorLoginClient() {
  return (
    <LoginShell
      imageSrc="/ref/vendor-login/image-01.webp"
      imageAlt=""
      credit="Photograph by a Wedoura vendor"
      topRight={{ href: "/list-your-business", label: "List your business" }}
    >
      <LoginCard
        eyebrow="Vendor login"
        title={
          <>
            Welcome <em>back</em>
          </>
        }
        lead="Log in to see your enquiries, calendar and profile."
        emailPlaceholder="studio@example.com"
        demoHint={`Demo: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`}
        successMessage="Taking you to your dashboard…"
        redirectTo="/vendor-studio"
        onLogin={async (email, password) => {
          const result = await login(email, password);
          return result.ok ? { ok: true } : { ok: false, error: result.error };
        }}
        onGoogle={async () => {
          const result = await login(DEMO_EMAIL, DEMO_PASSWORD);
          return result.ok ? { ok: true } : { ok: false, error: result.error };
        }}
        footer={
          <>
            <p>
              New to Wedoura? <Link href="/list-your-business">List your business</Link>
            </p>
            <p className="mt-2 text-small">
              Planning your own wedding? <Link href="/login">Couple login</Link>
              {" · "}
              Need help?{" "}
              <a href="https://wa.me/910000000000" rel="noreferrer">
                WhatsApp our vendor team
              </a>
            </p>
          </>
        }
      />
    </LoginShell>
  );
}
