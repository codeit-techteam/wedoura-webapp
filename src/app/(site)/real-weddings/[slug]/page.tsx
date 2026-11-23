import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { RealWeddingStory } from "@/components/stories/RealWeddingStory";
import { getWedding, listAllCities, listWeddings } from "@/lib/api";
import { weddingSchema } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";

export async function generateStaticParams() {
  const { items } = await listWeddings({ limit: 10000 });
  return items.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: PageProps<"/real-weddings/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const wedding = await getWedding(slug);
  if (!wedding) return { title: "Real wedding" };
  return pageMeta({
    title: wedding.title,
    description: wedding.excerpt,
    path: `/real-weddings/${wedding.slug}`,
    image: wedding.cover.src,
  });
}

export default async function RealWeddingPage({ params }: PageProps<"/real-weddings/[slug]">) {
  const { slug } = await params;
  const wedding = await getWedding(slug);
  if (!wedding) notFound();

  const cities = await listAllCities();
  const cityName = cities.find((c) => c.slug === wedding.city)?.name ?? wedding.city;

  return (
    <>
      <JsonLd schema={weddingSchema(wedding)} />
      <RealWeddingStory wedding={wedding} cityName={cityName} />
    </>
  );
}
