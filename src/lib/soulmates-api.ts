"use client";

/**
 * Soulmates mock API. Public marketing pages stay server-rendered; all
 * member reads/writes go through this client module (localStorage + IndexedDB).
 */
import { useMemo } from "react";
import type {
  Introduction,
  IntroductionResponse,
  SoulmateBlock,
  SoulmateCreatedFor,
  SoulmateDocument,
  SoulmateGender,
  SoulmateMaritalStatus,
  SoulmatePhoto,
  SoulmatePhotoVisibility,
  SoulmateProfile,
  SoulmateProfileStatus,
  SoulmateReport,
  VendorIdType,
} from "@/data/types";
import { createSampleDocumentBlob, putDocumentBlob } from "@/lib/document-store";
import { getCoupleEmail } from "@/lib/couple-auth";
import {
  newId,
  readSoulmatesDb,
  updateSoulmatesDb,
  useSoulmatesDb,
} from "@/lib/soulmates-store";

export const SOULMATES_DEMO_EMAIL = "soulmates@gmail.com";
export const SOULMATES_DEMO_PASSWORD = "123456";
export const SOULMATES_DEMO_ACCOUNT_ID = "acct-demo-soulmates";
export const SOULMATES_DEMO_PROFILE_ID = "smp-demo-a";
export const SOULMATES_DEMO_PROFILE_B_ID = "smp-demo-b";
export const SOULMATES_DEMO_PROFILE_C_ID = "smp-demo-c";

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function nowIso(): string {
  return new Date().toISOString();
}

