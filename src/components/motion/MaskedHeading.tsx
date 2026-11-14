"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { EASE } from "@/lib/motion";

type Props = {
  /** One entry per visual line; each reveals from behind its own mask. */
  lines: ReactNode[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  /** Extra delay before the first line, in seconds. */
  delay?: number;
};

const lineVariants: Variants = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: { duration: 0.8, ease: EASE } },
};

const tags = { h1: motion.h1, h2: motion.h2, h3: motion.h3, p: motion.p } as const;

/**
 * Headline lines rising from behind a mask, one after another. The viewport
 * trigger sits on the heading itself: the clipped lines can never intersect
 * the viewport on their own, so they only carry variants.
 */
export function MaskedHeading({ lines, as = "h2", className, delay = 0 }: Props) {
  const reduce = useReducedMotion();
  const Tag = tags[as];
  return (
    <Tag
      className={cn("text-balance", className)}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: delay } } }}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span className="block will-change-transform" variants={lineVariants}>
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
