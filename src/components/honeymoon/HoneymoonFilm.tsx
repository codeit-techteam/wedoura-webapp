"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  poster?: string;
  label: string;
};

/**
 * The landing film band: a muted looping clip that plays while in view
 * (motion pattern 5), with a pause button. Rendered only when a clip exists
 * at public/films/honeymoon.mp4; respects reduced motion.
 */
export function HoneymoonFilm({ src, poster, label }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(true);
  const userPaused = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      userPaused.current = true;
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio >= 0.45 && !userPaused.current) {
            video.play().catch(() => {
              userPaused.current = true;
              setPaused(true);
            });
            setPaused(false);
          } else if (entry.intersectionRatio < 0.45) {
            video.pause();
            setPaused(true);
          }
        }
      },
      { threshold: [0, 0.45, 1] },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPaused.current = false;
      video.play().catch(() => undefined);
      setPaused(false);
    } else {
      userPaused.current = true;
      video.pause();
      setPaused(true);
    }
  }

  return (
    <section className="film" aria-label="Film">
      <video ref={videoRef} muted loop playsInline preload="metadata" src={src} poster={poster} aria-label={label} />
      <button type="button" className="vp" onClick={toggle} aria-label={paused ? "Play video" : "Pause video"}>
        {paused ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 4l13 8-13 8z" fill="#fff" stroke="none" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14M16 5v14" />
          </svg>
        )}
      </button>
    </section>
  );
}
