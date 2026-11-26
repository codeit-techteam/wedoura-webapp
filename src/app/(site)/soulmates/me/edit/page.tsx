import type { Metadata } from "next";
import { SoulmatesEditClient } from "@/components/soulmates/SoulmatesEditClient";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Edit profile · Soulmates",
  description: "Edit your Wedoura Soulmates profile.",
  path: "/soulmates/me/edit",
  noIndex: true,
});

export default function SoulmatesEditPage() {
  return <SoulmatesEditClient />;
}
