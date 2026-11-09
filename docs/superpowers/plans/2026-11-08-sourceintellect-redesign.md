# SourceIntellect Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static brochure in `website/` with a deploy-ready Astro site: one chronological stream of company-voice notes and posts, About, Contact, new mark and favicons, wired to the existing Firebase project.

**Architecture:** Astro static site at the repo root. Two Markdown content collections (`notes`, `posts`) merged by a `getStream()` helper. Plain CSS with design tokens, self-hosted IBM Plex via Fontsource. Pure text helpers (dates, sentence split, reading time, titles) live in `src/lib/` and are unit-tested with Vitest; rendered output is checked by tests that read `dist/` after a build. Brand assets are generated from one SVG source by a script.

**Tech Stack:** Node 26, Astro 7.x, `@astrojs/sitemap`, `marked` (note bodies), `@fontsource/ibm-plex-sans` + `@fontsource/ibm-plex-mono`, Vitest, `sharp` + `playwright-core` (dev-only, asset generation and screenshots), Firebase CLI (installed globally, v15).

**Spec:** `docs/superpowers/specs/2026-11-08-sourceintellect-redesign-design.md`

## Global Constraints

- Company voice only: no bylines, author fields, or personal names anywhere in site output.
- Navigation is exactly **Stream · About · Contact**. The built site must contain no links or text for X, Twitter, LinkedIn, RSS or Subscribe (spec §5, §12).
- Colour tokens exactly: `--bg #FFFFFF`, `--ink #15191D`, `--muted #5C6670`, `--hairline #E4E7EA`, `--code-bg #F1F3F4`, `--teal #0D8A7A`. Teal only on: the mark's highlighted weight, "intellect" in the wordmark, link underlines, focus rings (§6.3).
- Type: IBM Plex Sans 400/500/600 for text; IBM Plex Mono 400/500 for dates, "Latest", reading time, code. Headline 40px/1.12/−0.022em weight 500; stream post title 21px/1.3/500; body 17px/1.5; meta 13.5px; dates 12.5px mono; nav 15px. Sentence case; no all-caps, no letterspaced labels, no "→" (§6.2).
- Date display format `07 Nov 2026` (§6.2). Dates in frontmatter are `YYYY-MM-DD`; treat as UTC calendar dates.
- About page copy is fixed verbatim (§3). One-line description: `SourceIntellect is a company focused on where AI is going.`
- No scroll animation; hover/focus transitions 120ms; `prefers-reduced-motion` removes them; 2px teal focus ring offset 2px (§6.5).
- Light theme only. No analytics. No CSS framework. Dependencies limited to those in Tech Stack (§8).
- Build fails with a clear message when there are zero non-draft, non-future entries (§9). `SI_INCLUDE_DRAFTS=1` includes drafts for local preview.
- End state is **deploy-ready, not deployed**: never run `firebase deploy` (§11). Work on branch `redesign`.
- Commit after each task with the trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## Review Focus

1. A note whose first sentence contains a Markdown link or inline code (`[text](url)`, `` `x` ``): the headline must show plain text, not raw Markdown syntax. → test in Task 2 (`stripMarkdown`, `headlineSplit`).
2. A frontmatter date like `2026-11-07` displayed in a US-west timezone must still read `07 Nov 2026`, not the 6th. → `formatDate` uses UTC; test in Task 2.
3. An entry dated in the future (owner pre-writes) must not appear until that date; two entries on the same date must sort stably (posts before notes, then by slug). → `getStream` tests in Task 2.
4. The contact form with JavaScript disabled must still submit (plain POST to Web3Forms) and the honeypot must be invisible to users but present in the DOM. → Task 6 dist test.
5. A viewport of 320px must show no horizontal scroll on the home page and a post page. → Task 10 screenshot check asserts `document.documentElement.scrollWidth <= 320`.

---

### Task 1: Scaffold the Astro project, tokens and fonts

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `src/styles/global.css`, `src/env.d.ts`, `README.md`
- Modify: `.gitignore` (add `dist/` already present under Python; add `.astro/`)
- Test: `tests/unit/smoke.test.ts`

**Interfaces:**
- Produces: npm scripts `dev`, `build`, `preview`, `test` (vitest unit), `test:dist` (build then vitest `tests/dist`), `assets` (Task 7), `deploy` (Task 8). CSS custom properties named exactly as in Global Constraints, plus `--font-sans` and `--font-mono`.

