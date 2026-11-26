import type { Metadata } from "next";
import { SoulmatesPreviewClient } from "@/components/soulmates/SoulmatesPreviewClient";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "How others see you · Soulmates",
  description: "Preview your Wedoura Soulmates profile.",
  path: "/soulmates/me/profile",
  noIndex: true,
});

export default function SoulmatesPreviewPage() {
  return <SoulmatesPreviewClient />;
}
