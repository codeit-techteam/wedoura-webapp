"use client";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { toggleSaved, useSaved, type SavedKind } from "@/lib/saved";

type Props = {
  slug: string;
  name: string;
  kind?: SavedKind;
  /** white sits on photographs; ink on plain backgrounds. */
  tone?: "white" | "ink";
  className?: string;
  /** Show the word next to the icon (profile action bar). */
  withLabel?: boolean;
};

/** The one save button. Backed by the shared shortlist store. */
export function SaveButton({ slug, name, kind = "vendor", tone = "white", className, withLabel = false }: Props) {
  const saved = useSaved();
  const isSaved = saved.includes(kind === "story" ? `story:${slug}` : slug);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSaved(slug, kind);
      }}
      aria-label={isSaved ? `Remove ${name} from saved` : `Save ${name}`}
      aria-pressed={isSaved}
      className={cn(
        "tap inline-flex items-center justify-center gap-2 transition-chrome",
        tone === "white" ? "text-white" : "text-ink",
        isSaved ? "opacity-100" : "opacity-80 hover:opacity-100",
        className,
      )}
    >
      <Icon name="bookmark" size={22} className={isSaved ? "fill-current" : ""} />
      {withLabel && <span className="label">{isSaved ? "Saved" : "Save"}</span>}
    </button>
  );
}