- [ ] **Step 1: Create branch and init project**

Run: `git checkout -b redesign && npm init -y && npm i astro@^7 @astrojs/sitemap marked @fontsource/ibm-plex-sans @fontsource/ibm-plex-mono && npm i -D vitest typescript @types/node`
Expected: `node_modules/` present; `npx astro --version` prints 7.x.

- [ ] **Step 2: Write `astro.config.mjs`**

`site: 'https://sourceintellect.com'`, `trailingSlash: 'always'`, `build: { format: 'directory' }`, integrations `[sitemap()]`, `markdown.shikiConfig.theme: 'github-light'`.

- [ ] **Step 3: Write `src/styles/global.css`**

`:root` tokens from Global Constraints; `@font-face` provided by importing `@fontsource/ibm-plex-sans/{400,500,600}.css` and `@fontsource/ibm-plex-mono/{400,500}.css` in the layout (Task 3), with `--font-sans: "IBM Plex Sans", system-ui, sans-serif; --font-mono: "IBM Plex Mono", ui-monospace, monospace;`. Base: `body { margin:0; background:var(--bg); color:var(--ink); font:17px/1.5 var(--font-sans); }`. Link rule: ink text, `text-decoration: underline; text-decoration-color: var(--teal); text-decoration-thickness:1.5px; text-underline-offset:3px;` hover colour teal; `:focus-visible { outline:2px solid var(--teal); outline-offset:2px; }`. Transitions 120ms, removed under `@media (prefers-reduced-motion: reduce)`.

- [ ] **Step 4: Write `vitest.config.ts`** using Astro's `getViteConfig` with `test.include: ['tests/**/*.test.ts']`.

- [ ] **Step 5: Write the smoke test**

```ts
// tests/unit/smoke.test.ts
import { it, expect } from 'vitest';
it('runs', () => expect(1 + 1).toBe(2));
```

- [ ] **Step 6: Add scripts to `package.json`**

`"dev": "astro dev"`, `"build": "astro build"`, `"preview": "astro preview"`, `"test": "vitest run tests/unit"`, `"test:dist": "npm run build && vitest run tests/dist"`, `"deploy": "npm run build && firebase deploy --only hosting"`.

- [ ] **Step 7: Verify**

Run: `npm test && npm run build`
Expected: smoke test PASS; build completes (no pages yet is fine; add a minimal `src/pages/index.astro` with `<h1>SourceIntellect</h1>` if Astro requires one).

- [ ] **Step 8: Commit** — `chore: scaffold Astro site with tokens and fonts`

---

### Task 2: Content collections, stream, and text helpers

**Files:**
- Create: `src/content.config.ts`, `src/lib/text.ts`, `src/lib/stream.ts`, `src/content/notes/.gitkeep`, `src/content/posts/.gitkeep`
- Test: `tests/unit/text.test.ts`, `tests/unit/stream.test.ts`, fixtures under `tests/fixtures/content/{notes,posts}/`

**Interfaces:**
- Produces, in `src/lib/text.ts`:
  - `formatDate(d: Date): string` → `07 Nov 2026` using UTC fields.
  - `stripMarkdown(md: string): string` → plain text: links to their text, inline code to its content, emphasis markers removed, newlines collapsed to spaces.
  - `firstSentence(text: string): string` → up to and including the first `. `, `? ` or `! ` boundary (or whole text if none).
  - `truncateWords(text: string, max = 70): string` → cut on a word boundary, append `…` if cut.
  - `headlineSplit(md: string, threshold = 220): { lead: string; rest: string }` → if `stripMarkdown(md).length <= threshold`: `{ lead: md, rest: '' }`; else lead = plain first sentence, rest = original Markdown after that sentence.
  - `readingTime(text: string, wpm = 220): number` → minutes, min 1.
  - `noteTitle(md: string): string` → `truncateWords(firstSentence(stripMarkdown(md)), 70)`.
