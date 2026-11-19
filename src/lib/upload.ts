"use client";

/**
 * Simulated photo uploads for the portal. Files never leave the browser:
 * each image is decoded, checked against a minimum size, downscaled and
 * stored as a data URL (so 12+ photos fit the localStorage budget), with a
 * 12px blur placeholder matching scripts/photos.mjs. The backend swaps this
 * for a real upload endpoint without the screens changing.
 */
import type { Photo } from "@/data/types";
import { looksEquirect, MIN_PANORAMA_WIDTH, xmpSaysEquirect } from "@/lib/panorama";

/** Smallest acceptable long edge, in pixels. */
export const MIN_LONG_EDGE = 800;
/** Stored images are capped at this long edge. */
const MAX_LONG_EDGE = 1200;
/** Equirectangular 360° panoramas keep far more pixels than a photograph. */
export const TOUR_MAX_LONG_EDGE = 4096;
const JPEG_QUALITY = 0.72;
/** 360° photos are stored near 4096px, so they take a lower quality to fit
 *  the localStorage budget. */
const PANORAMA_JPEG_QUALITY = 0.6;
/** How much of the file head is scanned for XMP GPano metadata. */
const XMP_SCAN_BYTES = 128 * 1024;

export type UploadResult = { ok: true; photo: Photo } | { ok: false; error: string };

function decode(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode"));
    };
    img.src = url;
  });
}

function draw(img: HTMLImageElement, width: number, height: number, quality: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * Turn a drop into files. Dragging an image straight off a web page (such as
 * this site's own photographs) carries a URL, not a file; fetch it so those
 * drops work too. Cross-origin images that refuse to be fetched get a clear
 * message instead of silence.
 */
export async function filesFromDataTransfer(dt: DataTransfer): Promise<{ files: File[]; errors: string[] }> {
  if (dt.files && dt.files.length > 0) return { files: Array.from(dt.files), errors: [] };

  const urls = new Set<string>();
  const uriList = dt.getData("text/uri-list");
  for (const line of uriList.split("\n")) {
    const url = line.trim();
    if (url && !url.startsWith("#")) urls.add(url);
  }
  const html = dt.getData("text/html");
  for (const match of html.matchAll(/<img[^>]+src="([^"]+)"/gi)) urls.add(match[1]);

  if (urls.size === 0) {
    return { files: [], errors: ["That drop had no image in it. Drag files from your computer, or an image from a page."] };
  }

  const files: File[] = [];
  const errors: string[] = [];
  for (const url of urls) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      if (!blob.type.startsWith("image/")) {
        errors.push("The dropped link is not an image.");
        continue;
      }
      const name = new URL(url, window.location.href).pathname.split("/").pop() || "dropped-image";
      files.push(new File([blob], name, { type: blob.type }));
    } catch {
      errors.push("That image could not be fetched from its page. Save it to your computer first, then upload the file.");
    }
  }
  return { files, errors };
}

/** Validate and process one file into a Photo, or explain the rejection. */
export async function processPhotoFile(file: File, options: { maxLongEdge?: number } = {}): Promise<UploadResult> {
  const maxLongEdge = options.maxLongEdge ?? MAX_LONG_EDGE;
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: `"${file.name}" is not an image.` };
  }
  let img: HTMLImageElement;
  try {
    img = await decode(file);
  } catch {
    return { ok: false, error: `"${file.name}" could not be read as an image.` };
  }
  try {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (Math.max(w, h) < MIN_LONG_EDGE) {
      return {
        ok: false,
        error: `"${file.name}" is ${w}×${h}px. Photographs need at least ${MIN_LONG_EDGE}px on the long edge.`,
      };
    }
    let is360 = looksEquirect(w, h);
    if (!is360) {
      try {
        is360 = xmpSaysEquirect(await file.slice(0, XMP_SCAN_BYTES).text());
      } catch {
        // Unreadable metadata never blocks an upload.
      }
    }
    if (is360 && w < MIN_PANORAMA_WIDTH) {
      return {
        ok: false,
        error: `"${file.name}" looks like a 360° photo but is only ${w}px wide. 360° photos need at least ${MIN_PANORAMA_WIDTH}px across to stay sharp when visitors look around.`,
      };
    }
    const cap = is360 ? TOUR_MAX_LONG_EDGE : maxLongEdge;
    const scale = Math.min(1, cap / Math.max(w, h));
    const width = Math.round(w * scale);
    const height = Math.round(h * scale);
    const src = draw(img, width, height, is360 ? PANORAMA_JPEG_QUALITY : JPEG_QUALITY);
    // Blur placeholder: 12px wide JPEG, same recipe as scripts/photos.mjs.
    const blurW = 12;
    const blurH = Math.max(1, Math.round((blurW * height) / width));
    const blurDataURL = draw(img, blurW, blurH, 0.4);
    const id = `up-${crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10)}`;
    const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Uploaded photograph";
    return { ok: true, photo: { id, src, width, height, alt, blurDataURL, ...(is360 ? { projection: "equirectangular" as const } : {}) } };
  } catch {
    return { ok: false, error: `"${file.name}" could not be processed in this browser.` };
  } finally {
    URL.revokeObjectURL(img.src);
  }
}
