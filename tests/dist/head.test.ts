import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

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
