"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

type Props = { title: string; path: string };

/** Share to WhatsApp or Pinterest, or copy the link. No tracking. */
export function ShareButtons({ title, path }: Props) {
  const [copied, setCopied] = useState(false);
  const url = typeof window === "undefined" ? path : new URL(path, window.location.origin).toString();

  const links = [
    {
      label: "WhatsApp",
      icon: "whatsapp" as const,
      href: `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`,
    },
    {
      label: "Pinterest",
      icon: "pinterest" as const,
      href: `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`,
    },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the links above still work */
    }
  }

  return (
    <div className="flex items-center gap-2" aria-label="Share this story">
      {links.map((link) => (
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
