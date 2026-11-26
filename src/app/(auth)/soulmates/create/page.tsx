import type { Metadata } from "next";
import { SoulmatesCreateForm } from "@/components/soulmates/SoulmatesCreateForm";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Create your Soulmates profile",
  description:
    "Create a Wedoura Soulmates profile in a few calm steps. Verified by hand, private until you both say yes.",
  path: "/soulmates/create",
  noIndex: true,
});

export default function SoulmatesCreatePage() {
  return <SoulmatesCreateForm />;
}
