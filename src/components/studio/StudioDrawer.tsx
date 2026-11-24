"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useFocusTrap } from "@/lib/focus-trap";

type Props = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

/** Right-side drawer (full screen under ~640px). Escape closes. */
export function StudioDrawer({ title, open, onClose, children, footer }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="drawer" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="drawer-scrim" aria-label="Close" onClick={onClose} />
      <div ref={panelRef} className="drawer-panel enq-drawer-panel flex flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
          <h2 className="font-serif text-h3 text-ink">{title}</h2>
          <button type="button" onClick={onClose} className="studio-top-link shrink-0">
            Close
          </button>
        </div>
        <div className="mt-6 min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer ? <div className="mt-6 border-t border-line pt-4">{footer}</div> : null}
      </div>
    </div>
  );
}
