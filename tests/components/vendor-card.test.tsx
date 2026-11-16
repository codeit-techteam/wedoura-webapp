// @vitest-environment jsdom
/** The card: every VendorSummary field a couple should see, nothing else. */
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

import { VendorCard } from "@/components/cards/VendorCard";
import { listingToSummary } from "@/lib/listing-view";
import { formatPrice } from "@/lib/format";
import { makeFullListing } from "../helpers/listing-builder";

const refs = {
  categories: [{ slug: "photography-films", name: "Photography & Films" }],
  cities: [{ slug: "udaipur", name: "Udaipur" }],
};

afterEach(cleanup);

describe("VendorCard", () => {
  const listing = makeFullListing();
  const summary = listingToSummary(listing, refs.categories, refs.cities);

  it("shows name, category, city and the formatted price, and links to the profile", () => {
    const { container } = render(<VendorCard vendor={summary} />);
    const text = container.textContent ?? "";
    expect(text).toContain("Test Atelier Nine");
    expect(text).toContain("Udaipur");
    expect(text).toContain(formatPrice(175000, "per_event"));
    const link = container.querySelector('a[href="/vendors/test-atelier-nine"]');
    expect(link).not.toBeNull();
  });

  it("renders the card photos with their alt text and never private data", () => {
    const { container } = render(<VendorCard vendor={summary} />);
    const altTexts = [...container.querySelectorAll("img")].map((img) => img.getAttribute("alt"));
    expect(altTexts).toContain(listing.cardPhotos[0].alt);
    const text = container.textContent ?? "";
    expect(text).not.toContain("+912222222222"); // the phone
    expect(text).not.toContain("test-acc-full"); // the account id
  });

  it("formats on-request pricing", () => {
    const onRequest = listingToSummary(
      makeFullListing({ startingPriceINR: undefined, priceUnit: "on_request" }),
      refs.categories,
      refs.cities,
    );
    const { container } = render(<VendorCard vendor={onRequest} />);
    expect(container.textContent).toContain(formatPrice(undefined, "on_request"));
  });
});
