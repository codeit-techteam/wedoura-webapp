"use client";

import { Icon } from "@/components/ui/Icon";
import { SaveButton } from "@/components/ui/SaveButton";
import { cn } from "@/lib/cn";

type Props = {
  slug: string;
  name: string;
  startingPrice?: string;
  /** Hidden when the listing has no WhatsApp number. */
  whatsapp?: string;
  /** Anchor for the availability CTA (`#inquire` on vendors, `#enquire` on venues). */
  inquireHref: string;
};

/**
 * The profile's persistent actions on phones and tablets: price, save,
 * WhatsApp, inquiry. Hidden from lg where the side panel carries these actions.
 */
export function StickyActionBar({
  slug,
  name,
  startingPrice,
  whatsapp,
  inquireHref,
}: Props) {
  const wa = whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}` : undefined;
  return (
    <div
      className={cn(
        "fixed inset-x-0 z-30 border-t border-line bg-white lg:hidden",
        "bottom-bottombar md:bottom-0",
      )}
    >
      <div className="container-site flex items-center justify-between gap-4 py-2 md:py-3">
        <div className="min-w-0">
          <p className="truncate font-serif text-h3 md:hidden">{name}</p>
          {startingPrice && <p className="truncate text-small text-mute">{startingPrice}</p>}
        </div>
        <div className="flex shrink-0 items-stretch gap-2 border-l border-line pl-3 md:gap-3 md:pl-4">
          <SaveButton slug={slug} name={name} tone="ink" withLabel className="hidden px-2 sm:inline-flex" />
          <SaveButton slug={slug} name={name} tone="ink" className="sm:hidden" />
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              aria-label={`WhatsApp ${name}`}
              className="tap inline-flex items-center justify-center gap-2 border border-line px-4 text-ink transition-chrome hover:border-ink"
            >
              <Icon name="whatsapp" size={20} />
              <span className="label hidden md:inline">WhatsApp</span>
            </a>
          )}
          <a
            href={inquireHref}
            className="label tap inline-flex items-center justify-center bg-ink px-5 text-white transition-chrome hover:bg-black md:px-7"
          >
            Check availability
          </a>
        </div>
      </div>
    </div>
  );
}
