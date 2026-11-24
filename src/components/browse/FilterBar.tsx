"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { BottomSheet } from "@/components/browse/BottomSheet";
import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";
import { useIsDesktop } from "@/lib/media";
import { patchedHref, type ParamRecord } from "@/lib/url";

export type FilterOption = { value: string; label: string };

type StrapContextValue = {
  openParam: string | null;
  setOpenParam: (param: string | null) => void;
};

const FilterStrapContext = createContext<StrapContextValue | null>(null);

type SelectProps = {
  param: string;
  label: string;
  options: FilterOption[];
  allLabel?: string;
  pathname: string;
  params: ParamRecord;
  className?: string;
  /** Anchor the menu to the start or end of the trigger. Default start. */
  menuAlign?: "start" | "end";
};

/** One compact filter inside the strap (custom menu; no native select). */
export function FilterSelect({
  param,
  label,
  options,
  allLabel = "All",
  pathname,
  params,
  className,
  menuAlign = "start",
}: SelectProps) {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const strap = useContext(FilterStrapContext);
  const [localOpen, setLocalOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);

  const value = params[param] ?? "";
  const active = Boolean(value);
  const open = strap ? strap.openParam === param : localOpen;

  const resolved = options.find((o) => o.value === value);
  const display = resolved?.label ?? allLabel;

  const close = useCallback(() => {
    if (strap) strap.setOpenParam(null);
    else setLocalOpen(false);
  }, [strap]);

  const toggle = useCallback(() => {
    if (open) close();
    else if (strap) strap.setOpenParam(param);
    else setLocalOpen(true);
  }, [close, open, param, strap]);

  useEffect(() => {
    if (!open || !isDesktop) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, isDesktop, close]);

  const pick = (next: string) => {
    router.replace(patchedHref(pathname, params, { [param]: next || null, show: null }), { scroll: false });
    close();
  };

  const optionButtons = (
    <>
      <li role="option" aria-selected={!value}>
        <button
          type="button"
          onClick={() => pick("")}
          className={cn(
            "tap w-full px-4 py-2.5 text-left text-small transition-chrome hover:bg-ivory",
            !value ? "bg-ivory font-medium text-ink" : "text-mute hover:text-ink",
          )}
        >
          {allLabel}
        </button>
      </li>
      {options.map((o) => (
        <li key={o.value} role="option" aria-selected={value === o.value}>
          <button
            type="button"
            onClick={() => pick(o.value)}
            className={cn(
              "tap w-full border-t border-line px-4 py-2.5 text-left text-small transition-chrome hover:bg-ivory",
              value === o.value ? "bg-ivory font-medium text-ink" : "text-ink",
            )}
          >
            {o.label}
          </button>
        </li>
      ))}
    </>
  );

  if (!isDesktop && strap) {
    return (
      <div className={cn("border-b border-line pb-5 last:border-0 last:pb-0", className)}>
        <p className="label text-mute">{label}</p>
        <ul className="mt-3 flex flex-col" role="listbox" aria-label={label}>
          {optionButtons}
        </ul>
      </div>
    );
  }

  if (!isDesktop && !strap) {
    return (
      <>
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "tap flex w-full items-center justify-between gap-2 border border-line bg-white px-4 py-2.5 text-left",
            active && "bg-ivory",
            className,
          )}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="label text-mute">{label}</span>
            <span className="truncate text-small text-ink">{display}</span>
          </span>
          <Icon name="chevron-down" size={14} className="shrink-0 text-mute" />
        </button>
        <BottomSheet open={open} onClose={close} title={label}>
          <ul className="flex flex-col" role="listbox">
            {optionButtons}
          </ul>
        </BottomSheet>
      </>
    );
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative flex min-h-14 min-w-0 flex-col justify-center gap-0.5 px-4 py-2",
        active && "bg-ivory",
        className,
      )}
    >
      <span className="label text-mute">{label}</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
        className="tap flex w-full min-w-0 items-center justify-between gap-2 text-left"
      >
        <span className="truncate text-small text-ink">{display}</span>
        <Icon name="chevron-down" size={14} className={cn("shrink-0 text-mute transition-chrome", open && "rotate-180")} />
      </button>
      {open && (
        <ul
          ref={panelRef}
          role="listbox"
          className={cn(
            "no-scrollbar absolute top-full z-50 mt-px max-h-60 min-w-full overflow-y-auto border border-line bg-white",
            menuAlign === "end" ? "right-0" : "left-0",
          )}
          style={{ minWidth: "12.5rem" }}
        >
          {optionButtons}
        </ul>
      )}
    </div>
  );
}

type BarProps = {
  children: ReactNode;
  count: string;
  activeCount: number;
  clearHref?: string;
  className?: string;
};

/**
 * Compact filter strap in normal document flow. Mobile uses a bottom sheet.
 */
export function FilterBar({ children, count, activeCount, clearHref, className }: BarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [openParam, setOpenParam] = useState<string | null>(null);

  return (
    <FilterStrapContext.Provider value={{ openParam, setOpenParam }}>
      <Container className={cn("pb-6 md:pb-8", className)}>
        <div className="border border-line bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-line px-gutter py-2.5 md:hidden">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="tap inline-flex items-center gap-2 text-label-lg font-medium text-ink"
              aria-haspopup="dialog"
            >
              <Icon name="menu" size={18} />
              Filters{activeCount > 0 ? ` (${activeCount})` : ""}
            </button>
            <p className="text-small text-mute" aria-live="polite">
              {count}
            </p>
          </div>

          <div className="hidden min-h-14 md:flex md:items-stretch">
            <div className="grid min-w-0 flex-1 auto-cols-fr grid-flow-col divide-x divide-line">{children}</div>
            <aside className="flex shrink-0 items-center gap-4 border-l border-line px-5 py-2 text-right">
              <p className="text-small text-mute whitespace-nowrap" aria-live="polite">
                {count}
              </p>
              {clearHref && activeCount > 0 && (
                <Link href={clearHref} scroll={false} className="link-draw text-small text-ink">
                  Clear
                </Link>
              )}
            </aside>
          </div>
        </div>

        <div className="md:hidden">
          <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filters">
            <div className="flex flex-col gap-5">{children}</div>
            {clearHref && activeCount > 0 && (
              <Link
                href={clearHref}
                scroll={false}
                onClick={() => setSheetOpen(false)}
                className="link-draw mt-6 inline-block text-small text-ink"
              >
                Clear all filters
              </Link>
            )}
          </BottomSheet>
        </div>
      </Container>
    </FilterStrapContext.Provider>
  );
}
