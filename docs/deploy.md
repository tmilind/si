# Deploy

The site is a static Astro build in `dist/`, served by Firebase Hosting.

This site was prepared deploy-ready and has not been deployed by the builder; the owner runs the deploy.

- Firebase project and Hosting site ID: `si-52430058-a0280`
- Default URL: https://si-52430058-a0280.web.app
- `sourceintellect.com` (apex) already serves from this site.

## Prerequisites

- Node 26.
- Firebase CLI (`npm i -g firebase-tools`), logged in as `milind00@gmail.com`. Tokens expire; if the CLI complains, run `firebase login --reauth`.
- `PUBLIC_WEB3FORMS_KEY` set in the shell when building for deploy. The site is static, so the key is baked in at build time.

## Publish an entry

Add a Markdown file named `YYYY-MM-DD-slug.md` to `src/content/notes/` or `src/content/posts/`.

Note (the body is the note text; `source` is optional):

```yaml
---
date: 2026-11-07
source:
  title: Title of the thing you're reacting to
  url: https://example.com/article
draft: false
---
```

Post:

```yaml
---
title: Post title
date: 2026-11-07
summary: One-sentence summary.
draft: false
---
```

Drafts (`draft: true`) are excluded from the deploy build by default. `SI_INCLUDE_DRAFTS=1 npm run dev` is the only way to preview them. To publish, set `draft: false` (or remove the field). The build fails by design when there are no publishable entries.

Preview, including drafts, locally:

```sh
SI_INCLUDE_DRAFTS=1 npm run dev
```

`SI_INCLUDE_DRAFTS=1` is for local preview only; never set it for a deploy build.

## Deploy

```sh
export PUBLIC_WEB3FORMS_KEY=...   # your Web3Forms access key
npm run deploy                    # npm run build && firebase deploy --only hosting
```

## Post-deploy checks

- `/about.html` and `/contact.html` return 301 to `/about/` and `/contact/`. Example: `curl -sI https://sourceintellect.com/about.html` should show 301 and `location: /about/`.
- `https://sourceintellect.com` and https://si-52430058-a0280.web.app both serve the new site.
- `https://www.sourceintellect.com` redirects to the apex (after "Adding www" below).
- Share preview (OG image, title, description) is right for `/`, one note and one post.
- One real contact-form submission arrives at hello@sourceintellect.com.

## Adding www

`www.sourceintellect.com` does not resolve yet. The Firebase CLI cannot add custom domains, so use the console:

1. Firebase console, Hosting, **Add custom domain**.
2. Enter `www.sourceintellect.com`.
3. Choose **Redirect to an existing website** and select `sourceintellect.com`.
4. The console then shows DNS records (typically a CNAME or A records, plus a TXT record for verification). Add exactly those at your domain registrar.
5. Wait for verification and certificate provisioning, then run the www post-deploy check.

## Status

Branch `redesign` is deploy-ready. It was not deployed by the builder, and it has not been merged to `main`.

Verified 2026-11-08 (Lighthouse 12, headless Chrome, against the drafts build served by `astro preview`):

| Page | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| `/` | 1.00 | 1.00 | 1.00 | 1.00 |
| `/posts/chunking-sets-the-ceiling/` | 1.00 | 1.00 | 1.00 | 1.00 |

`npm run verify` passes (dist tests, link check, no horizontal scroll at 320px).

Before deploying, the owner must:

1. Edit and approve the five draft entries in `src/content/`, set `draft: false` on each, and delete the DRAFT comment line (the `<!-- DRAFT for owner review ... -->` line at the top of the body). The build fails without `SI_INCLUDE_DRAFTS=1` while drafts remain.
2. Create a Web3Forms access key and `export PUBLIC_WEB3FORMS_KEY=...` in the shell that runs the deploy.
3. Look at the rendered mark and share image and approve them: `public/og.png` and `public/favicon-32.png` (regenerate with `npm run assets`).
4. Add `www.sourceintellect.com` as a custom domain in the Firebase console (see "Adding www") and create the DNS records it shows at the registrar.
5. Merge to `main`, run `npm run deploy`, then work through "Post-deploy checks" above.
