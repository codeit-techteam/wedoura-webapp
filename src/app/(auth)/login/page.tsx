import type { Metadata } from "next";
import { CoupleLoginClient } from "@/components/auth/CoupleLoginClient";

export const metadata: Metadata = {
  title: "Couple login",
  description: "Sign in to your Wedoura wedding space.",
  robots: { index: false, follow: false },
};

export default function CoupleLoginPage() {
  return <CoupleLoginClient />;
}
