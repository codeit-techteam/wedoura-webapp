import type { Metadata } from "next";
import { Suspense } from "react";
import { SavedList } from "@/components/browse/SavedList";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Container } from "@/components/ui/Container";
import { listAllCities } from "@/lib/api";

export const metadata: Metadata = {
  title: "Saved",
  description: "Your shortlist of vendors and stories, kept on this device.",
  robots: { index: false, follow: false },
};

export default async function SavedPage() {
  // The shortlist lives in the browser; SavedList fetches exactly the saved
  // slugs, so nothing here grows with the vendor count.
  const cities = await listAllCities();
  const cityNames = Object.fromEntries(cities.map((c) => [c.slug, c.name]));

  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <MaskedHeading as="h1" className="font-serif text-h1" lines={["Your shortlist."]} />
        <p className="mt-4 max-w-prose text-mute">Saved on this device only, until accounts arrive.</p>
      </Container>
      <Container width="wide" className="mt-10">
        <Suspense fallback={null}>
          <SavedList cityNames={cityNames} />
        </Suspense>
      </Container>
    </main>
  );
}
