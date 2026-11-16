import Link from "next/link";

type Props = {
  shown: number;
  total: number;
  /** Href with a larger ?show= value, built on the server. */
  moreHref: string;
  noun?: string;
};

/**
 * Count plus a show-more link (?show= in the URL, so every state is linkable
 * and server-rendered); hides itself when everything is shown.
 */
export function LoadMore({ shown, total, moreHref, noun = "results" }: Props) {
  if (total <= shown) return null;
  return (
    <div className="mt-12 flex flex-col items-center gap-4">
      <p className="text-small text-mute">
        Showing {shown} of {total} {noun}
      </p>
      <Link
        href={moreHref}
        scroll={false}
        className="label tap inline-flex items-center justify-center gap-3 border border-ink px-8 py-4 text-ink transition-colors duration-300 ease-wedoura select-none hover:bg-ink hover:text-white"
      >
        Show more
      </Link>
    </div>
  );
}
