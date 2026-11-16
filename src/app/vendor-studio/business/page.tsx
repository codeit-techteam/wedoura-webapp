"use client";

import { Field, ScreenHeader, inputClass } from "@/components/studio/Field";
import { SaveState } from "@/components/studio/autosave";
import { ScreenSkeleton, useListingForm } from "@/components/studio/screen";

type Form = {
  name: string;
  tagline: string;
  about: string;
  team: string;
  yearsActive: string;
};

export default function BusinessPage() {
  const { form, apply, status, error } = useListingForm<Form>((l) => ({
    name: l.name,
    tagline: l.tagline,
    about: l.about.join("\n\n"),
    team: l.team ?? "",
    yearsActive: l.yearsActive ? String(l.yearsActive) : "",
  }));
  if (!form) return <ScreenSkeleton />;

  return (
    <div className="max-w-2xl">
      <ScreenHeader
        title="Business details"
        text="The name, the one-line tagline and the about text couples read on your profile."
        right={<SaveState status={status} error={error} />}
      />
      <div className="mt-8 grid gap-7">
        <Field id="bd-name" label="Business name" error={form.name.trim() ? undefined : "The name cannot be empty."}>
          <input
            id="bd-name"
            type="text"
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              apply({ name }, name.trim() ? { name: name.trim() } : {});
            }}
            className={inputClass}
          />
        </Field>
        <Field id="bd-tagline" label="Tagline" hint="One line under your name, e.g. “Quiet, editorial wedding photography”.">
          <input
            id="bd-tagline"
            type="text"
            value={form.tagline}
            onChange={(e) => apply({ tagline: e.target.value }, { tagline: e.target.value.trim() })}
            className={inputClass}
          />
        </Field>
        <Field id="bd-about" label="About" hint="A blank line starts a new paragraph.">
          <textarea
            id="bd-about"
            rows={7}
            value={form.about}
            onChange={(e) =>
              apply(
                { about: e.target.value },
                {
                  about: e.target.value
                    .split(/\n\s*\n/)
                    .map((p) => p.trim())
                    .filter(Boolean),
                },
              )
            }
            className={inputClass + " resize-y"}
          />
        </Field>
        <div className="grid gap-7 sm:grid-cols-2">
          <Field id="bd-team" label="Team" hint="E.g. “Two photographers”.">
            <input
              id="bd-team"
              type="text"
              value={form.team}
              onChange={(e) => apply({ team: e.target.value }, { team: e.target.value.trim() || undefined })}
              className={inputClass}
            />
          </Field>
          <Field
            id="bd-years"
            label="Years active"
            error={form.yearsActive && !/^\d{1,2}$/.test(form.yearsActive) ? "A number of years, e.g. 8." : undefined}
          >
            <input
              id="bd-years"
              type="text"
              inputMode="numeric"
              value={form.yearsActive}
              onChange={(e) => {
                const value = e.target.value;
                apply(
                  { yearsActive: value },
                  /^\d{1,2}$/.test(value) ? { yearsActive: Number(value) } : value === "" ? { yearsActive: undefined } : {},
                );
              }}
              className={inputClass}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}
