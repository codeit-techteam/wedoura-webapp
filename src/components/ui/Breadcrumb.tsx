import Link from "next/link";
import { Fragment } from "react";
import { cn } from "@/lib/cn";

type Crumb = { label: string; href?: string };

/** A quiet breadcrumb trail; the last crumb is the current page. */
export function Breadcrumb({ items, tone = "ink", className }: { items: Crumb[]; tone?: "ink" | "white"; className?: string }) {
  const muted = tone === "white" ? "text-white/70" : "text-mute";
  const strong = tone === "white" ? "text-white" : "text-ink";
  return (
    <nav aria-label="Breadcrumb" className={cn("text-small", muted, className)}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={`${item.label}-${i}`}>
              {i > 0 && <span aria-hidden="true">/</span>}
              <li>
                {item.href && !last ? (
                  <Link href={item.href} className={cn("link-draw", muted)}>
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={last ? "page" : undefined} className={last ? strong : undefined}>
                    {item.label}
                  </span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
