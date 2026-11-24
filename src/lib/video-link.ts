/** Validate and resolve YouTube / Vimeo links for film posters. */

export type VideoLinkInfo = {
  provider: "youtube" | "vimeo";
  id: string;
  /** Best-effort poster URL (YouTube only without a network call). */
  thumbnailUrl?: string;
};

export function parseVideoLink(raw: string): VideoLinkInfo | null {
  const url = raw.trim();
  if (!/^https?:\/\/.+/i.test(url)) return null;

  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (!id) return null;
      return { provider: "youtube", id, thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg` };
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      const id = u.searchParams.get("v") || u.pathname.match(/\/(?:embed|shorts)\/([^/?#]+)/)?.[1];
      if (!id) return null;
      return { provider: "youtube", id, thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg` };
    }

    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (!id || !/^\d+$/.test(id)) return null;
      return { provider: "vimeo", id };
    }
  } catch {
    return null;
  }
  return null;
}

export function isValidVideoLink(raw: string): boolean {
  return parseVideoLink(raw) != null;
}