- Produces, in `src/lib/stream.ts`:
  - `type Entry = { kind: 'note'; slug: string; date: Date; body: string; source?: { title: string; url: string }; url: string } | { kind: 'post'; slug: string; date: Date; title: string; summary: string; body: string; minutes: number; url: string }`
  - `getStream(opts?: { includeDrafts?: boolean; today?: Date }): Promise<Entry[]>` → newest first; excludes `draft: true` unless `includeDrafts`; excludes `date > today`; ties: posts before notes, then slug ascending; throws `Error('No publishable entries. Add a note or post, or set SI_INCLUDE_DRAFTS=1 for preview.')` when empty.
  - `slugOf(id: string): string` → strips a leading `YYYY-MM-DD-` from the collection entry id.
  - `filterEntries(entries: Entry[], opts: { includeDrafts: boolean; today: Date }): Entry[]` (entries carry a `draft: boolean` field internally before mapping) and `sortEntries(entries: Entry[]): Entry[]` and `assertNonEmpty(entries: Entry[]): Entry[]` (throws the message above) — the pure pieces `getStream` composes, exported for tests.
  - `includeDrafts(): boolean` → `process.env.SI_INCLUDE_DRAFTS === '1'`.
- Schemas in `src/content.config.ts` (Zod): notes `{ date: z.coerce.date(), source: z.object({title, url: z.string().url()}).optional(), draft: z.boolean().default(false) }`; posts `{ title, date: z.coerce.date(), summary, draft: z.boolean().default(false) }`. Loader: `glob({ pattern: '**/*.md', base: './src/content/notes' })` (verify the loader import path against the installed Astro 7 docs before writing).

- [ ] **Step 1: Write failing tests for `text.ts`**

```ts
expect(formatDate(new Date('2026-11-07'))).toBe('07 Nov 2026');
expect(stripMarkdown('See [the talk](https://x.y) and `temperature=0`.')).toBe('See the talk and temperature=0.');
expect(firstSentence('One. Two? Three')).toBe('One.');
expect(truncateWords('a '.repeat(50).trim(), 20)).toMatch(/…$/);
expect(headlineSplit('Short note.')).toEqual({ lead: 'Short note.', rest: '' });
const long = 'First sentence here. ' + 'x'.repeat(250);
expect(headlineSplit(long).lead).toBe('First sentence here.');
expect(headlineSplit(long).rest.startsWith('x')).toBe(true);
expect(readingTime('word '.repeat(2200))).toBe(10);
expect(noteTitle('[Agents](u) are mostly loops. More text.')).toBe('Agents are mostly loops.');
```

- [ ] **Step 2: Run** `npm test` — Expected: FAIL (module not found).
- [ ] **Step 3: Implement `src/lib/text.ts`** per the Interfaces block.
- [ ] **Step 4: Run** `npm test` — Expected: PASS.
- [ ] **Step 5: Write failing tests for `stream.ts`**

`getStream` reads from Astro's `getCollection`, so test the pure parts: export `sortEntries(entries: Entry[]): Entry[]` and `filterEntries(raw, {includeDrafts, today})` and test those; also `slugOf('2026-11-07-agent-demos')` → `'agent-demos'`, `slugOf('plain')` → `'plain'`. Assertions: future-dated entry excluded when `today` is before it; draft excluded unless flag; same-date post sorts before note; empty result from `assertNonEmpty([])` throws with the message above.

- [ ] **Step 6: Run** `npm test` — Expected: FAIL.
- [ ] **Step 7: Implement `src/content.config.ts` and `src/lib/stream.ts`**; `getStream` = `getCollection` ×2 → map to `Entry` (note `url: /notes/${slug}/`, post `url: /posts/${slug}/`, `minutes: readingTime(body)`) → `filterEntries` → `sortEntries` → `assertNonEmpty`. Emit `console.warn` for any note whose `stripMarkdown(body).length > 600` naming the file (§9).
- [ ] **Step 8: Run** `npm test` — Expected: PASS.
- [ ] **Step 9: Commit** — `feat: content collections, stream ordering and text helpers`

---

### Task 3: Base layout, masthead, footer, mark

**Files:**
- Create: `src/layouts/Base.astro`, `src/components/Masthead.astro`, `src/components/Footer.astro`, `src/components/Mark.astro`, `src/components/Wordmark.astro`, `public/og.png` (placeholder until Task 7), `public/favicon.svg` (the small-cut mark, Task 7 replaces)
- Test: `tests/dist/head.test.ts`

