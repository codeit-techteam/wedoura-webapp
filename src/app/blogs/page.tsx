import type { Metadata } from "next";
import { UnderlineTabs } from "@/components/browse/UnderlineTabs";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { getBlogPosts } from "@/lib/api";
import { pickParams } from "@/lib/url";

export const metadata: Metadata = {
  title: "Blog",
  description: "Planning guides, venue notes and ideas worth saving, from people who work weddings every week.",
};

export default async function BlogsPage({ searchParams }: PageProps<"/blogs">) {
  const params = pickParams(await searchParams, ["category"]);
  const posts = await getBlogPosts();
  const categories = [...new Set(posts.map((p) => p.category))];
  const shown = params.category
    ? posts.filter((p) => p.category.toLowerCase() === params.category.toLowerCase())
    : posts;

  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <MaskedHeading as="h1" className="font-serif text-h1" lines={[<>Worth reading before you book.</>]} />
      </Container>
      <Container width="wide" className="mt-10">
        <UnderlineTabs
          param="category"
          label="Article categories"
          tabs={categories.map((c) => ({ value: c.toLowerCase(), label: c }))}
          pathname="/blogs"
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
      </Container>
    </main>
  );
}
