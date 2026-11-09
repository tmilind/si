import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

describe('dist links', () => {
  it('passes scripts/check-links.mjs', () => {
    const r = spawnSync('node', ['scripts/check-links.mjs'], { encoding: 'utf8' });
    expect(r.status, `${r.stdout}\n${r.stderr}`).toBe(0);
  });
});
