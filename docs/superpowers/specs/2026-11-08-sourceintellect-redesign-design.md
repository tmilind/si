# SourceIntellect Redesign — Design Spec

**Date:** 2026-11-08
**Status:** Approved by owner; builder check done, answers folded in (marked "Builder-check decision")
**Supersedes:** `2026-07-11-sourceintellect-studio-site-design.md` (the "studio of Milind" positioning is dropped; much of the technical approach carries over)

## 1. Intent

sourceintellect.com currently serves a three-page consulting brochure for a company that doesn't offer those services. The owner wants to replace it with a site that shows **a company actively engaged in AI technology trends**: a place to publish short observations and occasional longer pieces, and later to anchor a brand presence on X and LinkedIn.

No product, service or technology focus has been decided. The site must therefore say nothing it would have to retract later, and must look deliberate and alive with only a handful of entries.

## 2. Goals, non-goals, anti-goals

**Goals**
- A stranger landing on any page understands within ten seconds that this is a company paying close attention to AI, and sees evidence in the form of dated, opinionated entries.
- Publishing a note takes under fifteen minutes end to end.
- The site deploys from this repo with one command.
- The design is distinctive but reads as natural to a developer and technical audience; nothing on it looks templated or generated.

**Non-goals (now)**
- Lead generation, services, pricing, team pages.
- Traffic volume for its own sake; SEO beyond correct metadata.
- Multiple authors, a CMS or web editor (contributors come later; Markdown-in-repo is enough for one author).

**Anti-goals (failure even if it works)**
- Anything fake: dead links, a form that discards submissions, invented team language, placeholder copy left in.
- A hero slogan, gradient, 3D blob, "AI brain" or robot imagery.
- A page that looks empty at five entries or needs volume to look right.
- Visible AI-generated tells: identical rounded cards with soft shadows, all-caps eyebrow labels, middle-dot meta strings, "→" on links, numbered 01/02/03 markers, fade-up-on-scroll on every section.

## 3. Positioning and voice

The site speaks as **SourceIntellect**, a company. There are no bylines and no personal names anywhere on the site. The About page is about the company; it names no people and lists no services.

**About page copy (final, owner-approved; do not edit):**

> SourceIntellect is a company focused on where AI is going.
>
> We watch technology trends closely, analyse what's changing, and synthesise it into a point of view. We also drive our own technology research. What we learn, we publish here.
>
> To get in touch, write to hello@sourceintellect.com.

The first sentence doubles as the site's one-line description (meta description, footer line, OG description for the home page).

## 4. Content model

Two content types, blended into **one chronological stream**, newest first.

| Type | Cadence | Shape | Fields |
|------|---------|-------|--------|
| **Note** | frequent | 2–5 sentences of the company's take on something read, tried or noticed; usually links to the thing | `date`, `body` (Markdown), optional `source: {title, url}` |
| **Post** | occasional | long-form, titled | `title`, `date`, `summary` (1–2 sentences; used in the stream and as OG description), `body` (Markdown) |

Rules:
- A note's commentary is the content; the link is the subject. Bare link lists are out.
- Every entry has its own permalink and correct Open Graph metadata, so it can be shared on X/LinkedIn later even though the site doesn't link to those networks yet.
- Markdown body may contain inline code, code blocks, links, emphasis, and images. Code is styled in Plex Mono.
- No categories, tags, pagination or search at launch. The home page shows the full stream. (Builder: when the stream exceeds roughly 50 entries, a yearly archive page becomes worth adding; not now.)
- Reading time for posts is computed at build time and shown in the stream as "Long read, 12 minutes" style text, not "12 min read".
- **Builder-check decision:** in the stream a post shows its title, then its summary at body size, then the reading-time line. (The wireframe in §6.1 omitted the summary; this corrects it.)
- **Builder-check decision (amended 2026-11-08 after owner review):** the **date is the permalink** for every entry, styled as muted text with no underline until hover/focus (teal underline). **Post titles are also links** to the post, plain at rest with the same hover treatment — the owner found a non-clickable title read as a missing link. Notes have no title, so the date remains their only permalink besides the source link. Underlines appear only on hover, so the stream stays free of a column of teal.

**Content standard (owner decision, 2026-11-08).** The stream shows a note in full, so a click on a note must never reveal "the same thing again"; a post is where depth lives.
- A **note** reacts to something external: 2–5 sentences, and it **must** carry a `source` link. It says what we think about the thing linked.
- A **post** is our own analysis: a title, a 1–2 sentence `summary` (what the stream shows), and **600+ words** that go materially beyond the summary — the problem, why it matters, what we found or recommend, with at least one concrete example (code, a table, a worked case). Anything that is our own thinking becomes a post, never a note.
- Launch therefore carries posts for the own-research topics; a thin own-research note is not acceptable as the headline.

