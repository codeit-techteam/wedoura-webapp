"use client";

import { useId, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Text } from "@/components/ui/Text";
import type { Faq } from "@/data/types";

type Props = {
  items: Faq[];
  /** Index opened initially; null for all closed. */
  defaultOpen?: number | null;
};

/**
 * Question-and-answer accordion. Every answer is always in the markup (so it
 * is server-rendered and findable); open and close animate the row height.
 */
export function Accordion({ items, defaultOpen = 0 }: Props) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const uid = useId();

  return (
    <ul className="border-t border-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${uid}-panel-${i}`;
        const buttonId = `${uid}-button-${i}`;
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
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="grid transition-[grid-template-rows,opacity] duration-450 ease-wedoura"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr", opacity: isOpen ? 1 : 0 }}
            >
              <div className="overflow-hidden" {...(isOpen ? {} : { inert: true })}>
                <Text tone="mute" className="max-w-prose pb-6">
                  {item.answer}
                </Text>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
