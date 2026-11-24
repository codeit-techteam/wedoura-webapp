"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { VendorListing } from "@/data/types";
import { cn } from "@/lib/cn";
import { profileNavFor } from "@/lib/studio-profile-nav";

/** Desktop side links + mobile select for Profile sub-pages. */
export function ProfileSubnav({ listing }: { listing: VendorListing }) {
  const pathname = usePathname();
  const router = useRouter();
  const items = profileNavFor(listing);
  const current = items.find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`)) ?? items[0];

  return (
    <div className="mb-8">
      <label className="block md:hidden">
        <span className="sr-only">Profile section</span>
        <select
          className="w-full border-b border-line bg-transparent pb-2 text-[length:var(--text-dash-body)] text-ink"
          value={current?.href ?? ""}
          onChange={(e) => {
            router.push(e.target.value);
          }}
        >
          {items.map((item) => (
            <option key={item.id} value={item.href}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <nav className="hidden flex-wrap gap-1 border-b border-line md:flex" aria-label="Profile sections">
        {items.map((item) => {
          const on = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "min-h-11 px-3 py-2 font-sans text-[length:var(--text-dash-help)] tracking-[0.12em] uppercase",
                on ? "border-b-2 border-ink text-ink" : "text-mute hover:text-ink",
              )}
              aria-current={on ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
