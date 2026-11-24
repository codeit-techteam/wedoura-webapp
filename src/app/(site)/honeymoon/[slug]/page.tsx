import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PhotoGrid } from "@/components/media/PhotoGrid";
import { Photo } from "@/components/media/Photo";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { HoneymoonPlanForm } from "@/components/profile/HoneymoonPlanForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { Text } from "@/components/ui/Text";
import { getDestination, listDestinations } from "@/lib/api";
import { pageMeta } from "@/lib/seo";

export async function generateStaticParams() {
  const all = await listDestinations();
  return all.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/honeymoon/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const destination = await getDestination(slug);
  if (!destination) return { title: "Honeymoon" };
  return pageMeta({
    title: destination.name,
    description: destination.summary,
    path: `/honeymoon/${destination.slug}`,
    image: destination.cover.src,
  });
}

export default async function HoneymoonDestinationPage({ params }: PageProps<"/honeymoon/[slug]">) {
  const { slug } = await params;
  const destination = await getDestination(slug);
  if (!destination) notFound();

  return (
    <main className="pb-section-sm">
      <section data-nav-dark className="relative -mt-nav bg-ink text-white">
        <Parallax className="h-[min(78vh,40rem)]">
          <Photo photo={destination.cover} sizes="100vw" mode="cover" priority quality={75} objectPosition="50% 40%" />
        </Parallax>
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink/90 via-ink/30 to-ink/25" />
        <Container className="absolute inset-x-0 bottom-0 pb-10 md:pb-14">
          <Breadcrumb
            tone="white"
            items={[{ label: "Honeymoon", href: "/honeymoon" }, { label: destination.name }]}
          />
          <MaskedHeading as="h1" className="mt-5 max-w-3xl font-serif text-display" lines={[destination.name]} />
          <p className="mt-4 text-body text-white/90">
            {destination.country} · Best from {destination.bestMonths}
          </p>
        </Container>
      </section>

      <section aria-label="Overview" className="border-b border-line bg-white py-section-sm">
        <Container>
          <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
            <div>
              <Label>Overview</Label>
              <p className="mt-3 font-serif text-h3 leading-snug text-balance">{destination.summary}</p>
            </div>
            <div className="flex flex-col gap-5">
              {destination.overview.map((paragraph) => (
                <Text key={paragraph.slice(0, 32)} tone="mute">
                  {paragraph}
                </Text>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section aria-label="What to experience" className="bg-ivory py-section-sm">
        <Container>
          <MaskedHeading as="h2" className="font-serif text-h2" lines={["What to experience"]} />
          <ul className="mt-10 grid gap-2 md:grid-cols-3">
            {destination.experiences.map((item, i) => (
              <Reveal as="li" key={item.title} delay={i * 0.08} className="flex flex-col gap-4 bg-white p-6 md:p-8">
                <p className="font-serif text-h3">{item.title}</p>
                <Text tone="mute">{item.description}</Text>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-label="Photographs" className="py-section-sm">
        <Container width="wide">
          <MaskedHeading as="h2" className="font-serif text-h2" lines={["In photographs"]} />
          <p className="mt-3 max-w-prose text-mute">A sense of the place—light, water and the pace of the days.</p>
          <div className="mt-10">
            <PhotoGrid photos={destination.gallery} columns={3} sizes="(min-width: 64rem) 28vw, (min-width: 48rem) 33vw, 50vw" />
          </div>
        </Container>
      </section>

      <section aria-label="Why couples choose this" className="border-t border-line bg-white py-section-sm">
        <Container>
          <MaskedHeading as="h2" className="font-serif text-h2" lines={["Why couples come here"]} />
          <ul className="mt-8 border-t border-line">
            {destination.whyCouples.map((line) => (
              <li key={line} className="border-b border-line py-5 text-body text-ink md:py-6">
                {line}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-label="Good to know" className="border-t border-line bg-ivory py-section-sm">
        <Container>
          <MaskedHeading as="h2" className="font-serif text-h2" lines={["Good to know"]} />
          <dl className="mt-10 grid gap-8 sm:grid-cols-2">
            {destination.practical.map((row) => (
              <div key={row.label}>
                <dt className="label text-mute">{row.label}</dt>
                <dd className="mt-2 max-w-prose text-body">{row.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section aria-label="Plan it with us" className="border-t border-line py-section-sm">
        <Container>
          <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
            <div>
              <MaskedHeading as="h2" className="font-serif text-h2" lines={["Plan it with us"]} />
              <p className="mt-4 max-w-prose text-mute">
                Tell us how long you have and what kind of days you want. We will sketch a loose route for {destination.name}
                —no call centre, no package hard-sell.
              </p>
            </div>
            <div className="border border-line bg-ivory p-6 md:p-10">
              <HoneymoonPlanForm destinationName={destination.name} />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}