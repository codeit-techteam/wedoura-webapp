"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { reveal } from "@/lib/motion";

type Props = {
  children: ReactNode;
  /** Seconds. Use small steps (0.08) for a row of cards. */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "figure";
};

/** Motion 1: fade and rise about 24px over 0.9s when entering view, once. */
export function Reveal({ children, delay = 0, className, as = "div" }: Props) {
  const Tag = motion[as];
  return (
    <Tag
      initial={reveal.initial}
      whileInView={reveal.whileInView}
      viewport={reveal.viewport}
      transition={{ ...reveal.transition, delay }}
      className={className}
    >
      {children}
    </Tag>
  );
}
