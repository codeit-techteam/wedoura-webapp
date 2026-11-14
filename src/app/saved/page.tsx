import type { Metadata } from "next";
import { SavedList } from "@/components/browse/SavedList";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Container } from "@/components/ui/Container";
import { getCities, getVendors } from "@/lib/api";

export const metadata: Metadata = {
  title: "Saved",
  description: "Your shortlist, kept on this device.",
};

export default async function SavedPage() {
  const [vendors, cities] = await Promise.all([getVendors(), getCities()]);
  const cityNames = new Map(cities.map((c) => [c.slug, c.name]));

  const cards = vendors.map((v) => ({
    slug: v.slug,
    name: v.name,
    category: v.category,
    cityName: cityNames.get(v.city) ?? v.city,
    startingPrice: v.pricing[0]?.price,
    photos: v.bestPhotos,
  }));

  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <MaskedHeading as="h1" className="font-serif text-h1" lines={[<>Your shortlist.</>]} />
        <p className="mt-4 max-w-prose text-mute">Saved on this device only, until accounts arrive.</p>
      </Container>
      <Container width="wide" className="mt-10">
        <SavedList vendors={cards} />
      </Container>
    </main>
  );
}
