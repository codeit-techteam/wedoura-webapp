"use client";

type Props = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
};

export function SoulmatesToast({ message, actionLabel, onAction, onDismiss }: Props) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-6 z-50 mx-auto flex max-w-md items-center justify-between gap-4 border border-line bg-ink px-4 py-3 text-ivory shadow-none md:inset-x-auto md:right-6 md:left-auto"
    >
      <p className="font-sans text-[14px] leading-snug">{message}</p>
      <div className="flex shrink-0 items-center gap-3">
        {actionLabel && onAction ? (
          <button
            type="button"
            className="border-b border-gold pb-0.5 font-sans text-[11px] font-medium tracking-[0.2em] uppercase"
            onClick={onAction}
          >
            {actionLabel}
          </button>
        ) : null}
        <button
          type="button"
          aria-label="Dismiss"
          className="font-sans text-[11px] tracking-[0.16em] text-white/70 uppercase"
          onClick={onDismiss}
        >
          Close
        </button>
      </div>
    </div>
  );
}
