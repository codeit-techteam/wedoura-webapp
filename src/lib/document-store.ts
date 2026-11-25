"use client";

/**
 * Private binary storage for vendor identity documents.
 * Metadata lives in the mock DB (localStorage); file bytes live in IndexedDB
 * so large PDFs never blow the localStorage quota. The real backend replaces
 * this with a private bucket and signed URLs.
 */

const DB_NAME = "wedoura:vendor-documents";
const STORE = "files";
const DB_VERSION = 1;

export const IDB_URL_PREFIX = "idb:";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Could not open document store."));
  });
}

function idbUrl(key: string): string {
  return `${IDB_URL_PREFIX}${key}`;
}

export function isIdbDocumentUrl(url: string): boolean {
  return url.startsWith(IDB_URL_PREFIX);
}

export function documentBlobKey(url: string): string | null {
  return isIdbDocumentUrl(url) ? url.slice(IDB_URL_PREFIX.length) : null;
}

/** Persist a File/Blob and return a private `idb:…` URL for the mock record. */
export async function putDocumentBlob(blob: Blob, preferredKey?: string): Promise<string> {
  const key = preferredKey ?? (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Could not store the document file."));
  });
  db.close();
  return idbUrl(key);
}

/** Read a stored blob by private URL. */
export async function getDocumentBlob(url: string): Promise<Blob | null> {
  const key = documentBlobKey(url);
  if (!key) return null;
  const db = await openDb();
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve((req.result as Blob | undefined) ?? null);
    req.onerror = () => reject(req.error ?? new Error("Could not read the document file."));
  });
  db.close();
  return blob;
}

/** Object URL for preview/admin review. Caller should revoke when done. */
export async function getDocumentObjectUrl(url: string): Promise<string | null> {
  const blob = await getDocumentBlob(url);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

export async function deleteDocumentBlob(url: string): Promise<void> {
  const key = documentBlobKey(url);
  if (!key) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Could not delete the document file."));
  });
  db.close();
}

/** Canvas placeholder clearly marked SAMPLE — never a real ID image. */
export async function createSampleDocumentBlob(label = "SAMPLE"): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 400;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.fillStyle = "#F3EEE6";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#C8A96A";
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);
  ctx.fillStyle = "#111111";
  ctx.font = "600 48px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText(label, canvas.width / 2, canvas.height / 2 - 12);
  ctx.font = "400 18px system-ui, sans-serif";
  ctx.fillStyle = "#4F4A42";
  ctx.fillText("Wedoura demo · not a real identity document", canvas.width / 2, canvas.height / 2 + 36);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Could not create the sample document image.");
  return blob;
}
