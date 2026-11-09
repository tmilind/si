import { describe, it, expect } from 'vitest';
import { listEntryDirs, readDist } from './helpers';

const [noteSlug] = listEntryDirs('notes');
const [postSlug] = listEntryDirs('posts');

describe('note page', () => {
  it.skipIf(!noteSlug)('exists with a plain first-sentence title and article og:type', () => {
    const html = readDist(`notes/${noteSlug}/index.html`);
    const title = html.match(/<title>([^<]*)<\/title>/)![1];
    expect(title).toContain(' – SourceIntellect');
    expect(title).not.toContain('[');
    expect(html).toMatch(/<meta property="og:type" content="article"/);
  });
});

describe('post page', () => {
  it.skipIf(!postSlug)('exists and highlights code blocks', () => {
    const html = readDist(`posts/${postSlug}/index.html`);
    expect(html).toContain('<pre');
    expect(html).toMatch(/<meta property="og:type" content="article"/);
    expect(html).toMatch(/Long read, \d+ minutes/);
  });
  it.skipIf(!postSlug)('gives code blocks the grey code background', () => {
    const html = readDist(`posts/${postSlug}/index.html`);
    const pre = html.match(/<pre[^>]*>/)![0];
    expect(pre).toContain('#f1f3f4');
  });
});
