"use client";

import { useRef, useState } from "react";
import { FilmPreview } from "@/components/media/FilmPreview";
import { Photo as PhotoImg } from "@/components/media/Photo";
import { Field, inputClass } from "@/components/studio/Field";
import { EmptyState } from "@/components/studio/EmptyState";
import { PhotoManager } from "@/components/studio/PhotoManager";
import { PhotoPickerModal } from "@/components/studio/PhotoPickerModal";
import { SectionCard } from "@/components/studio/SectionCard";
import { StudioDrawer } from "@/components/studio/StudioDrawer";
import { ScreenSkeleton, moveItem, useListingForm } from "@/components/studio/screen";
import { Clapperboard, GripVertical, Images } from "lucide-react";
import type { Album, Film, Photo } from "@/data/types";
import { publicProfileHref } from "@/lib/studio-profile-nav";
import { isValidVideoLink, parseVideoLink } from "@/lib/video-link";

type Form = {
  portfolio: Photo[];
  cover?: Photo;
  avatar?: Photo;
  aboutPhoto?: Photo;
  cardPhotos: Photo[];
  films: Film[];
  albums: Album[];
};

const TINY_BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function youtubePosterPhoto(videoId: string, title: string): Photo {
  return {
    id: `film-poster-${videoId}`,
    src: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    width: 1280,
    height: 720,
    alt: title.trim() || "Film poster",
    blurDataURL: TINY_BLUR,
  };
}

function syncPortfolioRefs(form: Form, portfolio: Photo[]) {
  const ids = new Set(portfolio.map((p) => p.id));
  const keep = (p?: Photo) => (p && ids.has(p.id) ? p : undefined);
  const cardPhotos = form.cardPhotos.filter((p) => ids.has(p.id));
  const albums = form.albums.map((a) => ({
    ...a,
    photos: a.photos.filter((p) => ids.has(p.id)),
  }));
  return {
    portfolio,
    cover: keep(form.cover),
    avatar: keep(form.avatar),
    aboutPhoto: keep(form.aboutPhoto),
    cardPhotos,
    albums,
  };
}

const emptyAlbum = (baseCity: string): Album => ({
  slug: `story-${Date.now().toString(36)}`,
  title: "New wedding story",
  location: baseCity,
  excerpt: "",
  photos: [],
  featured: true,
});

