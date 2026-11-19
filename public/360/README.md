# 360° panoramas

Real equirectangular photographs (360°×180°, 2:1, 4096×2048), downscaled from
Poly Haven's free 8K tonemapped JPGs. All are CC0 (public domain); credits are
kept anyway in `alt.json` and shown small in the viewer.

| File | Source asset | Author |
| --- | --- | --- |
| pano01.jpg | [Historic Cloister Passage](https://polyhaven.com/a/historic_cloister_passage) | Elvis Posa |
| pano02.jpg | [Symmetrical Garden 02](https://polyhaven.com/a/symmetrical_garden_02) | Dimitrios Savva, Jarod Guest |
| pano03.jpg | [Vestibule](https://polyhaven.com/a/vestibule) | Sergej Majboroda |
| pano04.jpg | [Glass Passage](https://polyhaven.com/a/glass_passage) | Greg Zaal |

**To add or replace:** drop in equirectangular JPGs (2:1, at least 4000px
wide), add an `alt.json` entry (alt text, plus credit where one is due), then
run `npm run photos` — they join `src/data/photos.ts` with
`projection: "equirectangular"` and can be used in portfolios and venue tours
(`venue.tour` in `src/data/vendors.ts` references them by photo id).