**Interfaces:**
- `Base.astro` props: `{ title: string; description: string; canonical: string; ogType?: 'website' | 'article' }`. Renders `<html lang="en">`, head with `<title>`, meta description, canonical, `og:title/description/image/type/url`, `twitter:card=summary_large_image`, font CSS imports, `global.css`; body = `<Masthead/> <main><slot/></main> <Footer/>`.
- `Mark.astro` props `{ size?: number; variant?: 'default' | 'small' | 'dark' }` renders the inline SVG from spec §6.4 exactly (default radii; `small` variant raises radii: min 1.2, diagonal 2.6, teal 3.3; `dark` swaps fills to `#DFE3E8` / `#33D6C0`).
- `Wordmark.astro` renders `<span class="wordmark">source<b>intellect</b></span>` with `b` 600 teal.
- Masthead: mark (28px) + wordmark linking to `/`, nav `Stream (/) · About (/about/) · Contact (/contact/)`, 84px tall desktop. Footer: the one-line description, the same three links, `hello@sourceintellect.com` mailto. Links separated by spacing, not characters.

- [ ] **Step 1: Write failing dist test**

```ts
// tests/dist/head.test.ts — reads dist/index.html with node:fs
expect(html).toMatch(/<meta property="og:title"/);
expect(html).toMatch(/<link rel="canonical" href="https:\/\/sourceintellect\.com\/"/);
expect(html).toMatch(/<meta name="description" content="SourceIntellect is a company focused on where AI is going\."/);
for (const banned of ['twitter.com', 'x.com', 'linkedin.com', 'rss.xml', '/rss', 'subscribe']) expect(html.toLowerCase()).not.toContain(banned);
expect(html).toContain('source<b>intellect</b>');
```
(Note: `twitter:card` meta is allowed; test for banned `twitter.com` URL, not the word.)

- [ ] **Step 2: Run** `npm run test:dist` — Expected: FAIL.
- [ ] **Step 3: Implement the five components and have `src/pages/index.astro` use `Base`** with a temporary `<p>stream goes here</p>`.
- [ ] **Step 4: Run** `npm run test:dist` — Expected: PASS.
- [ ] **Step 5: Commit** — `feat: base layout, masthead, footer and mark`

---

### Task 4: Home page stream

**Files:**
- Create: `src/pages/index.astro`, `src/components/Headline.astro`, `src/components/StreamRow.astro`, `src/components/NoteBody.astro`, `src/styles/stream.css`
- Test: `tests/dist/home.test.ts`, dev fixtures: three non-draft entries in `src/content/` created in this task and **deleted in Task 9** (they're fixtures, named `0000-00-00-fixture-*.md` so they're unmistakable)

**Interfaces:**
- `NoteBody.astro` props `{ md: string }` → `marked.parse(md)` output via `set:html`; inline code and code blocks get `--code-bg` and `--font-mono`.
- `Headline.astro` props `{ entry: Entry }` → date column with "Latest" (mono) over the date (mono, link to `entry.url`); note: uses `headlineSplit`, lead in a `<p class="headline">` (40px rule), `rest` via `NoteBody` at body size, then the source line `On <a href=source.url>source.title</a>` if present; post: `<h1 class="headline">` title → summary → `Long read, N minutes`.
- `StreamRow.astro` props `{ entry: Entry }` → grid `160px 1fr`; date (mono, link); note body via `NoteBody` (+ source line); post title (21px/500) + summary + reading line. Rows separated by 1px `--hairline`.
- `index.astro`: `const stream = await getStream({ includeDrafts: includeDrafts() })`; `<Headline entry={stream[0]}/>` then `stream.slice(1).map(StreamRow)`; if only one entry, no stream section is rendered.
- Mobile ≤720px: grid collapses to one column; date above body; headline 28px; side padding 20px.

- [ ] **Step 1: Create three fixture entries** (two notes incl. one >220 chars with a Markdown link in its first sentence, one post), all dated in the past, `draft: false`.
- [ ] **Step 2: Write failing dist test**

```ts
expect(html).toMatch(/class="headline"/);
expect(html).not.toMatch(/\]\(http/);                 // no raw markdown in output
expect(html).toMatch(/Long read, \d+ minutes/);
expect(html).toMatch(/\d{2} [A-Z][a-z]{2} \d{4}/);    // 07 Nov 2026 format
expect((html.match(/class="row"/g) ?? []).length).toBe(2); // 3 entries → 1 headline + 2 rows
```

