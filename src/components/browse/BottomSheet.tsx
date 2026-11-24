"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { EASE } from "@/lib/motion";
import { useFocusTrap } from "@/lib/focus-trap";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

/** A mobile bottom sheet: focus-trapped, Escape closes, body locked. */
export function BottomSheet({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/50" />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            data-lenis-prevent
            className="relative max-h-[85dvh] w-full overflow-y-auto overscroll-contain bg-white px-gutter pt-5 pb-bottombar"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="label text-ink">{title}</p>
              <button type="button" onClick={onClose} className="label tap px-2 text-mute hover:text-ink">
                Done
              </button>
            </div>
            <div className="pb-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
