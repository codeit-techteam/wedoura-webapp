"use client";

import { useInView } from "motion/react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Lightbox } from "@/components/media/Lightbox";
import { Photo } from "@/components/media/Photo";
import { Reveal } from "@/components/motion/Reveal";
import type { Photo as PhotoData, RealWedding, StoryFigure, StoryNightClip, StoryRowLayout } from "@/data/types";
import { cn } from "@/lib/cn";
import "@/styles/real-wedding.css";

type Props = {
  wedding: RealWedding;
  cityName: string;
};

const longDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" });

const COUNT_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
];

function countWord(n: number): string {
  return COUNT_WORDS[n] ?? String(n);
}

/** Last word in italic gold, matching the reference accent pattern. */
function withAccent(text: string): ReactNode {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 2) return text;
  const last = parts.pop()!;
  return (
    <>
      {parts.join(" ")} <em>{last}</em>
    </>
  );
}

/** "Mira & Sahil" with the ampersand as the gold accent, as in the reference. */
function coupleHeading(couple: string): ReactNode {
  const parts = couple.split("&");
  if (parts.length !== 2) return couple;
  return (
    <>
      {parts[0].trim()} <em>&amp;</em> {parts[1].trim()}
    </>
  );
}

function romanOf(n: number): string {
  const numerals: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let out = "";
  let left = n;
  for (const [value, glyph] of numerals) {
    while (left >= value) {
      out += glyph;
      left -= value;
    }
  }
  return out;
}

/* ------------------------------------------------- gallery row planning */

type PlacedFigure = { figure: StoryFigure; index: number };
type PlannedRow = { layout: StoryRowLayout; items: PlacedFigure[] };

const ROW_SIZE: Record<StoryRowLayout, number> = { single: 1, pair: 2, mosaic: 3, petals: 2 };

/** Consume figures row by row; incomplete rows degrade to singles. */
function planRows(figures: PlacedFigure[], rows: StoryRowLayout[] | undefined): PlannedRow[] {
  const planned: PlannedRow[] = [];
  let at = 0;
  for (const layout of rows ?? []) {
    const size = ROW_SIZE[layout];
    if (at + size > figures.length) break;
    planned.push({ layout, items: figures.slice(at, at + size) });
    at += size;
  }
  for (; at < figures.length; at += 1) {
    planned.push({ layout: "single", items: [figures[at]] });
  }
  return planned;
}

const ASPECT_CLASS: Record<NonNullable<StoryFigure["aspect"]>, string> = {
  "3/2": "rw-ph--32",
  "4/5": "rw-ph--45",
  "2/3": "rw-ph--23",
};

/* --------------------------------------------------------- small pieces */

/** Reading progress: a thin gold line across the top, as in the reference. */
function ReadingProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      const root = document.documentElement;
      const total = root.scrollHeight - root.clientHeight;
      if (ref.current) ref.current.style.width = total > 0 ? `${(root.scrollTop / total) * 100}%` : "0%";
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div ref={ref} className="rw-progress" aria-hidden="true" />;
}

/** One figure in a chapter gallery; opens the lightbox. */
function GalleryFigure({
  placed,
  full,
  sizes,
  onOpen,
}: {
  placed: PlacedFigure;
  full?: "full" | "tall";
  sizes: string;
  onOpen: (index: number) => void;
}) {
  const { figure, index } = placed;
  const intrinsic = !figure.aspect && !full;
  return (
    <button
      type="button"
      className={cn("rw-ph", figure.aspect && !full && ASPECT_CLASS[figure.aspect], full === "full" && "rw-ph--full", full === "tall" && "rw-ph--tall")}
      style={intrinsic ? { aspectRatio: `${figure.photo.width}/${figure.photo.height}` } : undefined}
      aria-label={`View larger: ${figure.caption ?? figure.photo.alt}`}
      onClick={() => onOpen(index)}
    >
      <Photo photo={figure.photo} mode="cover" sizes={sizes} quality={75} />
    </button>
  );
}

/**
 * One clip of "The Night": plays muted while at least 30% is in view, with a
 * pause button whose choice sticks, as in the reference. Reduced motion
 * leaves the clip paused until the visitor presses play.
 */
