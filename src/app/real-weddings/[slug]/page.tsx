import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Placeholder } from "@/components/chrome/Placeholder";
import { getRealWedding, getRealWeddings } from "@/lib/api";

export async function generateStaticParams() {
  const weddings = await getRealWeddings();
  return weddings.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: PageProps<"/real-weddings/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const wedding = await getRealWedding(slug);
  return wedding ? { title: wedding.title, description: wedding.excerpt } : { title: "Real wedding" };
}

export default async function RealWeddingPage({ params }: PageProps<"/real-weddings/[slug]">) {
  const { slug } = await params;
  const wedding = await getRealWedding(slug);
  if (!wedding) notFound();
  return <Placeholder eyebrow="Real wedding" title={wedding.title} step={6} />;
}
