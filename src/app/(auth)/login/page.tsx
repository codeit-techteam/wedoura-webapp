import type { Metadata } from "next";
import { Suspense } from "react";
import { CoupleLoginClient } from "@/components/auth/CoupleLoginClient";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Couple login",
  description: "Sign in to your Wedoura wedding space.",
  path: "/login",
  noIndex: true,
});

export default function CoupleLoginPage() {
  return (
    <Suspense fallback={null}>
      <CoupleLoginClient />
    </Suspense>
  );
}
