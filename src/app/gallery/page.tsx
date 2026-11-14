import type { Metadata } from "next";
import { Placeholder } from "@/components/chrome/Placeholder";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photographs from weddings across India, with the full-screen viewer.",
};

export default function Page() {
  return (
    <Placeholder eyebrow="Gallery" title="Photo wall" step={7} />
  );
}
