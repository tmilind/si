# The SourceIntellect mark

A 4x4 attention matrix. Dot size is attention weight: a strong diagonal (the model attending to itself and its context), quiet off-diagonal cells, and one teal off-diagonal weight in row 2, column 4. That teal dot is the moment a model notices something unexpected.

Geometry: viewBox `0 0 32 32`, dot centres at 5.5 / 12.5 / 19.5 / 26.5. The same radii are used by `src/components/Mark.astro`; change them in both places together.

## Variants

| File | Use |
| --- | --- |
| `logos/mark.svg` | Default. Headers, documents, anything 32px and up on a light surface. |
| `logos/mark-small.svg` | Below 32px (favicons, tab icons, small UI). Radii remapped 0.8..2.3 to 1.2..2.6, teal dot 3.3, so the smallest dots survive rasterising. |
| `logos/mark-dark.svg` | Dark surfaces. Dots `#DFE3E8`, teal `#33D6C0` (the light-surface teal is too dim on dark). |

Rule: never scale the default mark below 32px; switch to the small cut.

## Wordmark

`source` in IBM Plex Sans 400, ink `#15191D`, then `intellect` in IBM Plex Sans 600, teal `#0D8A7A`, as one word with no space. `logos/wordmark.svg` uses live `<text>`, so it needs IBM Plex Sans installed to render correctly.

## Regenerating

`npm run assets` rebuilds from the SVGs: favicons (16/32/48 PNG, `favicon.ico`), `apple-touch-icon.png`, `icon-192/512.png`, `og.png` (via system Chrome and `scripts/og.html`) into `public/`, and the 400px avatars into `logos/`. Earlier brand-kit files are in `logos/legacy/`.
