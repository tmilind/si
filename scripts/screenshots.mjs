// Serves dist/ via astro preview, captures responsive screenshots, asserts no horizontal scroll at 320.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const PORT = 4321;
const ORIGIN = `http://localhost:${PORT}`;
const OUT = new URL('../.playwright-mcp/verify/', import.meta.url).pathname;
const PAGES = { home: '/', post: '/posts/chunking-sets-the-ceiling/' };
const WIDTHS = [320, 768, 1280];

mkdirSync(OUT, { recursive: true });
const server = spawn('npx', ['astro', 'preview', '--port', String(PORT)], { stdio: 'ignore' });
let browser;
let failed = false;
try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(ORIGIN + '/')).ok) break; } catch {}
    if (i > 60) throw new Error('preview server did not start');
    await new Promise((r) => setTimeout(r, 500));
  }
  browser = await chromium.launch({ channel: 'chrome' });
  for (const [name, path] of Object.entries(PAGES)) {
    for (const w of WIDTHS) {
      const page = await browser.newPage({ viewport: { width: w, height: 800 } });
      await page.goto(ORIGIN + path, { waitUntil: 'networkidle' });
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
  server.kill();
}
process.exit(failed ? 1 : 0);
