"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";

export type SubnavSection = { id: string; label: string };

type Props = { sections: SubnavSection[] };

/**
 * Profile section links in a hairline strap under the key facts (scrolls with
 * the page). Scrollspy underlines the section in view. One line; narrow
 * screens scroll sideways without a visible scrollbar.
 */
export function StickySubnav({ sections }: Props) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const targets = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio);
          else visible.delete(entry.target.id);
        }
        for (const section of sections) {
          if (visible.has(section.id)) {
            setActive(section.id);
            return;
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.1, 0.5] },
    );
    targets.forEach((t) => observer.observe(t));

    const onScroll = () => {
      if (window.scrollY < window.innerHeight * 0.4) setActive(sections[0]?.id ?? "");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [sections]);

  return (
    <nav aria-label="Profile sections" className="relative border-b border-line bg-white">
      <Container>
        <ul className="no-scrollbar flex w-full flex-nowrap items-end justify-between gap-6 overflow-x-auto md:gap-8">
          {sections.map((section) => (
            <li key={section.id} className="shrink-0">
              <a
                href={`#${section.id}`}
                aria-current={active === section.id ? "true" : undefined}
                className={cn(
                  "label tap inline-flex items-center justify-center whitespace-nowrap border-b-2 pt-4 pb-3.5 transition-chrome",
                  active === section.id
                    ? "border-gold text-ink"
                    : "border-transparent text-mute hover:border-line hover:text-ink",
                )}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </nav>
  );
}
