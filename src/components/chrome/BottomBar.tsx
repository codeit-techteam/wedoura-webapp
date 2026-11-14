"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SavedCount } from "@/components/chrome/SavedCount";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

const items: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/vendors", label: "Vendors", icon: "grid" },
  { href: "/real-weddings", label: "Real Weddings", icon: "stories" },
  { href: "/saved", label: "Saved", icon: "bookmark" },
];

/** Fixed bottom navigation for phones, with safe-area padding. Hidden from md up. */
export function BottomBar() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <nav
      aria-label="Primary, mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] text-ink md:hidden"
    >
      <ul className="grid grid-cols-4">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href} className="relative">
              {active && <span aria-hidden="true" className="absolute inset-x-4 top-0 h-px bg-ink" />}
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 transition-chrome",
                  active ? "text-ink" : "text-mute",
                )}
              >
                <span className="relative">
                  <Icon name={item.icon} size={22} className={cn(active && "[&_*]:stroke-2")} />
                  {item.href === "/saved" && <SavedCount className="absolute -top-2 -right-3 h-4 min-w-4 bg-white" />}
                </span>
                <span className="text-label uppercase tracking-caps">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
