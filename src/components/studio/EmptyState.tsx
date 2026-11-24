"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  icon: LucideIcon;
  title: string;
  action?: ReactNode;
  className?: string;
};

/** Quiet empty state for dashboard lists. */
export function EmptyState({ icon: Icon, title, action, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 border border-line bg-white px-6 py-14 text-center",
        "rounded-[length:var(--radius-dash)]",
        className,
      )}
    >
      <Icon className="size-8 text-gold" strokeWidth={1.25} aria-hidden="true" />
      <p className="max-w-sm font-sans text-[length:var(--text-dash-body)] text-mute">{title}</p>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