## 5. Site structure

| Route | Content |
|-------|---------|
| `/` | Masthead, newest entry set large, the rest of the stream, footer |
| `/notes/<slug>/` | A single note, same typography as the stream, with the date, body and source link |
| `/posts/<slug>/` | A single post: title, date, reading time, body |
| `/about/` | The About copy above, nothing else |
| `/contact/` | Working form plus the `hello@` address as plain text |
| `/404` | Custom page in site style: one sentence, link home |

Navigation (masthead and footer): **Stream · About · Contact**. No X, LinkedIn, RSS or Subscribe anywhere. These are explicitly deferred (see §12), not forgotten.

Redirects so nothing 404s: `/about.html → /about/`, `/contact.html → /contact/`. `/index.html` resolves to `/` via Firebase `cleanUrls`.

**`www.sourceintellect.com` is in scope** (owner decision). Today it doesn't resolve. Add it as a Firebase Hosting custom domain configured to redirect to the apex, and give the owner the exact DNS record(s) to add at the registrar. Canonical URLs use the apex.

## 6. Visual design

Decided with the owner through mockups (kept in `.superpowers/brainstorm/26558-1794182006/content/`, gitignored; `type-systems-v2.html` option 3 and `logo-marks-v2.html` option B are the references).

### 6.1 Layout ("Headline first")

Home page, desktop, left-aligned, max content width ~1100px with 72px side padding:

```
┌──────────────────────────────────────────────────────────────┐
│ [mark] sourceintellect              Stream   About   Contact │  84px masthead
│                                                              │
│ Latest          Most agent demos this quarter are a loop     │  newest entry:
│ 07 Nov 2026     around one model call with a nicer           │  date column 160px,
│                 interface. The ones worth studying are       │  body 40px/1.12,
│                 the ones that fail well.                     │  max 24ch
│                 On a talk from the Agents in Production…     │  source line 15px
│ ─────────────────────────────────────────────────────────── │  1px hairline
│ 04 Nov 2026     Inference prices fell again. Every time…     │  17px/1.5, max 64ch
│                 On the latest round of API price cuts        │  13.5px muted
│ ─────────────────────────────────────────────────────────── │
│ 29 Oct 2026     What a year of running retrieval over…       │  post: 21px/1.3, 500
│                 Long read, 12 minutes                        │
│ ─────────────────────────────────────────────────────────── │
│ …                                                            │
│                                                              │
│ SourceIntellect is a company focused on where AI is going.   │  footer, 14px muted
│ Stream · About · Contact                      hello@…        │  (plain spaces/links,
└──────────────────────────────────────────────────────────────┘   no middle dots)
```

- The **newest entry is the headline**. If it's a note, its body is set at headline size; if it's a post, its title is (summary and reading-time line follow at body size). There is no slogan or hero.
- **Builder-check decision (amended 2026-11-08 after owner review):** when the newest entry is a note, its **first sentence** is always the headline (a plain `<h1>`, not a link — the note is shown in full here and the date is its only permalink) and the remainder follows at body size (17px) in the same column. When the newest entry is a post, the headline is its title, linked to the post. The permalink page always shows the whole body at body size. No extra schema field; sentence split on `. ` / `? ` / `! `.
- Dates sit in a fixed-width left column. Entries are separated by 1px hairlines, nothing else. No cards, no backgrounds, no icons.
- Only the newest entry is enlarged; everything below is uniform.
- **Mobile (<720px):** single column; date moves above the body as a small line; side padding 20px; newest entry headline drops to ~28px.
- Single-entry pages reuse the same column structure (date left, content right on desktop) so the site feels like one surface.

### 6.2 Type

- **IBM Plex Sans** for all reading text and headings (weights 400, 500, 600).
- **IBM Plex Mono** for dates, the "Latest" label, reading-time line, tags if ever added, inline code and code blocks (weights 400, 500).
- Scale (desktop): headline 40px/1.12/−0.022em weight 500 · post title in stream 21px/1.3 weight 500 · body 17px/1.5 · meta 13.5px · dates 12.5px mono · nav 15px.
- Dates formatted `07 Nov 2026` (two-digit day, short month, year).
- Sentence case everywhere. No all-caps labels, no letterspaced eyebrows, no "→" on links.
- Self-host the fonts (woff2, latin subset) rather than loading from Google, for privacy and no third-party request. `font-display: swap`.

### 6.3 Colour

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#FFFFFF` | page |
| `--ink` | `#15191D` | text, mark |
| `--muted` | `#5C6670` | dates, meta, nav |
| `--hairline` | `#E4E7EA` | rules |
| `--code-bg` | `#F1F3F4` | inline code / code block background |
| `--teal` | `#0D8A7A` | the mark's highlighted weight, the word "intellect" in the wordmark, link underlines, focus rings |

