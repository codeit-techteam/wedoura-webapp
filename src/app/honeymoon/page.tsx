import type { Metadata } from "next";
import { Suspense } from "react";
import { DestinationExplorer } from "@/components/browse/DestinationExplorer";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Container } from "@/components/ui/Container";
import { getDestinations } from "@/lib/api";

export const metadata: Metadata = {
  title: "Honeymoon",
  description: "Places worth the first week of being married: backwaters, islands, coffee hills and fort towns.",
};

export default async function HoneymoonPage() {
  const destinations = await getDestinations();
  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <MaskedHeading as="h1" className="font-serif text-h1" lines={[<>After the wedding, this.</>]} />
        <p className="mt-4 max-w-prose text-mute">Four places we would send anyone. Tap one to see why.</p>
      </Container>
      <Container width="wide" className="mt-10">
        <Suspense fallback={null}>
          <DestinationExplorer destinations={destinations} />
        </Suspense>
      </Container>
    </main>
  );
}