- [ ] **Step 3: Run** `npm run test:dist` — Expected: FAIL.
- [ ] **Step 4: Implement the components and page.**
- [ ] **Step 5: Run** `npm run test:dist` — Expected: PASS. Then `npm run dev`, open the home page, compare against spec §6.1 wireframe at 1280px and 375px; fix spacing until it matches.
- [ ] **Step 6: Commit** — `feat: home page stream with headline-first layout`

---

### Task 5: Note and post pages

**Files:**
- Create: `src/pages/notes/[slug].astro`, `src/pages/posts/[slug].astro`, `src/styles/entry.css`
- Test: `tests/dist/entries.test.ts`

**Interfaces:**
- Both use `getStaticPaths` from `getStream({ includeDrafts: includeDrafts() })` filtered by kind; `params.slug = entry.slug`.
- Note page: `Base` title `${noteTitle(body)} – SourceIntellect`, description = first ~160 chars of `stripMarkdown(body)` cut on a word, `ogType: 'article'`; layout: date column + full body via `NoteBody` + source line.
- Post page: `Base` title `${title} – SourceIntellect`, description = summary; renders the collection entry's Markdown through Astro's renderer (so Shiki highlights code) inside an `<article>` with max-width 64ch; shows date and `Long read, N minutes` above the title.

- [ ] **Step 1: Write failing dist test** — for the fixture note: `dist/notes/<slug>/index.html` exists, `<title>` starts with the first sentence (no `[`), `og:type` is `article`; for the fixture post: `dist/posts/<slug>/index.html` exists and contains a `<pre` block if the fixture has a code fence.
- [ ] **Step 2: Run** `npm run test:dist` — Expected: FAIL.
- [ ] **Step 3: Implement both pages.**
- [ ] **Step 4: Run** `npm run test:dist` — Expected: PASS.
- [ ] **Step 5: Commit** — `feat: note and post permalink pages`

---

### Task 6: About, Contact, 404

**Files:**
- Create: `src/pages/about.astro`, `src/pages/contact.astro`, `src/pages/404.astro`, `src/scripts/contact.ts`
- Test: `tests/dist/pages.test.ts`

**Interfaces:**
- About: the §3 copy verbatim in three `<p>`s; the email as a `mailto:` link. Nothing else.
- Contact: `<form action="https://api.web3forms.com/submit" method="POST">` with hidden `access_key` read from `import.meta.env.PUBLIC_WEB3FORMS_KEY` (document in README; `.env.example` with the variable name), hidden `subject` = `Message from sourceintellect.com`, fields `name`, `email`, `message` (labels, not placeholders), honeypot `<input type="checkbox" name="botcheck" class="hp" tabindex="-1" aria-hidden="true">` hidden via CSS, button `Send message`. `contact.ts` progressively enhances: intercepts submit, `fetch` POST, on success replaces the form with `Sent. We'll reply to {email}.`; on failure shows `Couldn't send. Email <a href="mailto:hello@sourceintellect.com">hello@sourceintellect.com</a> instead.` Below the form, always: `Or write to hello@sourceintellect.com` as a mailto link.
- 404: one sentence `There's nothing at this address.` and a link `Back to the stream` → `/`.

- [ ] **Step 1: Write failing dist test** — `dist/about/index.html` contains the exact first About sentence and no `<form`; `dist/contact/index.html` contains `action="https://api.web3forms.com/submit"`, `name="botcheck"`, `mailto:hello@sourceintellect.com`; `dist/404.html` exists.
- [ ] **Step 2: Run** `npm run test:dist` — Expected: FAIL.
- [ ] **Step 3: Implement the three pages and the script.**
- [ ] **Step 4: Run** `npm run test:dist` — Expected: PASS. Manually: `npm run dev`, disable JS in the browser, confirm the form still has a POST action and the honeypot is not visible.
- [ ] **Step 5: Commit** — `feat: about, contact and 404 pages`

---

### Task 7: Brand assets from the mark