Teal appears in exactly those places. Links are ink-coloured text with a 1.5px teal underline offset 3px; on hover the text turns teal.

**Light theme only at launch.** Dark mode is deferred (§12); it's a design pass, not a toggle.

### 6.4 The mark ("Weights")

A 4×4 attention-matrix of dots. The diagonal is heavy, one off-diagonal weight is teal. Geometry on a 32-unit grid, dot centres at 5.5 / 12.5 / 19.5 / 26.5:

```svg
<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <g fill="#15191D">
    <circle cx="5.5"  cy="5.5"  r="2.3"/> <circle cx="12.5" cy="5.5"  r="0.9"/> <circle cx="19.5" cy="5.5"  r="1.2"/> <circle cx="26.5" cy="5.5"  r="0.8"/>
    <circle cx="5.5"  cy="12.5" r="1.1"/> <circle cx="12.5" cy="12.5" r="2.3"/> <circle cx="19.5" cy="12.5" r="0.9"/>
    <circle cx="5.5"  cy="19.5" r="0.8"/> <circle cx="12.5" cy="19.5" r="1.3"/> <circle cx="19.5" cy="19.5" r="2.3"/> <circle cx="26.5" cy="19.5" r="1.0"/>
    <circle cx="5.5"  cy="26.5" r="1.2"/> <circle cx="12.5" cy="26.5" r="0.8"/> <circle cx="19.5" cy="26.5" r="1.1"/> <circle cx="26.5" cy="26.5" r="2.3"/>
  </g>
  <circle cx="26.5" cy="12.5" r="3.0" fill="#0D8A7A"/>
</svg>
```

- **Small-size cut (≤32px rendered):** raise every radius so the smallest dot is ≥1.2 and the diagonal is 2.6, teal 3.3. Use this for favicons.
- **Dark surfaces** (dark favicon, round avatar): dots `#DFE3E8`, teal `#33D6C0`.
- **Wordmark:** `sourceintellect` as one word in Plex Sans, "source" weight 400 in ink, "intellect" weight 600 in teal. Mark sits left of the wordmark at cap-height, 10px gap.
- Deliverables: `mark.svg`, `mark-small.svg`, `mark-dark.svg`, favicon set (16, 32, 48, 180 apple-touch, 192, 512), `favicon.ico`, a 1200×630 OG image (mark + wordmark + the one-line description on white), and 400×400 light and dark avatars for later use on X/LinkedIn. New assets go in `.ai/logos/`; the old lattice PNGs move to `.ai/logos/legacy/`.

### 6.5 Motion and polish floor

- No scroll-triggered animation. The only motion is hover/focus transitions (120ms) on links and the form button.
- Visible focus rings (2px teal, offset 2px). `prefers-reduced-motion` removes the transitions.
- Responsive to 320px wide with no horizontal scroll. Line lengths under 80 characters at every width.
- Contrast: all text on white meets WCAG AA (muted `#5C6670` on white is 5.6:1).

## 7. Contact form

Static-friendly form posting to **Web3Forms** (free tier, access key only), delivering to `hello@sourceintellect.com`. Fields: name, email, message. Honeypot field for spam. On success, the page shows "Sent. We'll reply to [email]." without a redirect. The `hello@` address is also printed on the page as a `mailto:` link so the form is never the only route. Fallback provider if Web3Forms disappoints: Formspree. (Carried over from the July spec; owner creates the access key with the `hello@` mailbox.)

## 8. Technical design

