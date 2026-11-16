"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export type SubnavSection = { id: string; label: string };

type Props = { sections: SubnavSection[] };

/**
 * The profile's section navigation: sticky under the navbar, highlighting
 * the section currently in view while scrolling.
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
        // Highest visible section in document order wins.
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

    // Near the top of the page no section sits in the observer band yet;
    // fall back to the first section so the highlight never lags behind.
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
    <nav
      aria-label="Profile sections"
      className="sticky top-0 z-30 border-b border-line bg-white md:top-nav"
    >
      <ul className="no-scrollbar container-site flex gap-6 overflow-x-auto md:gap-8">
        {sections.map((section) => (
          <li key={section.id} className="shrink-0">
            <a
              href={`#${section.id}`}
              aria-current={active === section.id ? "true" : undefined}
              className={cn(
                "tap relative flex items-center pt-3 pb-3 text-label-lg whitespace-nowrap transition-colors duration-300 ease-wedoura",
                active === section.id ? "font-medium text-ink" : "text-mute hover:text-ink",
              )}
            >
              {section.label}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-0 bottom-0 h-0.5 origin-left bg-ink transition-transform duration-300 ease-wedoura",
                  active === section.id ? "scale-x-100" : "scale-x-0",
                )}
              />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
