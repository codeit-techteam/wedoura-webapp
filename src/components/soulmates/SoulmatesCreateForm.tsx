"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  IdentityDocumentFields,
  type IdentityDraft,
} from "@/components/profile/IdentityDocumentFields";
import type {
  SoulmateCreatedFor,
  SoulmateGender,
  SoulmateMaritalStatus,
  SoulmatePhoto,
  SoulmatePhotoVisibility,
  SoulmateProfile,
} from "@/data/types";
import {
  coupleLogin,
  coupleLoginWithGoogle,
  useCoupleAccount,
  useCoupleHydrated,
} from "@/lib/couple-auth";
import { getDocumentObjectUrl } from "@/lib/document-store";
import { idTypeNeedsBack } from "@/lib/identity-document";
import {
  ageFromDob,
  buildSoulmateDocument,
  getMySoulmateProfile,
  saveMySoulmateProfile,
  submitMySoulmateProfile,
  uploadSoulmatePhoto,
} from "@/lib/soulmates-api";
import {
  CITIES,
  EDUCATION,
  FOR_OPTIONS,
  forLabel,
  forRelation,
  heightOptions,
  INCOME,
  LANGUAGES,
  MARITAL,
  MONTHS,
  PREF_CITIES,
  PROMPTS,
  ROMAN,
  STEP_CAPS,
  STEP_IMAGES,
  STEP_NAMES,
  STEP_SHORT,
  STEPS,
  TINTS,
  VALUES,
} from "./soulmates-create-constants";
import "@/styles/soulmates-create.css";

type PhotoDraft = SoulmatePhoto & { previewUrl?: string };

type FormState = {
  createdFor: SoulmateCreatedFor | "";
  creatorName: string;
  creatorWhatsapp: string;
  consent: boolean;
  accountEmail: string;
  accountPassword: string;
  firstName: string;
  lastName: string;
  gender: SoulmateGender | "";
  dobD: string;
  dobM: string;
  dobY: string;
  heightCm: number;
  maritalStatus: SoulmateMaritalStatus;
  city: string;
  community: string;
  languages: string[];
  education: string;
  fieldOfStudy: string;
  profession: string;
  organisation: string;
  incomeBand: string;
  incomePrivate: boolean;
  about: string;
  familyType: string;
  familyOutlook: string;
  familyCanJoin: boolean;
  ageMin: number;
  ageMax: number;
  locations: string[];
  values: string[];
  wish: string;
  photos: PhotoDraft[];
  photoVisibility: SoulmatePhotoVisibility;
  phone: string;
  identity: IdentityDraft;
  terms: boolean;
};

const EMPTY_IDENTITY: IdentityDraft = {
  type: "masked_aadhaar",
  front: null,
  back: null,
  consent: false,
};

const HEIGHTS = heightOptions();

function emptyForm(): FormState {
  return {
    createdFor: "",
    creatorName: "",
    creatorWhatsapp: "",
    consent: false,
    accountEmail: "",
    accountPassword: "",
    firstName: "",
    lastName: "",
    gender: "",
    dobD: "",
    dobM: "",
    dobY: "",
    heightCm: 163,
    maritalStatus: "Never married",
    city: "",
    community: "",
    languages: [],
    education: "",
    fieldOfStudy: "",
    profession: "",
    organisation: "",
    incomeBand: "",
    incomePrivate: true,
    about: "",
    familyType: "Nuclear family",
    familyOutlook: "Moderate",
    familyCanJoin: true,
    ageMin: 25,
    ageMax: 32,
    locations: [],
    values: [],
    wish: "",
    photos: [],
    photoVisibility: "mutual",
    phone: "",
    identity: EMPTY_IDENTITY,
    terms: false,
  };
}

function dobFromParts(d: string, m: string, y: string): string {
  return d && m && y ? `${y}-${m}-${d}` : "";
}

function partsFromDob(dob: string): { d: string; m: string; y: string } {
  if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return { d: "", m: "", y: "" };
  const [y, m, d] = dob.split("-");
  return { d, m, y };
}

function profileToForm(p: SoulmateProfile): FormState {
  const { d, m, y } = partsFromDob(p.basics.dateOfBirth);
  return {
    createdFor: p.createdFor,
    creatorName: p.creator.name,
    creatorWhatsapp: p.creator.whatsapp,
    consent: p.personConsents || p.createdFor === "myself",
    accountEmail: "",
    accountPassword: "",
    firstName: p.basics.firstName,
    lastName: p.basics.lastName,
    gender: p.basics.gender,
    dobD: d,
    dobM: m,
    dobY: y,
    heightCm: p.basics.heightCm || 163,
    maritalStatus: p.basics.maritalStatus,
    city: p.basics.city,
    community: p.basics.community ?? "",
    languages: p.basics.languages,
    education: p.work.education,
    fieldOfStudy: p.work.fieldOfStudy,
    profession: p.work.profession,
    organisation: p.work.organisation,
    incomeBand: p.work.incomeBand ?? "",
    incomePrivate: p.work.incomePrivate,
    about: p.about.text,
    familyType: p.about.familyType,
    familyOutlook: p.about.familyOutlook,
    familyCanJoin: p.about.familyCanJoin,
    ageMin: p.preferences.ageMin,
    ageMax: p.preferences.ageMax,
    locations: p.preferences.locations,
    values: p.preferences.values,
    wish: p.preferences.note ?? "",
    photos: p.photos.map((ph) => ({ ...ph })),
    photoVisibility: p.photoVisibility,
    phone: p.phone,
    identity: EMPTY_IDENTITY,
    terms: false,
  };
}

