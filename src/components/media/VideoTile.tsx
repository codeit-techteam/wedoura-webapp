"use client";

import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  src?: string;
  poster: string;
  alt: string;
  title?: string;
  className?: string;
};

/**
 * A film tile that plays muted while most of it is on screen, with a pause
 * button. Reduced motion and a missing clip leave the poster still.
 */
export function VideoTile({ src, poster, alt, title, className }: Props) {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref, { amount: 0.6 });
  const [paused, setPaused] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduce(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    if (inView && !reduce && !paused) {
      video.play().catch(() => {
        /* autoplay blocked: the poster stays */
      });
    } else {
      video.pause();
    }
  }, [inView, reduce, paused, src]);

  return (
    <figure ref={ref} className={cn("relative overflow-hidden bg-ink", className)}>
      {src && !reduce ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          playsInline
          loop
          className="h-full w-full object-cover"
          aria-label={alt}
        />
      ) : (
        // Poster only: the clip is absent, or motion is reduced.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt={alt} className="h-full w-full object-cover" />
      )}
      {title ? (
        <figcaption className="absolute bottom-6 left-6 font-serif text-h3 text-white">{title}</figcaption>
      ) : null}
      {src ? (
        <button
          type="button"
          aria-label={paused ? "Play video" : "Pause video"}
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
          className="absolute right-6 bottom-6 flex size-12 items-center justify-center rounded-full border border-white/60 bg-ink/35 text-white backdrop-blur-sm hover:bg-ink/55"
        >
          {paused ? (
            <svg viewBox="0 0 24 24" className="size-4 fill-white" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-white" aria-hidden="true">
              <path d="M8 5v14M16 5v14" strokeWidth="2" />
            </svg>
          )}
        </button>
      ) : null}
    </figure>
  );
}
