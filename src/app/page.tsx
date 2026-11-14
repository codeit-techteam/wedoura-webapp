import Link from "next/link";
import { Suspense } from "react";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { CityMosaic } from "@/components/home/CityMosaic";
import { Accordion } from "@/components/ui/Accordion";
import { FeaturedTabs } from "@/components/home/FeaturedTabs";
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
  getBlogPosts,
  getCategories,
  getCities,
  getFilms,
  getPhoto,
  getPromises,
  getRealWeddings,
  getSiteFaq,
  getVendors,
} from "@/lib/api";

const monthYear = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });

export default async function HomePage() {
  const [heroA, heroB, heroC, bandPhoto, categories, cities, vendors, weddings, films, promises, posts, faq] =
    await Promise.all([
      getPhoto("p23"),
      getPhoto("p21"),
      getPhoto("p24"),
      getPhoto("p31"),
      getCategories(),
      getCities(),
      getVendors(),
      getRealWeddings(),
      getFilms(),
      getPromises(),
      getBlogPosts(),
      getSiteFaq(),
    ]);
  const cityNames = Object.fromEntries(cities.map((c) => [c.slug, c.name]));
  const heroPhotos = [heroA, heroB, heroC].filter((p) => p !== undefined);

  const tabVendors = vendors.map((vendor) => ({
    slug: vendor.slug,
    name: vendor.name,
    category: vendor.category,
    cityName: cityNames[vendor.city] ?? vendor.city,
    startingPrice: vendor.pricing[0]?.price,
    photos: vendor.bestPhotos,
  }));

  return (
    <main>
      {/* 1 · Hero: three crossfading photographs, search, quick links. */}
      <HeroV2
        photos={heroPhotos}
        cities={cities.map((c) => ({ slug: c.slug, name: c.name }))}
        categories={categories.map((c) => ({ slug: c.slug, name: c.shortName }))}
      />

      {/* 2 · Categories: one full-width row of six tall tiles. */}
      <section aria-label="Vendor categories" className="py-section-sm md:py-section">
        <Container className="mb-8 md:mb-10">
          <MaskedHeading as="h2" className="font-serif text-h1" lines={[<>Six kinds of wedding people.</>]} />
        </Container>
        <Container width="wide">
          <CategoryTiles categories={categories} />
        </Container>
      </section>

      {/* 3 · Featured vendors: tabs over a near-edge-to-edge grid. */}
      <section aria-label="Featured vendors" className="py-section-sm md:py-section">
        <Container className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <MaskedHeading as="h2" className="font-serif text-h1" lines={[<>The ones to meet first.</>]} />
          <Button href="/vendors" variant="link">
            See all vendors
          </Button>
        </Container>
        <Container width="wide">
          <Suspense fallback={null}>
            <FeaturedTabs
              vendors={tabVendors}
              tabs={categories.map((c) => ({ slug: c.slug, name: c.shortName }))}
            />
          </Suspense>
        </Container>
      </section>

      {/* 4 · Real weddings: pinned horizontal scroll (carousel on phones). */}
      <section aria-label="Real weddings" className="py-section-sm md:pt-section md:pb-0">
        <Container className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <MaskedHeading as="h2" className="font-serif text-h1" lines={[<>Whole weddings, as they happened.</>]} />
          <Button href="/real-weddings" variant="link">
            All stories
          </Button>
        </Container>
        <WeddingsScroller weddings={weddings} cityNames={cityNames} />
      </section>

      {/* 5 · Films: the one dark section, first film grows on scroll. */}
      <FilmsShowcase films={films} />

      {/* 6 · Cities: an uneven photo mosaic. */}
      <section aria-label="Browse by city" className="py-section-sm md:py-section">
        <Container className="mb-8 md:mb-10">
          <MaskedHeading as="h2" className="font-serif text-h1" lines={[<>Start with your city.</>]} />
        </Container>
        <Container width="wide">
          <CityMosaic cities={cities} />
        </Container>
      </section>

      {/* 7 · Why Wedoura: one slim band, three short lines. */}
      <Section tone="ivory" size="small" aria-label="Why Wedoura">
        <Container>
          <ul className="grid gap-6 md:grid-cols-3 md:gap-10">
            {promises.map((promise, i) => (
              <Reveal as="li" key={promise.title} delay={i * 0.08} className="border-t border-ink/20 pt-5">
                <p className="font-serif text-h3">{promise.title}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      {/* 8 · Blog: three cards with large images. */}
      <section aria-label="From the blog" className="py-section-sm md:py-section">
        <Container className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <MaskedHeading as="h2" className="font-serif text-h1" lines={[<>Worth reading first.</>]} />
          <Button href="/blogs" variant="link">
            All articles
          </Button>
        </Container>
        <Container width="wide">
          <ul className="grid gap-2 gap-y-10 md:grid-cols-3">
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
      <Section tone="ivory" id="faq" aria-label="Frequently asked questions">
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
        className="relative flex min-h-96 items-end overflow-hidden bg-ink py-section-sm text-white md:min-h-128"
      >
        {bandPhoto && <Photo photo={bandPhoto} sizes="100vw" mode="cover" objectPosition="50% 35%" />}
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/20 to-transparent" />
        <Container className="relative">
          <MaskedHeading as="h2" className="max-w-2xl font-serif text-h1" lines={[<>You do beautiful work.</>, <>Let couples see it.</>]} />
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