**Files:**
- Create: `.ai/logos/mark.svg`, `.ai/logos/mark-small.svg`, `.ai/logos/mark-dark.svg`, `.ai/logos/wordmark.svg`, `.ai/logo-mark.md`, `scripts/build-assets.mjs`, `public/favicon.svg`, `public/favicon.ico`, `public/favicon-16.png`, `public/favicon-32.png`, `public/favicon-48.png`, `public/apple-touch-icon.png` (180), `public/icon-192.png`, `public/icon-512.png`, `public/og.png` (1200×630), `.ai/logos/avatar-light-400.png`, `.ai/logos/avatar-dark-400.png`, `scripts/og.html`
- Move: existing `.ai/logos/*.png`, `.ai/logos/favicons/`, `.ai/logos/hero/`, `.ai/logos/social/` → `.ai/logos/legacy/`
- Modify: `src/layouts/Base.astro` (favicon/apple-touch links), `package.json` (`"assets": "node scripts/build-assets.mjs"`), devDeps `sharp`, `playwright-core`
- Test: `tests/unit/assets.test.ts` (reads generated PNG dimensions with `sharp`)

**Interfaces:**
- `build-assets.mjs`: rasterises `mark-small.svg` to the favicon PNG sizes and `favicon.ico` (16+32+48) with `sharp`; rasterises `mark.svg`/`mark-dark.svg` onto 400×400 white/`#15191D` discs for avatars; launches system Chrome via `playwright-core` (`channel: 'chrome'`) to screenshot `scripts/og.html` at 1200×630 for `public/og.png`. `og.html` is a self-contained page (imports the Fontsource CSS via relative `node_modules` path) showing mark + wordmark + the one-line description on white.
- `.ai/logo-mark.md`: one page describing the mark (attention matrix, one teal weight), the three variants, sizes, and the rule for dark surfaces (§6.4).

- [ ] **Step 1: Write the SVGs** exactly per spec §6.4 (default and small-cut radii; dark variant colours).
- [ ] **Step 2: Write failing test** — after `npm run assets`: `public/og.png` is 1200×630; `public/icon-512.png` is 512×512; `public/favicon.ico` exists and is >1KB.
- [ ] **Step 3: Run** `npm test` — Expected: FAIL (files missing).
- [ ] **Step 4: Write `scripts/build-assets.mjs` and `scripts/og.html`; run `npm run assets`.**
- [ ] **Step 5: Run** `npm test` — Expected: PASS. Open `public/og.png` and the favicons and check them by eye against the mockup (`.superpowers/brainstorm/26558-1794182006/content/logo-marks-v2.html`, option B).
- [ ] **Step 6: Move legacy assets, write `.ai/logo-mark.md`, add favicon links to `Base.astro`.**
- [ ] **Step 7: Commit** — `feat: attention-matrix mark, favicons, OG image and avatars`

---

### Task 8: Firebase hosting config and deploy wiring

**Files:**
- Modify: `firebase.json`, `README.md`
- Create: `docs/deploy.md`
- Test: `tests/unit/firebase.test.ts`; manual emulator check

**Interfaces:**
- `firebase.json`: `hosting: { site: 'si-52430058-a0280', public: 'dist', cleanUrls: true, trailingSlash: true, ignore: [...], redirects: [{source:'/about.html', destination:'/about/', type:301}, {source:'/contact.html', destination:'/contact/', type:301}] }`. Firebase serves `dist/404.html` automatically.
- `docs/deploy.md`: how to log in (`firebase login --reauth` as `milind00@gmail.com`), `npm run deploy`, the post-deploy checks from spec §10, and the **www** steps: in the Firebase console add custom domain `www.sourceintellect.com` choosing "redirect to sourceintellect.com", then add the DNS records the console shows at the registrar (the CLI cannot add custom domains). Note explicitly that the builder did not deploy.

- [ ] **Step 1: Write failing test** — parse `firebase.json`; assert `public === 'dist'`, `cleanUrls === true`, redirects contain both sources with `type 301`.
- [ ] **Step 2: Run** `npm test` — Expected: FAIL.
- [ ] **Step 3: Update `firebase.json`; write `docs/deploy.md`; add publishing + deploy sections to `README.md`** (how to add a note/post, `SI_INCLUDE_DRAFTS=1 npm run dev`, `PUBLIC_WEB3FORMS_KEY`).
- [ ] **Step 4: Run** `npm test` — Expected: PASS.
- [ ] **Step 5: Emulator check** — `npm run build && firebase emulators:start --only hosting` in the background, then `curl -sI localhost:5000/about.html | head -1` → `HTTP/1.1 301`; `curl -s localhost:5000/nope | grep -c "nothing at this address"` → `1`. Stop the emulator.
- [ ] **Step 6: Commit** — `chore: firebase hosting config and deploy docs`

