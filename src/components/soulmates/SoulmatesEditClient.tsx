"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  IdentityDocumentFields,
  type IdentityDraft,
} from "@/components/profile/IdentityDocumentFields";
import { SoulmatesAuthGate } from "@/components/soulmates/SoulmatesAuthGate";
import {
  CITIES,
  EDUCATION,
  heightOptions,
  INCOME,
  LANGUAGES,
  MARITAL,
  PREF_CITIES,
  VALUES,
} from "@/components/soulmates/soulmates-create-constants";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import type {
  SoulmateGender,
  SoulmateMaritalStatus,
  SoulmatePhoto,
  SoulmateProfile,
} from "@/data/types";
import {
  buildSoulmateDocument,
  editRequiresReview,
  updateMySoulmateProfile,
  uploadSoulmatePhoto,
  useMySoulmateProfile,
} from "@/lib/soulmates-api";

const HEIGHTS = heightOptions();

const EMPTY_ID: IdentityDraft = {
  type: "masked_aadhaar",
  front: null,
  back: null,
  consent: false,
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line pt-10">
      <h2 className="font-serif text-[1.85rem] text-ink">{title}</h2>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block border-b border-line py-3">
      <span className="block font-sans text-[11px] font-medium tracking-[0.24em] text-gold-deep uppercase">
        {label}
        {hint ? (
          <small className="ml-2 font-normal tracking-normal text-[#8C857A] normal-case">{hint}</small>
        ) : null}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full border-0 bg-transparent py-2 font-sans text-[17px] text-ink outline-none";

function EditFormInner({ profile }: { profile: SoulmateProfile }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(profile.basics.firstName);
  const [lastName, setLastName] = useState(profile.basics.lastName);
  const [gender, setGender] = useState<SoulmateGender>(profile.basics.gender);
  const [dob, setDob] = useState(profile.basics.dateOfBirth);
  const [heightCm, setHeightCm] = useState(profile.basics.heightCm);
  const [maritalStatus, setMaritalStatus] = useState<SoulmateMaritalStatus>(
    profile.basics.maritalStatus,
  );
  const [city, setCity] = useState(profile.basics.city);
  const [community, setCommunity] = useState(profile.basics.community ?? "");
  const [languages, setLanguages] = useState<string[]>(profile.basics.languages);
  const [education, setEducation] = useState(profile.work.education);
  const [fieldOfStudy, setFieldOfStudy] = useState(profile.work.fieldOfStudy);
  const [profession, setProfession] = useState(profile.work.profession);
  const [organisation, setOrganisation] = useState(profile.work.organisation);
  const [incomeBand, setIncomeBand] = useState(profile.work.incomeBand ?? "");
  const [incomePrivate, setIncomePrivate] = useState(profile.work.incomePrivate);
  const [about, setAbout] = useState(profile.about.text);
  const [familyType, setFamilyType] = useState(profile.about.familyType);
  const [familyOutlook, setFamilyOutlook] = useState(profile.about.familyOutlook);
  const [familyCanJoin, setFamilyCanJoin] = useState(profile.about.familyCanJoin);
  const [ageMin, setAgeMin] = useState(profile.preferences.ageMin);
  const [ageMax, setAgeMax] = useState(profile.preferences.ageMax);
  const [locations, setLocations] = useState<string[]>(profile.preferences.locations);
  const [values, setValues] = useState<string[]>(profile.preferences.values);
  const [wish, setWish] = useState(profile.preferences.note ?? "");
  const [photos, setPhotos] = useState<SoulmatePhoto[]>(profile.photos);
  const [photoVisibility, setPhotoVisibility] = useState<"mutual" | "verified">(
    profile.photoVisibility,
  );
  const [phone, setPhone] = useState(profile.phone);
  const [identity, setIdentity] = useState<IdentityDraft>(EMPTY_ID);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmReview, setConfirmReview] = useState(false);

  const draftInput = useMemo(() => {
    return {
      createdFor: profile.createdFor,
      creator: profile.creator,
      personConsents: profile.personConsents,
      basics: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        dateOfBirth: dob,
        heightCm,
        maritalStatus,
        city,
        community: community.trim() || undefined,
        languages,
      },
      work: {
        education,
        fieldOfStudy: fieldOfStudy.trim(),
        profession: profession.trim(),
        organisation: organisation.trim(),
        incomeBand: incomeBand || undefined,
        incomePrivate,
      },
      about: {
        text: about.trim(),
        familyType,
        familyOutlook,
        familyCanJoin,
      },
      preferences: {
        ageMin,
        ageMax,
        locations,
        values,
        note: wish.trim() || undefined,
      },
      photos,
      photoVisibility,
      phone,
      identityDocument: profile.identityDocument,
    };
  }, [
    profile,
    firstName,
    lastName,
    gender,
    dob,
    heightCm,
    maritalStatus,
    city,
    community,
    languages,
    education,
    fieldOfStudy,
    profession,
    organisation,
    incomeBand,
    incomePrivate,
    about,
    familyType,
    familyOutlook,
    familyCanJoin,
    ageMin,
    ageMax,
    locations,
    values,
    wish,
    photos,
    photoVisibility,
    phone,
  ]);

  async function save(forceReview: boolean) {
    setBusy(true);
    setMessage("");
    let identityDocument = draftInput.identityDocument;
    if (identity.front && identity.consentAt) {
      identityDocument = await buildSoulmateDocument({
        profileId: profile.id,
        type: identity.type,
        front: identity.front,
        back: identity.back,
        consentAt: identity.consentAt,
      });
    }
    const input = { ...draftInput, identityDocument };
    const needsReview =
      forceReview ||
      editRequiresReview(profile, {
        basics: input.basics,
        photos: input.photos,
        identityDocument: input.identityDocument,
      }) ||
      Boolean(identity.front);
    const wasLive =
      profile.status === "live" || profile.status === "paused" || profile.status === "hidden";
    if (needsReview && wasLive && !forceReview) {
      setBusy(false);
      setConfirmReview(true);
      return;
    }
    const result = await updateMySoulmateProfile(input, {
      sendToReview: needsReview && (wasLive || profile.status === "changes_requested"),
    });
    setBusy(false);
    setConfirmReview(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage(
      result.value.status === "in_review"
        ? "Saved. Your profile is back with our team for review."
        : "Saved.",
    );
    if (result.value.status === "in_review") {
      window.setTimeout(() => router.push("/soulmates/me"), 900);
    }
  }

  function toggle(list: string[], value: string, set: (v: string[]) => void) {
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  return (
    <main className="bg-ivory pb-32">
      <Container className="max-w-3xl pt-8 md:pt-12">
        <Link
          href="/soulmates/me"
          className="inline-flex min-h-11 items-center font-sans text-[11.5px] font-medium tracking-[0.22em] text-mute uppercase"
        >
          ← Soulmates
        </Link>
        <Label className="mt-8 block">Edit profile</Label>
        <h1 className="mt-3 font-serif text-h2 text-ink">Your details</h1>
        <p className="mt-3 text-body text-mute">
          Changing photos, name, date of birth or your identity document sends the profile back for
          review.
        </p>

        <Section title="I · Who it’s for">
          <p className="text-body text-mute">
            Created for: <span className="text-ink">{profile.createdFor.replaceAll("_", " ")}</span>
          </p>
          {profile.createdFor !== "myself" ? (
            <p className="text-body text-mute">
              Creator: {profile.creator.name} · {profile.creator.whatsapp}
            </p>
          ) : null}
        </Section>

        <Section title="II · The basics">
          <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-8">
            <Field label="First name">
              <input className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </Field>
            <Field label="Last name" hint="shown as an initial">
              <input className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </Field>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["woman", "man"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`min-h-11 border px-4 font-sans text-[15px] ${
                  gender === g ? "border-ink bg-ink text-ivory" : "border-line bg-white"
                }`}
              >
                {g === "woman" ? "Woman" : "Man"}
              </button>
            ))}
          </div>
          <Field label="Date of birth">
            <input className={inputClass} type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
          </Field>
          <div className="grid sm:grid-cols-2 sm:gap-x-8">
            <Field label="Height">
              <select className={inputClass} value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))}>
                {HEIGHTS.map((h) => (
                  <option key={h.cm} value={h.cm}>
                    {h.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Marital status">
              <select
                className={inputClass}
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value as SoulmateMaritalStatus)}
              >
                {MARITAL.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 sm:gap-x-8">
            <Field label="City">
              <select className={inputClass} value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">Choose a city</option>
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Community" hint="optional">
              <input className={inputClass} value={community} onChange={(e) => setCommunity(e.target.value)} />
            </Field>
          </div>
          <div>
            <p className="font-sans text-[11px] font-medium tracking-[0.24em] text-gold-deep uppercase">
              Languages
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggle(languages, lang, setLanguages)}
                  className={`min-h-11 border px-4 font-sans text-[14px] ${
                    languages.includes(lang) ? "border-ink bg-ink text-ivory" : "border-line bg-white"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </Section>

        <Section title="III · Education & work">
          <div className="grid sm:grid-cols-2 sm:gap-x-8">
            <Field label="Highest education">
              <select className={inputClass} value={education} onChange={(e) => setEducation(e.target.value)}>
                <option value="">Choose one</option>
                {EDUCATION.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
            </Field>
            <Field label="Field of study">
              <input className={inputClass} value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)} />
            </Field>
            <Field label="Profession">
              <input className={inputClass} value={profession} onChange={(e) => setProfession(e.target.value)} />
            </Field>
            <Field label="Organisation" hint="private">
              <input className={inputClass} value={organisation} onChange={(e) => setOrganisation(e.target.value)} />
            </Field>
          </div>
          <Field label="Annual income" hint="optional">
            <select className={inputClass} value={incomeBand} onChange={(e) => setIncomeBand(e.target.value)}>
              <option value="">Prefer not to say</option>
              {INCOME.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </Field>
          <label className="flex items-center justify-between gap-4 py-3">
            <span className="font-serif text-[1.25rem] text-ink">Keep income private</span>
            <input
              type="checkbox"
              checked={incomePrivate}
              onChange={(e) => setIncomePrivate(e.target.checked)}
            />
          </label>
        </Section>

        <Section title="IV · About">
          <Field label="About you">
            <textarea
              className={`${inputClass} min-h-[140px]`}
              maxLength={600}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />
          </Field>
          <div className="grid sm:grid-cols-2 sm:gap-x-8">
            <Field label="Family type">
              <select className={inputClass} value={familyType} onChange={(e) => setFamilyType(e.target.value)}>
                <option>Nuclear family</option>
                <option>Joint family</option>
                <option>Prefer to explain later</option>
              </select>
            </Field>
            <Field label="Family outlook">
              <select className={inputClass} value={familyOutlook} onChange={(e) => setFamilyOutlook(e.target.value)}>
                <option>Traditional</option>
                <option>Moderate</option>
                <option>Liberal</option>
              </select>
            </Field>
          </div>
          <label className="flex items-center justify-between gap-4 py-3">
            <span className="font-serif text-[1.25rem] text-ink">Family can join conversations</span>
            <input
              type="checkbox"
              checked={familyCanJoin}
              onChange={(e) => setFamilyCanJoin(e.target.checked)}
            />
          </label>
        </Section>

        <Section title="V · Looking for">
          <div className="grid sm:grid-cols-2 sm:gap-x-8">
            <Field label="Age from">
              <select className={inputClass} value={ageMin} onChange={(e) => setAgeMin(Number(e.target.value))}>
                {Array.from({ length: 43 }, (_, i) => 18 + i).map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Age to">
              <select className={inputClass} value={ageMax} onChange={(e) => setAgeMax(Number(e.target.value))}>
                {Array.from({ length: 43 }, (_, i) => 18 + i).map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div>
            <p className="font-sans text-[11px] font-medium tracking-[0.24em] text-gold-deep uppercase">
              Where they live
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PREF_CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggle(locations, c, setLocations)}
                  className={`min-h-11 border px-4 font-sans text-[14px] ${
                    locations.includes(c) ? "border-ink bg-ink text-ivory" : "border-line bg-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-sans text-[11px] font-medium tracking-[0.24em] text-gold-deep uppercase">
              What matters most
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {VALUES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => toggle(values, v, setValues)}
                  className={`min-h-11 border px-4 font-sans text-[14px] ${
                    values.includes(v) ? "border-ink bg-ink text-ivory" : "border-line bg-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <Field label="Anything else" hint="optional">
            <textarea className={`${inputClass} min-h-[100px]`} value={wish} onChange={(e) => setWish(e.target.value)} />
          </Field>
        </Section>

        <Section title="VI · Photos & privacy">
          <p className="text-[15px] text-mute">{photos.length} photo(s). First is main. New uploads need team approval.</p>
          <label className="mt-4 flex min-h-[120px] cursor-pointer flex-col items-center justify-center border border-dashed border-[#bfb5a3] bg-white p-6">
            <span className="font-serif text-[1.4rem] text-ink">Add photos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={async (e) => {
                const files = Array.from(e.target.files ?? []);
                e.target.value = "";
                const room = 6 - photos.length;
                const next: SoulmatePhoto[] = [];
                for (let i = 0; i < Math.min(files.length, room); i++) {
                  next.push(await uploadSoulmatePhoto(files[i]!, photos.length + i));
                }
                setPhotos([...photos, ...next]);
              }}
            />
          </label>
          <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-6">
            {photos.map((p, i) => (
              <div key={p.id} className="relative aspect-[4/5] bg-sand">
                <button
                  type="button"
                  className="absolute top-1 right-1 z-[1] size-8 rounded-full bg-ink/70 text-white"
                  onClick={() => setPhotos(photos.filter((x) => x.id !== p.id))}
                >
                  ×
                </button>
                {i === 0 ? (
                  <span className="absolute bottom-0 left-0 bg-white px-2 py-1 font-sans text-[10px] tracking-[0.16em] text-gold-deep uppercase">
                    Main
                  </span>
                ) : null}
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["mutual", "After mutual interest"],
                ["verified", "Verified members"],
              ] as const
            ).map(([v, label]) => (
              <label key={v} className={`border p-4 ${photoVisibility === v ? "border-ink bg-sand" : "border-line"}`}>
                <input
                  type="radio"
                  className="sr-only"
                  checked={photoVisibility === v}
                  onChange={() => setPhotoVisibility(v)}
                />
                <span className="font-serif text-[1.2rem]">{label}</span>
              </label>
            ))}
          </div>
          <Field label="Mobile number" hint="team only">
            <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <div>
            <p className="mb-3 font-sans text-[11px] font-medium tracking-[0.24em] text-gold-deep uppercase">
              Replace identity document
            </p>
            <IdentityDocumentFields value={identity} onChange={setIdentity} />
          </div>
        </Section>

        {message ? <p className="mt-8 text-body text-mute">{message}</p> : null}
      </Container>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ivory/96 px-4 py-3 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link href="/soulmates/me" className="font-sans text-[12px] tracking-[0.2em] text-mute uppercase">
            Cancel
          </Link>
          <button
            type="button"
            disabled={busy}
            onClick={() => void save(false)}
            className="inline-flex min-h-12 items-center border border-ink bg-ink px-8 font-sans text-[12px] font-medium tracking-[0.24em] text-ivory uppercase disabled:opacity-40"
          >
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {confirmReview ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-4 md:items-center">
          <div className="w-full max-w-md border border-line bg-ivory p-6" role="dialog" aria-modal="true">
            <h2 className="font-serif text-h3 text-ink">Send for review again?</h2>
            <p className="mt-3 text-[16px] text-mute">
              You changed photos, name, date of birth or your identity document. Your profile will
              leave Live until our team checks it again.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="min-h-11 flex-1 border border-ink bg-ink font-sans text-[11.5px] font-medium tracking-[0.22em] text-ivory uppercase"
                onClick={() => void save(true)}
              >
                Save &amp; send for review
              </button>
              <button
                type="button"
                className="min-h-11 px-4 font-sans text-[11.5px] tracking-[0.2em] uppercase"
                onClick={() => setConfirmReview(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function EditForm() {
  const profile = useMySoulmateProfile();
  if (!profile) {
    return (
      <main className="bg-ivory pb-section-sm">
        <Container className="pt-12">
          <p className="text-body text-mute">No profile yet.</p>
          <Link href="/soulmates/create" className="mt-4 inline-block border-b border-gold pb-1">
            Create a profile
          </Link>
        </Container>
      </main>
    );
  }
  return <EditFormInner key={profile.id + profile.updatedAt} profile={profile} />;
}

export function SoulmatesEditClient() {
  return (
    <SoulmatesAuthGate next="/soulmates/me/edit">
      <EditForm />
    </SoulmatesAuthGate>
  );
}
