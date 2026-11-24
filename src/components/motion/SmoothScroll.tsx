"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import { cancelFrame, frame } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import "lenis/dist/lenis.css";

/**
 * Smooth scrolling via Lenis, driven by Motion's frame loop so scroll-linked
 * values (Parallax, the navbar) read the same scroll position each frame.
 * Lenis >= 1.3.26 switches itself off under prefers-reduced-motion, and
 * `anchors` keeps in-page links such as /#faq working.
 *
 * `allowNestedScroll` lets overflow panels (forms, drawers, story viewers)
 * take the wheel/trackpad instead of Lenis swallowing them — without it,
 * those panels only move if you drag the scrollbar.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    function update(data: { timestamp: number }) {
      lenisRef.current?.lenis?.raf(data.timestamp);
    }
    frame.update(update, true);
    return () => cancelFrame(update);
  }, []);

  return (
    <ReactLenis
      root
      options={{ autoRaf: false, anchors: true, allowNestedScroll: true }}
      ref={lenisRef}
    >
      {children}
    </ReactLenis>
  );
}
