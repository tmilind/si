// Serves dist/ with a small static server, captures responsive screenshots, asserts no horizontal scroll at 320.
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright-core';

const PORT = 4321;
const ORIGIN = `http://localhost:${PORT}`;
const OUT = new URL('../.playwright-mcp/verify/', import.meta.url).pathname;
const WIDTHS = [320, 768, 1280];

mkdirSync(OUT, { recursive: true });
const DIST = new URL('../dist/', import.meta.url).pathname;
const postDir = existsSync(join(DIST, 'posts'))
  ? readdirSync(join(DIST, 'posts'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()[0]
  : undefined;
if (!postDir) {
  console.error('No post found under dist/posts/. Build with SI_INCLUDE_DRAFTS=1 (or add a published post) before running screenshots.');
  process.exit(1);
}
const PAGES = { home: '/', post: `/posts/${postDir}/` };
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.xml': 'application/xml' };

function resolveFile(urlPath) {
  const p = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  let f = join(DIST, p);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  return existsSync(f) && statSync(f).isFile() ? f : null;
}

try {
  await fetch(ORIGIN + '/');
  console.error(`port ${PORT} is already answering; refusing to screenshot a stale server`);
  process.exit(1);
} catch {}

const server = createServer((req, res) => {
  const f = resolveFile(req.url);
  const file = f ?? join(DIST, '404.html');
  res.writeHead(f ? 200 : 404, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(PORT, r));
let browser;
let failed = false;
try {
  browser = await chromium.launch({ channel: 'chrome' });
  for (const [name, path] of Object.entries(PAGES)) {
    for (const w of WIDTHS) {
      const page = await browser.newPage({ viewport: { width: w, height: 800 } });
      const resp = await page.goto(ORIGIN + path, { waitUntil: 'networkidle' });
      if (!resp?.ok()) throw new Error(`${ORIGIN + path} responded ${resp?.status()} (was dist built with SI_INCLUDE_DRAFTS=1?)`);
      const file = `${OUT}${name}-${w}.png`;
      await page.screenshot({ path: file, fullPage: true });
      let line = file;
      if (w === 320) {
        const sw = await page.evaluate(() => document.documentElement.scrollWidth);
        line += `  scrollWidth=${sw}`;
        if (sw > 320) { failed = true; line += '  FAIL: horizontal overflow'; }
      }
      console.log(line);
      await page.close();
    }
  }
} catch (e) {
  console.error(e);
  failed = true;
} finally {
  await browser?.close();
  server.close();
}
process.exit(failed ? 1 : 0);
