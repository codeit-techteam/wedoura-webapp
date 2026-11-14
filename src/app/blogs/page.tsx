import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogBrowser } from "@/components/browse/BlogBrowser";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Container } from "@/components/ui/Container";
import { getBlogPosts } from "@/lib/api";

export const metadata: Metadata = {
  title: "Blog",
  description: "Planning guides, venue notes and ideas worth saving, from people who work weddings every week.",
};

export default async function BlogsPage() {
  const posts = await getBlogPosts();
  const categories = [...new Set(posts.map((p) => p.category))];

  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <MaskedHeading as="h1" className="font-serif text-h1" lines={[<>Worth reading before you book.</>]} />
      </Container>
      <Container width="wide" className="mt-10">
        <Suspense fallback={null}>
          <BlogBrowser posts={posts} categories={categories} />
        </Suspense>
      </Container>
    </main>
  );
}
