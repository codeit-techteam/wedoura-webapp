import type { Metadata } from "next";
import Link from "next/link";
import { PhotoTile } from "@/components/cards/PhotoTile";
import { Photo } from "@/components/media/Photo";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { listDestinations } from "@/lib/api";
import { pickParams } from "@/lib/url";

export const metadata: Metadata = {
  title: "Honeymoon",
  description: "Places worth the first week of being married: backwaters, islands, coffee hills and fort towns.",
};

export default async function HoneymoonPage({ searchParams }: PageProps<"/honeymoon">) {
  const params = pickParams(await searchParams, ["place"]);
  const destinations = await listDestinations();
  const selected = destinations.find((d) => d.slug === params.place) ?? null;

  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <MaskedHeading as="h1" className="font-serif text-h1" lines={["After the wedding, this."]} />
        <p className="mt-4 max-w-prose text-mute">Four places we would send anyone. Tap one to see why.</p>
      </Container>
      <Container width="wide" className="mt-10">
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4" aria-label="Destinations">
          {destinations.map((destination) => {
            const isOpen = selected?.slug === destination.slug;
            return (
              <li key={destination.slug} className="relative aspect-3/4">
                <Link
                  href={isOpen ? "/honeymoon" : `/honeymoon?place=${destination.slug}`}
                  scroll={false}
                  aria-current={isOpen ? "true" : undefined}
                  className="block h-full w-full text-left outline-offset-4"
                >
                  <PhotoTile
                    photo={destination.cover}
                    title={destination.name}
                    sizes="(min-width: 48rem) 25vw, 100vw"
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        {selected && (
          <section aria-label={selected.name}>
            <div className="mt-2 grid gap-8 bg-ivory p-6 md:grid-cols-[1.2fr_1fr] md:gap-14 md:p-12">
              <div className="relative aspect-4/3 overflow-hidden">
                <Photo photo={selected.cover} mode="cover" sizes="(min-width: 48rem) 55vw, 100vw" />
              </div>
              <div>
                <div className="flex items-start justify-between gap-6">
                  <h2 className="font-serif text-h2">{selected.name}</h2>
                  <Link
                    href="/honeymoon"
                    scroll={false}
                    className="label tap inline-flex items-center px-2 text-mute transition-chrome hover:text-ink"
                  >
                    Close
                  </Link>
                </div>
                <p className="mt-2 text-small text-mute">
                  {selected.country} · Best from {selected.bestMonths}
                </p>
                <p className="mt-5 max-w-prose text-mute">{selected.summary}</p>
                <Label className="mt-8 block">Why couples go</Label>
                <ul className="mt-3 border-t border-ink/20">
                  {selected.highlights.map((line) => (
                    <li key={line} className="border-b border-ink/20 py-3 text-body">
                      {line}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Button href="/contact" variant="outline">
                    Plan it with us
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}
      </Container>
    </main>
  );
}
