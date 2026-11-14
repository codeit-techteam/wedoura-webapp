"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { page } from "@/lib/motion";

// Used by src/app/template.tsx so every route change fades and rises in.
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={page.initial} animate={page.animate} transition={page.transition}>
      {children}
    </motion.div>
  );
}
