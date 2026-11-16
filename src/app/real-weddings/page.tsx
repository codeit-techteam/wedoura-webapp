import type { Metadata } from "next";
import { Suspense } from "react";
import { WeddingBrowser } from "@/components/browse/WeddingBrowser";
import { StoryCard } from "@/components/cards/StoryCard";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { getCities, getRealWeddings, getWeddingStyles } from "@/lib/api";

export const metadata: Metadata = {
  title: "Real Weddings",
  description: "Whole weddings across India, told the way they happened, with the people who made them.",
};

export default async function RealWeddingsPage() {
  const [weddings, styles, cities] = await Promise.all([getRealWeddings(), getWeddingStyles(), getCities()]);
  const cityNames = Object.fromEntries(cities.map((c) => [c.slug, c.name]));
  const featured = weddings.find((w) => w.featured) ?? weddings[0];
  const rest = weddings.filter((w) => w.slug !== featured?.slug);

  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <MaskedHeading as="h1" className="font-serif text-h1" lines={[<>Real weddings, start to finish.</>]} />
      </Container>

      {featured && (
        <Container width="wide" className="mt-8 md:mt-10">
          <Reveal>
            <StoryCard wedding={featured} cityName={cityNames[featured.city]} sizes="100vw" variant="large" />
          </Reveal>
        </Container>
      )}

      <Container className="mt-12 md:mt-16">
        <Suspense fallback={null}>
          <WeddingBrowser
            weddings={rest}
            cityNames={cityNames}
            styles={styles}
            cities={cities.map((c) => ({ value: c.slug, label: c.name }))}
          />
        </Suspense>
      </Container>
    </main>
  );
}
