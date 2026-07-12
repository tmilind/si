# SourceIntellect Studio Site — Design Spec

**Date:** 2026-07-11
**Status:** Draft for review

## 1. Context & Problem

sourceintellect.com is live on Firebase Hosting (DNS + Zoho email already configured),
serving a 3-page static consulting brochure that is byte-identical to `website/` in this
repo. It has no real function today:

- The contact form fakes success and discards submissions (`contact.html` intercepts
  submit and logs to console).
- No favicon, no OG/social meta — shared links render blank despite a full branding kit
  sitting unused in `.ai/logos/`.
- Footer links (Careers, Blog, LinkedIn, Twitter, GitHub) point to `#`.
- The repo has no deploy pipeline (`firebase.json` / `.firebaserc` absent); the site was
  deployed once, outside this repo's history.
- The corporate "we" voice describes a six-service consultancy that doesn't exist yet.

## 2. Goals

**Primary (now):** Build reputation / career capital for Milind as an AI engineer.
**Secondary (later):** Preserve the SourceIntellect brand and domain so the site can
graduate into a company site without rebuilding.

Non-goals: consulting lead-gen, AI news aggregation, traffic volume for its own sake.

## 3. Positioning — the Studio Model

SourceIntellect is presented as **the AI engineering studio of Milind** (full name and
byline TBD by owner). The brand stays on the door; the content is personally authored.

- Every post/note carries Milind's byline.
- The About page is about the person, not a fictional company.
- Corporate framing (services, "we", team language) is shelved, not deleted — it returns
  at company-launch time by rewriting the homepage, nothing structural.

Rejected alternatives: keeping the corporate "we" voice (works against reputation —
readers connect with a person, and an empty consultancy reads as inflated); going purely
personal with no brand (leaves the domain/brand dead and restarts brand equity at
company time).

## 4. Content Model — Posts + Notes

Two content types, blended into **one chronological stream**:

| Type | Cadence | Shape | Purpose |
|------|---------|-------|---------|
| **Post** | occasional (monthly-ish) | long-form, original, titled | reputation makers: deep technical write-ups of real work |
| **Note** | frequent (weekly-ish) | 2–5 sentences of Milind's take on something read/tried, with the link | keeps the site visibly alive; demonstrates judgment cheaply |

Rules:
- A note's commentary is the content; the link is the subject. Bare link lists and a
  "Resources" page are explicitly out — they read as filler and carry zero evidence
  about the author.
- Notes are visually compact in the stream (smaller, may be untitled, external-link
  affordance); posts get full titles and summaries.
- Launch with 2–3 real pieces already published, written from work already done.

**Designing for sparseness:** no pagination, no categories/tags at launch, no section
that needs volume to look right. One compact stream that looks intentional at 5 entries
and still works at 500.

## 5. Site Structure

| Route | Content |
|-------|---------|
| `/` | Studio intro (who Milind is, what he builds), latest posts + notes stream, featured projects |
| `/blog/` | Full posts + notes stream; individual posts at `/blog/<slug>/` |
| `/projects/` | Tools/demos shipped, each with a short write-up and link |
| `/about/` | Personal: background, current focus, GitHub/LinkedIn links |
| `/contact/` | Working form + `hello@sourceintellect.com` |

URL compatibility: the live site's `about.html` and `contact.html` get redirects (or
Firebase `cleanUrls`) to the new routes so nothing 404s.

The six service cards on the current homepage are removed. Footer links either point
somewhere real (GitHub, LinkedIn) or are removed (Careers, Twitter if unused).

## 6. Technical Design

- **Framework:** Astro. Markdown/MDX content collections in, static HTML out. Adding a
  post = dropping a `.md` file. Two collections: `posts` and `notes`, merged and sorted
  by date for the stream.
- **Styling:** Port the existing design system from `website/index.html` (light theme,
  charcoal + teal `#14b8a6` accent, geometric/minimal per `.ai/brand-strategy.md`) into
  Astro layouts/components. Reuse the inline SVG logo mark.
- **Branding assets:** favicons from `.ai/logos/favicons/` into `public/`; site-wide
  `og:image` from `.ai/logos/social/`; meta description, `og:*` and `twitter:card` tags
  on every page; per-post OG title/description (generated per-post OG *images* are a
  later nice-to-have, not launch scope).
- **Feeds & SEO:** RSS feed (`/rss.xml`) covering posts + notes, `sitemap.xml`,
  canonical URLs. Distribution happens on LinkedIn/X/HN; the site must share well.
- **Contact form:** Web3Forms (free tier, 250 submissions/mo, access key only — no
  account dashboard needed) — form `action` posts to the provider, delivers to
  `hello@sourceintellect.com`. Static-friendly success state; honeypot spam field. No
  custom backend. Fallback if Web3Forms disappoints: Formspree.
- **Hosting/deploy:** same Firebase Hosting project. Add `firebase.json` (public =
  Astro's `dist/`, `cleanUrls: true`) and `.firebaserc` to the repo so
  `npm run build && firebase deploy` works from here. **Precondition:** confirm access
  to the Firebase project (`firebase projects:list`).
- **Repo layout:** Astro project replaces `website/` as the source of truth; the old
  static files are removed once the new site ships (they remain in git history).

## 7. Error Handling & Edge Cases

- Custom 404 page in site style.
- Form provider outage/spam: honeypot field; mailto link shown alongside the form as
  fallback.
- Empty-state: if `projects` has fewer than 2 entries at launch, the homepage omits the
  featured-projects section rather than showing a thin one.

## 8. Testing / Verification

- `astro build` clean; link check over built output (no `#` hrefs, no 404s).
- Form: one real submission end-to-end, confirm delivery to hello@.
- Share-preview check: OG tags validated (e.g. opengraph.xyz) for home + one post.
- Lighthouse pass on home + one post (static site; expect 95+ across the board).
- After deploy: old URLs (`/about.html`, `/contact.html`) resolve, RSS validates.

## 9. Launch Checklist (content, owner-side)

- [ ] Decide byline/full name and one-line studio description
- [ ] 2–3 launch pieces (at least one long post, rest can be notes)
- [ ] 1–2 projects listed (or omit section)
- [ ] About page copy
- [ ] Web3Forms access key (created with hello@sourceintellect.com)
- [ ] Confirm Firebase project access

## 10. Success Criteria

- Site deploys from this repo with one command.
- A stranger landing on any page can tell within 10 seconds who Milind is and see
  evidence of real AI engineering work.
- Publishing a note takes under 15 minutes end-to-end.
- Nothing on the site is fake: no dead links, no fake form, no invented company voice.
