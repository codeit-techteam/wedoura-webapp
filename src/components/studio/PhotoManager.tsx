"use client";

import { useRef, useState, type DragEvent } from "react";
import { Badge360 } from "@/components/media/Badge360";
import { Photo as PhotoImg } from "@/components/media/Photo";
import { PhotoSphere } from "@/components/media/PhotoSphere";
import { Field, inputClass } from "@/components/studio/Field";
import { StudioDrawer } from "@/components/studio/StudioDrawer";
import { Icon } from "@/components/ui/Icon";
import { Label } from "@/components/ui/Label";
import type { Photo } from "@/data/types";
import { cn } from "@/lib/cn";
import { useIsDesktop } from "@/lib/media";
import { MIN_PANORAMA_WIDTH } from "@/lib/panorama";
import { filesFromDataTransfer, MIN_LONG_EDGE, processPhotoFile } from "@/lib/upload";

type UploadingFile = { key: string; name: string; progress: number };

type Props = {
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
  cover?: Photo;
  onSetCover: (photo: Photo) => void;
  highlights: Photo[];
  onToggleHighlight: (photo: Photo) => void;
  maxHighlights?: number;
  avatar?: Photo;
  onSetAvatar?: (photo: Photo) => void;
  aboutPhoto?: Photo;
  onSetAboutPhoto?: (photo: Photo) => void;
  pendingIds?: string[];
  hint?: string;
};

/**
 * The portal's photo tool: one grid with upload, badges, hover/tap actions,
 * drag reorder, bulk select, and caption editing in a drawer.
 */
