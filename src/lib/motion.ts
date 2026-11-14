// Motion constants from the brief, mirrored in src/styles/tokens.css.
// Use these in every Motion component so the site moves in one voice.

export const EASE = [0.2, 0.7, 0.2, 1] as const;

/** 1. Fade and rise when a section or card enters view. Plays once. */
export const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.9, ease: EASE },
} as const;

/** 2. Slow zoom on hover or press for photos and cards. */
export const zoom = {
  rest: { scale: 1 },
  hover: { scale: 1.04 },
  transition: { duration: 1.2, ease: EASE },
} as const;

/** 3. Parallax range for cover images and story openers only. */
export const PARALLAX_PERCENT = 6;

/** 4. Page and viewer transitions. */
export const page = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
  transition: { duration: 0.45, ease: EASE },
} as const;

export const viewer = {
  backdrop: { duration: 0.35, ease: EASE },
  photo: { duration: 0.55, ease: EASE },
} as const;

/** 5. Film previews: play muted in view, pause off screen. */
export const FILM_PREVIEW_SECONDS = 10;
