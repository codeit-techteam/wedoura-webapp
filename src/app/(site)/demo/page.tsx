import type { Metadata } from "next";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { DemoPanel } from "@/components/profile/DemoPanel";
import { Container } from "@/components/ui/Container";

// Demo-only; linked from nowhere and kept out of search engines.
export const metadata: Metadata = {
  title: "Demo controls",
  description: "Demo-only stand-in for the Wedoura admin app.",
  robots: { index: false, follow: false },
};

export default function DemoPage() {
  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <p className="label inline-block border border-ink px-3 py-1.5">Demo controls · not part of the site</p>
        <MaskedHeading as="h1" className="mt-5 font-serif text-h1" lines={["Approvals and publishing."]} />
        <p className="mt-4 max-w-prose text-mute">
          This page stands in for the separate admin app. It works on this browser&apos;s demo store: approve or
          reject applications, publish or unpublish listings, and watch the studio react.
        </p>
      </Container>
      <Container className="mt-12">
        <DemoPanel />
      </Container>
    </main>
  );
}
