"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";
import type { Faq } from "@/data/types";
import { EASE } from "@/lib/motion";

type Props = { items: Faq[] };

/** The site FAQ as an accordion with smooth open and close. */
export function FaqAccordion({ items }: Props) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul className="border-t border-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `faq-panel-${i}`;
        const buttonId = `faq-button-${i}`;
        return (
          <li key={item.question} className="border-b border-line">
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="tap flex w-full items-center justify-between gap-6 py-5 text-left outline-offset-4"
              >
                <span className="font-serif text-h3 leading-snug">{item.question}</span>
                <Icon
                  name="chevron-down"
                  size={18}
                  className={`shrink-0 text-gold transition-transform duration-300 ease-wedoura ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="overflow-hidden"
                >
                  <Text tone="mute" className="max-w-prose pb-6">
                    {item.answer}
                  </Text>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
