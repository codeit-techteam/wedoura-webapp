"use client";

import { useRef, useState, type DragEvent } from "react";
import { Badge360 } from "@/components/media/Badge360";
import { Photo as PhotoImg } from "@/components/media/Photo";
import { PhotoSphere } from "@/components/media/PhotoSphere";
import { inputClass } from "@/components/studio/Field";
import { Icon } from "@/components/ui/Icon";
import type { Photo } from "@/data/types";
import { cn } from "@/lib/cn";
import { MIN_PANORAMA_WIDTH } from "@/lib/panorama";
import { filesFromDataTransfer, MIN_LONG_EDGE, processPhotoFile } from "@/lib/upload";

type UploadingFile = { key: string; name: string; progress: number };

type Props = {
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
  /** Ids awaiting admin approval; shown with a chip. */
  pendingIds?: string[];
  /** Shown in the drop zone, e.g. "At least 12 photographs". */
  hint?: string;
};

/**
 * The portal's photo tool: drag-drop or file-picker upload (simulated, with
 * progress), reorder by drag or keyboard, per-photo alt text, delete and
 * bulk select. Rejected files get a clear message.
 */
export function PhotoManager({ photos, onChange, pendingIds = [], hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const [panoNote, setPanoNote] = useState<{ id: string; note: string } | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);
  const pending = new Set(pendingIds);

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    setRejected([]);
    const entries = list.map((f, i) => ({ key: `${Date.now()}-${i}`, name: f.name, progress: 0 }));
    setUploading((u) => [...u, ...entries]);

    // Simulated upload progress while the file is processed locally.
    const tick = setInterval(() => {
      setUploading((u) => u.map((e) => ({ ...e, progress: Math.min(90, e.progress + 18) })));
    }, 180);

    const added: Photo[] = [];
    const errors: string[] = [];
    for (const [i, file] of list.entries()) {
      const result = await processPhotoFile(file);
      if (result.ok) added.push(result.photo);
      else errors.push(result.error);
      setUploading((u) => u.map((e) => (e.key === entries[i].key ? { ...e, progress: 100 } : e)));
    }
    clearInterval(tick);
    setTimeout(() => setUploading((u) => u.filter((e) => !entries.some((n) => n.key === e.key))), 400);
    if (added.length) onChange([...photos, ...added]);
    if (errors.length) setRejected(errors);
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= photos.length) return;
    const next = [...photos];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  function setAlt(id: string, alt: string) {
    onChange(photos.map((p) => (p.id === id ? { ...p, alt } : p)));
  }

  function toggle360(photo: Photo) {
    const making360 = photo.projection !== "equirectangular";
    if (making360 && photo.width < MIN_PANORAMA_WIDTH) {
      setPanoNote({
        id: photo.id,
        note: `This photograph is ${photo.width}px wide; 360° photos need at least ${MIN_PANORAMA_WIDTH}px across. Upload the original export from your 360 camera instead.`,
      });
      return;
    }
    setPanoNote(null);
    if (!making360 && previewId === photo.id) setPreviewId(null);
    onChange(
      photos.map((p) => (p.id === photo.id ? { ...p, projection: making360 ? ("equirectangular" as const) : ("flat" as const) } : p)),
    );
  }

  function remove(ids: string[]) {
    onChange(photos.filter((p) => !ids.includes(p.id)));
    setSelected(new Set());
  }

  function toggleSelect(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const onZoneDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    // Accept real files and images dragged straight off a web page.
    void filesFromDataTransfer(e.dataTransfer).then(({ files, errors }) => {
      if (files.length) void handleFiles(files);
      if (errors.length) setRejected((r) => [...r, ...errors]);
    });
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onZoneDrop}
        className={cn(
          "flex flex-col items-center gap-3 border border-dashed px-6 py-10 text-center transition-chrome",
          dragOver ? "border-ink bg-ivory" : "border-line bg-white",
        )}
      >
        <p className="text-body text-mute">Drag photographs here, or</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="label tap border border-ink px-5 py-2.5 text-ink transition-chrome hover:bg-ink hover:text-white"
        >
          Choose files
        </button>
        <p className="text-small text-mute">
          {hint ??
            `JPEG or PNG, at least ${MIN_LONG_EDGE}px on the long edge. 360° photos are spotted automatically and need ${MIN_PANORAMA_WIDTH}px across.`}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          aria-label="Upload photographs"
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Upload progress */}
      {uploading.length > 0 && (
        <div className="mt-4 border border-line bg-white px-4 py-3">
          <p className="label text-mute">Uploading</p>
          <ul className="mt-2 flex flex-col gap-2" aria-label="Uploading">
            {uploading.map((u) => (
              <li key={u.key} className="flex items-center gap-4">
                <span className="min-w-0 flex-1 truncate text-small text-mute">{u.name}</span>
                <span className="relative h-1 w-32 overflow-hidden bg-line" aria-hidden="true">
                  <span className="absolute inset-y-0 left-0 bg-ink transition-all" style={{ width: `${u.progress}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rejected files */}
      {rejected.length > 0 && (
        <div className="mt-4 flex items-start justify-between gap-4 border border-ink bg-white px-4 py-3" role="alert">
          <div className="min-w-0">
            <p className="label text-ink">Not added</p>
            {rejected.map((message) => (
              <p key={message} className="mt-1 text-small text-ink">
                {message}
              </p>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setRejected([])}
            className="label tap shrink-0 px-2 text-mute transition-chrome hover:text-ink"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Toolbar: count, selection and the bulk actions */}
      {photos.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border border-line bg-white px-4 py-2">
          <p className="text-small text-mute">
            {selected.size > 0
              ? `${selected.size} of ${photos.length} selected`
              : `${photos.length} photograph${photos.length === 1 ? "" : "s"} — drag to reorder`}
          </p>
          <div className="flex items-center gap-1">
            {selected.size < photos.length && (
              <button
                type="button"
                onClick={() => setSelected(new Set(photos.map((p) => p.id)))}
                className="label tap px-3 text-mute transition-chrome hover:text-ink"
              >
                Select all
              </button>
            )}
            {selected.size > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="label tap px-3 text-mute transition-chrome hover:text-ink"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => remove([...selected])}
                  className="label tap border border-ink px-3 py-1.5 text-ink transition-chrome hover:bg-ink hover:text-white"
                >
                  Delete selected
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Grid */}
      {photos.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4" aria-label="Photographs">
          {photos.map((photo, i) => (
            <li
              key={photo.id}
              draggable
              onDragStart={() => (dragIndex.current = i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex.current !== null && dragIndex.current !== i) move(dragIndex.current, i);
                dragIndex.current = null;
              }}
              className="group border border-line bg-white p-2"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-ivory">
                <PhotoImg photo={photo} mode="cover" sizes="(min-width: 64rem) 20vw, 45vw" />
                {photo.projection === "equirectangular" && <Badge360 position="top-auto bottom-1.5 left-1.5" />}
                <label className="absolute top-1.5 left-1.5 inline-flex cursor-pointer bg-white/90 p-1.5">
                  <input
                    type="checkbox"
                    checked={selected.has(photo.id)}
                    onChange={() => toggleSelect(photo.id)}
                    aria-label={`Select ${photo.alt || "photo"}`}
                    className="size-4 accent-ink"
                  />
                </label>
                {pending.has(photo.id) && (
                  <span className="label absolute right-1.5 bottom-1.5 inline-flex items-center gap-1.5 bg-white/90 px-2 py-1 text-mute">
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />
                    Pending review
                  </span>
                )}
              </div>
              <input
                type="text"
                value={photo.alt}
                onChange={(e) => setAlt(photo.id, e.target.value)}
                placeholder="Describe this photograph"
                aria-label={`Alt text for photo ${i + 1}`}
                className={cn(inputClass, "mt-2 px-2 py-1.5 text-small")}
              />
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <label className="tap inline-flex cursor-pointer items-center gap-2 py-1 text-small text-mute">
                  <input
                    type="checkbox"
                    checked={photo.projection === "equirectangular"}
                    onChange={() => toggle360(photo)}
                    className="size-4 accent-ink"
                  />
                  360° photo
                </label>
                {photo.projection === "equirectangular" && (
                  <button
                    type="button"
                    onClick={() => setPreviewId(previewId === photo.id ? null : photo.id)}
                    aria-expanded={previewId === photo.id}
                    className="label tap px-2 text-mute transition-chrome hover:text-ink"
                  >
                    {previewId === photo.id ? "Close preview" : "Preview"}
                  </button>
                )}
              </div>
              {panoNote?.id === photo.id && (
                <p className="mt-1 text-small text-ink" role="alert">
                  {panoNote.note}
                </p>
              )}
              {previewId === photo.id && photo.projection === "equirectangular" && (
                <div className="mt-2 aspect-2/1 overflow-hidden border border-line">
                  <PhotoSphere photo={photo} autorotate={false} />
                </div>
              )}
              <div className="mt-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, i - 1)}
                    disabled={i === 0}
                    aria-label={`Move photo ${i + 1} earlier`}
                    className="tap inline-flex items-center justify-center text-mute transition-chrome hover:text-ink disabled:opacity-30"
                  >
                    <Icon name="arrow-left" size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, i + 1)}
                    disabled={i === photos.length - 1}
                    aria-label={`Move photo ${i + 1} later`}
                    className="tap inline-flex items-center justify-center text-mute transition-chrome hover:text-ink disabled:opacity-30"
                  >
                    <Icon name="arrow-right" size={16} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove([photo.id])}
                  className="label tap px-2 text-mute transition-chrome hover:text-ink"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
