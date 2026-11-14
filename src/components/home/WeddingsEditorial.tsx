import Link from "next/link";
import { Photo } from "@/components/media/Photo";
import { PhotoCard } from "@/components/media/PhotoCard";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import type { RealWedding } from "@/data/types";

type Props = {
  weddings: RealWedding[];
  cityNames: Record<string, string>;
};

function photographerOf(wedding: RealWedding): string | undefined {
  return wedding.credits.find((c) => c.role === "Photography" || c.role === "Films")?.name;
}

/**
 * One cover story with its headline overlapping the image edge, and two
 * smaller stories offset beside it.
 */
export function WeddingsEditorial({ weddings, cityNames }: Props) {
  const [cover, ...rest] = weddings;
  if (!cover) return null;
  const coverCredit = photographerOf(cover);

  return (
    <div className="grid gap-x-8 gap-y-16 md:grid-cols-12">
      {/* Cover story: parallax image, headline pulled over its edge. */}
      <Reveal as="article" className="md:col-span-8">
        <Link href={`/real-weddings/${cover.slug}`} className="group block outline-offset-4">
          <Parallax className="aspect-4/3 md:aspect-3/2">
            <Photo
              photo={cover.cover}
              mode="cover"
              sizes="(min-width: 48rem) 62vw, 100vw"
              className="transition-transform duration-1200 ease-wedoura group-hover:scale-104"
            />
          </Parallax>
          <div className="relative z-10 -mt-8 md:-mt-14 md:max-w-xl">
            <div className="bg-white pt-5 pr-8 md:pt-6 md:pr-10">
              <p className="label text-mute">{cityNames[cover.city]}</p>
              <h3 className="mt-2 font-serif text-h2 leading-none text-balance">{cover.title}</h3>
              <p className="mt-3 text-small text-mute">
                {cover.couple}
                {coverCredit ? ` · Photographs by ${coverCredit}` : ""}
              </p>
            </div>
          </div>
        </Link>
      </Reveal>

      {/* Two smaller stories, the second pushed down for an offset rhythm. */}
      <div className="grid gap-12 sm:grid-cols-2 md:col-span-4 md:grid-cols-1 md:gap-14">
        {rest.slice(0, 2).map((wedding, i) => {
          const credit = photographerOf(wedding);
          return (
            <Reveal as="article" key={wedding.slug} delay={0.12 + i * 0.08} className={i === 1 ? "md:ml-14" : ""}>
              <PhotoCard
                photo={wedding.cover}
                ratio="4/3"
                sizes="(min-width: 48rem) 28vw, 50vw"
                href={`/real-weddings/${wedding.slug}`}
                eyebrow={cityNames[wedding.city]}
                title={wedding.title}
                meta={`${wedding.couple}${credit ? ` · Photographs by ${credit}` : ""}`}
                compact
              />
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
