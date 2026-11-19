import { describe, expect, it } from "vitest";
import { resolveTour } from "@/lib/tour";
import type { Photo, VenueTourData } from "@/data/types";

const pano = (id: string): Photo => ({
  id,
  src: `/360/${id}.jpg`,
  width: 4096,
  height: 2048,
  alt: id,
  blurDataURL: "data:image/jpeg;base64,x",
  projection: "equirectangular",
});

const flat = (id: string): Photo => ({
  id,
  src: `/photos/${id}.jpg`,
  width: 1600,
  height: 2400,
  alt: id,
  blurDataURL: "data:image/jpeg;base64,x",
});

const tour: VenueTourData = {
  scenes: [
    { id: "a", photoId: "x1", name: "Courtyard", startYaw: 40 },
    { id: "b", photoId: "x2", name: "Lawn" },
  ],
  links: [
    { from: "a", to: "b", yaw: 120 },
    { from: "b", to: "a", yaw: 300 },
  ],
  markers: [{ scene: "a", yaw: 10, pitch: -5, label: "Stage" }],
};

describe("resolveTour", () => {
  it("resolves scenes against the photos it is given", () => {
    const resolved = resolveTour(tour, [pano("x1"), pano("x2")]);
    expect(resolved?.scenes.map((s) => s.id)).toEqual(["a", "b"]);
    expect(resolved?.scenes[0].photo.src).toBe("/360/x1.jpg");
    expect(resolved?.scenes[0].startYaw).toBe(40);
    expect(resolved?.scenes[1].startYaw).toBe(0);
    expect(resolved?.links).toHaveLength(2);
    expect(resolved?.markers).toHaveLength(1);
  });

  it("drops scenes whose photo is missing (e.g. pending review), with their links and markers", () => {
    const resolved = resolveTour(tour, [pano("x2")]);
    expect(resolved?.scenes.map((s) => s.id)).toEqual(["b"]);
    expect(resolved?.links).toEqual([]);
    expect(resolved?.markers).toEqual([]);
  });

  it("ignores scenes pointing at flat photos", () => {
    expect(resolveTour(tour, [flat("x1"), flat("x2")])).toBeNull();
  });

  it("returns null without a tour or without scenes", () => {
    expect(resolveTour(undefined, [pano("x1")])).toBeNull();
    expect(resolveTour({ scenes: [], links: [] }, [pano("x1")])).toBeNull();
  });
});