export default function MediaPage() {
  const { listing, form, apply } = useListingForm<Form>((l) => ({
    portfolio: l.portfolio,
    cover: l.cover,
    avatar: l.avatar,
    aboutPhoto: l.aboutPhoto,
    cardPhotos: l.cardPhotos,
    films: l.films,
    albums: l.albums,
  }));

  const [storyIndex, setStoryIndex] = useState<number | null>(null);
  const [storyDraft, setStoryDraft] = useState<Album | null>(null);
  const [storyPhotosOpen, setStoryPhotosOpen] = useState(false);

  const [filmIndex, setFilmIndex] = useState<number | null>(null);
  const [filmDraft, setFilmDraft] = useState<{ title: string; youtubeUrl: string; poster: Photo | null } | null>(null);
  const [filmPosterOpen, setFilmPosterOpen] = useState(false);
  const [filmMsg, setFilmMsg] = useState<string | null>(null);
  const [posterFromLibrary, setPosterFromLibrary] = useState(false);

  const storyDragFrom = useRef<number | null>(null);
  const [storyUndo, setStoryUndo] = useState<{ album: Album; index: number } | null>(null);
  const storyUndoTimer = useRef<number | null>(null);

  if (!form || !listing) return <ScreenSkeleton />;

  function setCover(photo: Photo) {
    apply({ cover: photo }, { cover: photo });
  }

  function setAvatar(photo: Photo) {
    apply({ avatar: photo }, { avatar: photo });
  }

  function setAboutPhoto(photo: Photo) {
    apply({ aboutPhoto: photo }, { aboutPhoto: photo });
  }

  function toggleHighlight(photo: Photo) {
    const exists = form!.cardPhotos.some((p) => p.id === photo.id);
    const next = exists
      ? form!.cardPhotos.filter((p) => p.id !== photo.id)
      : form!.cardPhotos.length >= 7
        ? form!.cardPhotos
        : [...form!.cardPhotos, photo];
    apply({ cardPhotos: next }, { cardPhotos: next });
  }

  function updatePortfolio(portfolio: Photo[]) {
    const next = syncPortfolioRefs(form!, portfolio);
    apply(next, next);
  }

  function openStoryEdit(index: number) {
    setStoryDraft({ ...form!.albums[index] });
    setStoryIndex(index);
    setStoryPhotosOpen(false);
  }

  function openStoryAdd() {
    const album = emptyAlbum(listing!.baseCity);
    setStoryDraft(album);
    setStoryIndex(-1);
    setStoryPhotosOpen(false);
  }

  function closeStoryDrawer() {
    setStoryIndex(null);
    setStoryDraft(null);
    setStoryPhotosOpen(false);
  }

  function saveStoryDrawer() {
    if (!storyDraft || storyIndex === null) return;
    const albums =
      storyIndex === -1
        ? [...form!.albums, storyDraft]
        : form!.albums.map((a, i) => (i === storyIndex ? storyDraft : a));
    apply({ albums }, { albums });
    closeStoryDrawer();
  }

  function deleteStory(index: number) {
    const album = form!.albums[index];
    const albums = form!.albums.filter((_, i) => i !== index);
    apply({ albums }, { albums });
    setStoryUndo({ album, index });
    if (storyUndoTimer.current != null) window.clearTimeout(storyUndoTimer.current);
    storyUndoTimer.current = window.setTimeout(() => setStoryUndo(null), 5000);
  }

  function undoStoryDelete() {
    if (!storyUndo) return;
    const albums = [...form!.albums];
    albums.splice(storyUndo.index, 0, storyUndo.album);
    apply({ albums }, { albums });
    setStoryUndo(null);
    if (storyUndoTimer.current != null) window.clearTimeout(storyUndoTimer.current);
  }

  function reorderStories(from: number, to: number) {
    if (from === to) return;
    const albums = moveItem(form!.albums, from, to);
    apply({ albums }, { albums });
  }

  function openFilmEdit(index: number) {
    const film = form!.films[index];
    setFilmDraft({
      title: film.title,
      youtubeUrl: film.youtubeUrl ?? film.fullSrc,
      poster: film.poster,
    });
    setPosterFromLibrary(true);
    setFilmIndex(index);
    setFilmMsg(null);
  }

  function openFilmAdd() {
    setFilmDraft({ title: "", youtubeUrl: "", poster: null });
    setPosterFromLibrary(false);
    setFilmIndex(-1);
    setFilmMsg(null);
  }

  function closeFilmDrawer() {
    setFilmIndex(null);
    setFilmDraft(null);
    setFilmPosterOpen(false);
    setFilmMsg(null);
  }

  function onFilmUrlChange(url: string) {
    if (!filmDraft) return;
    const parsed = parseVideoLink(url);
    let poster = filmDraft.poster;
    if (!posterFromLibrary && parsed?.provider === "youtube" && parsed.thumbnailUrl) {
      poster = youtubePosterPhoto(parsed.id, filmDraft.title);
    }
    setFilmDraft({ ...filmDraft, youtubeUrl: url, poster });
  }

  function saveFilmDrawer() {
    if (!filmDraft || filmIndex === null) return;
    if (!filmDraft.title.trim()) return setFilmMsg("Give the film a title.");
    if (!isValidVideoLink(filmDraft.youtubeUrl)) return setFilmMsg("A valid YouTube or Vimeo link (https://…).");
    if (!filmDraft.poster) return setFilmMsg("Choose a poster from your photos or use a YouTube link.");
    setFilmMsg(null);
    const url = filmDraft.youtubeUrl.trim();
    const film: Film = {
      id: filmIndex === -1 ? `film-${Date.now().toString(36)}` : form!.films[filmIndex].id,
      title: filmDraft.title.trim(),
      previewSrc: "",
      fullSrc: url,
      youtubeUrl: url,
      poster: filmDraft.poster,
      durationSec: filmIndex === -1 ? 0 : form!.films[filmIndex].durationSec,
    };
    const films =
      filmIndex === -1 ? [...form!.films, film] : form!.films.map((f, i) => (i === filmIndex ? film : f));
    apply({ films }, { films });
    closeFilmDrawer();
  }

  const storyPhotoIds = storyDraft?.photos.map((p) => p.id) ?? [];

  return (
    <div className="flex flex-col gap-10">
      <p className="max-w-prose text-[length:var(--text-dash-body)] text-mute">
        Your portfolio is what couples remember. Lead with your strongest work. Full films are YouTube or Vimeo links.
      </p>

      <SectionCard
        id="portfolio"
        title="Photos"
        help="Upload, reorder and star up to seven card highlights. Set cover, avatar and about photo from the grid."
        shownOnProfile={listing.portfolio.length > 0}
        seeOnProfileHref={publicProfileHref(listing, "portfolio")}
      >
        {form.portfolio.length === 0 ? (
          <EmptyState
            icon={Images}
            title="No photographs yet. Upload your strongest frames to build the portfolio."
            className="mb-6"
          />
        ) : null}
        <PhotoManager
          photos={form.portfolio}
          onChange={updatePortfolio}
          cover={form.cover}
          onSetCover={setCover}
          highlights={form.cardPhotos}
          onToggleHighlight={toggleHighlight}
          maxHighlights={7}
          avatar={form.avatar}
          onSetAvatar={setAvatar}
          aboutPhoto={form.aboutPhoto}
          onSetAboutPhoto={setAboutPhoto}
          pendingIds={listing.pendingMediaIds}
          hint="At least 12 photographs"
        />
      </SectionCard>

      <SectionCard
        id="albums"
        title="Wedding stories"
        help="Each story opens as a frame-by-frame reader on your public profile. Choose up to 24 photographs per story."
        shownOnProfile={listing.albums.length > 0}
        seeOnProfileHref={publicProfileHref(listing, "inside")}
      >
        {form.albums.length === 0 ? (
          <EmptyState
            icon={Images}
            title="No wedding stories yet. Add one with photographs from your portfolio."
            action={
              <button type="button" className="studio-btn" onClick={openStoryAdd}>
                Add story
              </button>
            }
            className="mb-6"
          />
        ) : (
          <ul className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {form.albums.map((album, index) => {
              const cover = album.photos[0];
              return (
                <li
                  key={album.slug}
                  draggable
                  onDragStart={() => {
                    storyDragFrom.current = index;
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const from = storyDragFrom.current;
                    storyDragFrom.current = null;
                    if (from == null) return;
                    reorderStories(from, index);
                  }}
                  className="flex flex-col border border-line bg-white"
                >
                  <div className="relative aspect-4/3 bg-ivory">
                    {cover ? (
                      <PhotoImg photo={cover} mode="cover" sizes="(min-width: 64rem) 25vw, 50vw" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-small text-mute">No photos yet</div>
                    )}
                    <button
                      type="button"
                      className="absolute top-2 left-2 tap flex size-9 cursor-grab items-center justify-center bg-white/90 text-mute active:cursor-grabbing"
                      aria-label={`Drag story ${album.title}`}
                      tabIndex={-1}
                    >
                      <GripVertical className="size-4" strokeWidth={1.5} aria-hidden="true" />
                    </button>
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <p className="font-serif text-h4 text-ink">{album.title}</p>
                    <p className="text-[length:var(--text-dash-help)] text-mute">{album.location}</p>
                    <p className="text-[length:var(--text-dash-help)] text-mute">
                      {album.photos.length} photograph{album.photos.length === 1 ? "" : "s"}
                    </p>
                    <div className="mt-auto flex gap-3 pt-4">
                      <button type="button" className="studio-top-link" onClick={() => openStoryEdit(index)}>
                        Edit
                      </button>
                      <button type="button" className="studio-top-link text-mute" onClick={() => deleteStory(index)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <button type="button" className="studio-btn" onClick={openStoryAdd}>
            + Add story
          </button>
          {storyUndo ? (
            <p className="text-[length:var(--text-dash-help)] text-mute" role="status">
              Story removed.{" "}
              <button type="button" className="border-b border-gold text-ink" onClick={undoStoryDelete}>
                Undo
              </button>
            </p>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard
        id="films"
        title="Films"
        help="Add a YouTube or Vimeo link and a poster. YouTube links can use the automatic thumbnail."
        shownOnProfile={listing.films.some((f) => Boolean(f.youtubeUrl || f.previewSrc || f.fullSrc))}
        seeOnProfileHref={publicProfileHref(listing, "films")}
      >
        {form.films.length === 0 ? (
          <EmptyState
            icon={Clapperboard}
            title="No films yet. Add a YouTube or Vimeo link with a poster."
            action={
              <button type="button" className="studio-btn" onClick={openFilmAdd}>
                Add film
              </button>
            }
            className="mb-6"
          />
        ) : (
          <ul className="mb-6 grid gap-4 sm:grid-cols-2">
            {form.films.map((film, i) => (
              <li key={film.id} className="studio-card p-2">
                <FilmPreview film={film} sizes="(min-width: 40rem) 24rem, 100vw" />
                <div className="mt-2 flex items-center justify-between gap-2 px-1">
                  <p className="truncate text-[length:var(--text-dash-help)]">{film.title}</p>
                  <div className="flex shrink-0 gap-3">
                    <button type="button" className="studio-top-link" onClick={() => openFilmEdit(i)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="studio-top-link text-mute"
                      onClick={() => {
                        const films = form.films.filter((_, idx) => idx !== i);
                        apply({ films }, { films });
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button type="button" className="studio-btn" onClick={openFilmAdd}>
          + Add film
        </button>
      </SectionCard>

      <StudioDrawer
        title={storyIndex === -1 ? "Add wedding story" : "Edit wedding story"}
        open={storyDraft != null}
        onClose={closeStoryDrawer}
        footer={
          <button type="button" className="studio-btn" onClick={saveStoryDrawer}>
            Save story
          </button>
        }
      >
        {storyDraft ? (
          <div className="grid gap-5">
            <Field id="story-title" label="Title">
              <input
                id="story-title"
                className={inputClass}
                value={storyDraft.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setStoryDraft({
                    ...storyDraft,
                    title,
                    slug: slugify(title) || storyDraft.slug,
                  });
                }}
              />
            </Field>
            <Field id="story-loc" label="Location">
              <input
                id="story-loc"
                className={inputClass}
                value={storyDraft.location}
                onChange={(e) => setStoryDraft({ ...storyDraft, location: e.target.value })}
              />
            </Field>
            <Field id="story-date" label="Date (optional)">
              <input
                id="story-date"
                type="date"
                className={inputClass}
                value={storyDraft.date ?? ""}
                onChange={(e) => setStoryDraft({ ...storyDraft, date: e.target.value || undefined })}
              />
            </Field>
            <Field id="story-lede" label="Short lede">
              <input
                id="story-lede"
                className={inputClass}
                value={storyDraft.excerpt ?? ""}
                placeholder="One line couples see when they open the story"
                onChange={(e) => setStoryDraft({ ...storyDraft, excerpt: e.target.value || undefined })}
              />
            </Field>
            <label className="tap flex cursor-pointer items-center gap-3 text-[length:var(--text-dash-body)] text-ink">
              <input
                type="checkbox"
                className="size-4 accent-ink"
                checked={storyDraft.featured !== false}
                onChange={(e) => setStoryDraft({ ...storyDraft, featured: e.target.checked ? true : false })}
              />
              Show in Inside the stories carousel
            </label>
            <div>
              <p className="label text-mute">Photographs</p>
              <p className="mt-1 text-[length:var(--text-dash-help)] text-mute">
                {storyDraft.photos.length} of 24 chosen · order matches the story reader
              </p>
              <button type="button" className="studio-btn mt-3" onClick={() => setStoryPhotosOpen(true)}>
                Choose photos
              </button>
            </div>
          </div>
        ) : null}
      </StudioDrawer>

      <PhotoPickerModal
        open={storyPhotosOpen && storyDraft != null}
        onClose={() => setStoryPhotosOpen(false)}
        title="Story photographs"
        photos={form.portfolio}
        selectedIds={storyPhotoIds}
        max={24}
        label="Story photographs"
        onToggle={(photo) => {
          if (!storyDraft) return;
          const exists = storyDraft.photos.some((p) => p.id === photo.id);
          const photos = exists
            ? storyDraft.photos.filter((p) => p.id !== photo.id)
            : storyDraft.photos.length >= 24
              ? storyDraft.photos
              : [...storyDraft.photos, photo];
          setStoryDraft({ ...storyDraft, photos });
        }}
      />

      <StudioDrawer
        title={filmIndex === -1 ? "Add film" : "Edit film"}
        open={filmDraft != null}
        onClose={closeFilmDrawer}
        footer={
          <button type="button" className="studio-btn" onClick={saveFilmDrawer}>
            Save film
          </button>
        }
      >
        {filmDraft ? (
          <div className="grid gap-5">
            <Field id="film-title" label="Title">
              <input
                id="film-title"
                className={inputClass}
                value={filmDraft.title}
                onChange={(e) => setFilmDraft({ ...filmDraft, title: e.target.value })}
              />
            </Field>
            <Field id="film-yt" label="YouTube or Vimeo link">
              <input
                id="film-yt"
                className={inputClass}
                value={filmDraft.youtubeUrl}
                onChange={(e) => onFilmUrlChange(e.target.value)}
                placeholder="https://"
              />
            </Field>
            <div>
              <p className="label text-mute">Poster</p>
              {filmDraft.poster ? (
                <div className="relative mt-2 aspect-video max-w-xs overflow-hidden border border-line bg-ivory">
                  <PhotoImg photo={filmDraft.poster} mode="cover" sizes="16rem" />
                </div>
              ) : (
                <p className="mt-2 text-[length:var(--text-dash-help)] text-mute">
                  Paste a YouTube link for an automatic thumbnail, or choose from your portfolio.
                </p>
              )}
              <button
                type="button"
                className="studio-btn mt-3"
                onClick={() => {
                  setPosterFromLibrary(true);
                  setFilmPosterOpen(true);
                }}
              >
                Choose from my photos
              </button>
            </div>
            {filmMsg ? (
              <p className="text-small text-ink" role="alert">
                {filmMsg}
              </p>
            ) : null}
          </div>
        ) : null}
      </StudioDrawer>

      <PhotoPickerModal
        open={filmPosterOpen && filmDraft != null}
        onClose={() => setFilmPosterOpen(false)}
        title="Film poster"
        photos={form.portfolio}
        selectedIds={filmDraft?.poster && form.portfolio.some((p) => p.id === filmDraft.poster!.id) ? [filmDraft.poster.id] : []}
        max={1}
        label="Film poster"
        onToggle={(photo) => {
          if (!filmDraft) return;
          const next = filmDraft.poster?.id === photo.id ? null : photo;
          setFilmDraft({ ...filmDraft, poster: next });
          setPosterFromLibrary(true);
        }}
      />
    </div>
  );
}