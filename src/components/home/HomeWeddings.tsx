import Image from "next/image";
import Link from "next/link";
import type { RealWedding } from "@/data/types";

type Props = {
  /** Featured pair shown as large story cards (first two). */
  weddings: RealWedding[];
  /** Extra stories whose covers fill the 6-up strip under the cards. */
  strip?: RealWedding[];
};

function CoupleHeading({ couple, title }: { couple: string; title: string }) {
  const parts = couple.split(/\s*&\s*/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 2) {
    return (
      <>
        {parts[0]} <em>&amp;</em> {parts[1]}
      </>
    );
  }
  // Fall back to the editorial title, italicising one accent word when present.
  const emMatch = title.match(/^(.*?)\b(\w+)\b(.*)$/);
  if (emMatch && title.split(" ").length > 4) {
    return (
      <>
        {emMatch[1]}
        <em>{emMatch[2]}</em>
        {emMatch[3]}
      </>
    );
  }
  return <>{title}</>;
}

function creditLine(story: RealWedding): string {
  if (story.credits.length) {
    return story.credits
      .slice(0, 4)
      .map((c) => c.name)
      .join(" · ");
  }
  return [story.couple, story.city].filter(Boolean).join(" · ");
}

function eyebrow(story: RealWedding): string {
  if (story.heroEyebrow) return story.heroEyebrow;
  if (story.featured) return `Wedding of the week · ${story.style}`;
  return `Real wedding · ${story.style}`;
}

/**
 * Homepage Real weddings: two 4:5 story cards + six-up photo strip,
 * matching the home reference section.
 */
export function HomeWeddings({ weddings, strip = [] }: Props) {
  if (!weddings.length) return null;

  const featured = weddings.slice(0, 2);
  const stripItems = (strip.length ? strip : weddings.slice(2)).slice(0, 6);

  return (
    <section
      id="weddings"
      aria-label="Real weddings"
      className="bg-white pt-[clamp(5.5rem,11vw,10.625rem)]"
    >
      <div className="mx-auto mb-[clamp(2.75rem,5vw,4.375rem)] flex max-w-[90rem] flex-wrap items-end justify-between gap-6 px-[clamp(1.25rem,5vw,5.5rem)]">
        <div>
          <p className="label text-gold-deep">The Wedoura edit</p>
          <h2 className="mt-3.5 font-serif text-[clamp(2.625rem,5vw,4.75rem)] leading-[1.02] text-ink">
            Real <em>weddings</em>
          </h2>
        </div>
        <Link
          href="/real-weddings"
          className="border-b border-gold pb-1 font-sans text-button font-medium tracking-[0.26em] text-ink uppercase hover:text-gold-deep"
        >
          Read all stories
        </Link>
      </div>

      <div className="mx-auto grid max-w-[90rem] gap-[clamp(1rem,1.8vw,1.75rem)] px-[clamp(1.25rem,5vw,5.5rem)] md:grid-cols-2">
        {featured.map((story) => (
          <Link
            key={story.slug}
            href={`/real-weddings/${story.slug}`}
            className="group block"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-sand">
              <Image
                src={story.cover.src}
                alt={story.cover.alt}
                fill
                className="object-cover transition-transform duration-1200 ease-wedoura group-hover:scale-104"
                sizes="(min-width: 48rem) 45vw, 100vw"
                unoptimized
              />
            </div>
            <div className="max-w-[40rem] pt-7 pl-1 md:pl-5">
              <p className="label text-gold-deep">{eyebrow(story)}</p>
              <h3 className="mt-3 font-serif text-[clamp(2.25rem,3.6vw,3.5rem)] leading-[1.04] text-ink group-hover:text-gold-deep">
                <CoupleHeading couple={story.couple} title={story.title} />
              </h3>
              {story.excerpt ? (
                <p className="mt-3.5 text-[1.1875rem] leading-relaxed text-mute">{story.excerpt}</p>
              ) : null}
              <p className="mt-4 font-sans text-[0.875rem] tracking-[0.04em] text-mute">
                {creditLine(story)}
              </p>
              <span className="mt-5 inline-block border-b border-gold pb-1 font-sans text-button font-medium tracking-[0.26em] text-ink uppercase">
                Read the story
              </span>
            </div>
          </Link>
        ))}
      </div>

      {stripItems.length > 0 ? (
        <div className="mx-auto mt-[clamp(1rem,1.8vw,1.75rem)] grid max-w-[90rem] grid-cols-3 gap-[clamp(0.5rem,1.2vw,1.75rem)] px-[clamp(1.25rem,5vw,5.5rem)] md:grid-cols-6">
          {stripItems.map((story) => (
            <Link
              key={story.slug}
              href={`/real-weddings/${story.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden bg-sand"
              aria-label={story.couple || story.title}
            >
              <Image
                src={story.cover.src}
                alt=""
                fill
                className="object-cover transition-transform duration-1200 ease-wedoura group-hover:scale-104"
                sizes="(min-width: 48rem) 15vw, 33vw"
                unoptimized
              />
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
