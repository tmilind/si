#!/usr/bin/env node
// Mechanical content-quality gate. See docs/content-standard.md.
// Usage: node scripts/lint-content.mjs [--offline] [--include-drafts] [--warn-only]
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// ---- Editable lists --------------------------------------------------------

/** A1: banned phrases (case-insensitive, whole-word). */
export const BANNED_PHRASES = [
  'rapidly evolving',
  'game-changer',
  'game changer',
  "in today's",
  'delve',
  'delve into',
  'revolutioni[sz]e',
  'cutting-edge',
  'unlock the',
  "it's worth noting",
  'in conclusion',
  'at the end of the day',
  'paradigm shift',
  '(?:AI|tech) landscape',
  'leverage (?:the|our|this)',
  'excited to',
  'thrilled',
];

/** A5: [American regex source, British spelling]. */
export const BRITISH_SPELLING = [
  ['analy[z](?:e|es|ed|ing|er|ers)', 'analyse'],
  ['optimi[z](?:e|es|ed|ing|ation|ations)', 'optimise'],
  ['tokeni[z](?:er|ers|e|es|ed|ing|ation)', 'tokeniser'],
  ['behavior(?:s|al)?', 'behaviour'],
  ['color(?:s|ed|ing)?', 'colour'],
  ['center(?:s|ed|ing)?', 'centre'],
  ['organi[z]ation(?:s|al)?', 'organisation'],
];

const ABBREVIATIONS = ['e.g.', 'i.e.', 'vs.', 'etc.', 'approx.', 'cf.'];

// ---- Parsing ---------------------------------------------------------------

