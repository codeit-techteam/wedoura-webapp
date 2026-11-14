# Extracted reference

The three client mockups in `docs/reference/*.html` are ~2 MB each because of embedded base64 images. **Do not open them whole.** Use these extracts instead:

- `tokens.md` — CSS variables, fonts, section order, easing, durations, type scale per mockup, with the brief's authoritative values at the top.
- `<name>.markup.html` — body markup, images replaced by `PHOTO_PLACEHOLDER`.
- `<name>.css` — the mockup's stylesheet, one rule per line.
- `<name>.js` — the mockup's script (image arrays collapsed).

Names: `homepage`, `photographer-profile`, `mobile-app`. Regenerate with `npm run extract-reference`.

The mockups are for tone, type, spacing and section ideas only. Do not copy them line by line. Where a value differs from `docs/reference/brief.md`, the brief wins.
