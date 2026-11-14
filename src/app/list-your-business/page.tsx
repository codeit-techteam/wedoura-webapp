import type { Metadata } from "next";
import { Placeholder } from "@/components/chrome/Placeholder";

export const metadata: Metadata = {
  title: "List Your Business",
  description: "The vendor pitch and signup form.",
};

export default function Page() {
  return (
    <Placeholder eyebrow="List Your Business" title="Show your work to couples who are looking" step={8} />
  );
}
