import { existsSync, readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(p, 'utf8');

describe('about page', () => {
  const html = existsSync('dist/about/index.html') ? read('dist/about/index.html') : '';
  it('has the first sentence and no form', () => {
    expect(html).toContain('SourceIntellect is a company focused on where AI is going.');
    expect(html).not.toContain('<form');
  });
});

describe('contact page', () => {
  const html = existsSync('dist/contact/index.html') ? read('dist/contact/index.html') : '';
  it('has the form wiring', () => {
    expect(html).toContain('action="https://api.web3forms.com/submit"');
    expect(html).toContain('name="botcheck"');
    expect(html).toContain('mailto:hello@sourceintellect.com');
  });
});

describe('404 page', () => {
  it('is built', () => {
    expect(existsSync('dist/404.html')).toBe(true);
  });
});
