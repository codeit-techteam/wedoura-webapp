"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** The portal's input look: calm, dense, bordered. Height and type come from .studio-app tokens. */
export const inputClass =
  "w-full min-h-[var(--tap-target)] border border-line bg-white px-3.5 py-2.5 text-[length:var(--text-dash-body)] text-ink outline-offset-2 placeholder:text-mute/60 focus:border-ink rounded-[length:var(--radius-dash)]";

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
      <label htmlFor={id} className="label text-mute tracking-[var(--tracking-dash-label)]">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {hint && !error && (
        <p className="mt-1.5 text-[length:var(--text-dash-help)] text-mute">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-[length:var(--text-dash-help)] text-ink" role="alert">
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
      <div className="min-w-0">
        <h1 className="studio-section-title">{title}</h1>
        {text && <p className="mt-2 max-w-prose text-[length:var(--text-dash-help)] text-mute">{text}</p>}
      </div>
      {right && <div className="shrink-0 pt-1.5">{right}</div>}
    </div>
  );
}

/**
 * A white bordered section card: the one container every studio screen groups
 * its fields into. Square corners, hairline border, no shadow.
 */
export function StudioCard({
  title,
  text,
  right,
  className,
  children,
}: {
  title?: string;
  text?: string;
  right?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("studio-card", className)}>
      {(title || right) && (
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line pb-3">
          {title && <h2 className="label text-mute tracking-[var(--tracking-dash-label)]">{title}</h2>}
          {right && <div className="shrink-0">{right}</div>}
        </div>
      )}
      {text && <p className="-mt-2 mb-5 max-w-prose text-[length:var(--text-dash-help)] text-mute">{text}</p>}
      {children}
    </section>
  );
}
