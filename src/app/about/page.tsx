import type { Metadata } from "next";
import { Placeholder } from "@/components/chrome/Placeholder";

export const metadata: Metadata = {
  title: "About",
  description: "Who we are and why the photographs come first.",
};

export default function Page() {
  return (
    <Placeholder eyebrow="About" title="About Wedoura" step={7} />
  );
}
