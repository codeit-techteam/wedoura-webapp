/**
 * 360° (equirectangular) photo detection. Pure functions so the rules are
 * testable without a browser: a photo counts as 360 when its pixels are 2:1
 * within 1%, or when its XMP metadata carries GPano
 * ProjectionType=equirectangular (the tag every 360 camera writes).
 */

/** Smallest acceptable width for an equirectangular photo, in pixels. */
export const MIN_PANORAMA_WIDTH = 4000;

/** How far from exactly 2:1 an image may be and still read as equirectangular. */
const ASPECT_TOLERANCE = 0.01;

/** True when width:height is 2:1 within 1%. */
export function looksEquirect(width: number, height: number): boolean {
  if (width <= 0 || height <= 0) return false;
  return Math.abs(width / (2 * height) - 1) <= ASPECT_TOLERANCE;
}

/** True when a chunk of file text carries GPano ProjectionType=equirectangular. */
export function xmpSaysEquirect(head: string): boolean {
  if (!/GPano/i.test(head)) return false;
  return /ProjectionType\s*(?:>|=|=\s*")\s*"?equirectangular/i.test(head);
}

/** Convert degrees (the stored unit) to the radians Photo Sphere Viewer wants. */
export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
