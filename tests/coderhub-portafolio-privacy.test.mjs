// tests/coderhub-portafolio-privacy.test.mjs — the public portfolio site never
// leaks private data and has no broken internal links (A2, coderhub-portafolio).
//
// Builds the fictional fixture (.agents/skills/coderhub-portafolio/examples/martin)
// into a temp dir with --no-og (no Playwright screenshot of the OG card) and
// checks every generated file:
//   - none of the fixture's private values are published: compensation.*,
//     location.visa_status, candidate.phone, and the companies of
//     data/applications.md that are not in cv.md
//   - no "career-ops", no <form, no document.cookie, no external <script src=,
//     no http:// (mixed content; XML namespace URIs like the sitemap's xmlns
//     are identifiers, not requests, and are exempt)
//   - the required files exist (index.html, en/index.html, sitemap.xml,
//     robots.txt, llms.txt)
//   - every relative href/src (and css url()) resolves to a generated file
//   - the published CV PDFs carry no phone (contacto has no `telefono`): they
//     are re-rendered from the sibling HTML (examples/martin/output/*.html)
//     without the tel: link, so they differ from the source PDF and have no
//     tel: URI (link URIs are plain text in the PDF; mailto: is the control);
//     without the sibling HTML the build fails instead of publishing the phone
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, statSync } from 'fs';
import { inflateSync } from 'zlib';
import { pathToFileURL } from 'url';
import { tmpdir } from 'os';
import { dirname, join, relative, resolve, sep } from 'path';
import * as yaml from 'js-yaml';
import { isNestedCheckout } from '../lib/mjs-files.mjs';
import { pass, fail, run, lastRunFailure, rmSync, ROOT, NODE } from './helpers.mjs';

console.log('\nCoderHub OS portafolio: privacy + links (coderhub-portafolio)');

const SKILL = '.agents/skills/coderhub-portafolio';
const BUILD = join(ROOT, SKILL, 'build.mjs');
const FIXTURE = join(ROOT, SKILL, 'examples', 'martin');
const BINARY = /\.(png|jpe?g|gif|webp|avif|ico|pdf|woff2?|ttf|otf)$/i;

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const child = join(dir, e.name);
  if (!e.isDirectory()) return [child];
  return isNestedCheckout(child) ? [] : walk(child);
});

/** Every scalar leaf of a YAML value, as strings. */
const leaves = (v) => {
  if (v === null || v === undefined) return [];
  if (Array.isArray(v)) return v.flatMap(leaves);
  if (typeof v === 'object') return Object.values(v).flatMap(leaves);
  return [String(v)];
};

/** Company column of every markdown table row in data/applications.md. */
const applicationCompanies = (md) => {
  const out = [];
  let col = -1;
  for (const line of md.split('\n')) {
    if (!line.trim().startsWith('|')) { col = -1; continue; }
    const cells = line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
    if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
    const header = cells.findIndex((c) => /^(company|empresa)$/i.test(c));
    if (header !== -1) { col = header; continue; }
    if (col === -1 || !cells[col]) continue;
    const name = cells[col].replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '').trim();
    if (name) out.push(name);
  }
  return out;
};

