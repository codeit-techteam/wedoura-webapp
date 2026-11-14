import type { Metadata } from "next";
import { Placeholder } from "@/components/chrome/Placeholder";

export const metadata: Metadata = {
  title: "Real weddings",
  description: "Whole wedding days, told through the photographs and the people who made them.",
};

export default function Page() {
  return (
    <Placeholder eyebrow="Real weddings" title="Real weddings" step={6} />
  );
}