function firstUnfinishedStep(f: FormState, signedIn: boolean): number {
  if (!f.createdFor || !f.consent) return 0;
  if (!signedIn && (!f.accountEmail || f.accountPassword.length < 6)) return 0;
  if (f.createdFor !== "myself" && (!f.creatorName.trim() || f.creatorWhatsapp.replace(/\D/g, "").length < 8))
    return 0;
  if (!f.firstName.trim() || !f.lastName.trim() || !f.gender || !f.city || !f.languages.length) return 1;
  const dob = dobFromParts(f.dobD, f.dobM, f.dobY);
  if (!dob) return 1;
  if (!f.education || !f.profession.trim()) return 2;
  if (f.about.trim().length < 40) return 3;
  if (f.ageMin > f.ageMax) return 4;
  const phoneOk = f.phone.replace(/\D/g, "").length >= 10;
  const idOk =
    Boolean(f.identity.front && f.identity.consent) ||
    /* resumed draft may already have a document on the server profile */ false;
  if (!phoneOk) return 5;
  if (!idOk && !f.identity.front) return 5;
  return 6;
}

function Ic({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: path }} />
  );
}

function toggleIn(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

export function SoulmatesCreateForm() {
  const router = useRouter();
  const hydrated = useCoupleHydrated();
  const account = useCoupleAccount();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedFlash, setSavedFlash] = useState(false);
  const [done, setDone] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const dragIndex = useRef<number | null>(null);
  const profileIdRef = useRef<string>("");
  const [hadDocument, setHadDocument] = useState(false);

  const signedIn = Boolean(account);
  const dob = dobFromParts(form.dobD, form.dobM, form.dobY);
  const age = ageFromDob(dob);
  const years = useMemo(() => {
    const ny = new Date().getFullYear();
    const list: number[] = [];
    for (let k = ny - 18; k >= ny - 70; k--) list.push(k);
    return list;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const existing = await getMySoulmateProfile();
      if (cancelled) return;
      if (existing && (existing.status === "draft" || existing.status === "changes_requested")) {
        profileIdRef.current = existing.id;
        setHadDocument(Boolean(existing.identityDocument));
        const next = profileToForm(existing);
        setForm(next);
        setStep(firstUnfinishedStep(next, true));
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const revoked: string[] = [];
    let cancelled = false;
    (async () => {
      const map: Record<string, string> = {};
      for (const ph of form.photos) {
        if (ph.previewUrl) {
          map[ph.id] = ph.previewUrl;
          continue;
        }
        if (ph.url.startsWith("idb:")) {
          const obj = await getDocumentObjectUrl(ph.url);
          if (obj) {
            map[ph.id] = obj;
            revoked.push(obj);
          }
        } else if (ph.url) map[ph.id] = ph.url;
      }
      if (!cancelled) setPhotoUrls(map);
    })();
    return () => {
      cancelled = true;
      revoked.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [form.photos]);

  const patch = useCallback((partial: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  const displayName = useMemo(() => {
    const fn = form.firstName.trim();
    const ln = form.lastName.trim();
    if (!fn) return "Your name";
    return `${fn}${ln ? ` ${ln[0]!.toUpperCase()}.` : ""}${age && age >= 18 ? `, ${age}` : ""}`;
  }, [form.firstName, form.lastName, age]);

  const tint = TINTS[(form.firstName.trim().charCodeAt(0) || 0) % 4]!;

  function consentText(): string {
    if (form.createdFor === "myself" || !form.createdFor) return "I am creating this profile for myself.";
    return "The person this profile is for knows about it and agrees.";
  }

  function basicsLead(): string {
    if (form.createdFor === "myself" || !form.createdFor) {
      return "Only the first name and last initial are shown to other members.";
    }
    return "Tell us about them. Only their first name and last initial are shown.";
  }

  function validate(s: number): boolean {
    const next: Record<string, string> = {};
    if (s === 0) {
      if (!form.createdFor) next.for = "Please choose who this profile is for.";
      if (form.createdFor && form.createdFor !== "myself") {
        const digits = form.creatorWhatsapp.replace(/[^\d+]/g, "");
        if (!form.creatorName.trim() || digits.replace(/\D/g, "").length < 8) {
          next.cr = "Please add your name and a number we can reach you on.";
        }
      }
      if (!signedIn) {
        if (!/^\S+@\S+\.\S+$/.test(form.accountEmail.trim())) {
          next.account = "Please add an email and password, or continue with Google.";
        } else if (form.accountPassword.length < 6) {
          next.account = "Password needs at least 6 characters.";
        }
      }
      if (!form.consent) next.consent = "Please confirm before continuing.";
    }
    if (s === 1) {
      if (!form.firstName.trim() || !form.lastName.trim()) next.name = "Please add a first and last name.";
      if (!form.gender) next.gender = "Please choose one.";
      let dobMsg = "";
      if (!dob) dobMsg = "Please add a date of birth.";
      else if (form.gender === "man" && age !== null && age < 21) {
        dobMsg = "In India, the legal minimum age for marriage is 21 for men.";
      } else if (age !== null && age < 18) {
        dobMsg = "In India, the legal minimum age for marriage is 18 for women.";
      } else if (age !== null && age > 99) dobMsg = "Please check the date of birth.";
      if (dobMsg) next.dob = dobMsg;
      if (!form.city) next.city = "Please choose a city.";
      if (!form.languages.length) next.lang = "Please choose at least one language.";
    }
    if (s === 2) {
      if (!form.education || !form.profession.trim()) {
        next.work = "Please add your highest education and profession.";
      }
    }
    if (s === 3) {
      if (form.about.trim().length < 40) {
        next.about = "A little more, please. At least a few lines (40 characters).";
      }
    }
    if (s === 4) {
      if (form.ageMin > form.ageMax) next.age = "The first age should be lower than the second.";
    }
    if (s === 5) {
      const digits = form.phone.replace(/\D/g, "");
      if (digits.length < 10) next.phone = "Please enter a 10-digit mobile number.";
      if (!hadDocument) {
        if (!form.identity.front) next.id = "Please upload your identity document.";
        else if (idTypeNeedsBack(form.identity.type) && !form.identity.back) {
          next.id = "Please upload the back of your ID.";
        } else if (!form.identity.consent || !form.identity.consentAt) {
          next.id = "Please agree so we can use this document to verify identity.";
        }
      }
    }
    if (s === 6) {
      if (!form.terms) next.terms = "Please confirm to submit.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function ensureAccount(): Promise<boolean> {
    if (signedIn) return true;
    const result = await coupleLogin(form.accountEmail.trim(), form.accountPassword);
    if (!result.ok) {
      setErrors((e) => ({ ...e, account: result.error }));
      return false;
    }
    return true;
  }

  async function persist(asSubmit = false): Promise<boolean> {
    setBusy(true);
    try {
      if (!(await ensureAccount())) return false;

      let photos = form.photos;
      const needsUpload = photos.some((p) => p.previewUrl && !p.url.startsWith("idb:"));
      if (needsUpload) {
        const nextPhotos: PhotoDraft[] = [];
        for (let i = 0; i < photos.length; i++) {
          const p = photos[i]!;
          if (p.url.startsWith("idb:")) {
            nextPhotos.push({ ...p, order: i, previewUrl: undefined });
            continue;
          }
          // Recreate File from object URL is not possible; keep data already idb or skip
          nextPhotos.push({ ...p, order: i });
        }
        photos = nextPhotos;
      }

      let identityDocument = undefined as SoulmateProfile["identityDocument"];
      if (form.identity.front && form.identity.consentAt) {
        const pid = profileIdRef.current || "pending";
        identityDocument = await buildSoulmateDocument({
          profileId: pid,
          type: form.identity.type,
          front: form.identity.front,
          back: form.identity.back,
          consentAt: form.identity.consentAt,
        });
      }

      const createdFor = (form.createdFor || "myself") as SoulmateCreatedFor;
      const result = await saveMySoulmateProfile({
        createdFor,
        creator: {
          name: createdFor === "myself" ? form.firstName.trim() : form.creatorName.trim(),
          relation: forRelation(createdFor),
          whatsapp: createdFor === "myself" ? form.phone : form.creatorWhatsapp,
        },
        personConsents: form.consent,
        basics: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          gender: (form.gender || "woman") as SoulmateGender,
          dateOfBirth: dob,
          heightCm: form.heightCm,
          maritalStatus: form.maritalStatus,
          city: form.city,
          community: form.community.trim() || undefined,
          languages: form.languages,
        },
        work: {
          education: form.education,
          fieldOfStudy: form.fieldOfStudy.trim(),
          profession: form.profession.trim(),
          organisation: form.organisation.trim(),
          incomeBand: form.incomeBand || undefined,
          incomePrivate: form.incomePrivate,
        },
        about: {
          text: form.about.trim(),
          familyType: form.familyType,
          familyOutlook: form.familyOutlook,
          familyCanJoin: form.familyCanJoin,
        },
        preferences: {
          ageMin: form.ageMin,
          ageMax: form.ageMax,
          locations: form.locations,
          values: form.values,
          note: form.wish.trim() || undefined,
        },
        photos: photos.map((p, i) => ({
          id: p.id,
          url: p.url,
          order: i,
          status: p.status || "pending",
        })),
        photoVisibility: form.photoVisibility,
        phone: form.phone,
        identityDocument,
      });
      if (!result.ok) {
        setErrors((e) => ({ ...e, save: result.error }));
        return false;
      }
      profileIdRef.current = result.value.id;
      if (identityDocument) setHadDocument(true);
      if (asSubmit) {
        const sub = await submitMySoulmateProfile();
        if (!sub.ok) {
          setErrors((e) => ({ ...e, save: sub.error }));
          return false;
        }
      }
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 1400);
      return true;
    } finally {
      setBusy(false);
    }
  }

  async function addPhotos(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => /^image\//.test(f.type));
    const room = 6 - form.photos.length;
    if (room <= 0) return;
    const slice = list.slice(0, room);
    const added: PhotoDraft[] = [];
    for (let i = 0; i < slice.length; i++) {
      const file = slice[i]!;
      try {
        const uploaded = await uploadSoulmatePhoto(file, form.photos.length + i);
        const previewUrl = URL.createObjectURL(file);
        added.push({ ...uploaded, previewUrl });
      } catch {
        const previewUrl = URL.createObjectURL(file);
        added.push({
          id: `local-${Date.now()}-${i}`,
          url: previewUrl,
          order: form.photos.length + i,
          status: "pending",
          previewUrl,
        });
      }
    }
    patch({ photos: [...form.photos, ...added] });
  }

  function onDropReorder(to: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === to) return;
    const next = [...form.photos];
    const [item] = next.splice(from, 1);
    if (!item) return;
    next.splice(to, 0, item);
    patch({ photos: next.map((p, i) => ({ ...p, order: i })) });
  }

  async function goNext() {
    if (!validate(step)) return;
    if (step === 0 && !signedIn) {
      if (!(await ensureAccount())) return;
    }
    if (step < STEPS - 1) {
      await persist(false);
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const ok = await persist(true);
      if (ok) {
        setDone(true);
        window.scrollTo({ top: 0 });
      }
    }
  }

  async function saveExit() {
    if (!signedIn && form.accountEmail) {
      if (!(await ensureAccount())) return;
    }
    if (!signedIn) {
      router.push("/login?next=/soulmates/create");
      return;
    }
    await persist(false);
    router.push("/soulmates/me");
  }

  if (!hydrated || !loaded) {
    return (
      <div className="sm-create">
        <p style={{ padding: "48px 24px", color: "var(--mute, #4F4A42)" }}>Loading…</p>
      </div>
    );
  }

  const mainPhoto = form.photos[0] ? photoUrls[form.photos[0].id] : "";
  const showPhoto = Boolean(mainPhoto) && form.photoVisibility === "verified";

  if (done) {
    const thankName =
      form.createdFor === "myself"
        ? form.firstName.trim() || "friend"
        : form.creatorName.trim() || "friend";
    return (
      <div className="sm-create">
        <section className="done on" aria-live="polite">
          <figure className="donepic">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/ref/soulmates-create/image-07.webp"
              alt="A couple sharing a quiet moment"
              style={{ objectPosition: "50% 30%" }}
            />
          </figure>
          <div className="seal">{(form.firstName.trim()[0] || "W").toUpperCase()}</div>
          <span className="cap gold" style={{ display: "block", marginTop: 26 }}>
            Profile received
          </span>
          <h1>
            Thank you, <em>{thankName}</em>.
          </h1>
          <p className="lead">
            Your profile is with our team now. Nothing is visible to other members until it’s verified.
          </p>
          <div className="next">
            <div>
              <b>1</b>
              <h3>A short call</h3>
              <p>Someone from our team will call within a day to say hello and verify ID.</p>
            </div>
            <div>
              <b>2</b>
              <h3>Your profile goes live</h3>
              <p>Once verified, your profile appears with a ✓ badge, photos still private.</p>
            </div>
            <div>
              <b>3</b>
              <h3>First introductions</h3>
              <p>Each week we’ll suggest a few people who fit what you shared.</p>
            </div>
          </div>
          <div className="acts">
            <Link className="btn" href="/soulmates/me">
              Back to Soulmates
            </Link>
            <Link className="lnk" href="/">
              Wedoura home
            </Link>
          </div>
        </section>
        <footer className="foot">
          <span>© Wedoura Soulmates</span>
          <span>Verified by hand · Private until you both say yes</span>
        </footer>
      </div>
    );
  }

  const img = STEP_IMAGES[step]!;

  return (
    <div className="sm-create">
      <header className="top">
        <Link className="back" href="/soulmates" aria-label="Back to Soulmates">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
          <span>Soulmates</span>
        </Link>
        <Link className="logo" href="/" aria-label="Wedoura home">
          WEDOURA
        </Link>
        <div className="right">
          <span className={`saved${savedFlash ? " on" : ""}`} role="status">
            Saved
          </span>
          <button className="save" type="button" onClick={saveExit} disabled={busy}>
            Save &amp; exit
          </button>
        </div>
      </header>

      <div className="prog">
        <div className="bar" aria-hidden="true">
          <i style={{ width: `${((step + 1) / STEPS) * 100}%` }} />
        </div>
        <ol className="steps" aria-label="Profile steps">
          {ROMAN.map((r, i) => (
            <li
              key={r}
              className={i < step ? "done" : i === step ? "on" : undefined}
              aria-current={i === step ? "step" : undefined}
            >
              <b aria-hidden="true">{r}</b>
              <span>{STEP_SHORT[i]}</span>
            </li>
          ))}
        </ol>
        <p className="stepsm" aria-live="polite">
          Step {step + 1} of {STEPS} · {STEP_NAMES[step]}
        </p>
      </div>

      <main className="wrap">
        <form
          id="f"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void goNext();
          }}
        >
          <section className={`pane${step === 0 ? " on" : ""}`} aria-labelledby="h0">
            {step === 0 ? (
              <>
                <figure className="pimg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt} style={{ objectPosition: img.pos }} />
                </figure>
                <span className="cap gold">{STEP_CAPS[0]}</span>
                <h1 id="h0">
                  Who is this profile <em>for</em>?
                </h1>
                <p className="lead">
                  Many profiles on Wedoura are started by a parent or sibling. Either way, the person
                  it’s for must know about it and agree.
                </p>
                <fieldset className="grp">
                  <legend className="vh">Profile for</legend>
                  <div className="cards">
                    {FOR_OPTIONS.map((opt) => (
                      <label className="card" key={opt.value}>
                        <input
                          type="radio"
                          name="for"
                          value={opt.value}
                          checked={form.createdFor === opt.value}
                          onChange={() =>
                            patch({
                              createdFor: opt.value,
                              consent: false,
                            })
                          }
                        />
                        <span className="c">
                          <Ic path={opt.path} />
                          <b>{opt.label}</b>
                          <small>{opt.sub}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                  <span className="err">{errors.for ?? ""}</span>
                </fieldset>

                <div className="grp">
                  <span className="lbl">About you, the one creating it</span>
                  {!signedIn ? (
                    <>
                      <div className="row2">
                        <label className="f">
                          <span>Email</span>
                          <input
                            type="email"
                            autoComplete="email"
                            value={form.accountEmail}
                            onChange={(e) => patch({ accountEmail: e.target.value })}
                          />
                        </label>
                        <label className="f">
                          <span>Password</span>
                          <input
                            type="password"
                            autoComplete="new-password"
                            value={form.accountPassword}
                            onChange={(e) => patch({ accountPassword: e.target.value })}
                          />
                        </label>
                      </div>
                      <button
                        className="ghost"
                        type="button"
                        style={{ marginTop: 16 }}
                        onClick={async () => {
                          const result = await coupleLoginWithGoogle();
                          if (!result.ok) setErrors((e) => ({ ...e, account: result.error }));
                        }}
                      >
                        Continue with Google
                      </button>
                      <span className="err">{errors.account ?? ""}</span>
                    </>
                  ) : (
                    <p className="hint">Signed in as {account?.email}</p>
                  )}
                  {form.createdFor && form.createdFor !== "myself" ? (
                    <div className="row2" style={{ marginTop: 12 }}>
                      <label className="f">
                        <span>Your name</span>
                        <input
                          autoComplete="name"
                          value={form.creatorName}
                          onChange={(e) => patch({ creatorName: e.target.value })}
                        />
                      </label>
                      <label className="f">
                        <span>Your WhatsApp number</span>
                        <input
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          value={form.creatorWhatsapp}
                          onChange={(e) => patch({ creatorWhatsapp: e.target.value })}
                        />
                      </label>
                    </div>
                  ) : null}
                  <span className="err">{errors.cr ?? ""}</span>
                </div>

                <label className="consent">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => patch({ consent: e.target.checked })}
                  />
                  <span>{consentText()}</span>
                </label>
                <span className="err">{errors.consent ?? ""}</span>
              </>
            ) : null}
          </section>

          <section className={`pane${step === 1 ? " on" : ""}`} aria-labelledby="h1">
            {step === 1 ? (
              <>
                <figure className="pimg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt} style={{ objectPosition: img.pos }} />
                </figure>
                <span className="cap gold">{STEP_CAPS[1]}</span>
                <h1 id="h1">
                  The <em>basics</em>
                </h1>
                <p className="lead">{basicsLead()}</p>
                <div className="grp">
                  <div className="row2">
                    <label className={`f${errors.name && !form.firstName.trim() ? " bad" : ""}`}>
                      <span>First name</span>
                      <input
                        autoComplete="given-name"
                        value={form.firstName}
                        onChange={(e) => patch({ firstName: e.target.value })}
                      />
                    </label>
                    <label className={`f${errors.name && !form.lastName.trim() ? " bad" : ""}`}>
                      <span>
                        Last name <small>shown as an initial</small>
                      </span>
                      <input
                        autoComplete="family-name"
                        value={form.lastName}
                        onChange={(e) => patch({ lastName: e.target.value })}
                      />
                    </label>
                  </div>
                  <span className="err">{errors.name ?? ""}</span>
                </div>
                <fieldset className="grp">
                  <legend className="lbl">Gender</legend>
                  <div className="chips">
                    {(
                      [
                        ["woman", "Woman"],
                        ["man", "Man"],
                      ] as const
                    ).map(([v, label]) => (
                      <label className="chip" key={v}>
                        <input
                          type="radio"
                          name="gender"
                          checked={form.gender === v}
                          onChange={() => patch({ gender: v })}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                  <span className="err">{errors.gender ?? ""}</span>
                </fieldset>
                <div className="grp">
                  <div className={`f dobf${errors.dob ? " bad" : ""}`}>
                    <span>Date of birth</span>
                    <div className="dob3">
                      <label className="dob-part">
                        <span>Day</span>
                        <select
                          aria-label="Day"
                          value={form.dobD}
                          onChange={(e) => patch({ dobD: e.target.value })}
                        >
                          <option value="">—</option>
                          {Array.from({ length: 31 }, (_, i) => {
                            const v = String(i + 1).padStart(2, "0");
                            return (
                              <option key={v} value={v}>
                                {i + 1}
                              </option>
                            );
                          })}
                        </select>
                      </label>
                      <label className="dob-part">
                        <span>Month</span>
                        <select
                          aria-label="Month"
                          value={form.dobM}
                          onChange={(e) => patch({ dobM: e.target.value })}
                        >
                          <option value="">—</option>
                          {MONTHS.map((n, i) => {
                            const v = String(i + 1).padStart(2, "0");
                            return (
                              <option key={v} value={v}>
                                {n}
                              </option>
                            );
                          })}
                        </select>
                      </label>
                      <label className="dob-part">
                        <span>Year</span>
                        <select
                          aria-label="Year"
                          value={form.dobY}
                          onChange={(e) => patch({ dobY: e.target.value })}
                        >
                          <option value="">—</option>
                          {years.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                  <span className="err">{errors.dob ?? ""}</span>
                </div>
                <div className="grp">
                  <div className="row2">
                    <label className="f">
                      <span>Height</span>
                      <select
                        value={form.heightCm}
                        onChange={(e) => patch({ heightCm: Number(e.target.value) })}
                      >
                        {HEIGHTS.map((h) => (
                          <option key={h.cm} value={h.cm}>
                            {h.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="f">
                      <span>Marital status</span>
                      <select
                        value={form.maritalStatus}
                        onChange={(e) =>
                          patch({ maritalStatus: e.target.value as SoulmateMaritalStatus })
                        }
                      >
                        {MARITAL.map((m) => (
                          <option key={m}>{m}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
                <div className="grp">
                  <div className="row2">
                    <label className={`f${errors.city ? " bad" : ""}`}>
                      <span>City you live in</span>
                      <select value={form.city} onChange={(e) => patch({ city: e.target.value })}>
                        <option value="">Choose a city</option>
                        {CITIES.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                    <label className="f">
                      <span>
                        Community <small>optional</small>
                      </span>
                      <input
                        placeholder="As you’d like it described"
                        value={form.community}
                        onChange={(e) => patch({ community: e.target.value })}
                      />
                    </label>
                  </div>
                  <span className="err">{errors.city ?? ""}</span>
                </div>
                <fieldset className="grp">
                  <legend className="lbl">Languages you speak</legend>
                  <div className="chips">
                    {LANGUAGES.map((lang) => (
                      <label className="chip" key={lang}>
                        <input
                          type="checkbox"
                          checked={form.languages.includes(lang)}
                          onChange={() => patch({ languages: toggleIn(form.languages, lang) })}
                        />
                        <span>{lang}</span>
                      </label>
                    ))}
                  </div>
                  <span className="err">{errors.lang ?? ""}</span>
                </fieldset>
              </>
            ) : null}
          </section>

          <section className={`pane${step === 2 ? " on" : ""}`} aria-labelledby="h2">
            {step === 2 ? (
              <>
                <figure className="pimg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt} style={{ objectPosition: img.pos }} />
                </figure>
                <span className="cap gold">{STEP_CAPS[2]}</span>
                <h1 id="h2">
                  Education &amp; <em>work</em>
                </h1>
                <p className="lead">Our team verifies these by hand before your profile goes live.</p>
                <div className="grp">
                  <div className="row2">
                    <label className={`f${errors.work && !form.education ? " bad" : ""}`}>
                      <span>Highest education</span>
                      <select
                        value={form.education}
                        onChange={(e) => patch({ education: e.target.value })}
                      >
                        <option value="">Choose one</option>
                        {EDUCATION.map((e) => (
                          <option key={e}>{e}</option>
                        ))}
                      </select>
                    </label>
                    <label className="f">
                      <span>Field of study</span>
                      <input
                        placeholder="e.g. Architecture"
                        value={form.fieldOfStudy}
                        onChange={(e) => patch({ fieldOfStudy: e.target.value })}
                      />
                    </label>
                  </div>
                  <div className="row2">
                    <label className={`f${errors.work && !form.profession.trim() ? " bad" : ""}`}>
                      <span>Profession</span>
                      <input
                        placeholder="e.g. Product designer"
                        value={form.profession}
                        onChange={(e) => patch({ profession: e.target.value })}
                      />
                    </label>
                    <label className="f">
                      <span>
                        Organisation <small>private</small>
                      </span>
                      <input
                        placeholder="Only our team sees this"
                        value={form.organisation}
                        onChange={(e) => patch({ organisation: e.target.value })}
                      />
                    </label>
                  </div>
                  <span className="err">{errors.work ?? ""}</span>
                </div>
                <div className="grp">
                  <label className="f">
                    <span>
                      Annual income <small>optional</small>
                    </span>
                    <select
                      value={form.incomeBand}
                      onChange={(e) => patch({ incomeBand: e.target.value })}
                    >
                      <option value="">Prefer not to say</option>
                      {INCOME.map((i) => (
                        <option key={i}>{i}</option>
                      ))}
                    </select>
                  </label>
                  <label className="tog">
                    <span>
                      <b>Keep income private</b>
                      <small>Only shared after mutual interest, if at all.</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={form.incomePrivate}
                      onChange={(e) => patch({ incomePrivate: e.target.checked })}
                    />
                    <span className="sw" aria-hidden="true" />
                  </label>
                </div>
              </>
            ) : null}
          </section>

          <section className={`pane${step === 3 ? " on" : ""}`} aria-labelledby="h3">
            {step === 3 ? (
              <>
                <figure className="pimg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt} style={{ objectPosition: img.pos }} />
                </figure>
                <span className="cap gold">{STEP_CAPS[3]}</span>
                <h1 id="h3">
                  In your own <em>words</em>
                </h1>
                <p className="lead">
                  A few honest lines do more than a long list. Tap a prompt if you’re not sure where to
                  start.
                </p>
                <div className="grp">
                  <label className={`f${errors.about ? " bad" : ""}`}>
                    <span>About you</span>
                    <textarea
                      maxLength={600}
                      placeholder="What does a good Sunday look like for you?"
                      value={form.about}
                      onChange={(e) => patch({ about: e.target.value })}
                    />
                    <span className="count">
                      {form.about.length} / 600
                    </span>
                  </label>
                  <div className="prompts">
                    {PROMPTS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          const base = form.about.replace(/\s*$/, "");
                          patch({ about: `${base ? `${base}\n\n` : ""}${p} ` });
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <span className="err">{errors.about ?? ""}</span>
                </div>
                <fieldset className="grp">
                  <legend className="lbl">Family</legend>
                  <div className="row2">
                    <label className="f">
                      <span>Family type</span>
                      <select
                        value={form.familyType}
                        onChange={(e) => patch({ familyType: e.target.value })}
                      >
                        <option>Nuclear family</option>
                        <option>Joint family</option>
                        <option>Prefer to explain later</option>
                      </select>
                    </label>
                    <label className="f">
                      <span>Family outlook</span>
                      <select
                        value={form.familyOutlook}
                        onChange={(e) => patch({ familyOutlook: e.target.value })}
                      >
                        <option>Traditional</option>
                        <option>Moderate</option>
                        <option>Liberal</option>
                      </select>
                    </label>
                  </div>
                  <label className="tog">
                    <span>
                      <b>Family can join conversations</b>
                      <small>
                        Parents or siblings may message on your behalf, with you in the loop.
                      </small>
                    </span>
                    <input
                      type="checkbox"
                      checked={form.familyCanJoin}
                      onChange={(e) => patch({ familyCanJoin: e.target.checked })}
                    />
                    <span className="sw" aria-hidden="true" />
                  </label>
                </fieldset>
              </>
            ) : null}
          </section>

          <section className={`pane${step === 4 ? " on" : ""}`} aria-labelledby="h4">
            {step === 4 ? (
              <>
                <figure className="pimg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt} style={{ objectPosition: img.pos }} />
                </figure>
                <span className="cap gold">{STEP_CAPS[4]}</span>
                <h1 id="h4">
                  Who you’d like to <em>meet</em>
                </h1>
                <p className="lead">
                  We use this to suggest a few thoughtful introductions each week, not hundreds.
                </p>
                <div className="grp">
                  <span className="lbl">Age between</span>
                  <div className="row2">
                    <label className="f">
                      <span>From</span>
                      <select
                        value={form.ageMin}
                        onChange={(e) => patch({ ageMin: Number(e.target.value) })}
                      >
                        {Array.from({ length: 43 }, (_, i) => 18 + i).map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="f">
                      <span>To</span>
                      <select
                        value={form.ageMax}
                        onChange={(e) => patch({ ageMax: Number(e.target.value) })}
                      >
                        {Array.from({ length: 43 }, (_, i) => 18 + i).map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <span className="err">{errors.age ?? ""}</span>
                </div>
                <fieldset className="grp">
                  <legend className="lbl">Where they live</legend>
                  <div className="chips">
                    {PREF_CITIES.map((c) => (
                      <label className="chip" key={c}>
                        <input
                          type="checkbox"
                          checked={form.locations.includes(c)}
                          onChange={() => patch({ locations: toggleIn(form.locations, c) })}
                        />
                        <span>{c}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="grp">
                  <legend className="lbl">What matters most</legend>
                  <div className="chips">
                    {VALUES.map((v) => (
                      <label className="chip" key={v}>
                        <input
                          type="checkbox"
                          checked={form.values.includes(v)}
                          onChange={() => patch({ values: toggleIn(form.values, v) })}
                        />
                        <span>{v}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="grp">
                  <label className="f">
                    <span>
                      Anything else <small>optional</small>
                    </span>
                    <textarea
                      maxLength={400}
                      placeholder="Someone kind to waiters, who likes long walks and longer conversations…"
                      value={form.wish}
                      onChange={(e) => patch({ wish: e.target.value })}
                    />
                  </label>
                </div>
              </>
            ) : null}
          </section>

          <section className={`pane${step === 5 ? " on" : ""}`} aria-labelledby="h5">
            {step === 5 ? (
              <>
                <figure className="pimg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt} style={{ objectPosition: img.pos }} />
                </figure>
                <span className="cap gold">{STEP_CAPS[5]}</span>
                <h1 id="h5">
                  Photos &amp; <em>privacy</em>
                </h1>
                <p className="lead">
                  Add up to six photos. The first is your main photo. Nobody sees them until you choose.
                </p>
                <div className="grp">
                  <label
                    className="drop"
                    tabIndex={0}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add("over");
                    }}
                    onDragLeave={(e) => e.currentTarget.classList.remove("over")}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove("over");
                      void addPhotos(e.dataTransfer.files);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        document.getElementById("sm-ph")?.click();
                      }
                    }}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 8h4l2-3h6l2 3h4v11H3z" />
                      <circle cx="12" cy="13" r="3.5" />
                    </svg>
                    <b>Add photos</b>
                    <small>Drag them here, or tap to choose · JPG or PNG</small>
                    <input
                      id="sm-ph"
                      type="file"
                      accept="image/*"
                      multiple
                      className="vh"
                      onChange={(e) => {
                        if (e.target.files) void addPhotos(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <div className="thumbs">
                    {form.photos.map((p, i) => (
                      <div
                        className="thumb"
                        key={p.id}
                        draggable
                        onDragStart={() => {
                          dragIndex.current = i;
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => onDropReorder(i)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photoUrls[p.id] || p.previewUrl || ""} alt={`Photo ${i + 1}`} />
                        {i === 0 ? <span className="main">Main</span> : null}
                        <button
                          type="button"
                          aria-label={`Remove photo ${i + 1}`}
                          onClick={() =>
                            patch({ photos: form.photos.filter((_, j) => j !== i) })
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <fieldset className="grp">
                  <legend className="lbl">Who can see your photos</legend>
                  <div className="cards" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <label className="card">
                      <input
                        type="radio"
                        name="pvis"
                        checked={form.photoVisibility === "mutual"}
                        onChange={() => patch({ photoVisibility: "mutual" })}
                      />
                      <span className="c">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <rect x="5" y="11" width="14" height="10" rx="1" />
                          <path d="M8 11V8a4 4 0 018 0v3" />
                        </svg>
                        <b>After mutual interest</b>
                        <small>Recommended. Members see your initial until you both say yes.</small>
                      </span>
                    </label>
                    <label className="card">
                      <input
                        type="radio"
                        name="pvis"
                        checked={form.photoVisibility === "verified"}
                        onChange={() => patch({ photoVisibility: "verified" })}
                      />
                      <span className="c">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
                          <path d="M8.5 12l2.5 2.5 4.5-5" />
                        </svg>
                        <b>Verified members</b>
                        <small>Any verified member can see your photos.</small>
                      </span>
                    </label>
                  </div>
                </fieldset>
                <div className="grp">
                  <span className="lbl">Mobile number</span>
                  <label className="f">
                    <span>Team only — never shown to members</span>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+91"
                      value={form.phone}
                      onChange={(e) => patch({ phone: e.target.value })}
                    />
                  </label>
                  <span className="err">{errors.phone ?? ""}</span>
                  <div style={{ marginTop: 28 }}>
                    <span className="lbl">Identity document</span>
                    {hadDocument && !form.identity.front ? (
                      <p className="hint">Document already on file. Upload again only to replace it.</p>
                    ) : null}
                    <IdentityDocumentFields
                      value={form.identity}
                      onChange={(identity) => patch({ identity })}
                      errors={
                        errors.id
                          ? { front: errors.id, consent: errors.id, back: errors.id }
                          : undefined
                      }
                    />
                  </div>
                  <p className="hint">
                    Contact details are never shown. They open only after mutual interest. Our team
                    will also call to verify ID before your profile goes live.
                  </p>
                </div>
              </>
            ) : null}
          </section>

          <section className={`pane${step === 6 ? " on" : ""}`} aria-labelledby="h6">
            {step === 6 ? (
              <>
                <figure className="pimg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt} style={{ objectPosition: img.pos }} />
                </figure>
                <span className="cap gold">{STEP_CAPS[6]}</span>
                <h1 id="h6">
                  Take a <em>last look</em>
                </h1>
                <p className="lead">This is what our team will review. You can change anything later.</p>
                <button className="pvbtn" type="button" onClick={() => setSheet(true)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  See how others see you
                </button>
                <div>
                  {(
                    [
                      [0, "Who it’s for", [["Profile for", forLabel((form.createdFor || "myself") as SoulmateCreatedFor)], form.createdFor !== "myself" ? ["Created by", form.creatorName] : null]],
                      [1, "The basics", [["Name", `${form.firstName} ${form.lastName}`], ["Shown as", displayName], ["Gender", form.gender === "man" ? "Man" : "Woman"], ["Age", age], ["Height", HEIGHTS.find((h) => h.cm === form.heightCm)?.label], ["Marital status", form.maritalStatus], ["City", form.city], ["Community", form.community], ["Languages", form.languages.join(", ")]]],
                      [2, "Education & work", [["Education", [form.education, form.fieldOfStudy].filter(Boolean).join(", ")], ["Profession", form.profession], ["Organisation", `Private${form.organisation ? ` · ${form.organisation}` : ""}`], ["Income", `${form.incomeBand || "Prefer not to say"}${form.incomePrivate ? " · private" : ""}`]]],
                      [3, "About", [["In your words", form.about], ["Family", `${form.familyType}, ${form.familyOutlook.toLowerCase()}`], ["Family can join", form.familyCanJoin ? "Yes" : "No"]]],
                      [4, "Looking for", [["Age", `${form.ageMin} to ${form.ageMax}`], ["Where", form.locations.join(", ") || "Open"], ["What matters", form.values.join(", ") || "—"], ["Also", form.wish]]],
                      [5, "Photos & privacy", [["Photos", form.photos.length ? `${form.photos.length} added` : "None yet, you can add later"], ["Who sees photos", form.photoVisibility === "mutual" ? "After mutual interest" : "Verified members"], ["Mobile", form.phone ? "On file (team only)" : "Missing"], ["Identity", hadDocument || form.identity.front ? "Uploaded" : "Missing"]]],
                    ] as [number, string, ([string, unknown] | null)[]][]
                  ).map(([go, title, rows]) => (
                    <div className="rv-sec" key={title}>
                      <header>
                        <h3>{title}</h3>
                        <button type="button" onClick={() => setStep(go)}>
                          Edit
                        </button>
                      </header>
                      <dl>
                        {rows
                          .filter(Boolean)
                          .map((row) => {
                            const [k, v] = row!;
                            if (v === undefined || v === null || v === "") return null;
                            return (
                              <div key={k} style={{ display: "contents" }}>
                                <dt>{k}</dt>
                                <dd>{String(v)}</dd>
                              </div>
                            );
                          })}
                      </dl>
                    </div>
                  ))}
                </div>
                <label className="consent">
                  <input
                    type="checkbox"
                    checked={form.terms}
                    onChange={(e) => patch({ terms: e.target.checked })}
                  />
                  <span>
                    I confirm these details are true, and I agree to Wedoura’s terms and privacy
                    policy.
                  </span>
                </label>
                <span className="err">{errors.terms ?? errors.save ?? ""}</span>
              </>
            ) : null}
          </section>

          <div className="nav">
            <button
              className="prev"
              type="button"
              hidden={step === 0}
              onClick={() => {
                if (step > 0) setStep(step - 1);
              }}
            >
              ← Back
            </button>
            <button className="btn" type="button" disabled={busy} onClick={() => void goNext()}>
              {step === STEPS - 1 ? "Submit profile" : "Continue"}
            </button>
          </div>
        </form>

        <aside className={`aside${sheet ? " sheet" : ""}`} aria-label="Profile preview">
          {sheet ? (
            <button
              type="button"
              className="prev shx"
              style={{ marginBottom: 8 }}
              onClick={() => setSheet(false)}
            >
              Close preview
            </button>
          ) : null}
          <span className="cap gold">How others will see you</span>
          <div className="pv">
            <div
              className={`mono${showPhoto || mainPhoto ? " hasimg" : ""}`}
              style={
                !showPhoto
                  ? { background: tint[0], color: tint[1] }
                  : { color: "#fff" }
              }
            >
              <span className="bd">Verification pending</span>
              {mainPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mainPhoto}
                  alt=""
                  style={showPhoto ? { filter: "none" } : undefined}
                />
              ) : null}
              <span className="ini" style={{ visibility: showPhoto ? "hidden" : "visible" }}>
                {(form.firstName.trim()[0] || "W").toUpperCase()}
              </span>
              <span className="lock">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="10" rx="1" />
                  <path d="M8 11V8a4 4 0 018 0v3" />
                </svg>
                <span>
                  {form.photoVisibility === "verified"
                    ? "Visible to verified members"
                    : "Photo shared after mutual interest"}
                </span>
              </span>
            </div>
            <div className="t">
              <h3>{displayName}</h3>
              <div className="ty cap">
                {[form.city, form.profession.trim()].filter(Boolean).join(" · ") || "City · Profession"}
              </div>
              <p className="ab">
                {form.about.trim()
                  ? form.about.trim().length > 150
                    ? `${form.about.trim().slice(0, 150)}…`
                    : form.about.trim()
                  : "A few lines about you will appear here."}
              </p>
              <div className="tags">
                {[...form.languages.slice(0, 3), ...form.values.slice(0, 2)].map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="ft">
                <span>
                  {form.createdFor && form.createdFor !== "myself"
                    ? "Family-led profile"
                    : "Self-managed profile"}
                </span>
                <span>✓ Contact private</span>
              </div>
            </div>
          </div>
          <div className="assure">
            <div>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
              </svg>
              <span>Every profile is verified by hand before it goes live.</span>
            </div>
            <div>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="1" />
                <path d="M8 11V8a4 4 0 018 0v3" />
              </svg>
              <span>Your number, organisation and income are never shown.</span>
            </div>
            <div>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12h16M12 4v16" />
              </svg>
              <span>You can pause, hide or delete your profile at any time.</span>
            </div>
          </div>
        </aside>
      </main>

      {sheet ? <div className="shbg" onClick={() => setSheet(false)} aria-hidden="true" /> : null}

      <footer className="foot">
        <span>© Wedoura Soulmates</span>
        <span>Verified by hand · Private until you both say yes</span>
      </footer>
    </div>
  );
}
