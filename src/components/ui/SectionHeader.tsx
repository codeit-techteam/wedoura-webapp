import Link from "next/link";
import type { ReactNode } from "react";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/cn";

type Props = {
  label: string;
  title: ReactNode;
  lede?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
};

/** The section head used across the client's pages: gold label, serif title, optional link. */
export function SectionHeader({ label, title, lede, href, linkLabel = "See all", className }: Props) {
  return (
    <div className={cn("mb-11 flex flex-wrap items-end justify-between gap-6 xl:mb-16", className)}>
      <div>
        <Label>{label}</Label>
        <h2 className="mt-3.5 font-serif text-[clamp(2.625rem,5vw,4.75rem)] leading-[1.02] text-ink">{title}</h2>
        {lede ? <p className="mt-4 max-w-[30em] text-[1.25rem] leading-snug text-mute">{lede}</p> : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="font-sans text-button font-medium tracking-[0.26em] text-ink uppercase border-b border-gold pb-1 hover:text-gold-deep"
        >
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}
