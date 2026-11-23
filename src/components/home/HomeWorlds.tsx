import Image from "next/image";
import Link from "next/link";

const WORLDS = [
  {
    cap: "Plan",
    title: "Wedding vendors",
    body: "Photographers, planners, venues and more.",
    href: "/vendors",
    cta: "Explore",
    img: "image-16.webp",
  },
  {
    cap: "Meet",
    title: "Soulmates",
    body: "Thoughtful matrimony discovery, made for families.",
    href: "/soulmates",
    cta: "Discover",
    img: "image-20.webp",
  },
  {
    cap: "Escape",
    title: "Honeymoon",
    body: "Quiet escapes, planned by people who care.",
    href: "/honeymoon",
    cta: "Plan yours",
    img: "image-04.webp",
    position: "50% 60%",
  },
] as const;

export function HomeWorlds() {
  return (
    <section id="worlds" aria-label="Your whole journey" className="bg-ivory py-[clamp(5.5rem,12vw,14.375rem)]">
      <div className="mx-auto mb-[clamp(3.75rem,6.5vw,6.25rem)] max-w-[90rem] px-[clamp(1.25rem,5vw,5.5rem)]">
        <p className="label text-gold-deep">One home for the whole journey</p>
        <h2 className="mt-4 max-w-[14em] font-serif text-[clamp(2.625rem,5vw,4.75rem)] leading-[1.02] text-ink">
          Your whole <em>journey</em>, in one place
        </h2>
      </div>
      <ul className="mx-auto grid max-w-[90rem] gap-8 px-[clamp(1.25rem,5vw,5.5rem)] md:grid-cols-3 md:gap-[clamp(1rem,1.8vw,1.75rem)]">
        {WORLDS.map((world) => (
          <li key={world.href}>
            <Link href={world.href} className="group block">
              <div className="relative aspect-3/4.2 overflow-hidden bg-sand">
                <Image
                  src={`/ref/home/${world.img}`}
                  alt={world.title}
                  fill
                  className="object-cover transition-transform duration-1200 ease-wedoura group-hover:scale-104"
                  style={"position" in world ? { objectPosition: world.position } : undefined}
                  sizes="(min-width: 48rem) 33vw, 100vw"
                  unoptimized
                />
              </div>
              <p className="mt-5 label text-gold-deep">{world.cap}</p>
              <h3 className="mt-2 font-serif text-[clamp(2.125rem,3vw,2.875rem)] leading-tight text-ink">
                {world.title}
              </h3>
              <p className="mt-2 text-[1.125rem] text-mute">{world.body}</p>
              <span className="mt-4 inline-block border-b border-gold pb-0.5 font-sans text-button font-medium tracking-button text-ink uppercase group-hover:text-gold-deep">
                {world.cta}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
