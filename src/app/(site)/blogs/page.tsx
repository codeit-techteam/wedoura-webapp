import type { Metadata } from "next";
import { LoadMore } from "@/components/browse/LoadMore";
import { UnderlineTabs } from "@/components/browse/UnderlineTabs";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { listArticleCategories, listArticles } from "@/lib/api";
import { patchedHref, pickParams } from "@/lib/url";
import { absoluteUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Blog",
  description: "Planning guides, venue notes and ideas worth saving, from people who work weddings every week.",
  alternates: { canonical: absoluteUrl("/blogs") },
};

const PAGE = 9;
const PATHNAME = "/blogs";

export default async function BlogsPage({ searchParams }: PageProps<"/blogs">) {
  const params = pickParams(await searchParams, ["category", "show"]);
  const shownCount = Math.max(PAGE, Number.parseInt(params.show ?? "", 10) || PAGE);
  const [categories, filtered] = await Promise.all([
    listArticleCategories(),
    listArticles({ category: params.category || undefined, page: 1, limit: shownCount }),
  ]);
  const shown = filtered.items;

  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <MaskedHeading as="h1" className="font-serif text-h1" lines={["Worth reading before you book."]} />
      </Container>
      <Container width="wide" className="mt-10">
        <UnderlineTabs
          param="category"
          label="Article categories"
          tabs={categories.map((c) => ({ value: c.toLowerCase(), label: c }))}
          pathname={PATHNAME}
          params={params}
        />
        <div className="mt-10">
          {shown.length === 0 ? (
            <EmptyState
              title="Nothing written here yet."
              text="More articles are on the way. Read everything in the meantime."
              action={{ label: "All articles", href: "/blogs" }}
            />
          ) : (
            <ul className="grid grid-cols-1 gap-2 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((post, i) => (
                <li key={post.slug}>
                  <ArticleCard post={post} delay={(i % 3) * 0.08} />
                </li>
              ))}
            </ul>
          )}
        </div>
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
