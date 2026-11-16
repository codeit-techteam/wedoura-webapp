"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export { clearedHref, patchedHref, pickParams, vendorsHref, type ParamRecord } from "@/lib/url";

/**
 * Client-side URL state. Tabs, filters, sort and search all live in the URL,
 * so every state is linkable and the back button works. List pages read the
 * URL on the server (see url.ts) and their controls build hrefs with
 * patchedHref; this hook is only for client-only screens.
 *
 * Tab-like state on client-only screens (saved, studio) whose content is
 * client data anyway. List pages must NOT use this: they read searchParams
 * on the server so the content is in the HTML.
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
