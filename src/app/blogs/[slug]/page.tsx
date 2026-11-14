import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Placeholder } from "@/components/chrome/Placeholder";
import { getBlogPost, getBlogPosts } from "@/lib/api";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blogs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  return post ? { title: post.title, description: post.excerpt } : { title: "Article" };
}

export default async function BlogPostPage({ params }: PageProps<"/blogs/[slug]">) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();
  return <Placeholder eyebrow={post.category} title={post.title} step={7} />;
}
