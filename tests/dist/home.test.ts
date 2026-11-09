import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { listEntryDirs } from './helpers';

const html = readFileSync('dist/index.html', 'utf8');

describe('home stream', () => {
  it('renders a headline', () => {
    expect(html).toMatch(/class="headline"/);
  });
  it('has no raw markdown links', () => {
    expect(html).not.toMatch(/\]\(http/);
  });
  it.skipIf(listEntryDirs('posts').length === 0)('shows reading time for posts', () => {
    expect(html).toMatch(/Long read, \d+ minutes/);
  });
  it('links the headline to its entry', () => {
    expect(html).toMatch(/<h1 class="headline"><a class="title-link" href="\/(notes|posts)\/[^"]+\/">/);
  });
  it.skipIf(listEntryDirs('posts').length === 0)('links post titles to the post', () => {
    expect(html).toMatch(/<a class="title-link" href="\/posts\/[^"]+\/">/);
  });
  it('formats dates like 07 Nov 2026', () => {
    expect(html).toMatch(/\d{2} [A-Z][a-z]{2} \d{4}/);
  });
  it('renders one row per non-headline entry', () => {
    expect((html.match(/class="row"/g) ?? []).length).toBe(listEntryDirs('notes').length + listEntryDirs('posts').length - 1);
  });
});
