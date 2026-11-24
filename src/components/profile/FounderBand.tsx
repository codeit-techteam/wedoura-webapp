"use client";

import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/media/Photo";
import { Label } from "@/components/ui/Label";
import type { FounderProfile } from "@/data/types";

type Props = {
  founder: FounderProfile;
  vendorName: string;
};

/**
 * About the founder: full-bleed film or poster, caption band below on ivory
 * (reference `.founder` + `.slcap`), optional about paragraphs. Muted looping
 * preview when `previewSrc` exists; YouTube opens in a new tab.
 */
export function FounderBand({ founder, vendorName }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const [soundOn, setSoundOn] = useState(false);
  const hasPreview = Boolean(founder.previewSrc);

  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    if (!root || !video || !hasPreview) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      video.pause();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => undefined);
        else video.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [hasPreview]);

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    const next = !soundOn;
    video.muted = !next;
    setSoundOn(next);
  }

  return (
    <section ref={rootRef} id="founder" aria-label="About the founder" className="scroll-profile-anchor bg-ivory">
      <div className="relative aspect-video max-h-[min(70svh,40rem)] w-full overflow-hidden bg-ink md:aspect-[2.2/1]">
        {hasPreview ? (
          <video
            ref={videoRef}
            src={founder.previewSrc}
            poster={founder.poster.src}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={`A short hello from the founder of ${vendorName}`}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <Photo photo={founder.poster} mode="cover" sizes="100vw" quality={75} objectPosition="50% 30%" />
        )}
        {hasPreview ? (
          <button
            type="button"
            onClick={toggleSound}
            className="label tap absolute right-4 bottom-4 border border-white/50 bg-ink/40 px-4 py-2 text-white backdrop-blur-sm md:right-8 md:bottom-8"
          >
            {soundOn ? "Sound off" : "Sound on"}
          </button>
        ) : null}
        {founder.youtubeUrl ? (
          <a
            href={founder.youtubeUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Watch ${vendorName} founder introduction on YouTube`}
            className="tap absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-ink/25 text-white backdrop-blur-sm transition-chrome hover:bg-white hover:text-ink"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </a>
        ) : null}
      </div>

      <div className="container-site flex flex-wrap items-baseline gap-x-4 gap-y-2 py-5 md:py-6">
        <Label className="text-gold-deep">About the founder</Label>
        <p className="font-serif text-[1.1875rem] text-ink md:text-[1.375rem]">{founder.caption}</p>
        {founder.name ? <span className="text-small text-mute">{founder.name}</span> : null}
      </div>

      {founder.about && founder.about.length > 0 ? (
        <div className="container-site max-w-3xl pb-section-sm">
          <div className="flex flex-col gap-4">
            {founder.about.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="font-serif text-[1.1875rem] leading-relaxed text-mute">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
