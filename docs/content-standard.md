# Content standard

Enforced mechanically by `scripts/lint-content.mjs` (`npm run lint:content`, also run by `npm run verify` and `npm run deploy`). Flags: `--offline` skips link checks, `--include-drafts`, `--warn-only`. Word and phrase lists sit at the top of the script.

## The standard

- **Note**: reacts to something external. 2–5 sentences, a `source` link, the first sentence reads as a headline.
- **Post**: our own analysis. 600–1400 words, a 1–2 sentence `summary`, at least one concrete example (code, table, worked case).

## Voice

Plain engineering voice. British spelling. Sentence-case titles. No filler, hype, emoji or exclamation marks, no rhetorical-question openers. Say what we found or recommend, and how sure we are.

## What the lint enforces

| Rule | Check |
|---|---|
| N1 | Note has an `https://` `source.url` that parses |
| N2 | 2–5 sentences |
| N3 | At most 600 characters of plain text |
| N4 | First sentence at most 90 characters |
| P1 | Post body 600–1400 words (code blocks excluded) |
| P2 | Summary 1–2 sentences, 40–320 characters, ends with a full stop, no colon |
| P3 | Title 20–90 characters, sentence case (acronyms and body proper nouns allowed; `# lint: allow-title-case` overrides) |
| P4 | A code block, a table, or 2+ distinct external links |
| P5 | No heading deeper than `###`; headings at most 60 characters |
| A1 | No banned phrases |
| A2 | No emoji, no `!` |
| A3 | No `<!-- DRAFT` comment in a published entry |
| A4 | No paragraph that is a single rhetorical question |
| A5 | British spelling for the listed pairs |
| A6 | External links resolve (403/429 are warnings; HEAD falls back to GET) |
| A7 | Filename `YYYY-MM-DD-slug.md` matches `date`; slugs unique per collection |

## Human checklist (a machine cannot check these)

- Every number is traceable to a source you opened, not one you remember.
- No claim about our practice that we would not stand behind.
- No personal names of ours.
- Technical claims checked by someone who has built the thing.
- A note's first sentence reads as a headline on its own.
- A post's summary is a true summary of the post.
