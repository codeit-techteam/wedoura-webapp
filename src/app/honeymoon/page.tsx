import type { Metadata } from "next";
import { Placeholder } from "@/components/chrome/Placeholder";

export const metadata: Metadata = {
  title: "Honeymoon",
  description: "Where to go after, and when.",
};

export default function Page() {
  return (
    <Placeholder eyebrow="Honeymoon" title="Honeymoon destinations" step={7} />
  );
}
