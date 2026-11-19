import { existsSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { UnderlineTabs } from "@/components/browse/UnderlineTabs";
import { VendorCard } from "@/components/cards/VendorCard";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { CityMosaic } from "@/components/home/CityMosaic";
import { Accordion } from "@/components/ui/Accordion";
import { FilmsShowcase } from "@/components/home/FilmsShowcase";
import { HeroV2 } from "@/components/home/HeroV2";
import { WeddingsScroller } from "@/components/home/WeddingsScroller";
import { Photo } from "@/components/media/Photo";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Section } from "@/components/ui/Section";
import {
  getPhoto,
  getPromises,
  getSiteFaq,
  listArticles,
  listCategoriesWithCounts,
  listCitiesWithCounts,
  listFeatured,
  listFilms,
  listWeddings,
} from "@/lib/api";
import { absoluteUrl } from "@/lib/site-config";
import { patchedHref, pickParams } from "@/lib/url";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Wedoura · Wedding vendors across India" },
  description:
    "See wedding photographers, venues, makeup artists, decorators, caterers and musicians through their real work, and talk to them directly.",
  alternates: { canonical: absoluteUrl("/") },
};

const monthYear = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });
const HOME_FEATURED_COUNT = 6;

// A muted looping hero film plays when both files exist; otherwise the photo
// crossfade renders. Drop real assets into public/films/.
const heroVideo =
  existsSync(join(process.cwd(), "public", "films", "hero.mp4")) &&
  existsSync(join(process.cwd(), "public", "films", "hero.jpg"))
    ? { src: "/films/hero.mp4", poster: "/films/hero.jpg" }
    : undefined;

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = pickParams(await searchParams, ["category"]);
  const [heroA, heroB, heroC, bandPhoto, whyPhoto, categories, cities, featured, weddingsPage, films, promises, articles, faq] =
    await Promise.all([
      getPhoto("p23"),
      getPhoto("p21"),
      getPhoto("p24"),
      getPhoto("p31"),
      getPhoto("p35"),
      listCategoriesWithCounts(),
      listCitiesWithCounts(),
      listFeatured(params.category || undefined, HOME_FEATURED_COUNT),
      listWeddings({ page: 1, limit: 3 }),
      listFilms(6),
      getPromises(),
      listArticles({ limit: 3 }),
      getSiteFaq(),
    ]);
  const cityNames = Object.fromEntries(cities.map((c) => [c.slug, c.name]));
  const heroPhotos = [heroA, heroB, heroC].filter((p) => p !== undefined);
  const weddings = weddingsPage.items;
  const posts = articles.items;
  // The films section exists only while there is something to play.
  const playableFilms = films.filter((f) => f.previewSrc.length > 0 || f.fullSrc.length > 0);

  return (
    <main>
      {/* 1 · Hero: three crossfading photographs, search, quick links. */}
      <HeroV2
        photos={heroPhotos}
        video={heroVideo}
        cities={cities.map((c) => ({ slug: c.slug, name: c.name }))}
        categories={categories.map((c) => ({ slug: c.slug, name: c.shortName }))}
      />

      {/* 2 · Categories: six tiles in two rows of three from md. */}
      <section aria-label="Vendor categories" className="pt-section pb-section">
        <Container className="mb-8 md:mb-12">
          <MaskedHeading
            as="h2"
            className="font-serif text-h1"
            lines={[
              <span key="vendor-categories-headline">
                Six kinds of <em>wedding</em> people.
              </span>,
            ]}
          />
        </Container>
        <Container width="wide">
          <CategoryTiles categories={categories} />
        </Container>
      </section>

      {/* 3 · Featured vendors: tabs over two rows of three. */}
      <section aria-label="Featured vendors" className="pb-section">
        <Container className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <MaskedHeading
            as="h2"
            className="font-serif text-h1"
            lines={[
              <span key="featured-headline">
                The ones to <em>meet</em> first.
              </span>,
            ]}
          />
          <Button
            href={params.category ? patchedHref("/vendors", params, {}) : "/vendors"}
            variant="link"
          >
            See all vendors
          </Button>
        </Container>
        <Container width="wide">
          <UnderlineTabs
            param="category"
            label="Vendor categories"
            tabs={categories.map((c) => ({ value: c.slug, label: c.shortName }))}
            pathname="/"
            params={params}
          />
          <ul className="mt-8 grid grid-cols-1 gap-card-gap gap-y-14 sm:grid-cols-2 md:mt-10 lg:grid-cols-3">
            {featured.map((vendor) => (
              <li key={vendor.slug}>
                <VendorCard vendor={vendor} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 4 · Real weddings: pinned horizontal scroll (carousel on phones). */}
      <section aria-label="Real weddings" className="pb-0 pt-section">
        <Container className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <MaskedHeading
            as="h2"
            className="font-serif text-h1"
            lines={[
              <span key="weddings-headline">
                Whole weddings, as they <em>happened</em>.
              </span>,
            ]}
          />
          <Button href="/real-weddings" variant="link">
            All stories
          </Button>
        </Container>
        <WeddingsScroller weddings={weddings} cityNames={cityNames} />
      </section>

      {/* 5 · Films: the one dark section, first film grows on scroll.
          Hidden entirely until real clips exist. */}
      {playableFilms.length > 0 && <FilmsShowcase films={playableFilms} />}

      {/* 6 · Cities: an uneven photo mosaic. */}
      <section aria-label="Browse by city" className="pb-section pt-section-sm">
        <Container width="wide">
          <MaskedHeading
            as="h2"
            className="mb-8 font-serif text-h1 md:mb-12"
            lines={[
              <span key="cities-headline">
                Start with <em>your</em> city.
              </span>,
            ]}
          />
          <CityMosaic cities={cities} />
        </Container>
      </section>

      {/* 7 · Why couples choose Wedoura: three explained points beside one tall photograph. */}
      <Section tone="ivory" className="pb-section pt-section" aria-label="Why couples choose Wedoura">
        <Container>
          <div className="grid gap-10 md:grid-cols-2 md:gap-16 xl:gap-24">
            <div>
              <MaskedHeading
                as="h2"
                className="font-serif text-h1"
                lines={[
                  "Why couples",
                  <span key="why-choose">
                    <em>choose</em> Wedoura.
                  </span>,
                ]}
              />
              <ul className="mt-10 md:mt-14">
                {promises.map((promise, i) => (
                  <Reveal as="li" key={promise.title} delay={i * 0.08} className="border-t border-ink/20 py-6 md:py-8">
                    <span className="label block text-mute">0{i + 1}</span>
                    <h3 className="mt-2 font-serif text-h3">{promise.title}</h3>
                    <p className="mt-2 max-w-prose text-body text-mute">{promise.text}</p>
                  </Reveal>
                ))}
              </ul>
            </div>
            {whyPhoto && (
              <ImageReveal className="self-stretch">
                <div className="relative h-full min-h-96 overflow-hidden md:min-h-full">
                  <Photo photo={whyPhoto} mode="cover" sizes="(min-width: 48rem) 50vw, 100vw" />
                </div>
              </ImageReveal>
            )}
          </div>
        </Container>
      </Section>

      {/* 8 · Blog: three cards with large images. */}
      <section aria-label="From the blog" className="pb-section pt-section">
        <Container className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <MaskedHeading
            as="h2"
            className="font-serif text-h1"
            lines={[
              <span key="blog-headline">
                Worth <em>reading</em> first.
              </span>,
            ]}
          />
          <Button href="/blogs" variant="link">
            All articles
          </Button>
        </Container>
        <Container>
          <ul className="grid gap-card-gap gap-y-14 md:grid-cols-3">
            {posts.slice(0, 3).map((post, i) => (
              <li key={post.slug}>
                <Link href={`/blogs/${post.slug}`} className="group block">
                  <ImageReveal delay={i * 0.08}>
                    <div className="relative aspect-4/3 overflow-hidden bg-ivory">
                      <Photo
                        photo={post.cover}
                        mode="cover"
                        sizes="(min-width: 48rem) 33vw, 100vw"
                        className="transition-transform duration-1200 ease-wedoura group-hover:scale-104"
                      />
                    </div>
                  </ImageReveal>
                  <p className="mt-4 text-small text-mute">
                    {monthYear.format(new Date(post.date))} · {post.category}
                  </p>
                  <h3 className="mt-1 font-serif text-h3 leading-snug">{post.title}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 9 · FAQ. The footer links here. */}
      <Section tone="ivory" className="pb-section pt-section" id="faq" aria-label="Frequently asked questions">
        <Container>
          <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
            <Reveal>
              <Heading size="h2">Questions couples ask us</Heading>
            </Reveal>
            <Reveal delay={0.1}>
              <Accordion items={faq} />
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* 10 · List your business. */}
      <section
        aria-label="List your business"
        className="relative flex min-h-96 items-end overflow-hidden bg-ink py-section text-white md:min-h-128"
      >
        {bandPhoto && <Photo photo={bandPhoto} sizes="100vw" mode="cover" objectPosition="50% 35%" />}
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/20 to-transparent" />
        <Container className="relative">
          <MaskedHeading as="h2" className="max-w-2xl font-serif text-h1" lines={["You do beautiful work.", "Let couples see it."]} />
          <p className="mt-4 max-w-xl text-body text-white/90">A profile is your portfolio, your pricing and a direct line to couples.</p>
          <div className="mt-8">
            <Button href="/list-your-business" tone="white">
              List your business
            </Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
