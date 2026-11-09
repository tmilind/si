import { describe, it, expect, vi, afterEach } from 'vitest';
import { filterEntries, sortEntries, assertNonEmpty, slugOf, getStream, includeDrafts, warnIfLongNote } from '../../src/lib/stream';

vi.mock('astro:content', () => ({
  getCollection: vi.fn(async (name: string) =>
    name === 'notes'
      ? [
          { id: '2026-11-01-long-one', body: 'y'.repeat(601), data: { date: new Date('2026-11-01'), draft: false } },
          { id: '2026-11-02-short', body: 'ok', data: { date: new Date('2026-11-02'), draft: false } },
        ]
      : [],
  ),
}));

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.SI_INCLUDE_DRAFTS;
});

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
  it('logs the ids of skipped future-dated entries', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    filterEntries([note('a', '2026-11-08'), note('b', '2026-11-09'), note('c', '2026-12-01')], { includeDrafts: false, today });
    expect(info).toHaveBeenCalledTimes(1);
    expect(info.mock.calls[0][0]).toContain('Skipping 2 future-dated entries');
    expect(info.mock.calls[0][0]).toContain('b');
    info.mockRestore();
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
  it('throws when every entry is a draft and drafts are excluded', () => {
    const allDraftFixtures = [note('a', '2026-11-01', true), note('b', '2026-11-03', true), post('p', '2026-10-30', true)];
    expect(() => assertNonEmpty(filterEntries(allDraftFixtures, { includeDrafts: false, today: d('2026-11-08') }))).toThrow(
      'No publishable entries. Add a note or post, or set SI_INCLUDE_DRAFTS=1 for preview.',
    );
  });
  it('passes non-empty through', () => {
    const e = [note('a', '2026-11-01')];
    expect(assertNonEmpty(e)).toBe(e);
  });
});

describe('long note warning', () => {
  it('warns naming the file for notes over 600 plain chars', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    warnIfLongNote('a-note', 'y'.repeat(600));
    expect(warn).not.toHaveBeenCalled();
    warnIfLongNote('a-note', 'y'.repeat(601));
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('a-note.md');
  });
  it('getStream warns for the long note only', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const out = await getStream({ today: d('2026-12-01') });
    expect(out.map((e) => e.slug)).toEqual(['short', 'long-one']);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('2026-11-01-long-one.md');
  });
});

describe('includeDrafts', () => {
  it('reads the env var at call time', () => {
    expect(includeDrafts()).toBe(false);
    process.env.SI_INCLUDE_DRAFTS = '1';
    expect(includeDrafts()).toBe(true);
    process.env.SI_INCLUDE_DRAFTS = '0';
    expect(includeDrafts()).toBe(false);
  });
});
