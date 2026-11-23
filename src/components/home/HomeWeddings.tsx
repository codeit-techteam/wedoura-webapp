import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { RealWedding, VendorCredit } from "@/data/types";

type Props = { weddings: RealWedding[] };

function Credits({ credits }: { credits: VendorCredit[] }) {
  if (!credits.length) return null;
  return (
    <ul className="mt-3 space-y-0.5">
      {credits.slice(0, 4).map((c) => (
        <li key={`${c.role}-${c.name}`} className="text-small text-mute">
          <span className="font-medium text-ink">{c.role}:</span>{" "}
          {c.vendorSlug ? (
            <Link href={`/vendors/${c.vendorSlug}`} className="underline underline-offset-2 hover:text-ink">
              {c.name}
            </Link>
          ) : (
            c.name
          )}
        </li>
      ))}
    </ul>
  );
}

export function HomeWeddings({ weddings }: Props) {
  if (!weddings.length) return null;
  return (
    <section aria-label="Real weddings" className="py-section bg-white">
      <Container>
        <SectionHeader
          label="The Wedoura edit"
          title={
            <>
              Real <em>weddings</em>
            </>
          }
          href="/real-weddings"
          linkLabel="Read all stories"
        />
        <div className="grid gap-10 md:grid-cols-2">
          {weddings.map((story) => (
            <article key={story.slug}>
              <Link href={`/real-weddings/${story.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden bg-ivory">
                  <Image
                    src={story.cover.src}
                    alt={story.cover.alt}
                    fill
                    className="object-cover transition-transform duration-1200 ease-wedoura group-hover:scale-104"
                    sizes="(min-width: 48rem) 50vw, 100vw"
                    unoptimized
                  />
                </div>
              </Link>
              <div className="mt-5">
                <p className="label text-gold-deep">{story.couple} · {story.city}</p>
                <h3 className="mt-2 font-serif text-h3 text-ink leading-snug">
                  <Link href={`/real-weddings/${story.slug}`} className="hover:text-gold-deep">
                    {story.title}
                  </Link>
                </h3>
                <p className="mt-2 text-body text-mute line-clamp-3">{story.excerpt}</p>
                <Credits credits={story.credits} />
                <Link
                  href={`/real-weddings/${story.slug}`}
                  className="mt-4 inline-block font-sans text-button font-medium tracking-button text-ink uppercase border-b border-gold pb-0.5 hover:text-gold-deep"
                >
                  Read the story
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
