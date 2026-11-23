import type { Metadata } from "next";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { Photo } from "@/components/media/Photo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getPhoto } from "@/lib/api";

export const metadata: Metadata = { title: "Page not found" };

/** Root 404. It sits outside the (site) group, so it brings the site
 *  chrome itself to look like every other public page. */
export default async function NotFound() {
  const photo = await getPhoto("p18");
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col">{notFoundHero(photo)}</div>
        <SiteFooter />
      </div>
    </>
  );
}

function notFoundHero(photo: Awaited<ReturnType<typeof getPhoto>>) {
  return (
    <main className="relative -mt-nav flex min-h-dvh flex-col justify-end bg-ink pb-bottombar text-white" data-nav-dark>
      {photo && <Photo photo={photo} sizes="100vw" mode="cover" priority objectPosition="50% 40%" />}
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/30 to-transparent" />
      <Container className="relative pb-16 md:pb-24">
        <p className="label text-white/80">Page not found</p>
        <h1 className="mt-3.5 max-w-2xl font-serif text-h1 text-balance">
          This page has <em>wandered off</em>.
        </h1>
        <p className="mt-4 max-w-md text-body text-white/85">
          The link may be old, or the page is still being built. Everything that exists is a step away.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button href="/" tone="white">
            Back to the homepage
          </Button>
          <Button href="/vendors" variant="outline" tone="white">
            Browse vendors
          </Button>
        </div>
      </Container>
    </main>
  );
}
