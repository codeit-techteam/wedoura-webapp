"use client";

import { useLenis } from "lenis/react";
import { useEffect } from "react";

/**
 * Locks document scroll while an overlay is open. Sets body overflow and
 * stops Lenis so wheel/trackpad reach nested `overflow-y-auto` panels
 * (forms, drawers, story viewers) instead of being eaten by smooth scroll.
 */
export function usePageScrollLock(locked: boolean) {
  const lenis = useLenis();

  useEffect(() => {
    if (!locked) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      document.body.style.overflow = previous;
      lenis?.start();
    };
  }, [locked, lenis]);
}
