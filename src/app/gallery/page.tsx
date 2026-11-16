import type { Metadata } from "next";
import { UnderlineTabs } from "@/components/browse/UnderlineTabs";
import { PhotoGrid, type PhotoLink } from "@/components/media/PhotoGrid";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCategories, getGalleryItems } from "@/lib/api";
import { pickParams } from "@/lib/url";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photographs from weddings across India, each linked to the people who made it.",
};

export default async function GalleryPage({ searchParams }: PageProps<"/gallery">) {
  const params = pickParams(await searchParams, ["category"]);
  const [items, categories] = await Promise.all([getGalleryItems(), getCategories()]);
  const usedCategories = new Set(items.map((i) => i.category).filter(Boolean));

  const shown = params.category ? items.filter((i) => i.category === params.category) : items;
  const links: Record<string, PhotoLink> = {};
  for (const item of shown) {
    if (item.vendor) links[item.photo.id] = { href: `/vendors/${item.vendor.slug}`, label: `By ${item.vendor.name}` };
  }

  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <MaskedHeading as="h1" className="font-serif text-h1" lines={[<>The wall.</>]} />
        <p className="mt-4 max-w-prose text-mute">
          Every photograph on Wedoura, whole and uncropped. Tap one to see it full screen and meet the vendor
          behind it.
        </p>
      </Container>
      <Container width="wide" className="mt-10">
        <UnderlineTabs
          param="category"
          label="Photo categories"
          tabs={categories
            .filter((c) => usedCategories.has(c.slug))
            .map((c) => ({ value: c.slug, label: c.shortName }))}
          pathname="/gallery"
          params={params}
        />
        <div className="mt-10">
          {shown.length === 0 ? (
            <EmptyState title="No photographs here yet." action={{ label: "Show everything", href: "/gallery" }} />
          ) : (
            <PhotoGrid photos={shown.map((i) => i.photo)} links={links} />
          )}
        </div>
      </Container>
    </main>
  );
}
