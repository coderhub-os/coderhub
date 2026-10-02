#!/usr/bin/env node
// render-banner.mjs — CoderHub OS profile banners (LinkedIn / GitHub README).
//
// Fills templates/{style}.html with the payload, inlines the stack logos from
// Simple Icons (text chip when a logo can't be fetched) and screenshots it with
// the same Playwright Chromium that generate-pdf.mjs uses, at 2x.
//
// Usage:
//   node .agents/skills/coderhub-banner/render-banner.mjs <payload.json> \
//     --target=linkedin|github [--style=minimalista|glassmorphism|neobrutalism|all] \
//     --out=<file.png | directory>
//
// payload.json: { "eyebrow": "...", "name": "...", "tagline": "...",
//                 "stack": [{ "name": "Go", "slug": "go" }, ...] }
// With --style=all (default) --out is a directory and each file is
// {YYYY-MM-DD}_banner-{style}.png. With one style, --out may be a .png path.
// Prints a JSON summary: files written, PNG size, and logos that fell back to text.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join, resolve, extname } from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const HERE = dirname(fileURLToPath(import.meta.url));
const STYLES = ['minimalista', 'glassmorphism', 'neobrutalism'];
const TARGETS = { linkedin: { width: 1584, height: 396 }, github: { width: 1280, height: 320 } };
const LOGO_TINT = { minimalista: 'E8EEF6', glassmorphism: 'E8EEF6', neobrutalism: '151515' };
const SCALE = 2;
const FETCH_TIMEOUT_MS = 8000;

function die(msg) {
  console.error(`render-banner: ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { positional: [] };
  for (const a of argv) {
    const m = a.match(/^--([a-z-]+)=(.*)$/);
    if (m) args[m[1]] = m[2];
    else args.positional.push(a);
  }
  return args;
}

const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

async function fetchLogo(slug, hex) {
  if (!/^[a-z0-9.+-]+$/i.test(slug || '')) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`https://cdn.simpleicons.org/${slug}/${hex}`, { signal: ctrl.signal });
    if (!res.ok) return null;
    const svg = (await res.text()).trim();
    return svg.startsWith('<svg') ? svg : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function logosHtml(stack, style, missing) {
  const parts = [];
  for (const item of stack) {
    const name = typeof item === 'string' ? item : item.name;
    const slug = typeof item === 'string' ? item.toLowerCase() : item.slug;
    const svg = await fetchLogo(slug, LOGO_TINT[style]);
    if (svg) {
      const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
      parts.push(`<span class="logo"><img src="${src}" alt="${escapeHtml(name)}"></span>`);
    } else {
      missing.add(name);
      parts.push(`<span class="logo chip">${escapeHtml(name)}</span>`);
    }
  }
  return parts.join('\n');
}

function fill(template, values) {
  const out = template.replace(/\{\{([A-Z_]+)\}\}/g, (m, key) => (key in values ? values[key] : m));
  const left = out.match(/\{\{[A-Z_]+\}\}/);
  if (left) die(`unresolved placeholder ${left[0]}`);
  return out;
}

function pngSize(file) {
  const buf = readFileSync(file);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

const args = parseArgs(process.argv.slice(2));
const payloadPath = args.positional[0];
if (!payloadPath) die('missing <payload.json>');
const target = args.target;
if (!TARGETS[target]) die('--target must be linkedin or github');
const styleArg = args.style || 'all';
const styles = styleArg === 'all' ? STYLES : [styleArg];
if (!styles.every((s) => STYLES.includes(s))) die(`--style must be one of ${STYLES.join(', ')} or all`);
if (!args.out) die('missing --out');

let payload;
try {
  payload = JSON.parse(readFileSync(payloadPath, 'utf8'));
} catch (err) {
  die(`cannot read payload: ${err.message}`);
}
for (const key of ['eyebrow', 'name', 'tagline']) {
  if (typeof payload[key] !== 'string' || !payload[key].trim()) die(`payload.${key} is required`);
}
const stack = Array.isArray(payload.stack) ? payload.stack : [];

const outArg = resolve(args.out);
const singleFile = styles.length === 1 && extname(outArg).toLowerCase() === '.png';
const today = new Date().toLocaleDateString('sv-SE'); // local YYYY-MM-DD
const outFor = (style) => (singleFile ? outArg : join(outArg, `${today}_banner-${style}.png`));

const { width, height } = TARGETS[target];
const missing = new Set();
const written = [];
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: SCALE });
  const page = await context.newPage();
  for (const style of styles) {
    const templatePath = join(HERE, 'templates', `${style}.html`);
    if (!existsSync(templatePath)) die(`template not found: ${templatePath}`);
    const html = fill(readFileSync(templatePath, 'utf8'), {
      W: String(width),
      H: String(height),
      K: (width / TARGETS.linkedin.width).toFixed(4),
      EYEBROW: escapeHtml(payload.eyebrow),
      NAME: escapeHtml(payload.name),
      TAGLINE: escapeHtml(payload.tagline),
      LOGOS: await logosHtml(stack, style, missing),
    });
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const file = outFor(style);
    mkdirSync(dirname(file), { recursive: true });
    await page.screenshot({ path: file, clip: { x: 0, y: 0, width, height } });
    written.push({ style, file, ...pngSize(file) });
  }
} finally {
  await browser.close();
}

const summary = { target, files: written, logosAsText: [...missing] };
writeFileSync(1, `${JSON.stringify(summary, null, 2)}\n`);
