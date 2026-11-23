import type { Metadata } from "next";
import { LoadMore } from "@/components/browse/LoadMore";
import { UnderlineTabs } from "@/components/browse/UnderlineTabs";
import { PhotoGrid, type PhotoLink } from "@/components/media/PhotoGrid";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { listCategoriesWithCounts, listGalleryPhotos } from "@/lib/api";
import { patchedHref, pickParams } from "@/lib/url";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Gallery",
  description: "Photographs from weddings across India, each linked to the people who made it.",
  path: "/gallery",
});

const PAGE = 60;
const PATHNAME = "/gallery";

export default async function GalleryPage({ searchParams }: PageProps<"/gallery">) {
  const params = pickParams(await searchParams, ["category", "show"]);
  const shownCount = Math.max(PAGE, Number.parseInt(params.show ?? "", 10) || PAGE);
  // The category filter runs inside the api, before paging, so no photo is
  // ever lost behind the page boundary.
  const [gallery, categories] = await Promise.all([
    listGalleryPhotos(1, shownCount, params.category || undefined),
    listCategoriesWithCounts(),
  ]);
  const shown = gallery.items;
  const links: Record<string, PhotoLink> = {};
  for (const item of shown) {
    if (item.vendor) links[item.photo.id] = { href: `/vendors/${item.vendor.slug}`, label: `By ${item.vendor.name}` };
  }

  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <MaskedHeading as="h1" className="font-serif text-h1" lines={["The wall."]} />
        <p className="mt-4 max-w-prose text-mute">
          Every photograph on Wedoura, whole and uncropped. Tap one to see it full screen and meet the vendor
          behind it.
        </p>
      </Container>
      <Container width="wide" className="mt-10">
        <UnderlineTabs
          param="category"
          label="Photo categories"
          // Every counted category has at least one published vendor, and
          // every published vendor has card photos, so each tab has photos.
          tabs={categories.map((c) => ({ value: c.slug, label: c.shortName }))}
          pathname={PATHNAME}
          params={params}
        />
        <div className="mt-10">
          {shown.length === 0 ? (
            <EmptyState title="No photographs here yet." action={{ label: "Show everything", href: PATHNAME }} />
          ) : (
            <PhotoGrid photos={shown.map((i) => i.photo)} links={links} />
          )}
        </div>
        <LoadMore
          shown={shown.length}
          total={gallery.total}
          moreHref={patchedHref(PATHNAME, params, { show: String(shownCount + PAGE) })}
          noun="photographs"
        />
      </Container>
    </main>
  );
}
