import { VideoTile } from "@/components/media/VideoTile";

const CLIPS = [
  {
    src: "/ref/home/video-01.mp4",
    poster: "/ref/home/image-24.jpg",
    alt: "Wedding film stills from a coastal ceremony",
  },
  {
    src: "/ref/home/video-02.mp4",
    poster: "/ref/home/image-23.jpg",
    alt: "Wedding film stills from an evening reception",
  },
] as const;

/** Sticky full-viewport film tiles that play as you scroll. */
export function HomeMoments() {
  return (
    <section id="moments" aria-label="Moments worth keeping" className="bg-ivory">
      <div className="mx-auto flex max-w-[90rem] items-end justify-between gap-6 px-[clamp(1.25rem,5vw,5.5rem)] py-[clamp(5.5rem,12vw,14.375rem)] pb-16">
        <div>
          <p className="label text-gold-deep">From weddings on Wedoura</p>
          <h2 className="mt-4 font-serif text-[clamp(2.625rem,5vw,4.75rem)] leading-[1.02] text-ink">
            Moments worth <em>keeping</em>
          </h2>
        </div>
        <p className="hidden max-w-[14em] text-right text-small text-mute md:block">Plays as you scroll · sound off</p>
      </div>
      <div className="flex flex-col">
        {CLIPS.map((clip) => (
          <div key={clip.src} className="sticky top-[var(--nav-h)] h-[calc(100svh-var(--nav-h))] bg-ink">
            <VideoTile
              src={clip.src}
              poster={clip.poster}
              alt={clip.alt}
              className="h-full w-full"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
