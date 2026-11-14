import type { Metadata } from "next";
import { Placeholder } from "@/components/chrome/Placeholder";

export const metadata: Metadata = {
  title: "Saved",
  description: "Vendors you have saved on this device.",
};

export default function Page() {
  return (
    <Placeholder eyebrow="Saved" title="Your shortlist" step={7} />
  );
}
