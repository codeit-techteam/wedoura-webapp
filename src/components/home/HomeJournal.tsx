import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { BlogPost } from "@/data/types";

type Props = { articles: BlogPost[] };

const monthYear = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });

export function HomeJournal({ articles }: Props) {
  if (!articles.length) return null;
  return (
    <section aria-label="From the journal" className="py-section bg-white">
      <Container>
        <SectionHeader
          label="The journal"
          title={
            <>
              Ideas worth <em>saving</em>
            </>
          }
          href="/blogs"
          linkLabel="All articles"
        />
        <ul className="grid gap-8 gap-y-12 md:grid-cols-3">
          {articles.map((post, i) => (
            <li key={post.slug}>
              <Link href={`/blogs/${post.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
                  <Image
                    src={post.cover.src}
                    alt={post.cover.alt}
                    fill
                    className="object-cover transition-transform duration-1200 ease-wedoura group-hover:scale-104"
                    sizes="(min-width: 48rem) 33vw, 100vw"
                    priority={i === 0}
                    unoptimized
                  />
                </div>
                <p className="mt-4 text-small text-mute">
                  {monthYear.format(new Date(post.date))} · {post.category}
                </p>
                <h3 className="mt-1 font-serif text-h3 leading-snug text-ink group-hover:text-gold-deep transition-colors">
                  {post.title}
                </h3>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
