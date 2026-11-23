import type { Metadata } from "next";
import { Suspense } from "react";
import { SavedList } from "@/components/browse/SavedList";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
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
        <Label>Saved</Label>
        <MaskedHeading
          as="h1"
          className="mt-3.5 max-w-3xl font-serif text-[clamp(2.75rem,5.2vw,4.75rem)] leading-[1.02] text-ink"
          lines={[
            <>
              Your <em>shortlist</em>
            </>,
          ]}
        />
        <p className="mt-5 max-w-[36em] text-[1.1875rem] leading-relaxed text-mute">
          Saved on this device only, until accounts arrive.
        </p>
      </Container>
      <Container width="wide" className="mt-10">
        <Suspense fallback={null}>
          <SavedList cityNames={cityNames} />
        </Suspense>
      </Container>
    </main>
  );
}
