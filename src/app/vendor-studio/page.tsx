import type { Metadata } from "next";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { StudioGate } from "@/components/profile/StudioGate";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Vendor Studio",
  description: "Where vendors manage their profile, portfolio, pricing and inquiries.",
};

export default function VendorStudioPage() {
  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <MaskedHeading as="h1" className="font-serif text-h1" lines={[<>Vendor Studio.</>]} />
      </Container>
      <Container className="mt-10">
        <StudioGate />
      </Container>
    </main>
  );
}
