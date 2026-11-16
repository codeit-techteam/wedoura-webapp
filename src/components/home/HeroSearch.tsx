"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { BottomSheet } from "@/components/browse/BottomSheet";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { useIsDesktop } from "@/lib/media";

type Option = { slug: string; name: string };

type Props = {
  cities: Option[];
  categories: Option[];
};

type ActiveField = "city" | "category" | null;

/** Below this scroll offset, menus always open downward. */
const SCROLL_OPEN_DOWN_AT = 48;
/** Minimum space below the field before we flip the menu upward. */
const MENU_MIN_SPACE_BELOW = 288;

type PanelCoords = {
  left: number;
  width: number;
  anchorTop: number;
  anchorBottom: number;
  placement: "up" | "down";
};

type PickerProps = {
  field: "city" | "category";
  label: string;
  placeholder: string;
  value: string;
  options: Option[];
  onChange: (slug: string) => void;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
};

function PickerOptions({
  placeholder,
  value,
  options,
  onPick,
}: {
  placeholder: string;
  value: string;
  options: Option[];
  onPick: (slug: string) => void;
}) {
  return (
    <>
      <li role="option" aria-selected={!value}>
        <button
          type="button"
          onClick={() => onPick("")}
          className={cn(
            "tap w-full px-4 py-3 text-left text-body transition-chrome hover:bg-ivory md:px-5",
            !value ? "bg-ivory font-medium text-ink" : "text-mute hover:text-ink",
          )}
        >
          {placeholder}
        </button>
      </li>
      {options.map((o) => (
        <li key={o.slug} role="option" aria-selected={value === o.slug}>
          <button
            type="button"
            onClick={() => onPick(o.slug)}
            className={cn(
              "tap w-full border-t border-line px-4 py-3 text-left text-body transition-chrome hover:bg-ivory md:px-5",
              value === o.slug ? "bg-ivory font-medium text-ink" : "text-ink",
            )}
          >
            {o.name}
          </button>
        </li>
      ))}
    </>
  );
}

function HeroPicker({ field, label, placeholder, value, options, onChange, open, onToggle, onClose }: PickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  const isDesktop = useIsDesktop();
  const [coords, setCoords] = useState<PanelCoords | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const display = value ? (options.find((o) => o.slug === value)?.name ?? placeholder) : placeholder;

  const positionPanel = useCallback(() => {
    if (!rootRef.current) return;
    const r = rootRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const placement: PanelCoords["placement"] =
      window.scrollY > SCROLL_OPEN_DOWN_AT || spaceBelow >= MENU_MIN_SPACE_BELOW ? "down" : "up";
    setCoords({
      left: r.left,
      width: r.width,
      anchorTop: r.top,
      anchorBottom: r.bottom,
      placement,
    });
  }, []);

  useEffect(() => {
    if (!open || !isDesktop) return;
    positionPanel();
    const sync = () => positionPanel();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [open, isDesktop, positionPanel]);

  useEffect(() => {
    if (!open || !isDesktop) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, isDesktop, onClose]);

  useEffect(() => {
    if (!open || !isDesktop) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!rootRef.current?.contains(t) && !panelRef.current?.contains(t)) onClose();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, isDesktop, onClose]);

  const pick = (slug: string) => {
    onChange(slug);
    onClose();
  };

  const trigger = (
    <div
      ref={rootRef}
      className={cn(
        "flex min-h-full min-w-0 flex-col justify-center px-3 py-2 transition-chrome md:px-7 md:py-3",
        open && "bg-ivory",
      )}
    >
      <span className="label mb-0.5 text-mute">{label}</span>
      <button
        type="button"
        id={`hero-${field}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={onToggle}
        className="tap flex w-full min-w-0 items-center justify-between gap-3 text-left"
      >
        <span className="truncate text-body text-ink">{display}</span>
        <Icon
          name="chevron-down"
          size={16}
          className={cn("shrink-0 text-mute transition-chrome", open && "rotate-180")}
        />
      </button>
    </div>
  );

  const sheet =
    !isDesktop && open ? (
      <BottomSheet open onClose={onClose} title={label}>
        <ul role="listbox" aria-labelledby={`hero-${field}`} className="-mx-gutter border-y border-line">
          <PickerOptions placeholder={placeholder} value={value} options={options} onPick={pick} />
        </ul>
      </BottomSheet>
    ) : null;

  const menu =
    isDesktop && open && mounted && coords
      ? createPortal(
          <ul
            ref={panelRef}
            role="listbox"
            aria-labelledby={`hero-${field}`}
            className="no-scrollbar max-h-72 overflow-y-auto border border-line bg-white"
            style={{
              position: "fixed",
              left: coords.left,
              width: Math.max(coords.width, 220),
              zIndex: 50,
              ...(coords.placement === "up"
                ? { top: coords.anchorTop, transform: "translateY(calc(-100% - 1px))" }
                : { top: coords.anchorBottom, transform: "translateY(1px)" }),
            }}
          >
            <PickerOptions placeholder={placeholder} value={value} options={options} onPick={pick} />
          </ul>,
          document.body,
        )
      : null;

  return (
    <>
      {trigger}
      {sheet}
      {menu}
    </>
  );
}

/** The slim where-and-who search bar docked at the bottom of the hero. */
export function HeroSearch({ cities, categories }: Props) {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [active, setActive] = useState<ActiveField>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setActive(null);
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (category) params.set("category", category);
    const query = params.toString();
    router.push(query ? `/vendors?${query}` : "/vendors");
  }

  const toggle = (field: Exclude<ActiveField, null>) => () =>
    setActive((current) => (current === field ? null : field));

  return (
    <form
      onSubmit={onSubmit}
      aria-label="Find vendors"
      className={cn(
        "relative z-30 mx-auto grid h-[4.25rem] w-full max-w-(--container-hero-search) grid-cols-[1fr_1fr_auto] items-stretch divide-x divide-line border border-line bg-white text-ink md:h-16",
        active && "border-ink",
      )}
    >
      <HeroPicker
        field="city"
        label="Where"
        placeholder="Anywhere"
        value={city}
        options={cities}
        onChange={setCity}
        open={active === "city"}
        onToggle={toggle("city")}
        onClose={() => setActive(null)}
      />
      <HeroPicker
        field="category"
        label="Who"
        placeholder="All vendors"
        value={category}
        options={categories}
        onChange={setCategory}
        open={active === "category"}
        onToggle={toggle("category")}
        onClose={() => setActive(null)}
      />
      <button
        type="submit"
        className="tap flex items-center gap-3 bg-ink px-4 text-white transition-chrome hover:bg-black md:px-9"
      >
        <Icon name="search" size={18} />
        <span className="label hidden md:inline">Search</span>
        <span className="sr-only md:hidden">Search</span>
      </button>
    </form>
  );
}