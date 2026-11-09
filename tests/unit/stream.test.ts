import { describe, it, expect } from 'vitest';
import { filterEntries, sortEntries, assertNonEmpty, slugOf } from '../../src/lib/stream';

const d = (s: string) => new Date(s);
const note = (slug: string, date: string, draft = false) =>
  ({ kind: 'note', slug, date: d(date), body: 'b', url: `/notes/${slug}/`, draft }) as const;
const post = (slug: string, date: string, draft = false) =>
  ({ kind: 'post', slug, date: d(date), title: 't', summary: 's', body: 'b', minutes: 1, url: `/posts/${slug}/`, draft }) as const;

describe('slugOf', () => {
  it('strips leading date', () => {
    expect(slugOf('2026-11-07-agent-demos')).toBe('agent-demos');
    expect(slugOf('plain')).toBe('plain');
  });
});

describe('filterEntries', () => {
  const today = d('2026-11-08');
  it('excludes future-dated entries', () => {
    const out = filterEntries([note('a', '2026-11-08'), note('b', '2026-11-09')], { includeDrafts: false, today });
    expect(out.map((e) => e.slug)).toEqual(['a']);
  });
  it('excludes drafts unless flagged', () => {
    const raw = [note('a', '2026-11-01', true), note('b', '2026-11-01')];
    expect(filterEntries(raw, { includeDrafts: false, today }).map((e) => e.slug)).toEqual(['b']);
    expect(filterEntries(raw, { includeDrafts: true, today }).map((e) => e.slug)).toEqual(['a', 'b']);
  });
});

describe('sortEntries', () => {
  it('sorts newest first, posts before notes on ties, then slug', () => {
    const out = sortEntries([
      note('b', '2026-11-05'), note('a', '2026-11-05'), post('p', '2026-11-05'), note('z', '2026-11-07'),
    ]);
    expect(out.map((e) => e.slug)).toEqual(['z', 'p', 'a', 'b']);
  });
});

describe('assertNonEmpty', () => {
  it('throws on empty', () => {
    expect(() => assertNonEmpty([])).toThrow('No publishable entries. Add a note or post, or set SI_INCLUDE_DRAFTS=1 for preview.');
  });
  it('passes non-empty through', () => {
    const e = [note('a', '2026-11-01')];
    expect(assertNonEmpty(e)).toBe(e);
  });
});
