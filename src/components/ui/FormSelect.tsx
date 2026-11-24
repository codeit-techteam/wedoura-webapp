"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

type Option = { value: string; label: string };

type Props = {
  id: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
};

/**
 * Underline select for public forms. A custom menu so the open list
 * stays on the ivory palette instead of the browser's native popup.
 */
export function FormSelect({ id, value, options, onChange, placeholder = "Choose one" }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);
  const items = [{ value: "", label: placeholder }, ...options];

  useEffect(() => {
    if (!open) return;
    const outside = (node: Node | null) => !rootRef.current?.contains(node);
    const onPointer = (event: PointerEvent) => {
      if (outside(event.target as Node)) setOpen(false);
    };
    const onFocus = (event: FocusEvent) => {
      if (outside(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("focusin", onFocus);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.focus({ preventScroll: true });
  }, [open]);

  function openMenu() {
    const index = Math.max(
      0,
      items.findIndex((item) => item.value === value),
    );
    setActive(index);
    setOpen(true);
  }

  useEffect(() => {
    if (!open || !listRef.current) return;
    const node = listRef.current.querySelector<HTMLElement>(`[data-index="${active}"]`);
    if (!node) return;
    const list = listRef.current;
    const top = node.offsetTop;
    const bottom = top + node.offsetHeight;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
  }, [open, active]);

  function choose(next: string) {
    onChange(next);
    setOpen(false);
  }

  function onListKey(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, items.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setActive(items.length - 1);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const item = items[active];
      if (item) choose(item.value);
    }
  }

  return (
    <div ref={rootRef} className="relative mt-3">
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (open) setOpen(false);
          else openMenu();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!open) openMenu();
          }
        }}
        className="tap flex w-full items-center justify-between gap-3 border-b border-line bg-transparent pb-2 text-left text-body outline-offset-4 focus:border-ink"
      >
        <span className={selected ? "text-ink" : "text-mute/60"}>{selected?.label ?? placeholder}</span>
        <Icon
          name="chevron-down"
          size={16}
          className={cn("text-mute transition-transform duration-300 ease-wedoura", open && "rotate-180")}
        />
      </button>
      {open ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={`${listId}-${active}`}
          onKeyDown={onListKey}
          className="absolute top-full right-0 left-0 z-30 mt-1 max-h-64 overflow-y-auto border border-line bg-white outline-none"
        >
          {items.map((item, index) => {
            const isSelected = item.value === value;
            return (
              <li key={item.value || "placeholder"} role="presentation">
                <button
                  id={`${listId}-${index}`}
                  type="button"
                  role="option"
                  tabIndex={-1}
                  data-index={index}
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(item.value)}
                  className={cn(
                    "tap w-full border-l-2 px-4 py-2.5 text-left text-body transition-chrome",
                    index === active || isSelected ? "border-gold bg-ivory" : "border-transparent hover:bg-ivory",
                    item.value ? "text-ink" : "text-mute",
                  )}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
