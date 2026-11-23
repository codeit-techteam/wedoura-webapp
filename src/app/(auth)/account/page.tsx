import type { Metadata } from "next";
import { AccountSpace } from "@/components/account/AccountSpace";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Your wedding space",
  description: "Shortlist, enquiries and wedding details on Wedoura.",
  path: "/account",
  noIndex: true,
});

export default function AccountPage() {
  return <AccountSpace />;
}
