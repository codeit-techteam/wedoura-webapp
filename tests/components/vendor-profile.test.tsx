// @vitest-environment jsdom
/**
 * The profile: a full listing surfaces every section with the right content;
 * a minimal listing hides its empty sections cleanly and still reads as a
 * complete page. Private fields never render.
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
import { listingToDetail, listingToSummary } from "@/lib/listing-view";
import { formatPrice } from "@/lib/format";
import { makeFullListing, makeMinimalListing, makeVenueListing } from "../helpers/listing-builder";

const fieldsOf = (slug: string) => allCategories.find((c) => c.slug === slug)?.fields;

const refs = {
  categories: [
    { slug: "photography-films", name: "Photography & Films" },
    { slug: "venues", name: "Venues" },
    { slug: "decor-styling", name: "Decor & Styling" },
  ],
  cities: [
    { slug: "udaipur", name: "Udaipur" },
    { slug: "goa", name: "Goa" },
    { slug: "jaipur", name: "Jaipur" },
  ],
};

afterEach(cleanup);

describe("a full profile", () => {
  const listing = makeFullListing({
    packages: [
      {
        label: "One day",
        priceINR: 175000,
        unit: "per_event",
        note: "Two of us",
        inclusions: ["Two photographers through the day", "An online gallery within six weeks"],
      },
      { label: "Full week", unit: "on_request", inclusions: ["Everything in One day, every day"] },
    ],
  });
  const detail = listingToDetail(listing, refs.categories, refs.cities);
  const similar = [listingToSummary(makeMinimalListing(), refs.categories, refs.cities)];

  it("places every field", () => {
    const { container } = render(
      <VendorProfile vendor={detail} similar={similar} categoryFields={fieldsOf("photography-films")} />,
    );
    const text = container.textContent ?? "";
    // Identity
    expect(text).toContain("Test Atelier Nine");
    expect(text).toContain("A very distinctive tagline");
    for (const para of listing.about) expect(text).toContain(para);
    expect(text).toContain("Two photographers and a dog"); // team
    expect(text).toContain("11"); // yearsActive
    // Categorisation and place
    expect(text).toContain("Photography & Films");
    expect(text).toContain("Udaipur");
    for (const service of listing.services) expect(text).toContain(service);
    expect(text).toContain("Editorial, Candid"); // styles, as a key fact
    expect(text).toContain("Photography + film"); // the category select value
    expect(text).toContain("Second shooter"); // the true toggle
    expect(text).toContain("Across India and abroad"); // travels
    expect(text).toContain("Also serves Goa"); // the other city served
    // Price and packages
    expect(text).toContain(formatPrice(175000, "per_event"));
    for (const pkg of listing.packages) {
      expect(text).toContain(pkg.label);
      for (const inclusion of pkg.inclusions ?? []) expect(text).toContain(inclusion);
    }
    // Albums and FAQs (collapsed content stays in the markup)
    expect(text).toContain("A test album");
    expect(text).toContain("January 2026"); // the album date, formatted
    expect(text).toContain("A test question?");
    expect(text).toContain("A test answer.");
    // Similar rail
    expect(text).toContain("Bare Minimum Studio");
  });

  it("marks a verified vendor", () => {
    const { container } = render(<VendorProfile vendor={detail} similar={[]} />);
    expect(container.textContent).toContain("Verified");
  });

  it("renders services and styles as individual chips", () => {
    const { container } = render(<VendorProfile vendor={detail} similar={[]} />);
    const chips = container.querySelector('ul[aria-label="Services and styles"]');
    expect(chips).not.toBeNull();
    const items = [...chips!.querySelectorAll("li")].map((li) => li.textContent?.trim());
    for (const entry of [...listing.services, ...listing.styles]) expect(items).toContain(entry);
  });

  it("renders the photographs with alt text and a WhatsApp link", () => {
    const { container } = render(<VendorProfile vendor={detail} similar={[]} />);
    const altTexts = [...container.querySelectorAll("img")].map((img) => img.getAttribute("alt"));
    expect(altTexts).toContain(listing.portfolio[3].alt);
    const whatsapp = container.querySelector('a[href^="https://wa.me/"]');
    expect(whatsapp).not.toBeNull();
    expect(whatsapp!.getAttribute("href")).toContain("911111111111"); // the public whatsapp…
  });

  it("never shows the phone, account or admin fields", () => {
    const { container } = render(<VendorProfile vendor={detail} similar={[]} />);
    const html = container.innerHTML;
    expect(html).not.toContain("912222222222"); // contact.phone
    expect(html).not.toContain("test-acc-full");
  });
});

describe("a minimal profile", () => {
  const detail = listingToDetail(makeMinimalListing(), refs.categories, refs.cities);

  it("still reads as a complete page", () => {
    const { container } = render(<VendorProfile vendor={detail} similar={[]} />);
    const text = container.textContent ?? "";
    expect(text).toContain("Bare Minimum Studio");
    expect(text).toContain("Just enough to publish");
    expect(text).toContain("One paragraph only.");
    expect(text).toContain("Decor & Styling");
    expect(text).toContain("Jaipur");
    expect(text).toContain(formatPrice(undefined, "on_request"));
  });

  it("hides every empty section cleanly", () => {
    const full = render(
      <VendorProfile vendor={listingToDetail(makeFullListing(), refs.categories, refs.cities)} similar={[]} />,
    );
    const fullHeadings = [...full.container.querySelectorAll("h2, h3")].map((h) => h.textContent?.trim());
    full.unmount();

    const { container } = render(<VendorProfile vendor={detail} similar={[]} />);
    const text = container.textContent ?? "";
    const headings = [...container.querySelectorAll("h2, h3")].map((h) => h.textContent?.trim());
    // No stray content from sections the listing does not have.
    expect(text).not.toContain("A test album");
    expect(text).not.toContain("A test question?");
    // Unverified, serving only its own city: no mark, no "also serves" line.
    expect(text).not.toContain("Verified");
    expect(text).not.toContain("Also serves");
    // The minimal page renders strictly fewer sections than the full one,
    // and no heading is an empty shell.
    expect(headings.length).toBeLessThan(fullHeadings.length);
    for (const heading of headings) expect(heading).toBeTruthy();
    // No empty lists left behind.
    for (const ul of container.querySelectorAll("ul")) {
      expect(ul.children.length).toBeGreaterThan(0);
    }
  });
});

describe("a venue profile", () => {
  it("shows capacity, spaces, overview facts and the 360 entry point", () => {
    const detail = listingToDetail(makeVenueListing(), refs.categories, refs.cities);
    const { container } = render(<VenueProfile vendor={detail} similar={[]} />);
    const text = container.textContent ?? "";
    expect(text).toContain("80");
    expect(text).toContain("600");
    expect(text).toContain("guests");
    expect(text).toContain("Heritage palace");
    expect(text).toContain("42");
    expect(text).toContain("The courtyard");
    expect(text).toContain("The lawn");
    expect(text).toContain("Start the 360° tour");
  });
});
