import { describe, expect, it } from "vitest";
import { degToRad, looksEquirect, MIN_PANORAMA_WIDTH, xmpSaysEquirect } from "@/lib/panorama";

describe("looksEquirect", () => {
  it("accepts exact 2:1", () => {
    expect(looksEquirect(4096, 2048)).toBe(true);
    expect(looksEquirect(8192, 4096)).toBe(true);
  });

  it("accepts 2:1 within 1%", () => {
    expect(looksEquirect(4096, 2068)).toBe(true); // 0.97% off
    expect(looksEquirect(4056, 2048)).toBe(true);
  });

  it("rejects beyond 1%", () => {
    expect(looksEquirect(4096, 2100)).toBe(false);
    expect(looksEquirect(3000, 2000)).toBe(false);
    expect(looksEquirect(1600, 2400)).toBe(false);
  });

  it("rejects degenerate sizes", () => {
    expect(looksEquirect(0, 0)).toBe(false);
    expect(looksEquirect(-4096, -2048)).toBe(false);
  });
});

describe("xmpSaysEquirect", () => {
  it("matches GPano attribute form", () => {
    expect(xmpSaysEquirect('<rdf:Description GPano:ProjectionType="equirectangular"/>')).toBe(true);
  });

  it("matches GPano element form", () => {
    expect(xmpSaysEquirect("<GPano:ProjectionType>equirectangular</GPano:ProjectionType>")).toBe(true);
  });

  it("needs the GPano namespace", () => {
    expect(xmpSaysEquirect('ProjectionType="equirectangular"')).toBe(false);
  });

  it("rejects other projections and plain text", () => {
    expect(xmpSaysEquirect('GPano:ProjectionType="cylindrical"')).toBe(false);
    expect(xmpSaysEquirect("an ordinary jpeg header")).toBe(false);
  });
});

describe("constants and conversion", () => {
  it("keeps the 4000px floor", () => {
    expect(MIN_PANORAMA_WIDTH).toBe(4000);
  });

  it("converts degrees to radians", () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI);
    expect(degToRad(0)).toBe(0);
    expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
  });
});