function NightClip({ clip }: { clip: StoryNightClip }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(frameRef, { amount: 0.3 });
  const [paused, setPaused] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduce(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (inView && !paused && !reduce) {
      video.play().catch(() => setPaused(true));
    } else {
      video.pause();
    }
  }, [inView, paused, reduce]);

  return (
    <div ref={frameRef} className="rw-clip" style={{ aspectRatio: clip.aspectRatio ?? "3/2" }}>
      <video
        ref={videoRef}
        src={clip.src}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={clip.alt}
        className="block h-full w-full object-cover"
      />
      <button
        type="button"
        aria-label={paused ? "Play video" : "Pause video"}
        aria-pressed={paused}
        onClick={() => setPaused((value) => !value)}
        className="absolute right-4 bottom-4 flex size-11 items-center justify-center rounded-full border border-white/55 bg-ink/35 text-white opacity-70 backdrop-blur-sm transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100"
      >
        {paused ? (
          <svg viewBox="0 0 24 24" className="size-4 fill-white" aria-hidden="true">
            <path d="M7 4l13 8-13 8z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-white stroke-2" aria-hidden="true">
            <path d="M8 5v14M16 5v14" />
          </svg>
        )}
      </button>
    </div>
  );
}

/* --------------------------------------------------------------- story */

/**
 * The real-wedding story page, matching the client's real-wedding reference:
 * ivory hero opener, credit strip, Roman-numeral chapter nav with a scroll
 * spy, intro with the glance list, chapter galleries, pull quote, palette,
 * details, the night in video, credits, "Get the look", every photograph in
 * a strip with the lightbox, and the submit-a-wedding band. Sections hide
 * when their data is absent.
 */
