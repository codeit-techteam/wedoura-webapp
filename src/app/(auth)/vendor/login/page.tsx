import type { Metadata } from "next";
import { VendorLoginClient } from "@/components/auth/VendorLoginClient";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Vendor login",
  description: "Sign in to your Wedoura vendor profile.",
  path: "/vendor/login",
  noIndex: true,
});

export default function VendorLoginPage() {
  return <VendorLoginClient />;
}
