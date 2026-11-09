# SourceIntellect

Astro static site for sourceintellect.com.

- `npm run dev` - local dev server
- `npm run build` - build to `dist/`
- `npm test` - unit tests
- `npm run test:dist` - build, then test the built output
- `npm run deploy` - build and deploy to Firebase Hosting

## Contact form

The contact form posts to Web3Forms and needs `PUBLIC_WEB3FORMS_KEY`. Get a key at web3forms.com (created with the hello@sourceintellect.com mailbox), then put it in `.env` locally (see `.env.example`) and set it in the deploy environment. Without it the build warns and the form will not deliver.

## Publishing

Add `YYYY-MM-DD-slug.md` to `src/content/notes/` or `src/content/posts/` with this frontmatter:

```yaml
# note (source is optional)
date: 2026-11-07
source: { title: Thing you're reacting to, url: https://example.com/article }
draft: false

# post
title: Post title
date: 2026-11-07
summary: One-sentence summary.
draft: false
```

- Note images must live in `public/` and be referenced with absolute paths (`/images/…`).
- Slugs (the filename minus the date prefix) must be unique across all notes and across all posts.

Drafts (`draft: true`) are excluded from the deploy build by default. `SI_INCLUDE_DRAFTS=1 npm run dev` is the only way to preview them. To publish, set `draft: false` (or remove the field).

### Content standard

The full standard and human checklist are in [docs/content-standard.md](docs/content-standard.md); `npm run lint:content` enforces the checkable parts and runs inside `npm run verify` and `npm run deploy`.

The stream shows a note in full, so a click must never show "the same thing again". Depth lives in posts.

- A **note** reacts to something external: 2–5 sentences, and it must carry a `source` link. It says what we think about the thing linked.
- A **post** is our own analysis: a title, a 1–2 sentence `summary` (what the stream shows), and 600+ words that go materially beyond the summary — the problem, why it matters, what we found or recommend, at least one concrete example (code, a table, a worked case). Anything that is our own thinking becomes a post, never a note.

## Deploy

See [docs/deploy.md](docs/deploy.md).
