import { getCollection } from 'astro:content';
import { readingTime, stripMarkdown } from './text';

export type Entry =
  | { kind: 'note'; slug: string; date: Date; body: string; source?: { title: string; url: string }; url: string }
  | { kind: 'post'; slug: string; date: Date; title: string; summary: string; body: string; minutes: number; url: string };

/** Pre-filter shape: an Entry that still carries its draft flag. */
export type RawEntry = Entry & { draft: boolean };

export const EMPTY_MESSAGE = 'No publishable entries. Add a note or post, or set SI_INCLUDE_DRAFTS=1 for preview.';
const NOTE_WARN_LENGTH = 600;

export function includeDrafts(): boolean {
  return process.env.SI_INCLUDE_DRAFTS === '1';
}

/** Strips a leading `YYYY-MM-DD-` from a collection entry id. */
export function slugOf(id: string): string {
  return id.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

export function filterEntries(entries: RawEntry[], opts: { includeDrafts: boolean; today: Date }): Entry[] {
  return entries.filter((e) => (opts.includeDrafts || !e.draft) && e.date.getTime() <= opts.today.getTime());
}

export function sortEntries(entries: Entry[]): Entry[] {
  return [...entries].sort((a, b) => {
    if (a.date.getTime() !== b.date.getTime()) return b.date.getTime() - a.date.getTime();
    if (a.kind !== b.kind) return a.kind === 'post' ? -1 : 1;
    return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
  });
}

export function assertNonEmpty(entries: Entry[]): Entry[] {
  if (entries.length === 0) throw new Error(EMPTY_MESSAGE);
  return entries;
}

export async function getStream(opts: { includeDrafts?: boolean; today?: Date } = {}): Promise<Entry[]> {
  const [notes, posts] = await Promise.all([getCollection('notes'), getCollection('posts')]);

  const raw: RawEntry[] = [
    ...notes.map((n): RawEntry => {
      const slug = slugOf(n.id);
      const body = n.body ?? '';
      if (stripMarkdown(body).length > NOTE_WARN_LENGTH) {
        console.warn(`[stream] note "${n.id}.md" is over ${NOTE_WARN_LENGTH} characters; consider making it a post.`);
      }
      return {
        kind: 'note', slug, date: n.data.date, body, source: n.data.source,
        url: `/notes/${slug}/`, draft: n.data.draft,
      };
    }),
    ...posts.map((p): RawEntry => {
      const slug = slugOf(p.id);
      const body = p.body ?? '';
      return {
        kind: 'post', slug, date: p.data.date, title: p.data.title, summary: p.data.summary,
        body, minutes: readingTime(body), url: `/posts/${slug}/`, draft: p.data.draft,
      };
    }),
  ];

  const filtered = filterEntries(raw, {
    includeDrafts: opts.includeDrafts ?? includeDrafts(),
    today: opts.today ?? new Date(),
  });
  return assertNonEmpty(sortEntries(filtered));
}
