import type { Metadata } from "next";
import { AccountSpace } from "@/components/account/AccountSpace";

export const metadata: Metadata = {
  title: "Your wedding space",
  description: "Shortlist, enquiries and wedding details on Wedoura.",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountSpace />;
}
