import Image from "next/image";
import Link from "next/link";

const TILES = [
  { label: "Photographers", slug: "photography-films", img: "image-21.webp" },
  { label: "Videographers", slug: "videographers", img: "image-14.webp" },
  { label: "Planners", slug: "wedding-planners", img: "image-16.webp" },
  { label: "Venues", slug: "venues", img: "image-03.webp" },
  { label: "Makeup and hair", slug: "makeup-beauty", img: "image-17.webp", position: "30% 40%" },
  { label: "Decor and florals", slug: "decor-styling", img: "image-06.webp", position: "50% 70%" },
  { label: "Mehendi artists", slug: "mehendi-artists", img: "image-22.webp", position: "50% 55%" },
  { label: "Wedding attire", slug: "bridal-wear", img: "image-13.webp", position: "50% 30%" },
] as const;

/** Eight category tiles. No counts. */
export function HomeCategories() {
  return (
    <section id="cats" aria-label="Everything for your wedding" className="bg-ivory py-[clamp(5.5rem,12vw,14.375rem)]">
      <div className="mx-auto mb-[clamp(3.75rem,6.5vw,6.25rem)] flex max-w-[90rem] flex-col gap-4 px-[clamp(1.25rem,5vw,5.5rem)] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label text-gold-deep">Everything in one place</p>
          <h2 className="mt-4 font-serif text-[clamp(2.625rem,5vw,4.75rem)] leading-[1.02] text-ink">
            Everything for your <em>wedding</em>
          </h2>
        </div>
        <p className="max-w-[30em] text-[1.25rem] leading-relaxed text-mute">
          Choose what you need. Every vendor is hand-picked, with prices shown up front.
        </p>
      </div>
      <ul className="mx-auto grid max-w-[90rem] grid-cols-1 gap-x-[clamp(1rem,1.8vw,1.75rem)] gap-y-[clamp(3.75rem,6vw,6rem)] px-[clamp(1.25rem,5vw,5.5rem)] sm:grid-cols-2 lg:grid-cols-4">
        {TILES.map((tile) => (
          <li key={tile.slug}>
            <Link href={`/vendors?category=${tile.slug}`} className="group block">
              <div className="relative aspect-4/5 overflow-hidden bg-sand">
                <Image
                  src={`/ref/home/${tile.img}`}
                  alt={tile.label}
                  fill
                  className="object-cover transition-transform duration-1200 ease-wedoura group-hover:scale-104"
                  style={"position" in tile ? { objectPosition: tile.position } : undefined}
                  sizes="(min-width: 80rem) 25vw, (min-width: 40rem) 50vw, 100vw"
                  unoptimized
                />
              </div>
              <h3 className="mt-5 font-serif text-[clamp(1.75rem,2.4vw,2.25rem)] leading-tight text-ink group-hover:text-gold-deep">
                {tile.label}
              </h3>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
