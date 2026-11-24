import type { Metadata } from "next";
import Link from "next/link";
import { LoadMore } from "@/components/browse/LoadMore";
import { UnderlineTabs } from "@/components/browse/UnderlineTabs";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { Photo } from "@/components/media/Photo";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Label } from "@/components/ui/Label";
import { listArticleCategories, listArticles } from "@/lib/api";
import { patchedHref, pickParams } from "@/lib/url";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Journal",
  description: "Planning guides, venue notes and ideas worth saving, from people who work weddings every week.",
  path: "/blogs",
});

const PAGE = 9;
const PATHNAME = "/blogs";

const monthYear = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });

export default async function BlogsPage({ searchParams }: PageProps<"/blogs">) {
  const params = pickParams(await searchParams, ["category", "show"]);
  const shownCount = Math.max(PAGE, Number.parseInt(params.show ?? "", 10) || PAGE);
  const [categories, filtered] = await Promise.all([
    listArticleCategories(),
    listArticles({ category: params.category || undefined, page: 1, limit: shownCount }),
  ]);
  const shown = filtered.items;
  const featured = !params.category && shown[0] ? shown[0] : null;
  const gridPosts = featured ? shown.slice(1) : shown;

  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <Label>The Journal</Label>
        <MaskedHeading
          as="h1"
          className="mt-3.5 max-w-3xl font-serif text-[clamp(2.75rem,5.2vw,4.75rem)] leading-[1.02] text-ink"
          lines={[
            <span key="headline">
              Worth reading before you <em>book</em>
            </span>,
          ]}
        />
        <p className="mt-5 max-w-[36em] text-[1.1875rem] leading-relaxed text-mute">
          Guides on vendors, venues and the days around the ceremony — not listicles, just what we would tell
          friends.
        </p>
      </Container>

      {featured && (
        <Container width="wide" className="mt-10 md:mt-12">
          <Reveal>
            <Link href={`/blogs/${featured.slug}`} className="group grid bg-ivory md:grid-cols-2 md:items-stretch">
              <ImageReveal className="relative aspect-4/3 min-h-0 overflow-hidden md:aspect-auto md:h-full md:min-h-[18rem]">
                <Photo
                  photo={featured.cover}
                  mode="cover"
                  sizes="(min-width: 48rem) 50vw, 100vw"
                  className="transition-transform duration-1200 ease-wedoura group-hover:scale-104"
                  priority
                />
              </ImageReveal>
              <div className="flex flex-col justify-center px-6 py-8 md:px-12 md:py-10">
                <Label>Latest</Label>
                <p className="mt-3 text-small text-mute">
                  {monthYear.format(new Date(featured.date))} · {featured.category} · {featured.readMinutes} min read
                </p>
                <h2 className="mt-3 font-serif text-h2 leading-snug transition-colors duration-300 ease-wedoura group-hover:text-mute">
                  {featured.title}
                </h2>
                <p className="mt-4 max-w-prose text-mute">{featured.excerpt}</p>
                <p className="label mt-8 text-ink">Read article</p>
              </div>
            </Link>
          </Reveal>
        </Container>
      )}

      <Container className={featured ? "mt-10 md:mt-12" : "mt-10"}>
        <UnderlineTabs
          param="category"
          label="Article categories"
          tabs={categories.map((c) => ({ value: c.toLowerCase(), label: c }))}
          pathname={PATHNAME}
          params={params}
        />
      </Container>

      <Container width="wide" className="mt-10">
        {shown.length === 0 ? (
          <EmptyState
            title="Nothing written here yet."
            text="More articles are on the way. Read everything in the meantime."
            action={{ label: "All articles", href: "/blogs" }}
          />
        ) : (
          <ul className="grid grid-cols-1 gap-2 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
            {gridPosts.map((post, i) => (
              <li key={post.slug}>
                <ArticleCard post={post} delay={(i % 3) * 0.08} />
              </li>
            ))}
          </ul>
        )}
        <LoadMore
          shown={shown.length}
          total={filtered.total}
          moreHref={patchedHref(PATHNAME, params, { show: String(shownCount + PAGE) })}
          noun="articles"
        />
      </Container>
    </main>
  );
}