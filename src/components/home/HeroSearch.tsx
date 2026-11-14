"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";

type Option = { slug: string; name: string };

type Props = {
  cities: Option[];
  categories: Option[];
};

/** The slim where-and-who search bar docked at the bottom of the hero. */
export function HeroSearch({ cities, categories }: Props) {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (category) params.set("category", category);
    const query = params.toString();
    router.push(query ? `/vendors?${query}` : "/vendors");
  }

  const selectClass =
    "tap w-full appearance-none bg-transparent pr-8 text-body text-ink outline-offset-4 cursor-pointer";

  return (
    <form
      onSubmit={onSubmit}
      aria-label="Find vendors"
      className="grid grid-cols-[1fr_1fr_auto] items-stretch divide-x divide-line border border-line bg-white text-ink"
    >
      <label className="relative flex flex-col justify-center gap-1 px-5 py-3 md:px-8">
        <span className="label text-mute">Where</span>
        <select value={city} onChange={(e) => setCity(e.target.value)} className={selectClass}>
          <option value="">Anywhere</option>
          {cities.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" size={16} className="pointer-events-none absolute right-4 bottom-4 text-mute" />
      </label>
      <label className="relative flex flex-col justify-center gap-1 px-5 py-3 md:px-8">
        <span className="label text-mute">Who</span>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
          <option value="">All vendors</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" size={16} className="pointer-events-none absolute right-4 bottom-4 text-mute" />
      </label>
      <button
        type="submit"
        className="tap flex items-center gap-3 bg-ink px-5 text-white transition-chrome hover:bg-black md:px-10"
      >
        <Icon name="search" size={18} />
        <span className="label hidden md:inline">Search</span>
        <span className="sr-only md:hidden">Search</span>
      </button>
    </form>
  );
}
