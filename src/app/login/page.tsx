import type { Metadata } from "next";
import { Placeholder } from "@/components/chrome/Placeholder";

export const metadata: Metadata = {
  title: "Vendor login",
  description: "Sign in to your studio.",
};

export default function Page() {
  return (
    <Placeholder eyebrow="Vendor login" title="Vendor login" step={8} />
  );
}
