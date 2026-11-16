import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { Photo } from "@/components/media/Photo";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Parallax } from "@/components/motion/Parallax";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Hairline } from "@/components/ui/Hairline";
import { Heading } from "@/components/ui/Heading";
import { Label } from "@/components/ui/Label";
import { ShareButtons } from "@/components/ui/ShareButtons";
import { Text } from "@/components/ui/Text";
import type { Photo as PhotoData } from "@/data/types";
import { cn } from "@/lib/cn";
import { getArticle, listArticles } from "@/lib/api";

const longDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" });

function articleFigureWidth(photo: PhotoData) {
  const ratio = photo.width / photo.height;
  if (ratio < 0.85) return "max-w-sm";
  if (ratio < 1.15) return "max-w-xl";
  return "max-w-3xl";
}

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

  const meta = (
    <>
      {longDate.format(new Date(post.date))} · {post.readMinutes} min read
    </>
  );

  return (
    <main className="pb-section-sm">
      <section
        data-nav-dark
        className="relative -mt-nav flex min-h-[min(62vh,36rem)] flex-col justify-end bg-ink text-white"
      >
        <div className="absolute inset-0">
          <Parallax className="h-full min-h-[min(62vh,36rem)]">
            <Photo photo={post.cover} sizes="100vw" mode="cover" priority quality={75} objectPosition="50% 30%" />
          </Parallax>
          <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink via-ink/55 to-ink/40" />
        </div>
        <Container className="relative z-10 pb-10 pt-28 md:pb-14 md:pt-36">
          <Breadcrumb tone="white" items={[{ label: "Blog", href: "/blogs" }, { label: post.category }]} />
          <MaskedHeading as="h1" className="mt-5 max-w-2xl font-serif text-h1 md:max-w-3xl" lines={[post.title]} />
          <p className="mt-4 text-body text-white/90">{meta}</p>
        </Container>
      </section>

      <div className="relative z-10 border-t border-line bg-white">
        <Container className="py-10 md:py-14">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p className="max-w-article font-serif text-lead leading-snug text-balance">{post.excerpt}</p>
            <ShareButtons title={post.title} path={`/blogs/${post.slug}`} social={false} />
          </div>
        </Container>
      </div>

      <article aria-label="Article">
        {post.body.map((block, i) => (
          <section
            key={`${block.heading ?? "block"}-${i}`}
            className={cn("bg-white", i < post.body.length - 1 ? "pb-10 md:pb-14" : "pb-6")}
          >
            <Container>
              <div className="mx-auto w-full max-w-article">
                {block.heading ? (
                  <header className="border-b border-line pb-6 md:pb-8">
                    <Label>{String(i + 1).padStart(2, "0")}</Label>
                    <Heading level={2} size="h2" className="mt-3 text-balance">
                      {block.heading}
                    </Heading>
                  </header>
                ) : null}
                {block.paragraphs.length > 0 && (
                  <div className={cn("flex flex-col gap-5", block.heading && "mt-8 md:mt-10")}>
                    {block.paragraphs.map((paragraph) => (
                      <Text key={paragraph.slice(0, 32)} tone="mute">
                        {paragraph}
                      </Text>
                    ))}
                  </div>
                )}
              </div>
            </Container>

            {block.photo && (
              <Container className="mt-8 md:mt-10">
                <figure className={cn("mx-auto w-full", articleFigureWidth(block.photo))}>
                  <ImageReveal delay={i * 0.06}>
                    <Photo photo={block.photo} sizes="(min-width: 56rem) 42rem, 92vw" />
                  </ImageReveal>
                  <figcaption className="mt-3 text-small text-mute">{block.photo.alt}</figcaption>
                </figure>
              </Container>
            )}

            {i < post.body.length - 1 && (
              <Container className="mt-10 md:mt-12">
                <Hairline />
              </Container>
            )}
          </section>
        ))}
      </article>

      <Container className="mt-6 bg-white">
        <div className="mx-auto flex w-full max-w-article flex-col gap-6 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-small text-mute">Found it useful? Pass it on.</p>
          <ShareButtons title={post.title} path={`/blogs/${post.slug}`} social={false} />
        </div>
      </Container>

      {related.length > 0 && (
        <section aria-label="Keep reading" className="mt-16 bg-ivory py-section-sm md:mt-20">
          <Container width="wide">
            <MaskedHeading as="h2" className="font-serif text-h2" lines={["Keep reading"]} />
            <ul className="mt-10 grid grid-cols-1 gap-2 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
              {related.map((p, i) => (
                <li key={p.slug}>
                  <ArticleCard post={p} delay={i * 0.08} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </main>
  );
}