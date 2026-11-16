import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { Photo } from "@/components/media/Photo";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { ShareButtons } from "@/components/ui/ShareButtons";
import { Text } from "@/components/ui/Text";
import { getArticle, listArticles } from "@/lib/api";

const longDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" });

export async function generateStaticParams() {
  const { items } = await listArticles();
  return items.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blogs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getArticle(slug);
  if (!post) return { title: "Article" };
  return { title: post.title, description: post.excerpt, openGraph: { images: [post.cover.src] } };
}

export default async function BlogPostPage({ params }: PageProps<"/blogs/[slug]">) {
  const { slug } = await params;
  const post = await getArticle(slug);
  if (!post) notFound();
  const related = (await listArticles()).items.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <div className="mx-auto max-w-prose">
          <Breadcrumb items={[{ label: "Blog", href: "/blogs" }, { label: post.category }]} />
          <MaskedHeading as="h1" className="mt-5 font-serif text-h1" lines={[post.title]} />
          <p className="mt-4 text-small text-mute">
            {longDate.format(new Date(post.date))} · {post.category} · {post.readMinutes} min read
          </p>
        </div>
      </Container>

      <Container width="wide" className="mt-10">
        <ImageReveal>
          <Photo photo={post.cover} sizes="(min-width: 100rem) 1600px, 100vw" priority quality={75} />
        </ImageReveal>
      </Container>

      <Container className="mt-12">
        <div className="mx-auto max-w-prose">
          <Text variant="lead">{post.excerpt}</Text>
          {post.body.map((block, i) => (
            <section key={i} className="mt-10">
              {block.heading && <h2 className="font-serif text-h2">{block.heading}</h2>}
              {block.paragraphs.map((paragraph) => (
                <Text key={paragraph.slice(0, 24)} tone="mute" className="mt-5">
                  {paragraph}
                </Text>
              ))}
            </section>
          ))}
        </div>
      </Container>

      {post.body.some((b) => b.photo) && (
        <Container width="wide" className="mt-12">
          <div className="grid gap-2 md:grid-cols-2">
            {post.body
              .filter((b) => b.photo)
              .map((block, i) => (
                <ImageReveal key={i} delay={i * 0.08}>
                  <Photo photo={block.photo!} sizes="(min-width: 48rem) 50vw, 100vw" />
                </ImageReveal>
              ))}
          </div>
        </Container>
      )}

      <Container className="mt-12">
        <div className="mx-auto flex max-w-prose items-center justify-between gap-6 border-t border-line pt-6">
          <p className="text-small text-mute">Found it useful? Pass it on.</p>
          <ShareButtons title={post.title} path={`/blogs/${post.slug}`} />
        </div>
      </Container>

      {related.length > 0 && (
        <Container width="wide" className="mt-16">
          <MaskedHeading as="h2" className="font-serif text-h2" lines={[<>Keep reading</>]} />
          <ul className="mt-8 grid grid-cols-1 gap-2 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
            {related.map((p, i) => (
              <li key={p.slug}>
                <ArticleCard post={p} delay={i * 0.08} />
              </li>
            ))}
          </ul>
        </Container>
      )}
    </main>
  );
}
