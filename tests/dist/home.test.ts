import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

const html = readFileSync('dist/index.html', 'utf8');

describe('home stream', () => {
  it('renders a headline', () => {
    expect(html).toMatch(/class="headline"/);
  });
  it('has no raw markdown links', () => {
    expect(html).not.toMatch(/\]\(http/);
  });
  it('shows reading time for posts', () => {
    expect(html).toMatch(/Long read, \d+ minutes/);
  });
  it('formats dates like 07 Nov 2026', () => {
    expect(html).toMatch(/\d{2} [A-Z][a-z]{2} \d{4}/);
  });
  it('renders one row per non-headline entry', () => {
    expect((html.match(/class="row"/g) ?? []).length).toBe(2);
  });
});
