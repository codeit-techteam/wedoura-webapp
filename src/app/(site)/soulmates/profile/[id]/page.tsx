import type { Metadata } from "next";
import { SoulmatesProfileClient } from "@/components/soulmates/SoulmatesProfileClient";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Introduction · Soulmates",
  description: "A Wedoura Soulmates introduction.",
  path: "/soulmates/profile",
  noIndex: true,
});

export default async function SoulmatesProfilePage({
  params,
}: PageProps<"/soulmates/profile/[id]">) {
  const { id } = await params;
  return <SoulmatesProfileClient profileId={id} />;
}
