import type { Metadata } from "next";
import { Photo } from "@/components/media/Photo";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { Text } from "@/components/ui/Text";
import { getPhoto, getPromises } from "@/lib/api";

export const metadata: Metadata = {
  title: "About",
  description: "Why Wedoura exists: real work, direct contact and no made-up numbers.",
};

export default async function AboutPage() {
  const [photo, promises] = await Promise.all([getPhoto("p33"), getPromises()]);

  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <MaskedHeading
          as="h1"
          className="max-w-3xl font-serif text-h1"
          lines={[<>Weddings are made by people,</>, <>not listings.</>]}
        />
        <div className="mt-10 grid gap-12 md:grid-cols-[1.2fr_1fr] md:gap-20">
          <div className="max-w-prose">
            <Text variant="lead">
              Wedoura is a small team in India building one honest place to find the people who make weddings:
              photographers, venues, makeup artists, decorators, caterers and musicians.
            </Text>
            <Text tone="mute" className="mt-6">
              Sample copy. We started Wedoura after planning weddings of our own and finding the same thing
              everywhere: directories full of badges, paid rankings and numbers nobody could check. The work
              itself, the only thing that matters, was always three clicks away and cropped into squares.
            </Text>
            <Text tone="mute" className="mt-4">
              Sample copy. So the rules here are simple. Photographs run whole. Messages go straight to the
              vendor. And if we cannot stand behind a number, we do not show it.
            </Text>
            <ul className="mt-10 border-t border-line">
              {promises.map((promise, i) => (
                <Reveal as="li" key={promise.title} delay={i * 0.08} className="border-b border-line py-5">
                  <p className="font-serif text-h3">{promise.title}</p>
                </Reveal>
              ))}
            </ul>
          </div>
          {photo && (
            <ImageReveal>
              <figure>
                <Photo photo={photo} sizes="(min-width: 48rem) 40vw, 100vw" />
                {photo.credit && (
                  <figcaption className="mt-3 text-small text-mute">Photograph by {photo.credit}.</figcaption>
                )}
              </figure>
            </ImageReveal>
          )}
        </div>
      </Container>
    </main>
  );
}
