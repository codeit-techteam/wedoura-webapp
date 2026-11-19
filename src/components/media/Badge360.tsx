import { cn } from "@/lib/cn";

/**
 * The one "360°" mark. Sits in the corner of any tile whose photo is
 * equirectangular, in public grids and in the portal alike.
 */
export function Badge360({ position = "top-2 left-2" }: { position?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("label pointer-events-none absolute z-10 bg-ink/70 px-2 py-1 text-[12px] text-white", position)}
    >
      360°
    </span>
  );
}
