"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { EASE } from "@/lib/motion";

type Props = {
  /**
   * One entry per visual line; each reveals from behind its own mask.
   * String lines are fine; JSX elements in the array must carry a key.
   */
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
        // The space keeps the text content and accessible name readable
        // ("Why couples choose", not "Why coupleschoose"); between block
        // spans it never renders visually.
        <Fragment key={`masked-line-${i}`}>
          {i > 0 && " "}
          {/* pb/mb give Instrument Serif descenders (g, y, p) room inside the
              clip without loosening the visual line spacing. Font descent is
              ~0.3em; the line box alone leaves only a few px below the baseline. */}
          <span className="block overflow-hidden pb-[0.3em] -mb-[0.3em]">
            <motion.span className="block will-change-transform" variants={lineVariants}>
              {line}
            </motion.span>
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}