- **Framework:** Astro, static output. Two content collections, `notes` and `posts`, with the schemas in §4 enforced by Zod. One `getStream()` helper merges and sorts them for the home page.
- **Repo layout:** Astro project at the repo root (`src/`, `public/`, `astro.config.mjs`, `package.json`). `website/` is deleted in the launch commit; it remains in git history. `.ai/` stays as the brand archive and gets the new mark assets.
- **Adding an entry:** create `src/content/notes/2026-11-08-some-slug.md` (or `posts/…`) with frontmatter, commit, run `npm run deploy`. Slug = filename minus date prefix.
- **Build and deploy:** `npm run build` → `dist/`. `firebase.json` already in the repo is updated to `public: "dist"`, `cleanUrls: true`, the two redirects in §5, and a `404.html`. `.firebaserc` already points at project `si-52430058-a0280` (verified 2026-11-08; the owner's Firebase login is `milind00@gmail.com`). `npm run deploy` = build + `firebase deploy --only hosting`.
- **Fonts:** Plex Sans and Plex Mono woff2 files under `public/fonts/`, `@font-face` in global CSS, preloaded.
- **Metadata:** every page has `<title>`, meta description, canonical, `og:title`, `og:description`, `og:image` (site OG image), `og:type`, `twitter:card=summary_large_image`. Entries use their summary (posts) or first ~160 chars of body (notes) as description. **Builder-check decision (note titles):** a note's `og:title` is its first sentence, truncated to ~70 characters on a word boundary with an ellipsis if cut; its `<title>` is that followed by " – SourceIntellect". Posts use their title. `sitemap.xml` via `@astrojs/sitemap`. No RSS.
- **Analytics:** none at launch (owner hasn't asked; avoids a cookie/consent question). Easy to add later.
- **Dependencies:** keep to Astro, `@astrojs/sitemap`, and nothing else unless a concrete need appears. No CSS framework; plain CSS with the tokens in §6.3.

## 9. Error handling and edge cases

- **Empty stream:** build fails with a clear message if there are zero entries; the home page must never ship empty.
- **Only one entry:** the newest-entry headline renders and the stream below is simply absent; no "more coming soon" text.
- **Note without `source`:** the source line is omitted.
- **Very long note:** notes are capped by convention, not code; if a note's body exceeds ~600 characters the build prints a warning suggesting it be a post.
- **Form provider down:** the honeypot/JS-free form still posts; if the provider returns an error, show "Couldn't send. Email hello@sourceintellect.com instead." with the address linked.
- **Custom 404** in site style.

## 10. Verification

- `astro build` clean, no warnings.
- Link check over `dist/`: no `#` hrefs, no 404s, no references to X, LinkedIn, RSS or Subscribe.
- Lighthouse on `/` and one post: 95+ across the board; no third-party requests other than the form POST.
- Share preview check (opengraph.xyz or equivalent) on `/`, one note and one post.
- Screenshots at 320, 768 and 1280 widths for the home page and a post, reviewed against the §6.1 wireframe.
- Form: one real submission delivered to `hello@`.
- Post-deploy (owner runs these): `/about.html` and `/contact.html` redirect; `sourceintellect.com` and the `.web.app` URL serve the new site; `www.sourceintellect.com` redirects to the apex.

## 11. Scope of this build and launch checklist

**End state of this build (owner decision): deploy-ready, not deployed.** The work stops at: builds clean, verified locally per §10's pre-deploy items, `npm run deploy` wired up, `website/` removed in the launch commit on a branch. The owner runs the deploy when the checklist below is complete. Nothing is pushed to the live Firebase site by the builder.

**Launch entries (owner decision):** the builder **drafts** 3–5 entries in the company voice on real, current AI topics (at least one about the company's own research, at least one post), clearly marked as drafts in a `draft: true` frontmatter field that excludes them from the build. The owner edits or replaces them and flips `draft` off before deploying. The build must still fail if no non-draft entries exist (§9).

Owner-side checklist before deploy:

- [ ] Review and edit the drafted entries; set `draft: false` on the ones to ship.
- [ ] Web3Forms access key created with `hello@sourceintellect.com` and placed where the builder documents.
- [ ] Approve the final rendered mark and OG image.
- [ ] Add the DNS record(s) for `www` that the builder provides.
- [ ] Run `npm run deploy`, then the post-deploy checks in §10.

## 12. Deferred, explicitly

These were discussed and pushed out, not overlooked:

- X and LinkedIn links, and any cross-posting workflow ("we will add later").
- RSS feed and email subscriptions ("no RSS, no subscription for now").
- Dark mode.
- Multiple contributors, author fields, a CMS or web editor.
- Archive/pagination, tags, search.
- Per-entry OG images.
- A Projects page (from the July spec).
- Analytics.

## 13. Decisions and rejected alternatives

- **Company voice over personal studio.** The July spec built the site around a named engineer. Owner now wants a company presence and future contributors; names are off the site entirely.
- **Layout.** Four minimal layouts were shown (headline-first, single reading column, sticky left index, giant wordmark). Headline-first chosen because the newest take as the headline keeps the page alive without a hero, and dates-as-structure suits chronological content.
- **Type.** Inter/JetBrains, Geist, IBM Plex and system fonts were shown. Plex chosen: engineering heritage, warmth, not another company's current house style.
- **Mark.** Refined lattice, attention-matrix, "si" monogram and a convergence/prism were shown. Attention matrix chosen as the only option specifically about AI; it reads as a calm dot grid to non-specialists.
- **Dark theme** (the "Observatory" direction) rejected for launch: would have required changing the brand's light-and-clean direction.
- **Markdown in repo** over a CMS: one author who works in git; revisit when contributors arrive.
- **No RSS** despite near-zero cost: owner's explicit call.

## 14. Left to the builder

- Exact spacing values beyond those given; the wireframe and type scale are the constraints.
- Astro component breakdown and file naming.
- How reading time is computed (any reasonable words-per-minute).
- Form success/error UI details within the copy given in §7 and §9.
- OG image composition within §6.4's description.
