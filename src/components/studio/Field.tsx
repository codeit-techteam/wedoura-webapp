"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** The portal's input look: calm, dense, bordered. */
export const inputClass =
  "w-full border border-line bg-white px-3.5 py-2.5 text-body text-ink outline-offset-2 placeholder:text-mute/60 focus:border-ink";

export const selectClass = cn(inputClass, "cursor-pointer appearance-none");

type Props = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
};

/** Label + control + hint + inline error, the one field wrapper. */
export function Field({ id, label, hint, error, className, children }: Props) {
  return (
    <div className={className}>
      <label htmlFor={id} className="label text-mute">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {hint && !error && <p className="mt-1.5 text-small text-mute">{hint}</p>}
      {error && (
        <p className="mt-1.5 text-small text-ink" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Section heading inside a screen. */
export function ScreenHeader({ title, text, right }: { title: string; text?: string; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3 border-b border-line pb-5">
      <div>
        <h1 className="font-serif text-h2">{title}</h1>
        {text && <p className="mt-2 max-w-prose text-small text-mute">{text}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
