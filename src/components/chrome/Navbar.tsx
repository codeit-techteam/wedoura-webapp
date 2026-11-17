"use client";

import { AnimatePresence, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MobileMenu } from "@/components/chrome/MobileMenu";
import { SavedCount } from "@/components/chrome/SavedCount";
import { SearchOverlay } from "@/components/chrome/SearchOverlay";
import { VendorsPanel } from "@/components/chrome/VendorsPanel";
import { Wordmark } from "@/components/chrome/Wordmark";
import { Icon } from "@/components/ui/Icon";
import type { Category, City } from "@/data/types";
import { cn } from "@/lib/cn";

export type NavCategory = Pick<Category, "slug" | "name" | "shortName" | "cover">;
export type NavCity = Pick<City, "slug" | "name">;
type Panel = "vendors" | "search" | "menu";

export const PRIMARY_LINKS = [
  { href: "/real-weddings", label: "Real Weddings" },
  { href: "/blogs", label: "Blogs" },
  { href: "/honeymoon", label: "Honeymoon" },
] as const;

const HOVER_OPEN_MS = 120;
const HOVER_CLOSE_MS = 220;
const SCROLLED_AT = 8;
const HIDE_AFTER = 80;
const SCROLL_DEADBAND = 4;

type Props = { categories: NavCategory[]; cities: NavCity[] };

/**
 * Site navigation. Sticky; transparent with white text over a page that
 * renders an element with `data-nav-dark` (pure CSS, see globals.css);
 * solid white with a hairline once scrolled; slides away on scroll down and
 * back on scroll up. Panels: Vendors (hover, click, keyboard), Search and
 * the mobile Menu. Escape closes any of them.
 */
export function Navbar({ categories, cities }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  // The open panel is tied to the path it was opened on, so navigation
  // closes it without an effect.
  const [panelState, setPanelState] = useState<{ panel: Panel; path: string } | null>(null);
  const panel = panelState && panelState.path === pathname ? panelState.panel : null;

  const headerRef = useRef<HTMLElement>(null);
  const vendorsButtonRef = useRef<HTMLButtonElement>(null);
  const hoverTimer = useRef<number | null>(null);

  const open = useCallback((next: Panel) => setPanelState({ panel: next, path: pathname }), [pathname]);
  const close = useCallback(() => setPanelState(null), []);
  const closeVendors = useCallback(() => {
    close();
    vendorsButtonRef.current?.focus({ preventScroll: true });
  }, [close]);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = scrollY.getPrevious() ?? y;
    setScrolled(y > SCROLLED_AT);
    if (panel || y < HIDE_AFTER) {
      setHidden(false);
      return;
    }
    if (y > previous + SCROLL_DEADBAND) setHidden(true);
    else if (y < previous - SCROLL_DEADBAND) setHidden(false);
  });

  // Escape closes the open panel. Search and Menu restore focus through
  // their focus trap; the Vendors panel returns focus to its button.
  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      if (panel === "vendors") closeVendors();
      else close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panel, close, closeVendors]);

  // Clicking anywhere outside the header closes the Vendors panel.
  useEffect(() => {
    if (panel !== "vendors") return;
    const onPointerDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [panel, close]);

  const cancelHover = () => {
    if (hoverTimer.current !== null) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };
  const onVendorsPointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    cancelHover();
    hoverTimer.current = window.setTimeout(() => open("vendors"), HOVER_OPEN_MS);
  };
  const onHeaderPointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    cancelHover();
    if (panel === "vendors") hoverTimer.current = window.setTimeout(close, HOVER_CLOSE_MS);
  };
  const onHeaderBlur = (e: React.FocusEvent) => {
    if (panel === "vendors" && !headerRef.current?.contains(e.relatedTarget as Node | null)) close();
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const linkClass = (active: boolean) =>
    cn(
      "nav-link tap items-center border-b pb-px transition-chrome hover:border-current",
      active ? "border-current" : "border-transparent",
    );

  return (
    <>
      <header
        ref={headerRef}
        data-scrolled={scrolled}
        data-open={panel !== null}
        data-hidden={hidden && !panel}
        onPointerEnter={cancelHover}
        onPointerLeave={onHeaderPointerLeave}
        onBlur={onHeaderBlur}
        className="site-nav sticky top-0 z-40 h-nav border-b border-line bg-white text-ink transition-chrome data-[hidden=true]:-translate-y-full"
      >
        {/* h-nav on the header (border-box) so the 1px hairline is inside
            --nav-h; heroes use -mt-nav and must meet the viewport top. */}
        <div className="container-wide grid h-full grid-cols-[auto_1fr] items-center md:grid-cols-[1fr_auto_1fr]">
          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-7 lg:gap-9">
              <li>
                <button
                  ref={vendorsButtonRef}
                  type="button"
                  aria-expanded={panel === "vendors"}
                  aria-controls="vendors-panel"
                  aria-haspopup="true"
                  onClick={() => (panel === "vendors" ? closeVendors() : open("vendors"))}
                  onPointerEnter={onVendorsPointerEnter}
                  onKeyDown={(e) => {
                    // ArrowDown opens and enters the panel; Tab on an open
                    // panel enters it too, instead of skipping to the next link.
                    const enterPanel = () =>
                      requestAnimationFrame(() => document.querySelector<HTMLElement>("#vendors-panel a")?.focus());
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      open("vendors");
                      enterPanel();
                    } else if (e.key === "Tab" && !e.shiftKey && panel === "vendors") {
                      e.preventDefault();
                      enterPanel();
                    }
                  }}
                  className={cn(linkClass(panel === "vendors" || isActive("/vendors")), "inline-flex gap-1.5")}
                >
                  Vendors
                  <Icon name="chevron-down" size={10} className={cn("transition-chrome", panel === "vendors" && "rotate-180")} />
                </button>
              </li>
              {PRIMARY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={cn(linkClass(isActive(link.href)), "inline-flex")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <Wordmark className="md:justify-self-center" />

          <div className="flex items-center justify-end gap-1 md:gap-4 lg:gap-6">
            <button
              type="button"
              aria-label="Search"
              aria-haspopup="dialog"
              aria-expanded={panel === "search"}
              onClick={() => open("search")}
              className="hidden tap items-center justify-center transition-chrome hover:opacity-70 md:inline-flex"
            >
              <Icon name="search" size={18} />
            </button>
            <Link
              href="/saved"
              aria-current={isActive("/saved") ? "page" : undefined}
              className={cn(linkClass(isActive("/saved")), "hidden gap-2 md:inline-flex")}
            >
              Saved
              <SavedCount />
            </Link>
            <Link
              href="/list-your-business"
              className="nav-link hidden tap items-center border border-current px-4 py-2 transition-chrome hover:opacity-70 lg:inline-flex"
            >
              List Your Business
            </Link>
            <button
              type="button"
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-expanded={panel === "menu"}
              onClick={() => open("menu")}
              className="-mr-2 inline-flex tap items-center justify-center md:hidden"
            >
              <Icon name="menu" size={24} />
            </button>
          </div>
        </div>

        <AnimatePresence>{panel === "vendors" && <VendorsPanel categories={categories} onNavigate={close} />}</AnimatePresence>
      </header>

      <SearchOverlay open={panel === "search"} onClose={close} categories={categories} cities={cities} />
      <MobileMenu open={panel === "menu"} onClose={close} onSearch={() => open("search")} categories={categories} />
    </>
  );
}
