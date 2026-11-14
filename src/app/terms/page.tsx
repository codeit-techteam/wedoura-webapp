import type { Metadata } from "next";
import { Placeholder } from "@/components/chrome/Placeholder";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms for couples and vendors.",
};

export default function Page() {
  return (
    <Placeholder eyebrow="Terms" title="Terms of use" step={7} />
  );
}