export function PhotoManager({
  photos,
  onChange,
  cover,
  onSetCover,
  highlights,
  onToggleHighlight,
  maxHighlights = 7,
  avatar,
  onSetAvatar,
  aboutPhoto,
  onSetAboutPhoto,
  pendingIds = [],
  hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isDesktop = useIsDesktop();
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const [panoNote, setPanoNote] = useState<{ id: string; note: string } | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [captionPhoto, setCaptionPhoto] = useState<Photo | null>(null);
  const [captionDraft, setCaptionDraft] = useState("");
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);
  const pending = new Set(pendingIds);
  const highlightIds = new Set(highlights.map((p) => p.id));
  const countTwelveHint = hint?.includes("12");

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    setRejected([]);
    const entries = list.map((f, i) => ({ key: `${Date.now()}-${i}`, name: f.name, progress: 0 }));
    setUploading((u) => [...u, ...entries]);

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
      photos.map((p) =>
        p.id === photo.id ? { ...p, projection: making360 ? ("equirectangular" as const) : ("flat" as const) } : p,
      ),
    );
  }

  function remove(ids: string[]) {
    onChange(photos.filter((p) => !ids.includes(p.id)));
    setSelected(new Set());
    if (previewId && ids.includes(previewId)) setPreviewId(null);
    if (captionPhoto && ids.includes(captionPhoto.id)) setCaptionPhoto(null);
  }

  function toggleSelect(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function highlightSelected() {
    const room = maxHighlights - highlights.length;
    if (room <= 0) return;
    const hlSet = new Set(highlights.map((p) => p.id));
    let added = 0;
    for (const id of selected) {
      if (added >= room) break;
      if (hlSet.has(id)) continue;
      const photo = photos.find((p) => p.id === id);
      if (photo) {
        onToggleHighlight(photo);
        hlSet.add(id);
        added += 1;
      }
    }
  }

  function openCaption(photo: Photo) {
    setCaptionPhoto(photo);
    setCaptionDraft(photo.alt);
  }

  function saveCaption() {
    if (!captionPhoto) return;
    setAlt(captionPhoto.id, captionDraft);
    setCaptionPhoto(null);
  }

  const onZoneDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    void filesFromDataTransfer(e.dataTransfer).then(({ files, errors }) => {
      if (files.length) void handleFiles(files);
      if (errors.length) setRejected((r) => [...r, ...errors]);
    });
  };

  const previewPhoto = previewId ? photos.find((p) => p.id === previewId) : null;

  return (
    <div>
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

      {photos.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border border-line bg-white px-4 py-2">
          <p className="text-small text-mute">
            {countTwelveHint
              ? `${photos.length} of 12 photographs`
              : `${photos.length} photograph${photos.length === 1 ? "" : "s"}`}
            {" · "}
            {highlights.length} of {maxHighlights} highlights
            {selected.size > 0 ? ` · ${selected.size} selected` : ""}
          </p>
          <div className="flex flex-wrap items-center gap-1">
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
                  onClick={highlightSelected}
                  disabled={highlights.length >= maxHighlights}
                  className="label tap px-3 text-mute transition-chrome hover:text-ink disabled:opacity-40"
                >
                  Highlight selected
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

      {photos.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4" aria-label="Photographs">
          {photos.map((photo, i) => {
            const isCover = cover?.id === photo.id;
            const isHl = highlightIds.has(photo.id);
            const isAvatar = avatar?.id === photo.id;
            const isAbout = aboutPhoto?.id === photo.id;
            const is360 = photo.projection === "equirectangular";
            const toolbarOpen = !isDesktop && revealedId === photo.id;

            return (
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
                <div
                  className="relative aspect-4/3 cursor-pointer overflow-hidden bg-ivory"
                  role="button"
                  tabIndex={0}
                  aria-label={`Photo ${i + 1}${photo.alt ? `: ${photo.alt}` : ""}`}
                  onClick={() => {
                    if (!isDesktop) setRevealedId((id) => (id === photo.id ? null : photo.id));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (!isDesktop) setRevealedId((id) => (id === photo.id ? null : photo.id));
                    }
                  }}
                >
                  <PhotoImg photo={photo} mode="cover" sizes="(min-width: 64rem) 20vw, 45vw" />
                  {is360 && <Badge360 position="top-auto bottom-1.5 right-1.5" />}

                  <div className="pointer-events-none absolute inset-x-1.5 top-1.5 flex flex-wrap gap-1">
                    {isCover && (
                      <Label as="span" className="bg-white/90 px-1.5 py-0.5 text-[10px]">
                        Cover
                      </Label>
                    )}
                    {isHl && (
                      <Label as="span" className="bg-white/90 px-1.5 py-0.5 text-[10px]">
                        Highlight
                      </Label>
                    )}
                    {isAvatar && (
                      <Label as="span" className="bg-white/90 px-1.5 py-0.5 text-[10px]">
                        Avatar
                      </Label>
                    )}
                    {isAbout && (
                      <Label as="span" className="bg-white/90 px-1.5 py-0.5 text-[10px]">
                        About
                      </Label>
                    )}
                    {pending.has(photo.id) && (
                      <Label as="span" className="bg-white/90 px-1.5 py-0.5 text-[10px] text-mute">
                        Pending
                      </Label>
                    )}
                  </div>

                  <label
                    className="absolute top-1.5 left-1.5 z-10 inline-flex cursor-pointer bg-white/90 p-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(photo.id)}
                      onChange={() => toggleSelect(photo.id)}
                      aria-label={`Select ${photo.alt || "photo"}`}
                      className="size-4 accent-ink"
                    />
                  </label>

                  <div
                    className={cn(
                      "absolute inset-0 flex flex-col justify-end bg-ink/50 p-2 transition-opacity",
                      isDesktop ? "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100" : null,
                      !isDesktop && toolbarOpen ? "opacity-100" : null,
                      !isDesktop && !toolbarOpen ? "opacity-0" : null,
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        title={isHl ? "Remove highlight" : "Add highlight"}
                        aria-pressed={isHl}
                        disabled={!isHl && highlights.length >= maxHighlights}
                        onClick={() => onToggleHighlight(photo)}
                        className="label tap bg-white/95 px-2 py-1 text-ink disabled:opacity-40"
                      >
                        {isHl ? "★" : "☆"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onSetCover(photo)}
                        className="label tap bg-white/95 px-2 py-1 text-ink"
                      >
                        {isCover ? "Cover" : "Set cover"}
                      </button>
                      {onSetAvatar ? (
                        <button
                          type="button"
                          onClick={() => onSetAvatar(photo)}
                          className="label tap bg-white/95 px-2 py-1 text-ink"
                        >
                          Avatar
                        </button>
                      ) : null}
                      {onSetAboutPhoto ? (
                        <button
                          type="button"
                          onClick={() => onSetAboutPhoto(photo)}
                          className="label tap bg-white/95 px-2 py-1 text-ink"
                        >
                          About
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => toggle360(photo)}
                        className="label tap bg-white/95 px-2 py-1 text-ink"
                      >
                        360°
                      </button>
                      {is360 ? (
                        <button
                          type="button"
                          onClick={() => setPreviewId(photo.id)}
                          className="label tap bg-white/95 px-2 py-1 text-ink"
                        >
                          View
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => openCaption(photo)}
                        className="label tap bg-white/95 px-2 py-1 text-ink"
                      >
                        Caption
                      </button>
                      <button
                        type="button"
                        onClick={() => remove([photo.id])}
                        className="label tap bg-white/95 px-2 py-1 text-ink"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {panoNote?.id === photo.id && (
                  <p className="mt-1 text-small text-ink" role="alert">
                    {panoNote.note}
                  </p>
                )}
                <div className="mt-1.5 flex items-center justify-between text-mute">
                  <button
                    type="button"
                    onClick={() => move(i, i - 1)}
                    disabled={i === 0}
                    aria-label={`Move photo ${i + 1} earlier`}
                    className="tap inline-flex items-center justify-center transition-chrome hover:text-ink disabled:opacity-30"
                  >
                    <Icon name="arrow-left" size={16} />
                  </button>
                  <span className="text-small tabular-nums">{i + 1}</span>
                  <button
                    type="button"
                    onClick={() => move(i, i + 1)}
                    disabled={i === photos.length - 1}
                    aria-label={`Move photo ${i + 1} later`}
                    className="tap inline-flex items-center justify-center transition-chrome hover:text-ink disabled:opacity-30"
                  >
                    <Icon name="arrow-right" size={16} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <StudioDrawer
        title="360° preview"
        open={previewPhoto != null && previewPhoto.projection === "equirectangular"}
        onClose={() => setPreviewId(null)}
      >
        {previewPhoto ? (
          <div className="aspect-2/1 overflow-hidden border border-line">
            <PhotoSphere photo={previewPhoto} autorotate={false} />
          </div>
        ) : null}
      </StudioDrawer>

      <StudioDrawer
        title="Photo caption"
        open={captionPhoto != null}
        onClose={() => setCaptionPhoto(null)}
        footer={
          <button type="button" className="studio-btn" onClick={saveCaption}>
            Save caption
          </button>
        }
      >
        {captionPhoto ? (
          <Field id="photo-caption" label="Alt text / caption">
            <textarea
              id="photo-caption"
              className={cn(inputClass, "min-h-28 resize-y")}
              rows={4}
              value={captionDraft}
              onChange={(e) => setCaptionDraft(e.target.value)}
              placeholder="Describe this photograph for couples and search"
            />
          </Field>
        ) : null}
      </StudioDrawer>
    </div>
  );
}