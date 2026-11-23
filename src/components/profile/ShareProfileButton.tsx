"use client";

import { useState } from "react";

type Props = {
  title: string;
  className?: string;
};

/**
 * Share the current page via the native Web Share API, or copy the URL to
 * the clipboard on browsers that do not support sharing.
 */
export function ShareProfileButton({ title, className }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled or share failed — do nothing
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // clipboard unavailable
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share this profile"
      className={className}
    >
      {copied ? (
        <span className="label">Link copied</span>
      ) : (
        <>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0"
          >
            <path d="M12 3v12M7 8l5-5 5 5M5 13v7h14v-7" />
          </svg>
          <span className="label">Share</span>
        </>
      )}
    </button>
  );
}
