/**
 * Every field a public profile section uses must name a dashboard editor in
 * the registry (status OK). READ-ONLY and DERIVED are allowed without an editor.
 */
import { describe, expect, it } from "vitest";
import {
  PROFILE_CHROME_FIELDS,
  VENDOR_PROFILE_SECTIONS,
  VENUE_PROFILE_SECTIONS,
  editableProfileFields,
  profileSubnav,
} from "@/lib/profile-sections";
import { listingToDetail } from "@/lib/listing-view";
import { makeFullListing, makeVenueListing } from "./helpers/listing-builder";

const categories = [
  { slug: "photography-films", name: "Photography & films" },
  { slug: "venues", name: "Venues" },
];
const cities = [{ slug: "udaipur", name: "Udaipur" }];

describe("profile-sections registry", () => {
  it("gives every OK field a dashboard screen path or note", () => {
    const fields = editableProfileFields();
    expect(fields.length).toBeGreaterThan(20);
    for (const field of fields) {
      expect(field.dashboard, `${field.path} has no dashboard`).toBeTruthy();
      expect(field.dashboard.toLowerCase()).not.toContain("missing");
      expect(
        field.dashboard.startsWith("/") ||
          field.dashboard.includes("Admin") ||
          field.dashboard.includes("Not public") ||
          field.dashboard.includes("Derived"),
        `${field.path} dashboard "${field.dashboard}" looks empty`,
      ).toBe(true);
    }
  });

  it("fails if any public section field is marked without an editor", () => {
    const all = [
      ...PROFILE_CHROME_FIELDS,
      ...VENDOR_PROFILE_SECTIONS.flatMap((s) => s.fields),
      ...VENUE_PROFILE_SECTIONS.flatMap((s) => s.fields),
    ];
    const bad = all.filter(
      (f) => f.status === ("MISSING" as typeof f.status) || f.status === ("INCONSISTENT" as typeof f.status),
    );
    expect(bad, bad.map((f) => `${f.path}:${f.status}`).join(", ")).toEqual([]);
  });

  it("builds vendor and venue subnav from contentful sections", () => {
    const vendor = listingToDetail(makeFullListing(), categories, cities);
    const venue = listingToDetail(makeVenueListing(), categories, cities);
    const vendorNav = profileSubnav("vendor", vendor);
    const venueNav = profileSubnav("venue", venue);
    expect(vendorNav.some((s) => s.id === "inquire")).toBe(true);
    expect(venueNav.some((s) => s.id === "enquire")).toBe(true);
    expect(vendorNav.every((s) => s.id && s.label)).toBe(true);
    expect(venueNav.every((s) => s.id && s.label)).toBe(true);
  });
});
