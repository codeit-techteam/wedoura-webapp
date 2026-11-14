import type { Metadata } from "next";
import { Placeholder } from "@/components/chrome/Placeholder";

export const metadata: Metadata = {
  title: "Contact",
  description: "Write to us.",
};

export default function Page() {
  return (
    <Placeholder eyebrow="Contact" title="Contact" step={7} />
  );
}
