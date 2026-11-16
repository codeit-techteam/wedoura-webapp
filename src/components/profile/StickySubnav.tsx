"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";

export type SubnavSection = { id: string; label: string };

type Props = { sections: SubnavSection[] };

/**
 * Profile section links in a bordered strap. Scrollspy highlights the section
 * in view; the bar stays in normal document flow (not sticky).
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
    <Container className="pb-6 md:pb-8">
      <nav aria-label="Profile sections" className="border border-line bg-white">
        <ul className="no-scrollbar flex divide-x divide-line overflow-x-auto">
          {sections.map((section) => (
            <li key={section.id} className="min-w-[max-content] flex-1 shrink-0">
              <a
                href={`#${section.id}`}
                aria-current={active === section.id ? "true" : undefined}
                className={cn(
                  "tap flex items-center justify-center px-4 py-3.5 text-label-lg whitespace-nowrap transition-chrome md:px-5 md:py-4",
                  active === section.id
                    ? "bg-ivory font-medium text-ink"
                    : "text-mute hover:bg-ivory hover:text-ink",
                )}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </Container>
  );
}