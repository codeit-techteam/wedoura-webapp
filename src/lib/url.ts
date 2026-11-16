/**
 * URL helpers with no hooks, safe in server components. List pages read the
 * searchParams prop, normalise it with pickParams, filter on the server and
 * build every tab/filter/show-more href with patchedHref, so each state is
 * linkable and server-rendered. The client hooks live in url-state.ts.
 */

/** The current query params as a plain record (built on the server). */
export type ParamRecord = Record<string, string>;

/** Normalize the awaited searchParams prop to single string values. */
export function pickParams(
  searchParams: Record<string, string | string[] | undefined>,
  keys: string[],
): ParamRecord {
  const params: ParamRecord = {};
  for (const key of keys) {
    const value = searchParams[key];
    const first = Array.isArray(value) ? value[0] : value;
    if (first) params[key] = first;
  }
  return params;
}

/** Build an href from pathname + params with some keys patched (null clears). */
export function patchedHref(pathname: string, params: ParamRecord, patch: Record<string, string | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  for (const [key, value] of Object.entries(patch)) {
    if (value) search.set(key, value);
    else search.delete(key);
  }
  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/** Build an href from pathname + params with the given keys removed. */
export function clearedHref(pathname: string, params: ParamRecord, keys: string[]): string {
  const patch: Record<string, string | null> = {};
  for (const key of keys) patch[key] = null;
  return patchedHref(pathname, params, patch);
}

/** Build a /vendors href from filter values, skipping empties. */
export function vendorsHref(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  const query = search.toString();
  return query ? `/vendors?${query}` : "/vendors";
}