function unquote(v) {
  v = v.trim();
  return /^(["']).*\1$/.test(v) ? v.slice(1, -1) : v;
}

/** Tiny frontmatter parser: `key: value`, one nested block, inline `{ a: b }`. */
export function parseFrontmatter(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!m) return { fm: {}, body: raw, fmRaw: '' };
  const fm = {};
  let nested = null;
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const indented = /^\s+/.test(line);
    const kv = /^\s*([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line);
    if (!kv) continue;
    const [, k, v] = kv;
    if (indented && nested) {
      fm[nested][k] = unquote(v);
    } else if (v.trim() === '') {
      nested = k;
      fm[k] = {};
    } else if (/^\{.*\}$/.test(v.trim())) {
      nested = null;
      fm[k] = {};
      // Split on commas that are followed by a `key:` so URLs/titles survive.
      for (const part of v.trim().slice(1, -1).split(/,\s*(?=[A-Za-z_][\w-]*\s*:)/)) {
        const p = /^\s*([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(part);
        if (p) fm[k][p[1]] = unquote(p[2]);
      }
    } else {
      nested = null;
      fm[k] = unquote(v);
    }
  }
  return { fm, body: m[2], fmRaw: m[1] };
}

export function parseEntry(raw, file, collection) {
  const { fm, body, fmRaw } = parseFrontmatter(raw);
  const draft = String(fm.draft).toLowerCase() === 'true';
  return { file, collection, fm, body, raw, fmRaw, draft };
}

// ---- Text helpers ----------------------------------------------------------

const HTML_COMMENT = /<!--[\s\S]*?-->/g;
const FENCE = /^(```|~~~)[^\n]*\n[\s\S]*?^\1[ \t]*$/gm;

export const stripFences = (md) => md.replace(FENCE, '');

/** Same rules as `stripMarkdown` in src/lib/text.ts (keep in step). */
export function stripMarkdown(md) {
  const code = [];
  const text = md
    .replace(/`([^`]*)`/g, (_, c) => `\u0000${code.push(c) - 1}\u0000`)
    .replace(HTML_COMMENT, '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|\*|__)/g, '')
    .replace(/(^|\W)_+|_+(?=\W|$)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  return text.replace(/\u0000(\d+)\u0000/g, (_, i) => code[Number(i)]);
}

/** Prose only: no comments, fenced code, inline code, URLs or link targets. */
export function prose(body) {
  return stripFences(body.replace(HTML_COMMENT, ''))
    .replace(/`[^`]*`/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ');
}

export function splitSentences(text) {
  let t = text;
  ABBREVIATIONS.forEach((a, i) => {
    t = t.split(a).join(a.replace(/\./g, `\u0001${i}\u0001`));
  });
  return t
    .split(/(?<=[.?!])(?:\s+|$)/)
    .map((s) => s.replace(/\u0001\d+\u0001/g, '.').trim())
    .filter(Boolean);
}

const firstSentence = (text) => splitSentences(text)[0] ?? text;

export const countWords = (body) =>
  stripFences(body.replace(HTML_COMMENT, '')).split(/\s+/).filter(Boolean).length;

export function externalLinks(entry) {
  const urls = new Set(stripFences(entry.body).match(/https:\/\/[^\s)>\]"']+/g) ?? []);
  const src = entry.fm.source?.url;
  if (src) urls.add(src);
  return [...urls].map((u) => u.replace(/[.,;:]+$/, ''));
}

// ---- Rules -----------------------------------------------------------------

const fail = (rule, detail) => ({ rule, detail });

function checkNote(e) {
  const out = [];
  const url = e.fm.source?.url;
  let ok = false;
  try {
    ok = !!url && new URL(url).protocol === 'https:';
  } catch {}
  if (!ok) out.push(fail('N1', `source.url must be a valid https:// URL (got ${url ? `"${url}"` : 'none'})`));

  const text = stripMarkdown(e.body);
  const n = splitSentences(text).length;
  if (n < 2 || n > 5) out.push(fail('N2', `${n} sentences, want 2–5`));
  if (text.length > 600) out.push(fail('N3', `${text.length} characters, want at most 600`));
  const first = firstSentence(text);
  if (first.length > 90) out.push(fail('N4', `first sentence is ${first.length} characters, want at most 90 (it is the headline)`));
  return out;
}

const ACRONYM = /^[A-Z]{2,5}$/;

export function titleCaseWords(title, body) {
  const bodyCaps = new Set(
    (prose(body).match(/\b[A-Z][A-Za-z0-9-]*/g) ?? []).map((w) => w.toLowerCase()),
  );
  const words = title.split(/\s+/).slice(1);
  return words
    .map((w) => w.replace(/^[^A-Za-z]+|[^A-Za-z0-9-]+$/g, ''))
    .filter((w) => /^[A-Z]/.test(w) && !ACRONYM.test(w) && !bodyCaps.has(w.toLowerCase()));
}

function checkPost(e) {
  const out = [];
  const words = countWords(e.body);
  if (words < 600 || words > 1400) out.push(fail('P1', `${words} words, want 600–1400`));

  const summary = e.fm.summary ?? '';
  const sn = splitSentences(summary).length;
  if (!summary || sn < 1 || sn > 2) out.push(fail('P2', `summary has ${sn} sentences, want 1–2`));
  else if (summary.length < 40 || summary.length > 320) out.push(fail('P2', `summary is ${summary.length} characters, want 40–320`));
  else if (/:\s*$/.test(summary)) out.push(fail('P2', 'summary ends with a colon'));
  else if (!/\.$/.test(summary)) out.push(fail('P2', 'summary must end with a full stop'));

  const title = e.fm.title ?? '';
  const override = /#\s*lint:\s*allow-title-case/.test(e.fmRaw) || /^\s*#\s*lint:\s*allow-title-case/.test(e.body);
  if (title.length < 20 || title.length > 90) out.push(fail('P3', `title is ${title.length} characters, want 20–90`));
  else if (!override) {
    const caps = titleCaseWords(title, e.body);
    if (caps.length > 2) out.push(fail('P3', `title not in sentence case; capitalised: ${caps.join(', ')}`));
  }

  const hasCode = /^(```|~~~)/m.test(e.body);
  const hasTable = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/m.test(e.body);
  const links = new Set(stripFences(e.body).match(/https:\/\/[^\s)>\]"']+/g) ?? []);
  if (!hasCode && !hasTable && links.size < 2) {
    out.push(fail('P4', 'no concrete example: need a code block, a table, or 2+ distinct external links'));
  }

  let inFence = false;
  for (const line of e.body.split(/\r?\n/)) {
    if (/^(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const h = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (!h) continue;
    if (h[1].length > 3) out.push(fail('P5', `heading deeper than ###: "${line.trim()}"`));
    if (h[2].length > 60) out.push(fail('P5', `heading is ${h[2].length} characters, want at most 60: "${h[2]}"`));
  }
  return out;
}

function checkCommon(e) {
  const out = [];
  const text = [e.fm.title ?? '', e.fm.summary ?? '', prose(e.body)].join('\n');

  for (const p of BANNED_PHRASES) {
    const m = new RegExp(`(?<![\\w-])(?:${p})(?![\\w-])`, 'i').exec(text);
    if (m) out.push(fail('A1', `banned phrase "${m[0]}"`));
  }

  if (/\p{Extended_Pictographic}/u.test(text)) out.push(fail('A2', 'emoji found'));
  if (prose(e.body).includes('!')) out.push(fail('A2', 'exclamation mark in body'));

  if (!e.draft && /<!--\s*DRAFT/i.test(e.body)) out.push(fail('A3', '`<!-- DRAFT` comment in a non-draft entry'));

  for (const para of stripFences(e.body.replace(HTML_COMMENT, '')).split(/\n\s*\n/)) {
    const t = stripMarkdown(para);
    if (!t || /^(#|[-*>|]|\d+\.)/.test(para.trim())) continue;
    const s = splitSentences(t);
    if (s.length === 1 && /\?$/.test(s[0])) out.push(fail('A4', `rhetorical question as a paragraph: "${s[0]}"`));
  }

  for (const [us, uk] of BRITISH_SPELLING) {
    const m = new RegExp(`(?<![\\w-])${us}(?![\\w-])`, 'i').exec(text);
    if (m) out.push(fail('A5', `"${m[0]}" — use British spelling (${uk})`));
  }
  return out;
}

export function checkFilename(e) {
  const out = [];
  const m = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/.exec(path.basename(e.file));
  if (!m) return [fail('A7', 'filename must be YYYY-MM-DD-slug.md')];
  const date = e.fm.date;
  if (!date) out.push(fail('A7', 'frontmatter has no date'));
  else if (String(date).slice(0, 10) !== m[1]) out.push(fail('A7', `filename date ${m[1]} differs from frontmatter date ${date}`));
  return out;
}

/** All offline rules for one parsed entry. Returns [{rule, detail}]. */
export function lintEntry(e) {
  return [
    ...(e.collection === 'notes' ? checkNote(e) : checkPost(e)),
    ...checkCommon(e),
    ...checkFilename(e),
  ];
}

// ---- A6: external links ----------------------------------------------------

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

/** Returns 'ok' | 'warn' | 'fail' with a detail string. */
export async function checkUrl(url, fetchImpl = fetch) {
  const go = (method) =>
    fetchImpl(url, { method, redirect: 'follow', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(10_000) });
  try {
    let res = await go('HEAD');
    // Some servers answer HEAD wrongly (405, or even 404), so any non-success retries as GET.
    if (res.status >= 400) res = await go('GET');
    if (res.status >= 200 && res.status < 400) return { level: 'ok' };
    if (res.status === 403 || res.status === 429) return { level: 'warn', detail: `${url} returned ${res.status} (probably bot-blocked)` };
    return { level: 'fail', detail: `${url} returned ${res.status}` };
  } catch (err) {
    return { level: 'fail', detail: `${url} unreachable (${err?.cause?.code ?? err?.name ?? err})` };
  }
}

// ---- Driver ----------------------------------------------------------------

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function lintAll({ offline = false, includeDrafts = false, root = path.join(ROOT, 'src/content') } = {}) {
  const failures = [];
  const warnings = [];
  let checked = 0;

  for (const collection of ['notes', 'posts']) {
    const dir = path.join(root, collection);
    let files = [];
    try {
      files = readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
    } catch {}
    const slugs = new Map();
    for (const f of files) {
      const rel = path.join(path.relative(ROOT, dir), f);
      const entry = parseEntry(readFileSync(path.join(dir, f), 'utf8'), rel, collection);
      if (entry.draft && !includeDrafts) continue;
      checked++;
      const found = lintEntry(entry);

      const slug = /^\d{4}-\d{2}-\d{2}-(.+)\.md$/.exec(f)?.[1];
      if (slug) {
        if (slugs.has(slug)) found.push(fail('A7', `slug "${slug}" also used by ${slugs.get(slug)}`));
        slugs.set(slug, f);
      }

      if (!offline) {
        const results = await Promise.all(externalLinks(entry).map((u) => checkUrl(u)));
        for (const r of results) {
          if (r.level === 'fail') found.push(fail('A6', r.detail));
          if (r.level === 'warn') warnings.push({ file: rel, rule: 'A6', detail: r.detail });
        }
      }
      for (const x of found) failures.push({ file: rel, ...x });
    }
  }
  return { checked, failures, warnings };
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const { checked, failures, warnings } = await lintAll({
    offline: args.has('--offline'),
    includeDrafts: args.has('--include-drafts'),
  });
  for (const f of failures) console.log(`${f.file}: ${f.rule} — ${f.detail}`);
  for (const w of warnings) console.log(`${w.file}: ${w.rule} (warning) — ${w.detail}`);
  console.log(`lint-content: ${checked} entries checked, ${failures.length} failures, ${warnings.length} warnings`);
  process.exit(failures.length && !args.has('--warn-only') ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
