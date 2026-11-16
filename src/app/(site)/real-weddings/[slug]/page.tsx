import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Rail } from "@/components/browse/Rail";
import { StoryCard, photographerOf } from "@/components/cards/StoryCard";
import { FilmPreview } from "@/components/media/FilmPreview";
import { Photo } from "@/components/media/Photo";
import { PhotoGrid } from "@/components/media/PhotoGrid";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Label } from "@/components/ui/Label";
import { ShareButtons } from "@/components/ui/ShareButtons";
import { Text } from "@/components/ui/Text";
import { getFilm, getWedding, listAllCities, listVendors, listWeddings } from "@/lib/api";

const longDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" });

export async function generateStaticParams() {
  const { items } = await listWeddings();
  return items.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: PageProps<"/real-weddings/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const wedding = await getWedding(slug);
  if (!wedding) return { title: "Real wedding" };
  return {
    title: wedding.title,
    description: wedding.excerpt,
    openGraph: { images: [wedding.cover.src] },
  };
}

export default async function RealWeddingPage({ params }: PageProps<"/real-weddings/[slug]">) {
  const { slug } = await params;
  const wedding = await getWedding(slug);
  if (!wedding) notFound();

  const [cities, allWeddings, publishedVendors, film] = await Promise.all([
    listAllCities(),
    listWeddings(),
    listVendors({ limit: 999 }),
    wedding.filmId ? getFilm(wedding.filmId) : Promise.resolve(undefined),
  ]);
  const cityNames = Object.fromEntries(cities.map((c) => [c.slug, c.name]));
  const more = allWeddings.items.filter((w) => w.slug !== slug).slice(0, 4);
  const credit = photographerOf(wedding);
  // Credits link only to published profiles; others show as plain names.
  const publishedSlugs = new Set(publishedVendors.items.map((v) => v.slug));

  return (
    <main className="pb-section-sm">
      {/* Opener: full-bleed parallax cover. */}
      <section data-nav-dark className="relative -mt-nav bg-ink text-white">
        <Parallax className="h-[82vh]">
          <Photo photo={wedding.cover} sizes="100vw" mode="cover" priority quality={75} />
        </Parallax>
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/20 to-ink/25" />
        <Container className="absolute inset-x-0 bottom-0 pb-10 md:pb-14">
          <Breadcrumb
            tone="white"
            items={[{ label: "Real Weddings", href: "/real-weddings" }, { label: wedding.title }]}
          />
          <MaskedHeading as="h1" className="mt-5 max-w-4xl font-serif text-display" lines={[wedding.title]} />
          <p className="mt-4 text-body text-white/90">
            {wedding.couple} · {cityNames[wedding.city]} · {longDate.format(new Date(wedding.date))}
          </p>
        </Container>
      </section>

      {/* Lead */}
      <Container className="py-section-sm">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <p className="max-w-2xl font-serif text-h3 leading-snug text-balance">{wedding.excerpt}</p>
          <ShareButtons title={wedding.title} path={`/real-weddings/${wedding.slug}`} />
        </div>
        {credit && <p className="mt-6 text-small text-mute">Photographs by {credit}</p>}
      </Container>

      {/* Chapters: photographs inside the story at mixed sizes. */}
      {wedding.chapters.map((chapter, i) => (
        <section key={chapter.title} aria-label={chapter.title} className="pb-section-sm">
          {i % 2 === 0 ? (
            <Container>
              <div className="grid items-start gap-10 md:grid-cols-[1fr_1.6fr] md:gap-16">
                <Reveal className="md:sticky md:top-24">
                  <Label>Chapter {String(i + 1).padStart(2, "0")}</Label>
                  <MaskedHeading as="h2" className="mt-3 font-serif text-h2" lines={[chapter.title]} />
                  {chapter.text.map((paragraph) => (
                    <Text key={paragraph.slice(0, 24)} tone="mute" className="mt-5 max-w-prose">
                      {paragraph}
                    </Text>
                  ))}
                </Reveal>
                <PhotoGrid photos={chapter.photos} columns={2} sizes="(min-width: 48rem) 30vw, 50vw" />
              </div>
            </Container>
          ) : (
            <>
              <Container className="mb-10">
                <Label>Chapter {String(i + 1).padStart(2, "0")}</Label>
                <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
                  <MaskedHeading as="h2" className="font-serif text-h2" lines={[chapter.title]} />
                  <div className="max-w-md">
                    {chapter.text.map((paragraph) => (
                      <Text key={paragraph.slice(0, 24)} tone="mute">
                        {paragraph}
                      </Text>
                    ))}
                  </div>
                </div>
              </Container>
              <Container width="wide">
                <PhotoGrid photos={chapter.photos} columns={2} sizes="(min-width: 48rem) 48vw, 100vw" />
              </Container>
            </>
          )}
        </section>
      ))}

      {/* The film, when there is one. */}
      {film && (
        <section aria-label="The film" className="bg-ink py-section-sm text-white">
          <Container>
            <MaskedHeading as="h2" className="font-serif text-h2" lines={["The film"]} />
            <div className="mt-8 md:px-24">
              <FilmPreview film={film} sizes="(min-width: 48rem) 80vw, 100vw" />
            </div>
          </Container>
        </section>
      )}

      {/* The team */}
      <section aria-label="The team" className="py-section-sm">
        <Container>
          <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
            <div>
              <MaskedHeading as="h2" className="font-serif text-h2" lines={["The team"]} />
              <p className="mt-4 max-w-xs text-mute">The people who made the day. Names link to their Wedoura profiles.</p>
            </div>
            <ul className="border-t border-line">
              {wedding.credits.map((creditLine) => (
                <li key={creditLine.role + creditLine.name} className="border-b border-line">
                  {creditLine.vendorSlug && publishedSlugs.has(creditLine.vendorSlug) ? (
                    <Link
                      href={`/vendors/${creditLine.vendorSlug}`}
                      className="group flex tap items-baseline justify-between gap-6 py-4"
                    >
                      <span className="label text-mute">{creditLine.role}</span>
                      <span className="flex items-center gap-3 font-serif text-h3 transition-colors duration-300 ease-wedoura group-hover:text-mute">
                        {creditLine.name}
                        <Icon
                          name="arrow-right"
                          size={18}
                          className="text-gold transition-transform duration-300 ease-wedoura group-hover:translate-x-1"
                        />
                      </span>
                    </Link>
                  ) : (
                    <div className="flex items-baseline justify-between gap-6 py-4">
                      <span className="label text-mute">{creditLine.role}</span>
                      <span className="font-serif text-h3">{creditLine.name}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* More stories */}
      {more.length > 0 && (
        <section aria-label="More stories" className="bg-ivory py-section-sm">
          <Container>
            <MaskedHeading as="h2" className="font-serif text-h2" lines={["More stories"]} />
            <div className="mt-8">
              <Rail label="More stories" itemClassName="w-5/6 sm:w-3/5 xl:w-[31%]">
                {more.map((w) => (
                  <StoryCard
                    key={w.slug}
                    wedding={w}
                    cityName={cityNames[w.city]}
                    sizes="(min-width: 48rem) 33vw, 85vw"
                    variant="small"
                  />
                ))}
              </Rail>
            </div>
          </Container>
        </section>
      )}
    </main>
  );
}
