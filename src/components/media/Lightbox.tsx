"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type LightboxSlide = {
  src: string;
  alt: string;
};

type Props = {
  slides: LightboxSlide[];
  /** Open slide, or null when the viewer is closed. */
  index: number | null;
  onClose: () => void;
  onIndex: (index: number) => void;
};

/**
 * Full-screen photo viewer from the client's pages: close, previous, next,
 * arrow keys and a horizontal swipe. Photographs are shown whole.
 */
export function Lightbox({ slides, index, onClose, onIndex }: Props) {
  const open = index !== null && slides[index] !== undefined;
  const closeRef = useRef<HTMLButtonElement>(null);
  const startX = useRef<number | null>(null);
  const [offset, setOffset] = useState(0);

  const step = useCallback(
    (delta: number) => {
      if (index === null || slides.length === 0) return;
      onIndex((index + delta + slides.length) % slides.length);
    },
    [index, onIndex, slides.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose, step]);

  if (!open || index === null) return null;
  const slide = slides[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="fixed inset-0 z-50 flex flex-col bg-ink/97 text-ivory"
      onPointerDown={(event) => {
        startX.current = event.clientX;
      }}
      onPointerUp={(event) => {
        if (startX.current === null) return;
        const delta = event.clientX - startX.current;
        startX.current = null;
        setOffset(0);
        if (delta > 48) step(-1);
        else if (delta < -48) step(1);
      }}
      onPointerMove={(event) => {
        if (startX.current === null) return;
        setOffset(event.clientX - startX.current);
      }}
    >
      <div className="flex items-center justify-between px-[2vw] py-2.5 font-sans text-button font-medium tracking-[0.26em] text-mist uppercase">
        <span>
          {index + 1} / {slides.length}
        </span>
        <button ref={closeRef} type="button" onClick={onClose} className="min-h-12 min-w-12 hover:text-gold">
          Close ✕
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center pb-5">
        <button
          type="button"
          aria-label="Previous photo"
          onClick={() => step(-1)}
          className="absolute top-1/2 left-[1vw] -translate-y-1/2 font-serif text-[3.5rem] leading-none text-ivory hover:text-gold"
        >
          ‹
        </button>
        {/* The slide is a reference or content URL with an unknown intrinsic size, so it is not next/image. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.src}
          alt={slide.alt}
          className={cn("max-h-full max-w-[calc(100vw-8.75rem)] bg-transparent object-contain transition-transform")}
          style={{ transform: offset ? `translateX(${offset}px)` : undefined }}
        />
        <button
          type="button"
          aria-label="Next photo"
          onClick={() => step(1)}
          className="absolute top-1/2 right-[1vw] -translate-y-1/2 font-serif text-[3.5rem] leading-none text-ivory hover:text-gold"
        >
          ›
        </button>
      </div>
    </div>
  );
}