export function RealWeddingStory({ wedding, cityName }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);

  const chapters = wedding.chapters;

  /* Chapters resolve their figures (captioned, or the flat photo list),
     their gallery rows and their anchor ids once. The lightbox order is the
     cover photograph followed by every chapter figure. */
  const story = useMemo(() => {
    const slides: { photo: PhotoData; caption?: string }[] = [{ photo: wedding.cover }];
    const resolved = chapters.map((chapter, i) => {
      const figures: StoryFigure[] = chapter.figures ?? chapter.photos.map((photo) => ({ photo }));
      const placed: PlacedFigure[] = figures.map((figure) => {
        slides.push({ photo: figure.photo, caption: figure.caption });
        return { figure, index: slides.length - 1 };
      });
      return {
        chapter,
        id: `ch${i + 1}`,
        numeral: chapter.numeral ?? romanOf(i + 1),
        rows: planRows(placed, chapter.rows),
        placed,
      };
    });
    return { slides, resolved };
  }, [chapters, wedding.cover]);

  const slides = story.slides;
  const lightboxSlides = useMemo(
    () => slides.map((s) => ({ src: s.photo.src, alt: s.caption ? `${s.caption} — ${s.photo.alt}` : s.photo.alt })),
    [slides],
  );

  /* Scroll spy for the chapter nav. */
  useEffect(() => {
    const ids = [...story.resolved.map((c) => c.id), "team"];
    const sections = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0 || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveChapter(entry.target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [story.resolved]);

  const credits = wedding.credits;
  const facts = wedding.creditStrip ?? credits.slice(0, 4).map((c) => ({ label: c.role, value: c.name }));
  const glance =
    wedding.glance ??
    [
      { label: "Couple", value: wedding.couple },
      { label: "City", value: cityName },
      { label: "Date", value: longDate.format(new Date(wedding.date)) },
      { label: "Style", value: wedding.style },
    ];
  const introParagraphs = wedding.intro ?? [wedding.excerpt];
  const look = wedding.getTheLook ?? [];
  const palette = wedding.palette ?? [];
  const nightClips = wedding.nightClips ?? [];
  const photoCount = slides.length;

  /** A photograph for a credit or look card, spread across the story. */
  const spreadPhoto = (i: number, count: number, offset = 0) => {
    const n = slides.length;
    const pick = Math.min(n - 1, Math.max(0, Math.round((i * (n - 1)) / Math.max(1, count - 1)) + offset));
    return slides[pick].photo;
  };

  const paletteAfter = Math.min(2, chapters.length - 1);

  return (
    <main className="story-page">
      <ReadingProgress />

      {/* Hero opener: names on ivory, the photograph below at full screen. */}
      <section className="rw-hero">
        <div className="rw-hero-tx">
          <span className="rw-cap">{wedding.heroEyebrow ?? `Real Wedding · ${cityName}`}</span>
          <h1>{coupleHeading(wedding.couple)}</h1>
          {wedding.heroSubtitle && <span className="rw-hero-sub">{wedding.heroSubtitle}</span>}
        </div>
        <button type="button" className="rw-hero-img" aria-label={`View larger: ${wedding.cover.alt}`} onClick={() => setLightboxIndex(0)}>
          <Photo photo={wedding.cover} mode="cover" sizes="100vw" priority quality={90} />
        </button>
      </section>

      {/* Credit strip */}
      {facts.length > 0 && (
        <div className="rw-facts">
          {facts.map((fact) => (
            <div key={fact.label + fact.value}>
              <span className="rw-cap gold">{fact.label}</span>
              <span>{fact.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Chapter nav */}
      {story.resolved.length > 1 && (
        <nav className="rw-chapters" aria-label="Chapters">
          {story.resolved.map((entry) => (
            <a key={entry.id} href={`#${entry.id}`} className={cn(activeChapter === entry.id && "on")}>
              <b>{entry.numeral}</b>
              <span className="rw-cap">{entry.chapter.title}</span>
            </a>
          ))}
          {credits.length > 0 && (
            <a href="#team" className={cn(activeChapter === "team" && "on")}>
              <b>·</b>
              <span className="rw-cap">The Team</span>
            </a>
          )}
        </nav>
      )}

      {/* Intro and glance */}
      <section className="rw-intro">
        <div>
          <span className="rw-cap gold">The story</span>
          <Reveal>
            <h2>{withAccent(wedding.storyHeadline ?? wedding.title)}</h2>
          </Reveal>
          <Reveal className="rw-intro-body">
            {introParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </Reveal>
        </div>
        {glance.length > 0 && (
          <Reveal>
            <dl className="rw-glance">
              {glance.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.href ? <Link href={row.href}>{row.value}</Link> : row.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
      </section>

      {/* Chapters */}
      {story.resolved.map((entry, i) => {
        const { chapter, id, numeral, rows, placed } = entry;
        const chapterLines = chapter.intro ? [chapter.intro] : chapter.text;
        const header = (
          <Reveal className="rw-ch">
            <span className="rw-num">{numeral}</span>
            <h2>{withAccent(chapter.title)}</h2>
            {chapterLines.map((line) => (
              <p key={line.slice(0, 32)}>{line}</p>
            ))}
          </Reveal>
        );

        let body: ReactNode = null;
        if (chapter.variant === "night") {
          body = nightClips.length > 0 && (
            <div className="rw-gal">
              {planNightRows(nightClips).map((row, r) => (
                <div key={r} className={cn("rw-row", row.length > 1 && "rw-row--pair")}>
                  {row.map((clip) => (
                    <NightClip key={clip.src} clip={clip} />
                  ))}
                </div>
              ))}
            </div>
          );
        } else if (chapter.variant === "details") {
          const figure = placed[0];
          body = (figure || (wedding.details?.length ?? 0) > 0) && (
            <div className="rw-details">
              {figure && (
                <GalleryFigure placed={figure} sizes="(min-width: 56.25rem) 63vw, 100vw" onOpen={setLightboxIndex} />
              )}
              {(wedding.details?.length ?? 0) > 0 && (
                <Reveal className="rw-details-txt">
                  {chapter.intro && <span className="rw-cap gold">{chapter.intro}</span>}
                  <h2>
                    Every <em>detail</em>
                  </h2>
                  <dl>
                    {wedding.details!.map((row) => (
                      <div key={row.label}>
                        <dt>{row.label}</dt>
                        <dd>{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </Reveal>
              )}
            </div>
          );
        } else if (rows.length > 0) {
          body = (
            <div className="rw-gal">
              {rows.map((row, r) => {
                /* The first row of a chapter fills the screen, as in the reference. */
                const full = r === 0 && row.layout === "single" ? "full" : r === 0 && row.layout === "pair" ? "tall" : undefined;
                if (row.layout === "mosaic") {
                  const [main, ...stack] = row.items;
                  return (
                    <div key={r} className="rw-row rw-row--mosaic">
                      <GalleryFigure placed={main} sizes="(min-width: 56.25rem) 47vw, 100vw" onOpen={setLightboxIndex} />
                      <div className="rw-stack">
                        {stack.map((item) => (
                          <GalleryFigure key={item.index} placed={item} sizes="(min-width: 56.25rem) 53vw, 100vw" onOpen={setLightboxIndex} />
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={r} className={cn("rw-row", row.layout === "pair" && "rw-row--pair", row.layout === "petals" && "rw-row--petals")}>
                    {row.items.map((item) => (
                      <GalleryFigure
                        key={item.index}
                        placed={item}
                        full={full}
                        sizes={row.layout === "single" ? "100vw" : "(min-width: 56.25rem) 50vw, 100vw"}
                        onOpen={setLightboxIndex}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          );
        }

        return (
          <div key={id}>
            <section id={id} className={cn(chapter.variant === "night" && "rw-night")}>
              {header}
              {body}
            </section>

            {/* Editor's pull quote after the first chapter, as in the reference. */}
            {i === 0 && wedding.pullQuote && (
              <Reveal as="section" className="rw-pull">
                <span className="rw-cap">Editor’s note</span>
                <p>{wedding.pullQuote}</p>
              </Reveal>
            )}

            {/* The palette drawn from the photographs. */}
            {i === paletteAfter && palette.length > 0 && (
              <section className="rw-palette" aria-label="The palette">
                <Reveal as="div">
                  <header>
                    <div>
                      <span className="rw-cap gold">The palette</span>
                      <h2>
                        Drawn from the <em>photographs</em>
                      </h2>
                    </div>
                    {wedding.editorNote && <p>{wedding.editorNote}</p>}
                  </header>
                </Reveal>
                <Reveal className="rw-sw">
                  {palette.map((swatch) => (
                    <div key={swatch.name}>
                      <i style={{ background: swatch.hex }} aria-hidden="true" />
                      <b>{swatch.name}</b>
                      {swatch.note && <small>{swatch.note}</small>}
                    </div>
                  ))}
                </Reveal>
              </section>
            )}
          </div>
        );
      })}

      {/* Credits */}
      {credits.length > 0 && (
        <section className="rw-team" id="team">
          <span className="rw-cap gold">Credits</span>
          <Reveal as="div">
            <h2>
              The <em>team</em> behind the day
            </h2>
          </Reveal>
          <div className="rw-vendors">
            {credits.map((credit, i) => {
              const href = credit.venueSlug
                ? `/venues/${credit.venueSlug}`
                : credit.vendorSlug
                  ? `/vendors/${credit.vendorSlug}`
                  : undefined;
              const photo = spreadPhoto(i, credits.length);
              const card = (
                <>
                  <div className="rw-im">
                    <Photo photo={photo} mode="cover" sizes="(min-width: 56.25rem) 25vw, 78vw" />
                  </div>
                  <div className="rw-t">
                    <span className="rw-cap gold">{credit.role}</span>
                    <b>{credit.name}</b>
                    {href && <u>View profile →</u>}
                  </div>
                </>
              );
              return href ? (
                <Reveal key={credit.role + credit.name} as="div">
                  <Link href={href} className="rw-vendor">
                    {card}
                  </Link>
                </Reveal>
              ) : (
                <Reveal key={credit.role + credit.name} className="rw-vendor">
                  {card}
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {/* Get the look */}
      {look.length > 0 && (
        <section className="rw-look">
          <Reveal as="div">
            <header>
              <div>
                <span className="rw-cap gold">Get the look</span>
                <h2>
                  Plan a wedding <em>like this one</em>
                </h2>
              </div>
              <p>The pieces that made the day, and the Wedoura vendors who do them.</p>
            </header>
          </Reveal>
          <div className="rw-looks">
            {look.map((item, i) => (
              <Reveal key={item.label} as="div">
                <Link href={item.href}>
                  <span className="rw-im">
                    <Photo photo={spreadPhoto(i, look.length, 2)} mode="cover" sizes="(min-width: 56.25rem) 25vw, 78vw" />
                  </span>
                  <b>{item.label}</b>
                  <span className="rw-cap gold">{item.note ?? "Explore vendors"} →</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* All photographs */}
      {photoCount > 1 && (
        <section className="rw-all" aria-label="All photographs">
          <header>
            <h2>
              All {countWord(photoCount)} <em>photographs</em>
            </h2>
            <span className="rw-cap">Scroll · tap to enlarge</span>
          </header>
          <div className="rw-film">
            {slides.map((slide, i) => (
              <button
                key={`${slide.photo.id}-${i}`}
                type="button"
                className="rw-ph"
                style={{ aspectRatio: `${slide.photo.width}/${slide.photo.height}` }}
                aria-label={`View larger: ${slide.caption ?? slide.photo.alt}`}
                onClick={() => setLightboxIndex(i)}
              >
                <Photo photo={slide.photo} mode="cover" sizes="(min-width: 56.25rem) 40rem, 20rem" quality={60} />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Submit a wedding */}
      <section className="rw-cta">
        <span className="rw-cap">For wedding professionals</span>
        <h2>
          Turn your wedding into a Wedoura <em>editorial</em>
        </h2>
        <p>
          Share a recent wedding and the team behind it. Selected stories are published in Real Weddings, with every
          vendor credited and linked.
        </p>
        <Link href="/contact">Submit a wedding</Link>
      </section>

      <Lightbox slides={lightboxSlides} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onIndex={setLightboxIndex} />
    </main>
  );
}

/** Landscape clips take a row of their own; portrait clips sit in pairs. */
function planNightRows(clips: StoryNightClip[]): StoryNightClip[][] {
  const rows: StoryNightClip[][] = [];
  let pending: StoryNightClip | null = null;
  const isPortrait = (clip: StoryNightClip) => {
    const [w, h] = (clip.aspectRatio ?? "3/2").split("/").map(Number);
    return Number.isFinite(w) && Number.isFinite(h) && h > w;
  };
  for (const clip of clips) {
    if (isPortrait(clip)) {
      if (pending) {
        rows.push([pending, clip]);
        pending = null;
      } else {
        pending = clip;
      }
    } else {
      if (pending) {
        rows.push([pending]);
        pending = null;
      }
      rows.push([clip]);
    }
  }
  if (pending) rows.push([pending]);
  return rows;
}
