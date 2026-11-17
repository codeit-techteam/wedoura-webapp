"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { VendorListing } from "@/data/types";
import { cn } from "@/lib/cn";
import { updateMyListing } from "@/lib/vendor-api";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/* ------------------------------------------------------------ dirty state */

const DirtyContext = createContext<{ dirty: boolean; setDirty: (d: boolean) => void }>({
  dirty: false,
  setDirty: () => {},
});

/** Tracks unsaved changes across the portal and warns before leaving. */
export function DirtyProvider({ children }: { children: ReactNode }) {
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const value = useMemo(() => ({ dirty, setDirty }), [dirty]);
  return <DirtyContext.Provider value={value}>{children}</DirtyContext.Provider>;
}

export function useDirty() {
  return useContext(DirtyContext);
}

/* --------------------------------------------------------------- autosave */

const DEBOUNCE_MS = 800;

/**
 * Queue listing patches; they merge and save 800ms after the last change
 * (flushing on unmount), driving the Saving/Saved indicator and the dirty
 * flag for the leave-warning.
 */
export function useListingAutosave() {
  const { setDirty } = useDirty();
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | undefined>(undefined);
  const queue = useRef<Partial<VendorListing>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (Object.keys(queue.current).length === 0) return;
    const patch = queue.current;
    queue.current = {};
    const result = await updateMyListing(patch);
    if (result.ok) {
      setStatus("saved");
      setError(undefined);
      setDirty(false);
    } else {
      // Keep the patch so a retry can pick it up.
      queue.current = { ...patch, ...queue.current };
      setStatus("error");
      setError(result.error);
    }
  }, [setDirty]);

  const schedule = useCallback(
    (patch: Partial<VendorListing>) => {
      queue.current = { ...queue.current, ...patch };
      setDirty(true);
      setStatus("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), DEBOUNCE_MS);
    },
    [flush, setDirty],
  );

  // Flush pending edits when the screen unmounts.
  useEffect(() => {
    return () => {
      if (Object.keys(queue.current).length > 0) void flush();
    };
  }, [flush]);

  return { status, error, schedule, flush };
}

/** The visible Saving → Saved indicator: one quiet chip, the same on every screen. */
export function SaveState({ status, error, className }: { status: SaveStatus; error?: string; className?: string }) {
  return (
    <p
      aria-live="polite"
      className={cn(
        "label inline-flex min-h-8 items-center gap-2 border bg-white px-3 py-1.5",
        status === "error" ? "border-ink text-ink" : "border-line text-mute",
        status === "idle" && "invisible",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          status === "saving" && "animate-pulse bg-gold",
          status === "saved" && "bg-ink",
          status === "error" && "bg-gold",
          status === "idle" && "bg-line",
        )}
      />
      {status === "idle" && "Saved"}
      {status === "saving" && "Saving…"}
      {status === "saved" && "Saved"}
      {status === "error" && (error ?? "Could not save")}
    </p>
  );
}
