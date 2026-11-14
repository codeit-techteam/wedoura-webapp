import type { Metadata } from "next";
import { Placeholder } from "@/components/chrome/Placeholder";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How we treat your data.",
};

export default function Page() {
  return (
    <Placeholder eyebrow="Privacy Policy" title="Privacy policy" step={7} />
  );
}
