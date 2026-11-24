"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  /** DOM id for in-page anchors (e.g. media#portfolio). */
  id?: string;
  title: string;
  help: string;
  /** Whether the matching public section currently has content. */
  shownOnProfile: boolean;
  seeOnProfileHref?: string;
  className?: string;
  children: ReactNode;
};

/** Profile / media section shell: title, help, visibility, link to public anchor. */
export function SectionCard({
  id,
  title,
  help,
  shownOnProfile,
  seeOnProfileHref,
  className,
  children,
}: Props) {
  return (
    <section id={id} className={cn("studio-card", className)}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
        <div className="min-w-0 max-w-prose">
          <h2 className="studio-section-title">{title}</h2>
          <p className="mt-2 text-[length:var(--text-dash-help)] text-mute">{help}</p>
          <p className="mt-3 label text-mute">
            {shownOnProfile ? (
              <span className="text-gold-deep">Shown on profile</span>
            ) : (
              <span>Hidden — empty</span>
            )}
          </p>
        </div>
        {seeOnProfileHref ? (
          <a
            href={seeOnProfileHref}
            target="_blank"
            rel="noopener noreferrer"
            className="studio-top-link shrink-0"
          >
            See on profile ↗
          </a>
        ) : null}
      </div>
      {children}
    </section>
  );
}
