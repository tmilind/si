import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const cfg = JSON.parse(readFileSync('firebase.json', 'utf8'));
const h = cfg.hosting;

describe('firebase.json hosting', () => {
  it('serves dist with clean urls', () => {
    expect(h.site).toBe('si-52430058-a0280');
    expect(h.public).toBe('dist');
    expect(h.cleanUrls).toBe(true);
    expect(h.trailingSlash).toBe(true);
  });
  it('301-redirects the legacy .html pages', () => {
    const find = (s: string) => h.redirects.find((r: { source: string }) => r.source === s);
    expect(find('/about.html')).toMatchObject({ destination: '/about/', type: 301 });
    expect(find('/contact.html')).toMatchObject({ destination: '/contact/', type: 301 });
  });
  it('301-redirects the replaced weight-editing post', () => {
    const r = h.redirects.find((x: { source: string }) => x.source === '/posts/editing-weights-directly/');
    expect(r).toMatchObject({ destination: '/posts/weight-space-programming/', type: 301 });
  });
});
