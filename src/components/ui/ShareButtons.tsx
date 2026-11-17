"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useMounted } from "@/lib/media";

type Props = { title: string; path: string; /** When false, only copy link is shown. */ social?: boolean };

/** Share to WhatsApp or Pinterest, or copy the link. No tracking. */
export function ShareButtons({ title, path, social = true }: Props) {
  const [copied, setCopied] = useState(false);
  // Match SSR (relative path) on first paint, then the absolute URL once mounted.
  const mounted = useMounted();
  const shareUrl = mounted ? new URL(path, window.location.origin).toString() : path;

  const links = useMemo(
    () => [
      {
        label: "WhatsApp",
        icon: "whatsapp" as const,
        href: `https://wa.me/?text=${encodeURIComponent(`${title} — ${shareUrl}`)}`,
      },
      {
        label: "Pinterest",
        icon: "pinterest" as const,
        href: `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(title)}`,
      },
    ],
    [shareUrl, title],
  );

  async function copy() {
    try {
      const absolute =
        shareUrl.startsWith("http") ? shareUrl : new URL(shareUrl, window.location.origin).toString();
      await navigator.clipboard.writeText(absolute);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the links above still work */
    }
  }

  return (
    <div className="flex items-center gap-2" aria-label="Share this story">
      {social &&
        links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          aria-label={`Share on ${link.label}`}
          className="tap inline-flex items-center justify-center border border-line text-ink transition-chrome hover:border-ink"
        >
          <Icon name={link.icon} size={20} />
        </a>
        ))}
      <button
        type="button"
        onClick={copy}
        className="label tap inline-flex items-center justify-center border border-line px-4 text-ink transition-chrome hover:border-ink"
      >
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}