if (!existsSync(BUILD)) {
  fail(`${SKILL}/build.mjs does not exist yet: the portfolio privacy test cannot run`);
} else if (!existsSync(join(FIXTURE, 'config', 'profile.yml'))) {
  fail(`${SKILL}/examples/martin/config/profile.yml does not exist yet: the portfolio privacy test cannot run`);
} else {
  const out = mkdtempSync(join(tmpdir(), 'coderhub-portafolio-'));
  try {
    const stdout = run(NODE, [BUILD, `--root=${FIXTURE}`, `--out=${out}`, '--no-og'], { timeout: 120000 });
    if (stdout === null) {
      const d = lastRunFailure();
      fail(`build.mjs failed on the martin fixture (exit ${d?.status ?? '?'}): ${(d?.stderr || d?.stdout || '').trim().slice(0, 800)}`);
    } else {
      pass('build.mjs builds the martin fixture');

      // Required files.
      for (const rel of ['index.html', 'en/index.html', 'sitemap.xml', 'robots.txt', 'llms.txt']) {
        if (existsSync(join(out, rel))) pass(`site has ${rel}`);
        else fail(`site is missing ${rel}`);
      }

      const files = walk(out);
      const texts = files.filter((f) => !BINARY.test(f)).map((f) => ({ rel: relative(out, f), text: readFileSync(f, 'utf8') }));

      // Private values from the fixture.
      const profile = yaml.load(readFileSync(join(FIXTURE, 'config', 'profile.yml'), 'utf8')) || {};
      const cv = existsSync(join(FIXTURE, 'cv.md')) ? readFileSync(join(FIXTURE, 'cv.md'), 'utf8').toLowerCase() : '';
      const secrets = [];
      for (const v of leaves(profile.compensation)) secrets.push(['compensation', v]);
      for (const v of leaves(profile.location?.visa_status)) secrets.push(['location.visa_status', v]);
      for (const v of leaves(profile.candidate?.phone)) {
        secrets.push(['candidate.phone', v]);
        const compact = v.replace(/[\s().-]/g, '');
        if (compact !== v) secrets.push(['candidate.phone', compact]);
      }
      const appsPath = join(FIXTURE, 'data', 'applications.md');
      const companies = existsSync(appsPath)
        ? [...new Set(applicationCompanies(readFileSync(appsPath, 'utf8')))].filter((c) => !cv.includes(c.toLowerCase()))
        : [];
      for (const c of companies) secrets.push(['data/applications.md company', c]);

      if (!profile.compensation) fail('fixture profile.yml has no compensation block: nothing to check');
      if (!profile.location?.visa_status) fail('fixture profile.yml has no location.visa_status: nothing to check');
      if (!profile.candidate?.phone) fail('fixture profile.yml has no candidate.phone: nothing to check');
      if (companies.length === 0) fail('fixture data/applications.md has no company outside cv.md: nothing to check');

      // Values shorter than 4 chars ("USD") are too generic to match on.
      for (const [field, value] of secrets.filter(([, v]) => v.trim().length >= 4)) {
        const needle = value.trim().toLowerCase();
        const hits = texts.filter((t) => t.text.toLowerCase().includes(needle)).map((t) => t.rel);
        if (hits.length) fail(`${field} "${value}" is published in ${hits.join(', ')}`);
        else pass(`${field} "${value}" is not published`);
      }

      // Forbidden patterns.
      const forbidden = [
        ['"career-ops"', (t) => /career-ops/i.test(t)],
        ['<form', (t) => /<form\b/i.test(t)],
        ['document.cookie', (t) => /document\.cookie/i.test(t)],
        ['external <script src="http', (t) => /<script[^>]*\ssrc\s*=\s*["']?(https?:)?\/\//i.test(t)],
        ['http:// (mixed content)', (t) => /http:\/\//i.test(t.replace(/\bxmlns(:[\w-]+)?\s*=\s*["']http:\/\/[^"']*["']/gi, ''))],
      ];
      for (const [label, test] of forbidden) {
        const hits = texts.filter((t) => test(t.text)).map((t) => t.rel);
        if (hits.length) fail(`site contains ${label} in ${hits.join(', ')}`);
        else pass(`site has no ${label}`);
      }

      // Broken relative links.
      const refs = /\s(?:href|src)\s*=\s*["']([^"']*)["']|url\(\s*["']?([^"')]+)["']?\s*\)/gi;
      const broken = [];
      let checked = 0;
      for (const t of texts.filter((x) => /\.(html|css)$/i.test(x.rel))) {
        for (const m of t.text.matchAll(refs)) {
          const raw = (m[1] ?? m[2] ?? '').trim();
          if (!raw || raw.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith('//')) continue;
          if (raw.startsWith('/')) { broken.push(`${t.rel} → ${raw} (absolute path: breaks under /{repo}/ and file://)`); continue; }
          const path = decodeURI(raw.split(/[?#]/)[0]);
          if (!path) continue;
          checked++;
          let target = resolve(dirname(join(out, t.rel)), path);
          if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
          if (!target.startsWith(out + sep) || !existsSync(target)) broken.push(`${t.rel} → ${raw}`);
        }
      }
      if (checked === 0) fail('site has no relative href/src at all: link check found nothing to verify');
      if (broken.length) fail(`site has ${broken.length} broken relative link(s): ${broken.slice(0, 10).join(' | ')}`);
      else pass(`all ${checked} relative href/src resolve to generated files`);

      // CV PDFs without the phone.
      const summary = JSON.parse(stdout);
      const cfg = yaml.load(readFileSync(join(FIXTURE, 'config', 'portafolio.yml'), 'utf8')) || {};
      const phone = String(profile.candidate?.phone || '');
      const phoneDigits = phone.replace(/\D/g, '');
      const { stripPhone } = await import(pathToFileURL(BUILD).href);
      if ((cfg.contacto || []).includes('telefono')) fail('fixture portafolio.yml publishes telefono: the PDF phone check has nothing to check');
      const pdfEntries = Object.entries(cfg.cv_pdf || {}).filter(([, rel]) => rel);
      if (pdfEntries.length === 0) fail('fixture portafolio.yml has no cv_pdf: the PDF phone check has nothing to check');
      /** Raw PDF text plus every inflatable stream, latin1. */
      const pdfText = (buf) => {
        const raw = buf.toString('latin1');
        const parts = [raw];
        for (const m of raw.matchAll(/stream\r?\n/g)) {
          const start = m.index + m[0].length;
          const end = raw.indexOf('endstream', start);
          if (end === -1) continue;
          try { parts.push(inflateSync(buf.subarray(start, end)).toString('latin1')); } catch { /* not flate */ }
        }
        return parts.join('\n');
      };
      for (const [lang, rel] of pdfEntries) {
        const src = join(FIXTURE, rel);
        const htmlSrc = src.replace(/\.pdf$/i, '.html');
        const published = summary.publico?.find((p) => p.dato === `cv_pdf (${lang})`);
        const file = published ? join(out, published.valor.split(' ')[0]) : null;
        if (!file || !existsSync(file)) { fail(`cv_pdf.${lang}: the published PDF is missing from the site`); continue; }
        const buf = readFileSync(file);
        if (buf.subarray(0, 5).toString() !== '%PDF-') fail(`cv_pdf.${lang}: ${relative(out, file)} is not a PDF`);
        else if (buf.equals(readFileSync(src))) fail(`cv_pdf.${lang}: published PDF is a byte copy of ${rel} (phone not removed)`);
        else pass(`cv_pdf.${lang}: published PDF is re-rendered, not a copy of ${rel}`);
        const text = pdfText(buf);
        if (!/\/URI\s*\(mailto:/.test(text)) fail(`cv_pdf.${lang}: no mailto: URI in the PDF, so the tel: check would prove nothing`);
        else if (/\/URI\s*\(tel:/i.test(text)) fail(`cv_pdf.${lang}: published PDF still has a tel: link`);
        else pass(`cv_pdf.${lang}: published PDF has no tel: link (and keeps mailto:)`);
        if (!existsSync(htmlSrc)) { fail(`fixture is missing ${relative(FIXTURE, htmlSrc)}`); continue; }
        const html = readFileSync(htmlSrc, 'utf8');
        if (!html.includes(phone)) fail(`fixture ${relative(FIXTURE, htmlSrc)} has no phone: nothing to strip`);
        const clean = stripPhone(html, phone);
        const cleanDigits = clean.replace(/<[^>]+>/g, ' ').replace(/[\s().+-]/g, '');
        if (clean.includes(phone) || /tel:/i.test(clean) || cleanDigits.includes(phoneDigits)) fail(`cv_pdf.${lang}: the HTML rendered to PDF still has the phone`);
        else if (!clean.includes(String(profile.candidate?.email))) fail(`cv_pdf.${lang}: stripping the phone also dropped the email`);
        else if (/<span class="separator">\|<\/span>\s*<span class="separator">/.test(clean) || /contact-row">\s*<span class="separator">/.test(clean)) fail(`cv_pdf.${lang}: stripping the phone left a dangling separator`);
        else pass(`cv_pdf.${lang}: the HTML rendered to PDF has no phone and keeps the rest of the header`);
        if (published.contacto?.includes('telefono')) fail(`cv_pdf.${lang}: summary says the PDF carries telefono`);
        else if (published.contacto?.includes('email')) pass(`cv_pdf.${lang}: summary lists the PDF contact data without telefono`);
        else fail(`cv_pdf.${lang}: summary does not list the PDF contact data`);
      }

      // Without the sibling HTML the build refuses to publish the phone.
      const noHtml = mkdtempSync(join(tmpdir(), 'coderhub-portafolio-nohtml-'));
      try {
        cpSync(FIXTURE, noHtml, { recursive: true, filter: (p) => !/\.html$/i.test(p) });
        const res = run(NODE, [BUILD, `--root=${noHtml}`, `--out=${join(noHtml, 'site')}`, '--no-og'], { timeout: 120000, stdio: ['ignore', 'pipe', 'pipe'] });
        const d = lastRunFailure();
        if (res !== null) fail('build.mjs published the CV PDF without the sibling HTML (the phone would leak)');
        else if (!/no encuentro .*\.html/.test(d?.stderr || '')) fail(`build.mjs failed without the sibling HTML, but not with the expected message: ${(d?.stderr || '').trim().slice(0, 300)}`);
        else if (existsSync(join(noHtml, 'site'))) fail('build.mjs wrote the site even though the CV PDF check failed');
        else pass('without the sibling HTML the build fails with a clear message and writes nothing');
      } finally {
        rmSync(noHtml, { recursive: true, force: true });
      }

      // cv.md parser: a bullet that is only a place is not an achievement.
      const { isLocationBullet } = await import(pathToFileURL(BUILD).href);
      const cases = [['Buenos Aires, Argentina.', true], ['Córdoba', true], ['Madrid, Spain (remote)', true],
        ['Led the migration of 14 services, cutting p95 latency by 38%.', false], ['Mentor two junior engineers, weekly reviews', false]];
      const wrong = cases.filter(([t, want]) => isLocationBullet(t, 'Córdoba') !== want);
      if (wrong.length) fail(`isLocationBullet misclassifies: ${wrong.map(([t]) => t).join(' | ')}`);
      else pass('isLocationBullet tells place-only bullets from achievements');
    }
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
}
