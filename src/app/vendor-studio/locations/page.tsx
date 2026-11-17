"use client";

import { useEffect, useState } from "react";
import { Field, ScreenHeader, StudioCard, inputClass, selectClass } from "@/components/studio/Field";
import { SaveState } from "@/components/studio/autosave";
import { ScreenSkeleton, useListingForm } from "@/components/studio/screen";
import type { City } from "@/data/types";
import { listAllCities } from "@/lib/api";

type Form = { baseCity: string; citiesServed: string[]; travels: string };

export default function LocationsPage() {
  const [cities, setCities] = useState<City[]>([]);
  useEffect(() => {
    void listAllCities().then(setCities);
  }, []);

  const { form, apply, status, error } = useListingForm<Form>((l) => ({
    baseCity: l.baseCity,
    citiesServed: l.citiesServed,
    travels: l.travels ?? "",
  }));
  if (!form || cities.length === 0) return <ScreenSkeleton />;

  const toggleCity = (slug: string) => {
    const next = form.citiesServed.includes(slug)
      ? form.citiesServed.filter((c) => c !== slug)
      : [...form.citiesServed, slug];
    apply({ citiesServed: next }, { citiesServed: next });
  };

  return (
    <div className="max-w-2xl">
      <ScreenHeader
        title="Locations"
        text="Where you are based, the cities you serve and how far you travel."
        right={<SaveState status={status} error={error} />}
      />
      <div className="mt-8 grid gap-6">
        <StudioCard title="Home base">
        <Field id="lo-base" label="Base city">
          <select
            id="lo-base"
            value={form.baseCity}
            onChange={(e) => apply({ baseCity: e.target.value }, { baseCity: e.target.value })}
            className={selectClass}
          >
            {cities.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}
              </option>
            ))}
          </select>
        </Field>
        </StudioCard>
        <StudioCard title="Where you work">
        <div className="grid gap-6">
        <Field id="lo-served" label="Cities served" hint="Couples filtering by these cities will find you.">
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {cities.map((city) => (
              <li key={city.slug}>
                <label className="tap flex cursor-pointer items-center gap-2.5 border border-line bg-white px-3 py-2.5 text-small transition-chrome has-checked:border-ink">
                  <input
                    type="checkbox"
                    checked={form.citiesServed.includes(city.slug)}
                    onChange={() => toggleCity(city.slug)}
                    className="size-4 accent-ink"
                  />
                  {city.name}
                </label>
              </li>
            ))}
          </ul>
        </Field>
        <Field id="lo-travels" label="Travels" hint="Free text, e.g. “Across India”. Leave empty if you do not travel.">
          <input
            id="lo-travels"
            type="text"
            value={form.travels}
            onChange={(e) => apply({ travels: e.target.value }, { travels: e.target.value.trim() || undefined })}
            className={inputClass}
          />
        </Field>
        </div>
        </StudioCard>
      </div>
    </div>
  );
}
