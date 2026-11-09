// Walks dist/**/*.html and fails on banned links/text, href="#", and dead internal links.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const BASE = new URL('https://sourceintellect.com/');
const BANNED_HOSTS = ['x.com', 'twitter.com', 'linkedin.com'];
const BANNED_PATHS = ['/rss', '/rss.xml', '/feed', '/feed.xml'];
const BANNED_TEXT = new Set(['subscribe', 'rss']);

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
  });
}

function targetExists(pathname) {
  const p = decodeURIComponent(pathname);
  const f = join(DIST, p);
  if (p.endsWith('/')) return existsSync(join(f, 'index.html'));
  return (existsSync(f) && statSync(f).isFile()) || existsSync(join(f, 'index.html'));
}

if (!existsSync(DIST)) {
  console.error('dist/ not found; build first');
  process.exit(1);
}

const errors = [];
const files = walk(DIST);
for (const file of files) {
  const page = '/' + relative(DIST, file).replace(/index\.html$/, '');
  const html = readFileSync(file, 'utf8');
  const fail = (msg) => errors.push(`${page}: ${msg}`);

  for (const m of html.matchAll(/<(a|link)\b[^>]*?\shref=(?:"([^"]*)"|'([^']*)')/gi)) {
    const href = (m[2] ?? m[3]).trim();
    if (href === '#') { fail(`href="#"`); continue; }
    if (/^(mailto:|tel:|javascript:|data:)/i.test(href)) continue;
    let url;
    try { url = new URL(href, new URL(page, BASE)); } catch { fail(`unparseable href ${href}`); continue; }
    const host = url.hostname.toLowerCase().replace(/\.$/, '');
    if (BANNED_HOSTS.some((h) => host === h || host.endsWith('.' + h))) fail(`banned host in ${href}`);
    const path = url.pathname.replace(/\/+$/, '');
    if (BANNED_PATHS.some((b) => path.endsWith(b))) fail(`banned path in ${href}`);
    if (host === BASE.hostname) {
      if (!targetExists(url.pathname)) fail(`missing target for ${href}`);
    }
  }

  const body = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '');
  for (const m of body.matchAll(/>([^<]+)</g)) {
    if (BANNED_TEXT.has(m[1].trim().toLowerCase())) fail(`banned text "${m[1].trim()}"`);
  }
}

if (errors.length) {
  console.error(`check-links: ${errors.length} problem(s)\n` + errors.join('\n'));
  process.exit(1);
}
console.log(`check-links: ${files.length} pages OK`);
