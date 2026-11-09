import { existsSync, readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

const notePath = 'dist/notes/fixture-long/index.html';
const postPath = 'dist/posts/fixture-post/index.html';

describe('note page', () => {
  it('exists with a plain first-sentence title and article og:type', () => {
    expect(existsSync(notePath)).toBe(true);
    const html = readFileSync(notePath, 'utf8');
    const title = html.match(/<title>([^<]*)<\/title>/)![1];
    expect(title).toContain(' – SourceIntellect');
    expect(title).not.toContain('[');
    expect(html).toMatch(/<meta property="og:type" content="article"/);
  });
});

describe('post page', () => {
  it('exists and highlights code blocks', () => {
    expect(existsSync(postPath)).toBe(true);
    const html = readFileSync(postPath, 'utf8');
    expect(html).toContain('<pre');
    expect(html).toMatch(/<meta property="og:type" content="article"/);
    expect(html).toMatch(/Long read, \d+ minutes/);
  });
});