function accountIdFromEmail(email: string): string {
  if (email === SOULMATES_DEMO_EMAIL) return SOULMATES_DEMO_ACCOUNT_ID;
  return `acct-${email.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function requireEmail(): Result<string> {
  const email = getCoupleEmail();
  if (!email) return { ok: false, error: "Please sign in to continue." };
  return { ok: true, value: email };
}

function emptyDraft(accountId: string): SoulmateProfile {
  const t = nowIso();
  return {
    id: newId("smp"),
    accountId,
    createdFor: "myself",
    creator: { name: "", relation: "self", whatsapp: "" },
    personConsents: false,
    basics: {
      firstName: "",
      lastName: "",
      gender: "woman",
      dateOfBirth: "",
      heightCm: 163,
      maritalStatus: "Never married",
      city: "",
      languages: [],
    },
    work: {
      education: "",
      fieldOfStudy: "",
      profession: "",
      organisation: "",
      incomePrivate: true,
    },
    about: {
      text: "",
      familyType: "Nuclear family",
      familyOutlook: "Moderate",
      familyCanJoin: true,
    },
    preferences: {
      ageMin: 25,
      ageMax: 32,
      locations: [],
      values: [],
    },
    photos: [],
    photoVisibility: "mutual",
    phone: "",
    status: "draft",
    createdAt: t,
    updatedAt: t,
  };
}

function demoProfileA(): SoulmateProfile {
  const t = "2026-10-01T10:00:00.000Z";
  return {
    id: SOULMATES_DEMO_PROFILE_ID,
    accountId: SOULMATES_DEMO_ACCOUNT_ID,
    createdFor: "myself",
    creator: { name: "Meera", relation: "self", whatsapp: "+919811122233" },
    personConsents: true,
    basics: {
      firstName: "Meera",
      lastName: "Nair",
      gender: "woman",
      dateOfBirth: "1996-04-12",
      heightCm: 165,
      maritalStatus: "Never married",
      city: "Bengaluru",
      community: "Malayali",
      languages: ["Malayalam", "English", "Kannada"],
    },
    work: {
      education: "Master’s degree",
      fieldOfStudy: "Design",
      profession: "Product designer",
      organisation: "Quiet Studio",
      incomeBand: "₹10 to 25 lakh",
      incomePrivate: true,
    },
    about: {
      text: "A perfect Sunday looks like coffee, a long walk, and a quiet evening with family. I’m happiest when I’m making something with my hands.",
      familyType: "Nuclear family",
      familyOutlook: "Moderate",
      familyCanJoin: true,
    },
    preferences: {
      ageMin: 28,
      ageMax: 36,
      locations: ["Same city", "South India"],
      values: ["Kindness", "Humour", "Family closeness"],
      note: "Someone kind to waiters, who likes long walks and longer conversations.",
    },
    photos: [],
    photoVisibility: "mutual",
    phone: "+919811122233",
    identityDocument: {
      id: "smdoc-demo-a",
      profileId: SOULMATES_DEMO_PROFILE_ID,
      type: "pan",
      files: [],
      status: "approved",
      consentAt: t,
      submittedAt: t,
      reviewedAt: "2026-10-02T10:00:00.000Z",
    },
    status: "live",
    submittedAt: t,
    verifiedAt: "2026-10-02T12:00:00.000Z",
    createdAt: t,
    updatedAt: t,
  };
}

function demoProfileB(): SoulmateProfile {
  const t = "2026-09-15T10:00:00.000Z";
  return {
    id: SOULMATES_DEMO_PROFILE_B_ID,
    accountId: "acct-demo-soulmates-b",
    createdFor: "myself",
    creator: { name: "Arjun", relation: "self", whatsapp: "+919900011122" },
    personConsents: true,
    basics: {
      firstName: "Arjun",
      lastName: "Menon",
      gender: "man",
      dateOfBirth: "1993-08-03",
      heightCm: 178,
      maritalStatus: "Never married",
      city: "Bengaluru",
      languages: ["Malayalam", "English", "Hindi"],
    },
    work: {
      education: "Master’s degree",
      fieldOfStudy: "Computer science",
      profession: "Software engineer",
      organisation: "Private",
      incomePrivate: true,
    },
    about: {
      text: "I cook on weekends, read more than I should, and I’m looking for someone who laughs easily.",
      familyType: "Joint family",
      familyOutlook: "Traditional",
      familyCanJoin: true,
    },
    preferences: {
      ageMin: 26,
      ageMax: 34,
      locations: ["Same city", "South India"],
      values: ["Kindness", "Shared faith", "Travel"],
    },
    photos: [],
    photoVisibility: "mutual",
    phone: "+919900011122",
    status: "live",
    submittedAt: t,
    verifiedAt: "2026-09-16T12:00:00.000Z",
    createdAt: t,
    updatedAt: t,
  };
}

function demoProfileC(): SoulmateProfile {
  const t = "2026-09-20T10:00:00.000Z";
  return {
    id: SOULMATES_DEMO_PROFILE_C_ID,
    accountId: "acct-demo-soulmates-c",
    createdFor: "myself",
    creator: { name: "Kabir", relation: "self", whatsapp: "+919876543210" },
    personConsents: true,
    basics: {
      firstName: "Kabir",
      lastName: "Shah",
      gender: "man",
      dateOfBirth: "1992-01-20",
      heightCm: 180,
      maritalStatus: "Never married",
      city: "Mumbai",
      languages: ["Hindi", "English", "Gujarati"],
    },
    work: {
      education: "Bachelor’s degree",
      fieldOfStudy: "Business",
      profession: "Founder",
      organisation: "Private",
      incomePrivate: true,
    },
    about: {
      text: "I travel for work and for joy. Looking for a partner who values family and quiet evenings equally.",
      familyType: "Nuclear family",
      familyOutlook: "Liberal",
      familyCanJoin: false,
    },
    preferences: {
      ageMin: 27,
      ageMax: 35,
      locations: ["Anywhere in India"],
      values: ["Ambition", "Travel", "Humour"],
    },
    photos: [],
    photoVisibility: "verified",
    phone: "+919876543210",
    status: "live",
    submittedAt: t,
    verifiedAt: "2026-09-21T12:00:00.000Z",
    createdAt: t,
    updatedAt: t,
  };
}

function demoIntroductions(): Introduction[] {
  return [
    {
      id: "intro-demo-pending",
      profileAId: SOULMATES_DEMO_PROFILE_ID,
      profileBId: SOULMATES_DEMO_PROFILE_B_ID,
      createdBy: "admin-wedoura",
      createdAt: "2026-11-20T09:00:00.000Z",
      note: "Both care about family and South India.",
      responses: { a: "pending", b: "interested" },
      status: "pending",
    },
    {
      id: "intro-demo-mutual",
      profileAId: SOULMATES_DEMO_PROFILE_ID,
      profileBId: SOULMATES_DEMO_PROFILE_C_ID,
      createdBy: "admin-wedoura",
      createdAt: "2026-11-10T09:00:00.000Z",
      note: "Shared interest in travel and humour.",
      responses: { a: "interested", b: "interested" },
      status: "mutual",
    },
  ];
}

/** Seed demo Soulmates data once per browser. Safe to call on login. */
export async function ensureSoulmatesDemoSeed(): Promise<void> {
  const db = readSoulmatesDb();
  if (db.profiles.some((p) => p.id === SOULMATES_DEMO_PROFILE_ID)) return;

  let doc: SoulmateDocument | undefined;
  try {
    const blob = await createSampleDocumentBlob("SAMPLE");
    const url = await putDocumentBlob(blob, "soulmates-demo-id");
    doc = {
      id: "smdoc-demo-a",
      profileId: SOULMATES_DEMO_PROFILE_ID,
      type: "pan",
      files: [
        {
          name: "sample-id.png",
          mimeType: "image/png",
          size: blob.size,
          url,
          side: "front",
        },
      ],
      status: "approved",
      consentAt: "2026-10-01T10:00:00.000Z",
      submittedAt: "2026-10-01T10:00:00.000Z",
      reviewedAt: "2026-10-02T10:00:00.000Z",
    };
  } catch {
    /* IndexedDB unavailable */
  }

  const a = demoProfileA();
  if (doc) a.identityDocument = doc;

  updateSoulmatesDb((prev) => ({
    ...prev,
    profiles: [
      ...prev.profiles.filter(
        (p) =>
          p.id !== SOULMATES_DEMO_PROFILE_ID &&
          p.id !== SOULMATES_DEMO_PROFILE_B_ID &&
          p.id !== SOULMATES_DEMO_PROFILE_C_ID,
      ),
      a,
      demoProfileB(),
      demoProfileC(),
    ],
    introductions: [
      ...prev.introductions.filter((i) => !i.id.startsWith("intro-demo-")),
      ...demoIntroductions(),
    ],
  }));
}

export function publicDisplayName(profile: Pick<SoulmateProfile, "basics">): string {
  const { firstName, lastName } = profile.basics;
  const initial = lastName.trim()[0]?.toUpperCase() ?? "";
  return initial ? `${firstName} ${initial}.` : firstName;
}

export function ageFromDob(dob: string): number | null {
  if (!dob) return null;
  const b = new Date(dob);
  if (Number.isNaN(b.getTime())) return null;
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--;
  return a;
}

export function minMarriageAge(gender: SoulmateGender): number {
  return gender === "man" ? 21 : 18;
}

/** GET /soulmates/me */
export async function getMySoulmateProfile(): Promise<SoulmateProfile | null> {
  const auth = requireEmail();
  if (!auth.ok) return null;
  const accountId = accountIdFromEmail(auth.value);
  if (auth.value === SOULMATES_DEMO_EMAIL) await ensureSoulmatesDemoSeed();
  return readSoulmatesDb().profiles.find((p) => p.accountId === accountId) ?? null;
}

export function useMySoulmateProfile(): SoulmateProfile | null {
  const db = useSoulmatesDb();
  const email = getCoupleEmail();
  return useMemo(() => {
    if (!email) return null;
    const accountId = accountIdFromEmail(email);
    return db.profiles.find((p) => p.accountId === accountId) ?? null;
  }, [db, email]);
}

export type SoulmateProfileInput = {
  createdFor: SoulmateCreatedFor;
  creator: { name: string; relation: string; whatsapp: string };
  personConsents: boolean;
  basics: SoulmateProfile["basics"];
  work: SoulmateProfile["work"];
  about: SoulmateProfile["about"];
  preferences: SoulmateProfile["preferences"];
  photos: SoulmatePhoto[];
  photoVisibility: SoulmatePhotoVisibility;
  phone: string;
  identityDocument?: SoulmateDocument;
};

/** POST /soulmates/me — create or replace draft fields (keeps id/status). */
export async function saveMySoulmateProfile(input: SoulmateProfileInput): Promise<Result<SoulmateProfile>> {
  const auth = requireEmail();
  if (!auth.ok) return auth;
  const accountId = accountIdFromEmail(auth.value);
  const t = nowIso();

  const value = updateSoulmatesDb((db) => {
    const existing = db.profiles.find((p) => p.accountId === accountId);
    const next: SoulmateProfile = existing
      ? {
          ...existing,
          ...input,
          updatedAt: t,
        }
      : {
          ...emptyDraft(accountId),
          ...input,
          accountId,
          updatedAt: t,
        };
    return {
      ...db,
      profiles: [...db.profiles.filter((p) => p.accountId !== accountId), next],
    };
  });

  const profile = value.profiles.find((p) => p.accountId === accountId)!;
  return { ok: true, value: profile };
}

/** POST /soulmates/me/submit */
export async function submitMySoulmateProfile(): Promise<Result<SoulmateProfile>> {
  const auth = requireEmail();
  if (!auth.ok) return auth;
  const accountId = accountIdFromEmail(auth.value);
  const t = nowIso();
  let saved: SoulmateProfile | null = null;

  updateSoulmatesDb((db) => {
    const existing = db.profiles.find((p) => p.accountId === accountId);
    if (!existing) return db;
    const next: SoulmateProfile = {
      ...existing,
      status: "in_review",
      submittedAt: t,
      updatedAt: t,
      changeRequest: undefined,
      rejectReason: undefined,
    };
    saved = next;
    return {
      ...db,
      profiles: db.profiles.map((p) => (p.accountId === accountId ? next : p)),
    };
  });

  if (!saved) return { ok: false, error: "Save your profile before submitting." };
  return { ok: true, value: saved };
}

/** PATCH /soulmates/me/visibility */
export async function setMySoulmateVisibility(
  status: Extract<SoulmateProfileStatus, "live" | "paused" | "hidden">,
): Promise<Result<SoulmateProfile>> {
  const auth = requireEmail();
  if (!auth.ok) return auth;
  const accountId = accountIdFromEmail(auth.value);
  let saved: SoulmateProfile | null = null;
  const t = nowIso();

  updateSoulmatesDb((db) => {
    const existing = db.profiles.find((p) => p.accountId === accountId);
    if (!existing || (existing.status !== "live" && existing.status !== "paused" && existing.status !== "hidden")) {
      return db;
    }
    const next = { ...existing, status, updatedAt: t };
    saved = next;
    return {
      ...db,
      profiles: db.profiles.map((p) => (p.accountId === accountId ? next : p)),
    };
  });

  if (!saved) return { ok: false, error: "Only a verified profile can change visibility." };
  return { ok: true, value: saved };
}

/** DELETE /soulmates/me */
export async function deleteMySoulmateProfile(): Promise<Result<true>> {
  const auth = requireEmail();
  if (!auth.ok) return auth;
  const accountId = accountIdFromEmail(auth.value);
  const mine = readSoulmatesDb().profiles.find((p) => p.accountId === accountId);
  if (!mine) return { ok: false, error: "No profile to delete." };

  updateSoulmatesDb((db) => ({
    ...db,
    profiles: db.profiles.filter((p) => p.accountId !== accountId),
    introductions: db.introductions.filter(
      (i) => i.profileAId !== mine.id && i.profileBId !== mine.id,
    ),
    blocks: db.blocks.filter(
      (b) => b.blockerProfileId !== mine.id && b.blockedProfileId !== mine.id,
    ),
  }));
  return { ok: true, value: true };
}

/** GET /soulmates/me/introductions */
export async function listMyIntroductions(): Promise<Introduction[]> {
  const mine = await getMySoulmateProfile();
  if (!mine) return [];
  return readSoulmatesDb().introductions.filter(
    (i) => i.profileAId === mine.id || i.profileBId === mine.id,
  );
}

export function useMyIntroductions(): Introduction[] {
  const db = useSoulmatesDb();
  const mine = useMySoulmateProfile();
  return useMemo(() => {
    if (!mine) return [];
    return db.introductions.filter((i) => i.profileAId === mine.id || i.profileBId === mine.id);
  }, [db, mine]);
}

/** POST /soulmates/introductions/{id}/respond */
export async function respondToIntroduction(
  introductionId: string,
  response: Exclude<IntroductionResponse, "pending">,
): Promise<Result<Introduction>> {
  const mine = await getMySoulmateProfile();
  if (!mine) return { ok: false, error: "Please sign in." };
  let saved: Introduction | null = null;

  updateSoulmatesDb((db) => {
    const intro = db.introductions.find((i) => i.id === introductionId);
    if (!intro) return db;
    const side = intro.profileAId === mine.id ? "a" : intro.profileBId === mine.id ? "b" : null;
    if (!side) return db;
    const responses = { ...intro.responses, [side]: response };
    let status = intro.status;
    if (responses.a === "interested" && responses.b === "interested") status = "mutual";
    else if (responses.a === "not_for_me" || responses.b === "not_for_me") status = "closed";
    else status = "pending";
    const next = { ...intro, responses, status };
    saved = next;
    return {
      ...db,
      introductions: db.introductions.map((i) => (i.id === introductionId ? next : i)),
    };
  });

  if (!saved) return { ok: false, error: "Introduction not found." };
  return { ok: true, value: saved };
}

/**
 * GET /soulmates/introductions/{id}/profile — the other person, only if
 * this introduction involves the signed-in member.
 */
export async function getIntroducedProfile(
  introductionId: string,
): Promise<Result<{ introduction: Introduction; profile: SoulmateProfile; revealContact: boolean }>> {
  const mine = await getMySoulmateProfile();
  if (!mine) return { ok: false, error: "Please sign in." };
  const intro = readSoulmatesDb().introductions.find((i) => i.id === introductionId);
  if (!intro || (intro.profileAId !== mine.id && intro.profileBId !== mine.id)) {
    return { ok: false, error: "Introduction not found." };
  }
  const otherId = intro.profileAId === mine.id ? intro.profileBId : intro.profileAId;
  const profile = readSoulmatesDb().profiles.find((p) => p.id === otherId);
  if (!profile) return { ok: false, error: "Profile not found." };
  return {
    ok: true,
    value: {
      introduction: intro,
      profile,
      revealContact: intro.status === "mutual",
    },
  };
}

/** POST /soulmates/reports */
export async function reportSoulmateProfile(input: {
  reportedProfileId: string;
  reason: string;
  note: string;
}): Promise<Result<SoulmateReport>> {
  const mine = await getMySoulmateProfile();
  if (!mine) return { ok: false, error: "Please sign in." };
  const report: SoulmateReport = {
    id: newId("smr"),
    reporterProfileId: mine.id,
    reportedProfileId: input.reportedProfileId,
    reason: input.reason.trim(),
    note: input.note.trim(),
    createdAt: nowIso(),
    status: "open",
  };
  updateSoulmatesDb((db) => ({ ...db, reports: [...db.reports, report] }));
  return { ok: true, value: report };
}

/** Persist an ID upload into IndexedDB and return a SoulmateDocument. */
export async function buildSoulmateDocument(input: {
  profileId: string;
  type: VendorIdType;
  front: File;
  back?: File | null;
  consentAt: string;
}): Promise<SoulmateDocument> {
  const frontUrl = await putDocumentBlob(input.front);
  const files: SoulmateDocument["files"] = [
    {
      name: input.front.name,
      mimeType: input.front.type || "application/octet-stream",
      size: input.front.size,
      url: frontUrl,
      side: "front",
    },
  ];
  if (input.back) {
    const backUrl = await putDocumentBlob(input.back);
    files.push({
      name: input.back.name,
      mimeType: input.back.type || "application/octet-stream",
      size: input.back.size,
      url: backUrl,
      side: "back",
    });
  }
  return {
    id: newId("smdoc"),
    profileId: input.profileId,
    type: input.type,
    files,
    status: "submitted",
    consentAt: input.consentAt,
    submittedAt: nowIso(),
  };
}

/** Persist a profile photo into IndexedDB. */
export async function uploadSoulmatePhoto(file: File, order: number): Promise<SoulmatePhoto> {
  const url = await putDocumentBlob(file);
  return {
    id: newId("smph"),
    url,
    order,
    status: "pending",
  };
}

/* ---------------------------------------------------- member helpers */

const SEEN_KEY = "wedoura:soulmates-seen";

function isBlockedPair(blockerId: string, otherId: string, blocks: SoulmateBlock[]): boolean {
  return blocks.some(
    (b) =>
      (b.blockerProfileId === blockerId && b.blockedProfileId === otherId) ||
      (b.blockerProfileId === otherId && b.blockedProfileId === blockerId),
  );
}

function mySideOf(intro: Introduction, mineId: string): "a" | "b" | null {
  if (intro.profileAId === mineId) return "a";
  if (intro.profileBId === mineId) return "b";
  return null;
}

export function otherProfileId(intro: Introduction, mineId: string): string {
  return intro.profileAId === mineId ? intro.profileBId : intro.profileAId;
}

export function formatHeightCm(cm: number): string {
  const totalIn = Math.round(cm / 2.54);
  const ft = Math.floor(totalIn / 12);
  const inch = totalIn % 12;
  return `${ft}′ ${inch}″ · ${cm} cm`;
}

export function whatsappForProfile(profile: SoulmateProfile): string {
  if (profile.createdFor !== "myself" && profile.creator.whatsapp) {
    return profile.creator.whatsapp;
  }
  return profile.phone;
}

export function isFamilyLed(profile: SoulmateProfile): boolean {
  return profile.createdFor !== "myself";
}

export type SoulmateIntroView = {
  introduction: Introduction;
  profile: SoulmateProfile;
  mySide: "a" | "b";
  theirSide: "a" | "b";
  myResponse: IntroductionResponse;
  theirResponse: IntroductionResponse;
  mutual: boolean;
  revealContact: boolean;
  revealPhotos: boolean;
};

function toIntroView(
  intro: Introduction,
  mine: SoulmateProfile,
  other: SoulmateProfile,
  viewerVerified: boolean,
): SoulmateIntroView {
  const mySide = mySideOf(intro, mine.id)!;
  const theirSide = mySide === "a" ? "b" : "a";
  const mutual = intro.status === "mutual";
  const revealPhotos =
    mutual || (other.photoVisibility === "verified" && viewerVerified && mine.status === "live");
  return {
    introduction: intro,
    profile: other,
    mySide,
    theirSide,
    myResponse: intro.responses[mySide],
    theirResponse: intro.responses[theirSide],
    mutual,
    revealContact: mutual,
    revealPhotos,
  };
}

function activeIntroductionsFor(mine: SoulmateProfile): SoulmateIntroView[] {
  const db = readSoulmatesDb();
  const viewerVerified = mine.status === "live" || mine.status === "paused" || mine.status === "hidden";
  return db.introductions
    .filter((i) => i.profileAId === mine.id || i.profileBId === mine.id)
    .filter((i) => {
      const otherId = otherProfileId(i, mine.id);
      return !isBlockedPair(mine.id, otherId, db.blocks);
    })
    .map((i) => {
      const other = db.profiles.find((p) => p.id === otherProfileId(i, mine.id));
      if (!other) return null;
      return toIntroView(i, mine, other, viewerVerified);
    })
    .filter((x): x is SoulmateIntroView => Boolean(x));
}

export function useMyIntroductionViews(): SoulmateIntroView[] {
  const db = useSoulmatesDb();
  const mine = useMySoulmateProfile();
  return useMemo(() => {
    if (!mine) return [];
    void db;
    return activeIntroductionsFor(mine);
  }, [db, mine]);
}

/** This week: open intros I have not answered (exclude closed). Cap 5. */
export function useThisWeekIntroductions(): SoulmateIntroView[] {
  const all = useMyIntroductionViews();
  return useMemo(
    () =>
      all
        .filter((v) => v.introduction.status === "pending" && v.myResponse === "pending")
        .slice(0, 5),
    [all],
  );
}

/** They said interested first; I have not answered. */
export function useInterestedInMe(): SoulmateIntroView[] {
  const all = useMyIntroductionViews();
  return useMemo(
    () =>
      all.filter(
        (v) =>
          v.introduction.status === "pending" &&
          v.theirResponse === "interested" &&
          v.myResponse === "pending",
      ),
    [all],
  );
}

export function useMutualIntroductions(): SoulmateIntroView[] {
  const all = useMyIntroductionViews();
  return useMemo(() => all.filter((v) => v.mutual), [all]);
}

/**
 * GET /soulmates/profiles/{id} — only if introduced (or own profile for preview).
 */
export async function getSoulmateProfileForMember(
  profileId: string,
): Promise<Result<SoulmateIntroView | { preview: true; profile: SoulmateProfile }>> {
  const mine = await getMySoulmateProfile();
  if (!mine) return { ok: false, error: "Please sign in." };
  if (profileId === mine.id) {
    return { ok: true, value: { preview: true, profile: mine } };
  }
  const db = readSoulmatesDb();
  if (isBlockedPair(mine.id, profileId, db.blocks)) {
    return { ok: false, error: "This profile isn't available." };
  }
  const intro = db.introductions.find(
    (i) =>
      (i.profileAId === mine.id && i.profileBId === profileId) ||
      (i.profileBId === mine.id && i.profileAId === profileId),
  );
  if (!intro || intro.status === "closed") {
    return { ok: false, error: "This profile isn't available." };
  }
  const other = db.profiles.find((p) => p.id === profileId);
  if (!other) return { ok: false, error: "This profile isn't available." };
  const viewerVerified = mine.status === "live" || mine.status === "paused" || mine.status === "hidden";
  return { ok: true, value: toIntroView(intro, mine, other, viewerVerified) };
}

/** Undo a response back to pending (toast undo). */
export async function undoIntroductionResponse(introductionId: string): Promise<Result<Introduction>> {
  const mine = await getMySoulmateProfile();
  if (!mine) return { ok: false, error: "Please sign in." };
  let saved: Introduction | null = null;
  updateSoulmatesDb((db) => {
    const intro = db.introductions.find((i) => i.id === introductionId);
    if (!intro) return db;
    const side = mySideOf(intro, mine.id);
    if (!side) return db;
    const responses = { ...intro.responses, [side]: "pending" as const };
    let status: Introduction["status"] = "pending";
    if (responses.a === "interested" && responses.b === "interested") status = "mutual";
    else if (responses.a === "not_for_me" || responses.b === "not_for_me") status = "closed";
    const next = { ...intro, responses, status };
    saved = next;
    return {
      ...db,
      introductions: db.introductions.map((i) => (i.id === introductionId ? next : i)),
    };
  });
  if (!saved) return { ok: false, error: "Introduction not found." };
  return { ok: true, value: saved };
}

/** Fields that send a live/paused/hidden profile back to in_review. */
export function editRequiresReview(
  before: SoulmateProfile,
  after: Pick<SoulmateProfile, "basics" | "photos" | "identityDocument">,
): boolean {
  if (before.basics.firstName !== after.basics.firstName) return true;
  if (before.basics.lastName !== after.basics.lastName) return true;
  if (before.basics.dateOfBirth !== after.basics.dateOfBirth) return true;
  const beforePhotos = before.photos.map((p) => p.id).join(",");
  const afterPhotos = after.photos.map((p) => p.id).join(",");
  if (beforePhotos !== afterPhotos) return true;
  const beforeDoc = before.identityDocument?.id ?? "";
  const afterDoc = after.identityDocument?.id ?? beforeDoc;
  if (beforeDoc !== afterDoc) return true;
  return false;
}

export type SoulmateSettingsPatch = {
  photoVisibility?: SoulmatePhotoVisibility;
  incomePrivate?: boolean;
  familyCanJoin?: boolean;
};

/** PATCH /soulmates/me/settings — privacy toggles that save immediately. */
export async function updateMySoulmateSettings(patch: SoulmateSettingsPatch): Promise<Result<SoulmateProfile>> {
  const auth = requireEmail();
  if (!auth.ok) return auth;
  const accountId = accountIdFromEmail(auth.value);
  let saved: SoulmateProfile | null = null;
  const t = nowIso();
  updateSoulmatesDb((db) => {
    const existing = db.profiles.find((p) => p.accountId === accountId);
    if (!existing) return db;
    const next: SoulmateProfile = {
      ...existing,
      photoVisibility: patch.photoVisibility ?? existing.photoVisibility,
      work: {
        ...existing.work,
        incomePrivate: patch.incomePrivate ?? existing.work.incomePrivate,
      },
      about: {
        ...existing.about,
        familyCanJoin: patch.familyCanJoin ?? existing.about.familyCanJoin,
      },
      updatedAt: t,
    };
    saved = next;
    return {
      ...db,
      profiles: db.profiles.map((p) => (p.accountId === accountId ? next : p)),
    };
  });
  if (!saved) return { ok: false, error: "No profile to update." };
  return { ok: true, value: saved };
}

/**
 * PUT /soulmates/me with optional re-review. When `sendToReview` is true and
 * the profile was live/paused/hidden, status becomes in_review.
 */
export async function updateMySoulmateProfile(
  input: SoulmateProfileInput,
  opts?: { sendToReview?: boolean },
): Promise<Result<SoulmateProfile>> {
  const auth = requireEmail();
  if (!auth.ok) return auth;
  const accountId = accountIdFromEmail(auth.value);
  const t = nowIso();
  let saved: SoulmateProfile | null = null;

  updateSoulmatesDb((db) => {
    const existing = db.profiles.find((p) => p.accountId === accountId);
    if (!existing) return db;
    const wasVisible =
      existing.status === "live" || existing.status === "paused" || existing.status === "hidden";
    const next: SoulmateProfile = {
      ...existing,
      ...input,
      updatedAt: t,
      status:
        opts?.sendToReview && wasVisible
          ? "in_review"
          : existing.status === "changes_requested" && opts?.sendToReview
            ? "in_review"
            : existing.status,
      submittedAt: opts?.sendToReview ? t : existing.submittedAt,
      changeRequest: opts?.sendToReview ? undefined : existing.changeRequest,
    };
    if (opts?.sendToReview && wasVisible) {
      next.verifiedAt = undefined;
    }
    saved = next;
    return {
      ...db,
      profiles: db.profiles.map((p) => (p.accountId === accountId ? next : p)),
    };
  });

  if (!saved) return { ok: false, error: "No profile to update." };
  return { ok: true, value: saved };
}

export type BlockedMember = {
  block: SoulmateBlock;
  profile: SoulmateProfile;
};

export function useMyBlocks(): BlockedMember[] {
  const db = useSoulmatesDb();
  const mine = useMySoulmateProfile();
  return useMemo(() => {
    if (!mine) return [];
    return db.blocks
      .filter((b) => b.blockerProfileId === mine.id)
      .map((b) => {
        const profile = db.profiles.find((p) => p.id === b.blockedProfileId);
        return profile ? { block: b, profile } : null;
      })
      .filter((x): x is BlockedMember => Boolean(x));
  }, [db, mine]);
}

/** Block and close introductions both ways. */
export async function blockSoulmateProfile(blockedProfileId: string): Promise<Result<SoulmateBlock>> {
  const mine = await getMySoulmateProfile();
  if (!mine) return { ok: false, error: "Please sign in." };
  const existing = readSoulmatesDb().blocks.find(
    (b) => b.blockerProfileId === mine.id && b.blockedProfileId === blockedProfileId,
  );
  if (existing) return { ok: true, value: existing };
  const block: SoulmateBlock = {
    id: newId("smb"),
    blockerProfileId: mine.id,
    blockedProfileId,
    createdAt: nowIso(),
  };
  updateSoulmatesDb((db) => ({
    ...db,
    blocks: [...db.blocks, block],
    introductions: db.introductions.map((i) => {
      const involves =
        (i.profileAId === mine.id && i.profileBId === blockedProfileId) ||
        (i.profileBId === mine.id && i.profileAId === blockedProfileId);
      return involves ? { ...i, status: "closed" as const } : i;
    }),
  }));
  return { ok: true, value: block };
}

export async function unblockSoulmateProfile(blockedProfileId: string): Promise<Result<true>> {
  const mine = await getMySoulmateProfile();
  if (!mine) return { ok: false, error: "Please sign in." };
  updateSoulmatesDb((db) => ({
    ...db,
    blocks: db.blocks.filter(
      (b) => !(b.blockerProfileId === mine.id && b.blockedProfileId === blockedProfileId),
    ),
  }));
  return { ok: true, value: true };
}

function readSeenAt(email: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, string>;
    return map[email] ?? null;
  } catch {
    return null;
  }
}

export function markSoulmatesSeen(): void {
  const email = getCoupleEmail();
  if (!email || typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[email] = nowIso();
    window.localStorage.setItem(SEEN_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event("wedoura:soulmates-change"));
  } catch {
    /* private mode */
  }
}

/** Dot when there are unanswered intros or new interests since last visit. */
export function useSoulmatesActivityDot(): boolean {
  const db = useSoulmatesDb();
  const mine = useMySoulmateProfile();
  const email = getCoupleEmail();
  return useMemo(() => {
    if (!mine || !email) return false;
    void db;
    const views = activeIntroductionsFor(mine);
    const unanswered = views.some(
      (v) => v.introduction.status === "pending" && v.myResponse === "pending",
    );
    if (unanswered) return true;
    const seen = readSeenAt(email);
    if (!seen) return views.some((v) => v.theirResponse === "interested");
    return views.some(
      (v) =>
        v.theirResponse === "interested" &&
        v.myResponse === "pending" &&
        v.introduction.createdAt > seen,
    );
  }, [db, mine, email]);
}

export function sharedValues(a: SoulmateProfile, b: SoulmateProfile): string[] {
  return a.preferences.values.filter((v) => b.preferences.values.includes(v));
}

export function preferencesFitBothWays(viewer: SoulmateProfile, other: SoulmateProfile): {
  ageFits: boolean;
  locationOverlap: boolean;
} {
  const otherAge = ageFromDob(other.basics.dateOfBirth);
  const viewerAge = ageFromDob(viewer.basics.dateOfBirth);
  const ageFits =
    otherAge !== null &&
    viewerAge !== null &&
    otherAge >= viewer.preferences.ageMin &&
    otherAge <= viewer.preferences.ageMax &&
    viewerAge >= other.preferences.ageMin &&
    viewerAge <= other.preferences.ageMax;
  const locationOverlap =
    viewer.preferences.locations.length === 0 ||
    other.preferences.locations.length === 0 ||
    viewer.preferences.locations.some((l) => other.preferences.locations.includes(l)) ||
    viewer.preferences.locations.includes("Anywhere in India") ||
    other.preferences.locations.includes("Anywhere in India");
  return { ageFits, locationOverlap };
}

export type { SoulmateCreatedFor, SoulmateGender, SoulmateMaritalStatus };
