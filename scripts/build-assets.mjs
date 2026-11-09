// Regenerates every raster brand asset from the SVG marks. Run: npm run assets
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { chromium } from 'playwright-core';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const p = (...parts) => resolve(root, ...parts);
const read = (f) => readFileSync(p(f));

const svg = (name) => read(`.ai/logos/${name}.svg`);
const render = (name, size) => sharp(svg(name), { density: 1200 }).resize(size, size);

async function favicons() {
  const png = (size, bg) =>
    render('mark-small', size).flatten(bg ? { background: bg } : false).png().toBuffer();
  const sizes = { 16: 'public/favicon-16.png', 32: 'public/favicon-32.png', 48: 'public/favicon-48.png' };
  const bufs = {};
  for (const [s, f] of Object.entries(sizes)) {
    bufs[s] = await render('mark-small', +s).png().toBuffer();
    writeFileSync(p(f), bufs[s]);
  }
  writeFileSync(p('public/apple-touch-icon.png'), await png(180, '#ffffff'));
  writeFileSync(p('public/icon-192.png'), await png(192, '#ffffff'));
  writeFileSync(p('public/icon-512.png'), await png(512, '#ffffff'));
  writeFileSync(p('public/favicon.ico'), buildIco([bufs[16], bufs[32], bufs[48]], [16, 32, 48]));
}

// ICO container: ICONDIR + ICONDIRENTRY per image + PNG payloads (valid for modern browsers).
function buildIco(pngs, sizes) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length;
  const entries = pngs.map((buf, i) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(sizes[i], 0); // width
    e.writeUInt8(sizes[i], 1); // height
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(buf.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += buf.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...pngs]);
}

async function avatar(markName, discColour, out) {
  const S = 400;
  const disc = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}"><circle cx="${S / 2}" cy="${S / 2}" r="${S / 2}" fill="${discColour}"/></svg>`,
  );
  const mark = await render(markName, 240).png().toBuffer();
  await sharp(disc).composite([{ input: mark, gravity: 'centre' }]).png().toFile(p(out));
}

async function ogImage() {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome' });
  } catch (err) {
    throw new Error(`Could not launch system Chrome for the OG image: ${err.message}`);
  }
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    await page.goto(pathToFileURL(p('scripts/og.html')).href);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: p('public/og.png'), clip: { x: 0, y: 0, width: 1200, height: 630 } });
  } finally {
    await browser.close();
  }
}

await favicons();
await avatar('mark', '#ffffff', '.ai/logos/avatar-light-400.png');
await avatar('mark-dark', '#15191D', '.ai/logos/avatar-dark-400.png');
await ogImage();
console.log('assets built');
