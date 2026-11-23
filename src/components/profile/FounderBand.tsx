import { Photo } from "@/components/media/Photo";
import { Label } from "@/components/ui/Label";
import type { FounderProfile } from "@/data/types";

type Props = {
  founder: FounderProfile;
  vendorName: string;
};

/**
 * Founder strip: a full-bleed poster photograph with a caption. When a
 * YouTube URL is present, an overlaid play button opens it in a new tab
 * (no autoplay, no inline embed here — the full film player handles that).
 */
export function FounderBand({ founder, vendorName }: Props) {
  return (
    <section
      id="founder"
      aria-label="About the founder"
      className="scroll-profile-anchor relative h-[min(60svh,32.5rem)] overflow-hidden bg-ink"
    >
      <Photo
        photo={founder.poster}
        mode="cover"
        sizes="100vw"
        quality={75}
        objectPosition="50% 30%"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/20 to-transparent" />

      {founder.youtubeUrl && (
        <a
          href={founder.youtubeUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Watch ${vendorName} founder introduction on YouTube`}
          className="tap absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex size-16 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-chrome hover:bg-white/30"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </a>
      )}

      <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
        <Label className="text-white/60">About the founder</Label>
        <p className="mt-2 font-serif text-h3 text-white leading-snug">{founder.caption}</p>
      </div>
    </section>
  );
}