---

### Task 9: Launch content drafts, remove fixtures and old site

**Files:**
- Create: four notes and one post under `src/content/notes/` and `src/content/posts/`, all `draft: true`, filenames `2026-11-DD-<slug>.md`
- Delete: `tests`-era fixtures `src/content/**/0000-00-00-fixture-*.md`; `website/` (entire directory)
- Modify: `tests/dist/*.test.ts` to run with `SI_INCLUDE_DRAFTS=1` (update `test:dist` script to set it), and a new unit test asserting the build throws without the flag when all entries are drafts

**Interfaces:**
- Drafts are real: use web search to find three to four genuinely recent (Oct–Nov 2026) AI items with real URLs for the note `source` fields, and write 2–5 sentence company-voice takes. One note is about the company's own research framed generically (e.g. an observation from evaluating models on a document-heavy task) with no invented numbers. The post is 600–900 words on an evergreen engineering topic the implementer can write accurately (e.g. why retrieval chunking strategy dominates RAG quality), with one code block. No names, no "we're a small team", no claims about clients.
- Insert a top comment in each file: `<!-- DRAFT for owner review: edit freely, then set draft: false -->`.

- [ ] **Step 1: Write the five entries.**
- [ ] **Step 2: Delete fixtures and `website/`;** change `test:dist` to `SI_INCLUDE_DRAFTS=1 npm run build && vitest run tests/dist`; adjust the row-count assertion in `tests/dist/home.test.ts` to `5 - 1 = 4` rows.
- [ ] **Step 3: Write failing unit test** — `assertNonEmpty(filterEntries(allDraftFixtures, { includeDrafts: false }))` throws the §9 message.
- [ ] **Step 4: Run** `npm test && npm run test:dist` — Expected: PASS. Run `npm run build` without the flag — Expected: build fails with the "No publishable entries" message.
- [ ] **Step 5: Commit** — `content: draft launch entries; remove fixtures and legacy website`

---

### Task 10: Verification pass

**Files:**
- Create: `scripts/check-links.mjs`, `scripts/screenshots.mjs`, `tests/dist/links.test.ts`
- Modify: `package.json` (`"verify": "npm run test:dist && node scripts/check-links.mjs && node scripts/screenshots.mjs"`)

**Interfaces:**
- `check-links.mjs`: walks `dist/**/*.html`; fails on any `href="#"`, any internal href whose target file doesn't exist in `dist/`, and any occurrence of `x.com`, `twitter.com`, `linkedin.com`, `/rss`, `Subscribe`.
- `screenshots.mjs`: serves `dist/` (use `npx astro preview` or a tiny `http` server), uses `playwright-core` + system Chrome to capture `/` and the draft post at widths 320, 768, 1280 into `.playwright-mcp/verify/`, and asserts `document.documentElement.scrollWidth <= width` at 320 for both pages (Review Focus 5).

- [ ] **Step 1: Write `links.test.ts`** asserting `check-links.mjs` exits 0 against the current `dist/`; **run** → Expected: FAIL (script missing).
- [ ] **Step 2: Implement both scripts;** run `SI_INCLUDE_DRAFTS=1 npm run verify` — Expected: all green, six screenshots written.
- [ ] **Step 3: Review the screenshots by eye** against spec §6.1 and §6.2; fix any spacing/type deviations; re-run.
- [ ] **Step 4: Lighthouse** — with `astro preview` running: `npx lighthouse http://localhost:4321/ --only-categories=performance,accessibility,best-practices,seo --quiet --chrome-flags="--headless" --output=json --output-path=/tmp/lh.json` then read the four scores; Expected: each ≥ 0.95. Repeat for the post URL. Fix and re-run if not.
- [ ] **Step 5: Commit** — `test: link check, responsive screenshots and lighthouse pass`

- [ ] **Step 6: Hand-off note** — append to `docs/deploy.md` a "Status" section: branch `redesign` is deploy-ready; what the owner must do (spec §11 checklist). Do **not** merge to `main` and do **not** deploy; the owner does both.
