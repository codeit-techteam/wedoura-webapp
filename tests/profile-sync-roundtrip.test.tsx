// @vitest-environment jsdom
/**
 * Dashboard → public profile sync: after "saving" listing fields the way the
 * studio does (patch VendorListing → listingToDetail → VendorProfile /
 * VenueProfile), values appear with correct formatting; clearing them hides
 * the section. Also covers enquiry status for the couple account mapper.
 */
import { cleanup, render } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { src, alt, ...rest } = props;
    void rest;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={String(src)} alt={String(alt ?? "")} />;
  },
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: unknown; children: React.ReactNode } & Record<string, unknown>) => {
    void rest;
    return <a href={typeof href === "string" ? href : "#"}>{children}</a>;
  },
}));

import { VendorProfile } from "@/components/profile/VendorProfile";
import { VenueProfile } from "@/components/profile/VenueProfile";
import { categories as allCategories } from "@/data/categories";
import { photos } from "@/data/photos";
import type { Inquiry, VendorListing } from "@/data/types";
import { formatPrice } from "@/lib/format";
import { INQUIRY_STATUS_LABEL, normalizeInquiry } from "@/lib/inquiry";
import { listingToDetail, listingToSummary } from "@/lib/listing-view";
import { profileSubnav } from "@/lib/profile-sections";
import { makeFullListing, makeVenueListing } from "./helpers/listing-builder";

const fieldsOf = (slug: string) => allCategories.find((c) => c.slug === slug)?.fields;

const refs = {
  categories: [
    { slug: "photography-films", name: "Photography & Films" },
    { slug: "venues", name: "Venues" },
  ],
  cities: [
    { slug: "udaipur", name: "Udaipur" },
    { slug: "goa", name: "Goa" },
  ],
};

afterEach(cleanup);

function renderVendor(listing: VendorListing) {
  const detail = listingToDetail(listing, refs.categories, refs.cities);
  const similar = [listingToSummary(listing, refs.categories, refs.cities)];
  return render(
    <VendorProfile vendor={detail} similar={similar} categoryFields={fieldsOf(listing.category)} />,
  );
}

describe("profile-sync round-trip (vendor)", () => {
  it("shows business name, tagline, starting price, collection, FAQ, testimonial, caption, cover, story and film", () => {
    const listing = makeFullListing({
      name: "Sync Studio Name",
      tagline: "Sync tagline for the hero",
      startingPriceINR: 199999,
      priceUnit: "per_event",
      packages: [
        {
          label: "Sync half day",
          priceINR: 99000,
          unit: "per_event",
          note: "Half day coverage",
          inclusions: ["Two photographers"],
        },
      ],
      faqs: [{ question: "Sync FAQ question?", answer: "Sync FAQ answer." }],
      testimonials: [
        { quote: "Sync testimonial quote about the day.", couple: "Asha & Rohan", location: "Goa" },
      ],
      cover: { ...photos.p13, alt: "Sync cover alt text" },
      portfolio: [
        { ...photos.p13, alt: "Sync cover alt text" },
        { ...photos.p35, alt: "Sync portfolio caption" },
      ],
      albums: [
        {
          slug: "sync-story",
          title: "Sync palace morning",
          location: "Udaipur",
          excerpt: "A quiet start",
          photos: [photos.p24, photos.p18],
          featured: true,
        },
      ],
      films: [
        {
          id: "sync-film",
          title: "Sync morning film",
          previewSrc: "",
          fullSrc: "",
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          poster: photos.p24,
          durationSec: 0,
        },
      ],
    });

    const { container } = renderVendor(listing);
    const text = container.textContent ?? "";

    expect(text).toContain("Sync Studio Name");
    expect(text).toContain("Sync tagline for the hero");
    expect(text).toContain(formatPrice(199999, "per_event"));
    expect(text).toContain("Sync half day");
    expect(text).toContain(formatPrice(99000, "per_event"));
    expect(text).toContain("Sync FAQ question?");
    expect(text).toContain("Sync FAQ answer.");
    expect(text).toContain("Sync testimonial quote about the day.");
    expect(text).toContain("Asha & Rohan");
    expect(text).toContain("Sync palace morning");
    expect(text).toContain("Sync morning film");

    const imgs = Array.from(container.querySelectorAll("img"));
    expect(imgs.some((img) => img.getAttribute("alt") === "Sync cover alt text")).toBe(true);
    expect(imgs.some((img) => img.getAttribute("alt") === "Sync portfolio caption")).toBe(true);
  });

  it("hides FAQ, kind words, pricing packages, films and albums when cleared", () => {
    const listing = makeFullListing({
      packages: [],
      startingPriceINR: undefined,
      faqs: [],
      testimonials: [],
      press: [],
      films: [],
      albums: [],
      about: ["Still here"],
    });
    const detail = listingToDetail(listing, refs.categories, refs.cities);
    const nav = profileSubnav("vendor", detail);
    expect(nav.some((s) => s.id === "faq")).toBe(false);
    expect(nav.some((s) => s.id === "kind-words")).toBe(false);
    expect(nav.some((s) => s.id === "pricing")).toBe(false);
    expect(nav.some((s) => s.id === "films")).toBe(false);
    expect(nav.some((s) => s.id === "albums")).toBe(false);
    expect(nav.some((s) => s.id === "inside")).toBe(false);

    const { container } = render(
      <VendorProfile
        vendor={detail}
        similar={[]}
        categoryFields={fieldsOf("photography-films")}
      />,
    );
    const text = container.textContent ?? "";
    expect(container.querySelector("#faq")).toBeNull();
    expect(container.querySelector("#kind-words")).toBeNull();
    expect(container.querySelector("#pricing")).toBeNull();
    expect(container.querySelector("#films")).toBeNull();
    expect(container.querySelector("#albums")).toBeNull();
    expect(text).toContain("Still here");
  });
});

