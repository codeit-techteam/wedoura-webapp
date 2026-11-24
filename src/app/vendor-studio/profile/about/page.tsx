"use client";

import { Field, inputClass } from "@/components/studio/Field";
import { SectionCard } from "@/components/studio/SectionCard";
import { ScreenSkeleton, useListingForm } from "@/components/studio/screen";
import type { FounderProfile } from "@/data/types";
import { publicProfileHref } from "@/lib/studio-profile-nav";

type Form = {
  about: string;
  founderCaption: string;
  founderName: string;
  founderAbout: string;
  founderYoutube: string;
};

export default function ProfileAboutPage() {
  const { listing, form, apply } = useListingForm<Form>((l) => ({
    about: l.about.join("\n\n"),
    founderCaption: l.founder?.caption ?? "",
    founderName: l.founder?.name ?? "",
    founderAbout: (l.founder?.about ?? []).join("\n\n"),
    founderYoutube: l.founder?.youtubeUrl ?? "",
  }));

  function saveFounder(patch: Partial<Form>) {
    if (!form || !listing) return;
    const next = { ...form, ...patch };
    const caption = next.founderCaption.trim();
    const about = next.founderAbout
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    const existing = listing.founder;
    if (!caption && !next.founderName.trim() && about.length === 0 && !next.founderYoutube.trim()) {
      apply(
        { founderCaption: "", founderName: "", founderAbout: "", founderYoutube: "" },
        { founder: undefined },
      );
      return;
    }
    if (!existing?.poster && !listing.cover && listing.portfolio.length === 0) {
      return;
    }
    const founder: FounderProfile = {
      caption: caption || "About the founder",
      name: next.founderName.trim() || undefined,
      about: about.length ? about : undefined,
      youtubeUrl: next.founderYoutube.trim() || undefined,
      poster: existing?.poster ?? listing.cover ?? listing.portfolio[0],
      previewSrc: existing?.previewSrc,
    };
    apply(
      {
        founderCaption: next.founderCaption,
        founderName: next.founderName,
        founderAbout: next.founderAbout,
        founderYoutube: next.founderYoutube,
      },
      { founder },
    );
  }

  if (!form || !listing) return <ScreenSkeleton />;

  return (
    <div className="grid gap-8">
      <SectionCard
        title="About"
        help="Studio story paragraphs on your public profile."
        shownOnProfile={listing.about.length > 0}
        seeOnProfileHref={publicProfileHref(listing, "about")}
      >
        <Field id="pf-about" label="About text" hint="A blank line starts a new paragraph.">
          <textarea
            id="pf-about"
            rows={7}
            className={inputClass + " mt-3 resize-y"}
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
          />
        </Field>
      </SectionCard>

      <SectionCard
        title="About the founder"
        help="Shows under Voices. Uses your cover as the poster until you set one in Photos and videos."
        shownOnProfile={Boolean(listing.founder)}
        seeOnProfileHref={publicProfileHref(listing, "founder")}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Field id="pf-founder-caption" label="Caption">
            <input
              id="pf-founder-caption"
              className={inputClass}
              value={form.founderCaption}
              placeholder="Hello from behind the camera"
              onChange={(e) => saveFounder({ founderCaption: e.target.value })}
            />
          </Field>
          <Field id="pf-founder-name" label="Name (optional)">
            <input
              id="pf-founder-name"
              className={inputClass}
              value={form.founderName}
              onChange={(e) => saveFounder({ founderName: e.target.value })}
            />
          </Field>
          <Field id="pf-founder-yt" label="YouTube link (optional)">
            <input
              id="pf-founder-yt"
              className={inputClass}
              value={form.founderYoutube}
              placeholder="https://"
              onChange={(e) => saveFounder({ founderYoutube: e.target.value })}
            />
          </Field>
        </div>
        <Field id="pf-founder-about" label="About paragraphs" hint="A blank line starts a new paragraph.">
          <textarea
            id="pf-founder-about"
            rows={5}
            className={inputClass + " mt-3 resize-y"}
            value={form.founderAbout}
            onChange={(e) => saveFounder({ founderAbout: e.target.value })}
          />
        </Field>
      </SectionCard>
    </div>
  );
}