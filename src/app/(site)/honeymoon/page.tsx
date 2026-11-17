import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PhotoTile } from "@/components/cards/PhotoTile";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { listDestinations } from "@/lib/api";
import { pickParams } from "@/lib/url";
import { absoluteUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Honeymoon",
  description: "Places worth the first week of being married: backwaters, islands, coffee hills and fort towns.",
  alternates: { canonical: absoluteUrl("/honeymoon") },
};

export default async function HoneymoonPage({ searchParams }: PageProps<"/honeymoon">) {
  const params = pickParams(await searchParams, ["place"]);
  if (params.place) redirect(`/honeymoon/${params.place}`);

  const destinations = await listDestinations();

  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <MaskedHeading as="h1" className="font-serif text-h1" lines={["After the wedding, this."]} />
        <p className="mt-4 max-w-prose text-mute">
          Six places we send couples often. Each opens a full guide—what to do, what to book, and how to keep the
          first week unhurried.
        </p>
      </Container>
      <Container width="wide" className="mt-10 md:mt-14">
        <ul className="grid grid-cols-1 gap-2 gap-y-10 md:grid-cols-3" aria-label="Destinations">
          {destinations.map((destination, i) => (
            <li key={destination.slug}>
              <Reveal delay={i * 0.06}>
                <Link href={`/honeymoon/${destination.slug}`} className="group block">
                  <div className="relative aspect-3/4">
                    <PhotoTile
                      photo={destination.cover}
                      title={destination.name}
                      meta={`${destination.country} · ${destination.bestMonths}`}
                      sizes="(min-width: 64rem) 33vw, (min-width: 40rem) 50vw, 100vw"
                    />
                  </div>
                  <p className="mt-4 max-w-prose text-mute transition-chrome group-hover:text-ink">{destination.summary}</p>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </main>
  );
}