describe("profile-sync round-trip (venue)", () => {
  it("shows venue name, tagline, capacity and hides empty spaces section", () => {
    const listing = makeVenueListing({
      name: "Sync Courtyard",
      tagline: "Sync venue tagline",
      venue: {
        capacity: { min: 80, max: 220 },
        capacityNote: "Ceremony under the trees",
        spaces: ["Lawn"],
        spaceDetails: [
          {
            name: "Sync Lawn",
            kind: "Outdoor · lawn",
            setting: "outdoor",
            ceremony: 120,
            dinner: 100,
            standing: 200,
          },
        ],
        overviewFacts: [{ label: "Setting", value: "Garden" }],
      },
    });
    const detail = listingToDetail(listing, refs.categories, refs.cities);
    const { container } = render(<VenueProfile vendor={detail} similar={[]} />);
    const text = container.textContent ?? "";
    expect(text).toContain("Sync Courtyard");
    expect(text).toContain("Sync venue tagline");
    expect(text).toContain("Sync Lawn");

    const emptySpaces = makeVenueListing({
      venue: {
        capacity: { min: 50, max: 100 },
        spaces: [],
        spaceDetails: [],
      },
    });
    const emptyDetail = listingToDetail(emptySpaces, refs.categories, refs.cities);
    const nav = profileSubnav("venue", emptyDetail);
    expect(nav.some((s) => s.id === "spaces")).toBe(false);
  });
});

describe("enquiry status for couple account", () => {
  it("normalizes status labels couples see (no quote)", () => {
    const raw = {
      id: "inq-sync",
      listingId: "lst-01",
      name: "Audit Couple",
      whatsapp: "9988776655",
      city: "Goa",
      message: "Checking dates",
      source: "vendor_profile",
      status: "replied",
      coupleEmail: "couple@gmail.com",
      createdAt: "2026-11-24T10:00:00.000Z",
      updatedAt: "2026-11-24T11:00:00.000Z",
    } satisfies Partial<Inquiry> & Record<string, unknown>;

    const inquiry = normalizeInquiry(raw);
    expect(inquiry.status).toBe("replied");
    expect(INQUIRY_STATUS_LABEL[inquiry.status]).toBe("Replied");
    expect("quoteINR" in inquiry).toBe(false);
    expect("stage" in inquiry).toBe(false);
  });
});
