const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** `07 Nov 2026`, from UTC fields so the date never shifts with timezone. */
export function formatDate(d: Date): string {
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${day} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function stripMarkdown(md: string): string {
  return md
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/(\*\*|\*|__)/g, '')
    .replace(/(^|\W)_+|_+(?=\W|$)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

const BOUNDARY = /[.?!](?=\s)/;

export function firstSentence(text: string): string {
  const m = BOUNDARY.exec(text);
  return m ? text.slice(0, m.index + 1) : text;
}

export function truncateWords(text: string, max = 70): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max + 1);
  const space = cut.lastIndexOf(' ');
  const base = space > 0 ? cut.slice(0, space) : text.slice(0, max);
  return `${base.replace(/[\s.,;:!?-]+$/, '')}…`;
}

export function headlineSplit(md: string, threshold = 220): { lead: string; rest: string } {
  if (stripMarkdown(md).length <= threshold) return { lead: md, rest: '' };
  const m = BOUNDARY.exec(md);
  if (!m) return { lead: stripMarkdown(md), rest: '' };
  const end = m.index + 1;
  return { lead: stripMarkdown(md.slice(0, end)), rest: md.slice(end).trimStart() };
}

export function readingTime(text: string, wpm = 220): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wpm));
}

export function noteTitle(md: string): string {
  return truncateWords(firstSentence(stripMarkdown(md)), 70);
}
