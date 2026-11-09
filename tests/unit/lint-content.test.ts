import { describe, it, expect } from 'vitest';
// @ts-ignore -- plain .mjs script, no declarations
import { parseEntry, lintEntry, lintAll } from '../../scripts/lint-content.mjs';

type Failure = { rule: string; detail: string };

const SRC = 'source:\n  title: A thing\n  url: https://example.com/a\n';
const note = (body: string, file = '2026-11-01-x.md', date = '2026-11-01') =>
  parseEntry(`---\ndate: ${date}\n${SRC}draft: false\n---\n${body}\n`, file, 'notes');
const post = (body: string, over: Record<string, string> = {}, file = '2026-11-01-x.md') => {
  const fm = { title: 'Tables break first in retrieval', date: '2026-11-01',
    summary: 'A short and honest summary of what the post covers, in one sentence.', ...over };
  const head = Object.entries(fm).map(([k, v]) => `${k}: ${v}`).join('\n');
  return parseEntry(`---\n${head}\ndraft: false\n---\n${body}\n`, file, 'posts');
};
const rules = (e: unknown): string[] => (lintEntry(e) as Failure[]).map((f) => f.rule);

const words = (n: number) => Array(n).fill('word').join(' ') + '.';
const GOOD_POST = `${words(650)}\n\n\`\`\`js\nconst a = 1;\n\`\`\`\n`;
const GOOD_NOTE = 'Short headline here. A second sentence follows it.';

describe('lint-content rules', () => {
  it('accepts a good note and a good post', () => {
    expect(rules(note(GOOD_NOTE))).toEqual([]);
    expect(rules(post(GOOD_POST))).toEqual([]);
  });
  it('N2: one sentence fails, six fail, two pass', () => {
    expect(rules(note('Only one sentence here.'))).toContain('N2');
    expect(rules(note('A. B. C. D. E. F.'.replace(/\./g, ' is here.')))).toContain('N2');
    expect(rules(note('One thing. Two things.'))).not.toContain('N2');
  });
  it('N2 ignores abbreviations', () => {
    expect(rules(note('Tools, e.g. a parser, help. That is it.'))).not.toContain('N2');
  });
  it('N3: over 600 characters fails', () => {
    const long = `Headline. ${'x'.repeat(120)} `.repeat(1) + ('y'.repeat(100) + '. ').repeat(5);
    expect(rules(note(long))).toContain('N3');
  });
  it('N4: long first sentence fails', () => {
    expect(rules(note(`${'a '.repeat(60)}end. Second one.`))).toContain('N4');
  });
  it('N1: needs an https source url', () => {
    const e = parseEntry('---\ndate: 2026-11-01\nsource:\n  title: t\n  url: http://x.com\n---\nOne. Two.\n', '2026-11-01-x.md', 'notes');
    expect(rules(e)).toContain('N1');
    const none = parseEntry('---\ndate: 2026-11-01\n---\nOne. Two.\n', '2026-11-01-x.md', 'notes');
    expect(rules(none)).toContain('N1');
  });
  it('P1: a 300-word post fails', () => {
    expect(rules(post(`${words(300)}\n\n\`\`\`js\nx\n\`\`\`\n`))).toContain('P1');
  });
  it('P1: code does not count towards words', () => {
    const code = '```\n' + words(900) + '\n```\n';
    expect(rules(post(`${words(300)}\n\n${code}`))).toContain('P1');
  });
  it('P4: no code, table or links fails', () => {
    expect(rules(post(words(650)))).toContain('P4');
    expect(rules(post(`${words(650)}\n\n| a | b |\n|---|---|\n| 1 | 2 |\n`))).not.toContain('P4');
    expect(rules(post(`${words(650)} [a](https://a.com/x) [b](https://b.com/y)`))).not.toContain('P4');
    expect(rules(post(`${words(650)} [a](https://a.com/x)`))).toContain('P4');
  });
  it('P2: summary rules', () => {
    expect(rules(post(GOOD_POST, { summary: 'Too short.' }))).toContain('P2');
    expect(rules(post(GOOD_POST, { summary: 'A summary that is long enough to pass the floor but ends with a colon:' }))).toContain('P2');
  });
  it('P3: title case fails, proper nouns and override pass', () => {
    expect(rules(post(GOOD_POST, { title: 'How Every Word Gets A Capital Letter' }))).toContain('P3');
    expect(rules(post(`${GOOD_POST}\nWe use Firebase and Astro.`, { title: 'Why we picked Firebase and Astro today' }))).not.toContain('P3');
  });
  it('P5: deep or long headings fail', () => {
    expect(rules(post(`${GOOD_POST}\n#### Too deep\n`))).toContain('P5');
    expect(rules(post(`${GOOD_POST}\n## ${'long '.repeat(15)}\n`))).toContain('P5');
  });
  it('A1: banned phrase', () => {
    expect(rules(note('This is a game-changer. Really.'))).toContain('A1');
  });
  it('A5: American spelling', () => {
    expect(rules(note('We analyze the data. It works.'))).toContain('A5');
    expect(rules(note('We analyse the data. It works.'))).not.toContain('A5');
  });
  it('A2: emoji and exclamation marks', () => {
    expect(rules(note('Nice one \u{1F680}. Second.'))).toContain('A2');
    expect(rules(note('Nice one! Second.'))).toContain('A2');
  });
  it('A3: DRAFT comment in a non-draft entry', () => {
    expect(rules(note(`${GOOD_NOTE}\n<!-- DRAFT: fix -->`))).toContain('A3');
  });
  it('A4: rhetorical question paragraph', () => {
    expect(rules(post(`Why does this matter?\n\n${GOOD_POST}`))).toContain('A4');
  });
  it('A7: filename and date must agree', () => {
    expect(rules(note(GOOD_NOTE, '2026-11-02-x.md', '2026-11-01'))).toContain('A7');
    expect(rules(note(GOOD_NOTE, 'x.md'))).toContain('A7');
  });
});

describe('live content', () => {
  it('passes every rule offline', async () => {
    const r = await lintAll({ offline: true });
    expect(r.failures).toEqual([]);
    expect(r.checked).toBeGreaterThan(0);
  });
});
