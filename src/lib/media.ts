"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 48rem)";

function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/**
 * True from the md breakpoint. The server (and first paint) answers false, so
 * pinned scroll sections render their carousel markup once into the HTML and
 * upgrade to the pinned variant only on desktop after hydration — one set of
 * content, never two copies.
 */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}

const noopSubscribe = () => () => {};

/** False during SSR and hydration, true once mounted — without an effect, so
 *  portals and absolute URLs can wait for the client safely. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
