"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { PARALLAX_PERCENT } from "@/lib/motion";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  /** Height of the window the image shows through. */
  className?: string;
};

/**
 * Motion 3: gentle parallax for cover images and story openers only.
 * The child is scaled up slightly so the edges never show, and it drifts
 * a few percent as the section crosses the viewport. Off under reduced motion.
 */
export function Parallax({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const range = reduce ? 0 : PARALLAX_PERCENT;
  const y = useTransform(scrollYProgress, [0, 1], [`-${range}%`, `${range}%`]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y, scale: reduce ? 1 : 1 + (PARALLAX_PERCENT * 2) / 100 }} className="absolute inset-0 will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
