"use client";

import { useEffect, useState } from "react";
import { CategoryFieldInput } from "@/components/studio/CategoryFieldInput";
import { Field, inputClass, selectClass } from "@/components/studio/Field";
import { SectionCard } from "@/components/studio/SectionCard";
import { ScreenSkeleton, TagListInput, useListingForm } from "@/components/studio/screen";
import type { Category, CategorySlug, City } from "@/data/types";
import { listAllCategories, listAllCities } from "@/lib/api";
import { publicProfileHref } from "@/lib/studio-profile-nav";
import { submitListingForReview } from "@/lib/vendor-api";

type Form = {
  name: string;
  tagline: string;
  team: string;
  yearsActive: string;
  category: CategorySlug;
  services: string[];
  styles: string[];
  categoryValues: Record<string, string | string[] | number | boolean>;
  baseCity: string;
  citiesServed: string[];
  travels: string;
};

export default function ProfileBusinessPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([listAllCategories(), listAllCities()]).then(([cats, cts]) => {
      setCategories(cats);
      setCities(cts);
    });
  }, []);

  const { listing, form, apply } = useListingForm<Form>((l) => ({
    name: l.name,
    tagline: l.tagline,
    team: l.team ?? "",
    yearsActive: l.yearsActive ? String(l.yearsActive) : "",
    category: l.category,
    services: l.services,
    styles: l.styles,
    categoryValues: l.categoryValues,
    baseCity: l.baseCity,
    citiesServed: l.citiesServed,
    travels: l.travels ?? "",
  }));

  if (!form || !listing || categories.length === 0 || cities.length === 0) return <ScreenSkeleton />;

  const active = categories.find((c) => c.slug === form.category);
  const profileBase = publicProfileHref(listing);

  const setValue = (key: string, value: string | string[] | number | boolean | undefined) => {
    const categoryValues = { ...form.categoryValues };
    if (value === undefined || value === "") delete categoryValues[key];
    else categoryValues[key] = value;
    apply({ categoryValues }, { categoryValues });
  };

  return (
    <div className="grid gap-8">
      <SectionCard
        title="Basics"
        help="Name, tagline and at-a-glance facts in the hero and key facts row."
        shownOnProfile={Boolean(listing.name.trim() && listing.tagline.trim())}
        seeOnProfileHref={profileBase}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Field id="pf-name" label="Business name">
            <input
              id="pf-name"
              className={inputClass}
              value={form.name}
              onChange={(e) => apply({ name: e.target.value }, { name: e.target.value.trim() || form.name })}
            />
          </Field>
          <Field id="pf-tag" label="Tagline">
            <input
              id="pf-tag"
              className={inputClass}
              value={form.tagline}
              onChange={(e) => apply({ tagline: e.target.value }, { tagline: e.target.value.trim() })}
            />
          </Field>
          <Field id="pf-team" label="Team">
            <input
              id="pf-team"
              className={inputClass}
              value={form.team}
              onChange={(e) => apply({ team: e.target.value }, { team: e.target.value.trim() || undefined })}
            />
          </Field>
          <Field id="pf-years" label="Years active">
            <input
              id="pf-years"
              className={inputClass}
              inputMode="numeric"
              value={form.yearsActive}
              onChange={(e) => {
                const yearsActive = e.target.value;
                apply(
                  { yearsActive },
                  { yearsActive: /^\d+$/.test(yearsActive) ? Number(yearsActive) : undefined },
                );
              }}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard
        title="Category and services"
        help="How couples find you in search and the chips on your About section."
        shownOnProfile={form.services.length > 0 || form.styles.length > 0}
        seeOnProfileHref={publicProfileHref(listing, "about")}
      >
        <div className="grid gap-6">
          <Field id="pf-cat" label="Main category">
            <select
              id="pf-cat"
              className={selectClass}
              value={form.category}
              onChange={(e) => {
                const category = e.target.value as CategorySlug;
                apply({ category, categoryValues: {} }, { category, categoryValues: {} });
              }}
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field id="pf-services" label="Services">
            <TagListInput
              id="pf-services"
              values={form.services}
              onChange={(services) => apply({ services }, { services })}
              placeholder="e.g. Wedding photography"
            />
          </Field>
          <Field id="pf-styles" label="Styles">
            <TagListInput
              id="pf-styles"
              values={form.styles}
              onChange={(styles) => apply({ styles }, { styles })}
              placeholder="e.g. Editorial"
            />
          </Field>
          {active?.fields.map((field) => (
            <CategoryFieldInput
              key={field.key}
              field={field}
              value={form.categoryValues[field.key]}
              onChange={(v) => setValue(field.key, v)}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Locations"
        help="Base city, travel line and extra cities for filters."
        shownOnProfile={Boolean(listing.baseCity && (listing.travels || listing.citiesServed.length > 0))}
        seeOnProfileHref={profileBase}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Field id="pf-city" label="Base city">
            <select
              id="pf-city"
              className={selectClass}
              value={form.baseCity}
              onChange={(e) => apply({ baseCity: e.target.value }, { baseCity: e.target.value })}
            >
              {cities.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field id="pf-travels" label="Travels">
            <input
              id="pf-travels"
              className={inputClass}
              value={form.travels}
              onChange={(e) => apply({ travels: e.target.value }, { travels: e.target.value.trim() || undefined })}
              placeholder="Across India"
            />
          </Field>
        </div>
        <Field id="pf-served" label="Also serves" hint="City slugs couples can filter by.">
          <TagListInput
            id="pf-served"
            values={form.citiesServed}
            onChange={(citiesServed) => apply({ citiesServed }, { citiesServed })}
            placeholder="e.g. mumbai"
          />
        </Field>
      </SectionCard>

      <section className="studio-card bg-sand/50">
        <h2 className="studio-section-title">Submit for review</h2>
        <p className="mt-2 max-w-prose text-[length:var(--text-dash-body)] text-mute">
          When your profile feels ready, send it to Wedoura. Photos and films you add while published wait for
          approval.
        </p>
        <button
          type="button"
          className="mt-6 min-h-12 bg-ink px-6 font-sans text-button font-medium tracking-button text-ivory uppercase disabled:opacity-40"
          disabled={listing.status !== "draft" && listing.status !== "changes_requested"}
          onClick={async () => {
            const result = await submitListingForReview();
            setSubmitMsg(result.ok ? "Submitted for review." : result.error);
          }}
        >
          Submit for review
        </button>
        {submitMsg ? (
          <p className="mt-3 text-small" role="status">
            {submitMsg}
          </p>
        ) : null}
      </section>
    </div>
  );
}