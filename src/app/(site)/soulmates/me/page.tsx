import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SoulmatesMeClient } from "@/components/soulmates/SoulmatesMeClient";

export const metadata: Metadata = pageMeta({
  title: "Your Soulmates profile",
  description: "Manage your Wedoura Soulmates profile and introductions.",
  path: "/soulmates/me",
  noIndex: true,
});

export default function SoulmatesMePage() {
  return <SoulmatesMeClient />;
}
