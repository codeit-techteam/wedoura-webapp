import type { Metadata } from "next";
import { SoulmatesSettingsClient } from "@/components/soulmates/SoulmatesSettingsClient";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Privacy & settings · Soulmates",
  description: "Manage your Wedoura Soulmates privacy and profile visibility.",
  path: "/soulmates/me/settings",
  noIndex: true,
});

export default function SoulmatesSettingsPage() {
  return <SoulmatesSettingsClient />;
}
