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

type DirtyControllers = {
  flush: () => Promise<void>;
  discard: () => void;
};

type DirtyContextValue = {
  dirty: boolean;
  setDirty: (d: boolean) => void;
  status: SaveStatus;
  setStatus: (s: SaveStatus) => void;
  error?: string;
  setError: (e: string | undefined) => void;
  registerControllers: (controllers: DirtyControllers | null) => void;
  flush: () => Promise<void>;
  discard: () => void;
};

const DirtyContext = createContext<DirtyContextValue>({
  dirty: false,
  setDirty: () => {},
  status: "idle",
  setStatus: () => {},
  setError: () => {},
  registerControllers: () => {},
  flush: async () => {},
  discard: () => {},
});

/** Tracks unsaved changes across the portal and warns before leaving. */
export function DirtyProvider({ children }: { children: ReactNode }) {
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | undefined>(undefined);
  const controllers = useRef<DirtyControllers | null>(null);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const registerControllers = useCallback((next: DirtyControllers | null) => {
    controllers.current = next;
  }, []);

  const flush = useCallback(async () => {
    await controllers.current?.flush();
  }, []);

  const discard = useCallback(() => {
    controllers.current?.discard();
  }, []);

  const value = useMemo(
    () => ({
      dirty,
      setDirty,
      status,
      setStatus,
      error,
      setError,
      registerControllers,
      flush,
      discard,
    }),
    [dirty, status, error, registerControllers, flush, discard],
  );

  return <DirtyContext.Provider value={value}>{children}</DirtyContext.Provider>;
}

export function useDirty() {
  return useContext(DirtyContext);
}

const DEBOUNCE_MS = 800;

/**
 * Queue listing patches; they merge and save 800ms after the last change
 * (flushing on unmount), driving the Saving/Saved indicator and the dirty
 * flag for the leave-warning.
 */
export function useListingAutosave(onDiscard?: () => void) {
  const { setDirty, setStatus, setError, registerControllers } = useDirty();
  const [status, setLocalStatus] = useState<SaveStatus>("idle");
  const [error, setLocalError] = useState<string | undefined>(undefined);
  const queue = useRef<Partial<VendorListing>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncStatus = useCallback(
    (next: SaveStatus, err?: string) => {
      setLocalStatus(next);
      setStatus(next);
      setLocalError(err);
      setError(err);
    },
    [setError, setStatus],
  );

  const flush = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (Object.keys(queue.current).length === 0) return;
    const patch = queue.current;
    queue.current = {};
    syncStatus("saving");
    const result = await updateMyListing(patch);
    if (result.ok) {
      syncStatus("saved");
      setDirty(false);
    } else {
      queue.current = { ...patch, ...queue.current };
      syncStatus("error", result.error);
    }
  }, [setDirty, syncStatus]);

  const discard = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    queue.current = {};
    setDirty(false);
    syncStatus("idle");
    onDiscard?.();
  }, [onDiscard, setDirty, syncStatus]);

  const schedule = useCallback(
    (patch: Partial<VendorListing>) => {
      queue.current = { ...queue.current, ...patch };
      setDirty(true);
      syncStatus("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), DEBOUNCE_MS);
    },
    [flush, setDirty, syncStatus],
  );

  useEffect(() => {
    registerControllers({ flush, discard });
    return () => registerControllers(null);
  }, [discard, flush, registerControllers]);

  useEffect(() => {
    return () => {
      if (Object.keys(queue.current).length > 0) void flush();
    };
  }, [flush]);

  return { status, error, schedule, flush, discard };
}

/** Top-bar / chip save indicator. */
export function SaveState({ status, error, className }: { status: SaveStatus; error?: string; className?: string }) {
  const label =
    status === "saving"
      ? "Saving…"
      : status === "error"
        ? (error ?? "Could not save")
        : status === "saved" || status === "idle"
          ? "All changes saved"
          : "Unsaved changes";

  return (
    <p
      aria-live="polite"
      className={cn(
        "inline-flex min-h-8 items-center gap-2 font-sans text-[length:var(--text-dash-help)] text-mute",
        status === "error" && "text-ink",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          status === "saving" && "animate-pulse bg-gold",
          (status === "saved" || status === "idle") && "bg-ink",
          status === "error" && "bg-gold",
        )}
      />
      {label}
    </p>
  );
}

/** Sticky bar when a form has unsaved changes. */
export function StudioSaveBar() {
  const { dirty, status, flush, discard } = useDirty();
  if (!dirty && status !== "error") return null;

  return (
    <div className="studio-savebar" role="status">
      <p className="font-sans text-[length:var(--text-dash-body)] text-ink">You have unsaved changes</p>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="studio-btn-ghost" onClick={discard}>
          Discard
        </button>
        <button type="button" className="studio-btn" onClick={() => void flush()}>
          Save
        </button>
      </div>
    </div>
  );
}
