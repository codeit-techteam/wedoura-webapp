import type { Metadata } from "next";
import { Placeholder } from "@/components/chrome/Placeholder";

export const metadata: Metadata = {
  title: "Vendor Studio",
  description: "Manage your profile, portfolio and inquiries.",
};

export default function Page() {
  return (
    <Placeholder eyebrow="Vendor Studio" title="Vendor Studio" step={8} />
  );
}
