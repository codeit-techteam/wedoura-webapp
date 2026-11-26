"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AccountNav } from "@/components/chrome/AccountNav";
import { MobileMenu } from "@/components/chrome/MobileMenu";
import { NAV_LEFT, NAV_LIST, NAV_RIGHT } from "@/components/chrome/nav";
import { SearchOverlay } from "@/components/chrome/SearchOverlay";
import { Wordmark } from "@/components/chrome/Wordmark";
import { Icon } from "@/components/ui/Icon";
import type { Category, City } from "@/data/types";

export type NavCategory = Pick<Category, "slug" | "name" | "shortName" | "cover">;
export type NavCity = Pick<City, "slug" | "name">;

type Props = { categories: NavCategory[]; cities: NavCity[] };

const linkClass =
  "whitespace-nowrap font-sans text-button font-medium tracking-nav text-inherit uppercase hover:text-gold-deep";

/**
 * Split header: links, the centred Bodoni wordmark, links. Ivory, and
 * transparent with white text over a `data-nav-dark` hero until scroll.
 * Desktop chrome from lg (1024px) so 100% / 110% zoom on laptops keeps
 * the split nav; below that the hamburger and search open.
 */
export function Navbar({ categories, cities }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);

  const closeMenu = useCallback(() => setMenu(false), []);
  const closeSearch = useCallback(() => setSearch(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menu && !search) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setMenu(false);
      setSearch(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menu, search]);

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <>
      <header
        data-scrolled={scrolled}
        data-open={menu || search}
        className="site-nav sticky top-0 z-40 grid h-nav grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2 border-b border-line bg-ivory/92 px-3 text-ink backdrop-blur-md lg:grid-cols-[1fr_auto_1fr] lg:gap-3 lg:px-[2vw] xl:gap-5 xl:px-[3vw]"
      >
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={menu}
          aria-controls="site-menu"
          onClick={() => setMenu(true)}
          className="flex h-11 w-11 flex-col items-start justify-center gap-1.5 pl-2.5 lg:hidden"
        >
          <span className="block h-px w-[22px] bg-current" />
          <span className="block h-px w-3.5 bg-current" />
        </button>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-[clamp(0.625rem,1.2vw,1.875rem)]">
            {NAV_LEFT.map((item) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Wordmark className="justify-self-center" />

        <nav aria-label="Primary, continued" className="hidden justify-self-end lg:block">
          <ul className="flex items-center justify-end gap-[clamp(0.625rem,1.2vw,1.875rem)]">
            {NAV_RIGHT.map((item) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <AccountNav />
            </li>
            <li>
              <Link
                href={NAV_LIST.href}
                className="inline-flex min-h-11 items-center whitespace-nowrap border border-ink bg-ink px-4 font-sans text-button font-medium tracking-button text-ivory uppercase hover:border-gold-deep hover:bg-gold-deep xl:px-5"
              >
                {NAV_LIST.label}
              </Link>
            </li>
          </ul>
        </nav>

        <button
          type="button"
          aria-label="Search vendors"
          aria-expanded={search}
          onClick={() => setSearch(true)}
          className="flex h-11 w-11 items-center justify-center justify-self-end lg:hidden"
        >
          <Icon name="search" size={22} />
        </button>
      </header>

      <MobileMenu open={menu} onClose={closeMenu} />
      <SearchOverlay open={search} onClose={closeSearch} categories={categories} cities={cities} />
    </>
  );
}
