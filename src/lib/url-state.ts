"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * Tabs, filters, sort and search all live in the URL, so every state is
 * linkable and the back button works. Reads via useSearchParams; writes
 * replace the URL without scrolling or adding history entries.
 */
export function useParamState(key: string): [string, (value: string | null) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get(key) ?? "";

  const setValue = useCallback(
    (next: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next) params.set(key, next);
      else params.delete(key);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [key, pathname, router, searchParams],
  );

  return [value, setValue];
}

/** Clear several params at once (the "clear filters" action). */
export function useClearParams(keys: string[]): () => void {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of keys) params.delete(key);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [keys, pathname, router, searchParams]);
}

/** Build a /vendors href from filter values, skipping empties. */
export function vendorsHref(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  const query = search.toString();
  return query ? `/vendors?${query}` : "/vendors";
}
