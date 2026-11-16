import type { Metadata } from "next";
import { Suspense } from "react";
import { SavedList } from "@/components/browse/SavedList";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Container } from "@/components/ui/Container";
import { listAllCities, listVendors, listWeddings } from "@/lib/api";

export const metadata: Metadata = {
  title: "Saved",
  description: "Your shortlist of vendors and stories, kept on this device.",
};

export default async function SavedPage() {
  const [vendorsPage, weddingsPage, cities] = await Promise.all([
    listVendors({ limit: 999 }),
    listWeddings(),
    listAllCities(),
  ]);
  const cityNames = Object.fromEntries(cities.map((c) => [c.slug, c.name]));
  const cards = vendorsPage.items;
  const weddings = weddingsPage.items;

  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <MaskedHeading as="h1" className="font-serif text-h1" lines={[<>Your shortlist.</>]} />
        <p className="mt-4 max-w-prose text-mute">Saved on this device only, until accounts arrive.</p>
      </Container>
      <Container width="wide" className="mt-10">
        <Suspense fallback={null}>
          <SavedList vendors={cards} weddings={weddings} cityNames={cityNames} />
        </Suspense>
      </Container>
    </main>
  );
}
