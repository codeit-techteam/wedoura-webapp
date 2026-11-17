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
import { JsonLd } from "@/components/seo/JsonLd";
import { cn } from "@/lib/cn";
import { getFilm, getWedding, listAllCities, listWeddings } from "@/lib/api";
import { weddingSchema } from "@/lib/schema";
import { absoluteUrl } from "@/lib/site-config";

const longDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" });

export async function generateStaticParams() {
  const { items } = await listWeddings({ limit: 10000 });
  return items.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: PageProps<"/real-weddings/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const wedding = await getWedding(slug);
  if (!wedding) return { title: "Real wedding" };
  return {
    title: wedding.title,
    description: wedding.excerpt,
    alternates: { canonical: absoluteUrl(`/real-weddings/${wedding.slug}`) },
    openGraph: { images: [{ url: absoluteUrl(wedding.cover.src) }] },
  };
}

export default async function RealWeddingPage({ params }: PageProps<"/real-weddings/[slug]">) {
  const { slug } = await params;
  const wedding = await getWedding(slug);
  if (!wedding) notFound();

  const [cities, morePage, film] = await Promise.all([
    listAllCities(),
    listWeddings({ page: 1, limit: 5 }),
    wedding.filmId ? getFilm(wedding.filmId) : Promise.resolve(undefined),
  ]);
  const cityNames = Object.fromEntries(cities.map((c) => [c.slug, c.name]));
  const more = morePage.items.filter((w) => w.slug !== slug).slice(0, 4);
  const credit = photographerOf(wedding);

  return (
    <main className="pb-section-sm">
      <JsonLd schema={weddingSchema(wedding)} />
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
      <section className="border-b border-line bg-white">
        <Container className="py-section-sm">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <p className="max-w-2xl font-serif text-h3 leading-snug text-balance">{wedding.excerpt}</p>
            <ShareButtons title={wedding.title} path={`/real-weddings/${wedding.slug}`} />
          </div>
          {credit && <p className="mt-6 text-small text-mute">Photographs by {credit}</p>}
        </Container>
        <Container className="border-t border-line">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-5 py-6 md:grid-cols-4 md:py-7">
            <div>
              <dt className="label text-mute">Couple</dt>
              <dd className="mt-1 font-serif text-h3">{wedding.couple}</dd>
            </div>
            <div>
              <dt className="label text-mute">City</dt>
              <dd className="mt-1 font-serif text-h3">{cityNames[wedding.city]}</dd>
            </div>
            <div>
              <dt className="label text-mute">Style</dt>
              <dd className="mt-1 font-serif text-h3">{wedding.style}</dd>
            </div>
            <div>
              <dt className="label text-mute">Date</dt>
              <dd className="mt-1 font-serif text-h3">{longDate.format(new Date(wedding.date))}</dd>
            </div>
          </dl>
        </Container>
      </section>

      {/* Chapters: copy beside a three-column photo grid. */}
      {wedding.chapters.map((chapter, i) => (
        <section
          key={chapter.title}
          aria-label={chapter.title}
          className={cn("py-section-sm", i % 2 === 1 ? "bg-ivory" : "bg-white")}
        >
          <Container width={i % 2 === 1 ? "wide" : undefined}>
            <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
              <Reveal className="lg:sticky lg:top-24">
                <Label>Chapter {String(i + 1).padStart(2, "0")}</Label>
                <MaskedHeading as="h2" className="mt-3 font-serif text-h2" lines={[chapter.title]} />
                <div className="mt-5 flex flex-col gap-4">
                  {chapter.text.map((paragraph) => (
                    <Text key={paragraph.slice(0, 24)} tone="mute" className="max-w-prose">
                      {paragraph}
                    </Text>
                  ))}
                </div>
              </Reveal>
              <PhotoGrid
                photos={chapter.photos}
                columns={3}
                sizes="(min-width: 64rem) 22vw, (min-width: 48rem) 30vw, 50vw"
              />
            </div>
          </Container>
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
                  {/* getWedding strips vendorSlug for unpublished vendors, so
                      a slug here is always a live, published profile. */}
                  {creditLine.vendorSlug ? (
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
