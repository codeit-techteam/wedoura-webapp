import type { Metadata } from "next";
import { VendorLoginClient } from "@/components/auth/VendorLoginClient";

export const metadata: Metadata = {
  title: "Vendor login",
  description: "Sign in to your Wedoura vendor profile.",
  robots: { index: false, follow: false },
};

export default function VendorLoginPage() {
  return <VendorLoginClient />;
}
