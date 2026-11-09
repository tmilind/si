import { describe, it, expect } from 'vitest';
import { existsSync, statSync } from 'node:fs';
import sharp from 'sharp';

describe('brand assets', () => {
  it('og.png is 1200x630', async () => {
    const m = await sharp('public/og.png').metadata();
    expect([m.width, m.height]).toEqual([1200, 630]);
  });
  it('icon-512.png is 512x512', async () => {
    const m = await sharp('public/icon-512.png').metadata();
    expect([m.width, m.height]).toEqual([512, 512]);
  });
  it('favicon.ico exists and is larger than 1KB', () => {
    expect(existsSync('public/favicon.ico')).toBe(true);
    expect(statSync('public/favicon.ico').size).toBeGreaterThan(1024);
  });
});
