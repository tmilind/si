import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { listEntryDirs, readDist } from './helpers';

const html = readFileSync('dist/index.html', 'utf8');

describe('index head and chrome', () => {
  it('has og:title, canonical and description', () => {
    expect(html).toMatch(/<meta property="og:title"/);
    expect(html).toMatch(/<link rel="canonical" href="https:\/\/sourceintellect\.com\/"/);
    expect(html).toMatch(/<meta name="description" content="SourceIntellect is a company focused on where AI is going\."/);
  });
  it('has no banned links', () => {
    for (const banned of ['twitter.com', 'x.com', 'linkedin.com', 'rss.xml', '/rss', 'subscribe']) {
      expect(html.toLowerCase()).not.toContain(banned);
    }
  });
  it('renders the wordmark', () => {
    expect(html).toContain('source<b>intellect</b>');
  });
});

describe('social meta', () => {
  it('home has absolute og:image, og:type and twitter:card', () => {
    expect(html).toContain('<meta property="og:image" content="https://sourceintellect.com/og.png"');
    expect(html).toMatch(/<meta property="og:type"/);
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image"');
  });
  const [noteSlug] = listEntryDirs('notes');
  const [postSlug] = listEntryDirs('posts');
  const pages: [string, string | undefined][] = [
    ['note', noteSlug && `notes/${noteSlug}/index.html`],
    ['post', postSlug && `posts/${postSlug}/index.html`],
  ];
  for (const [name, path] of pages) {
    it.skipIf(!path)(`${name} og:title has no site suffix but <title> does`, () => {
      const page = readDist(path!);
      const og = page.match(/<meta property="og:title" content="([^"]*)"/)![1];
      const title = page.match(/<title>([^<]*)<\/title>/)![1];
      expect(og.endsWith('SourceIntellect')).toBe(false);
      expect(title.endsWith('SourceIntellect')).toBe(true);
    });
  }
});
