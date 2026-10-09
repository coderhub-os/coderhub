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
//   - every theme and language has the "Copy for AI" button and its embedded
//     markdown profile (same privacy scan, same text as llms.txt); boton_ia:
//     false drops both; the terminal theme has no automatic stack eyebrow
import { cpSync, existsSync, writeFileSync, mkdtempSync, readFileSync, readdirSync, statSync } from 'fs';
import { inflateSync } from 'zlib';
import { pathToFileURL } from 'url';
import { tmpdir } from 'os';
import { dirname, join, relative, resolve, sep } from 'path';
import * as yaml from 'js-yaml';
import { chromium } from 'playwright';
import { isNestedCheckout } from '../lib/mjs-files.mjs';
import { pass, fail, run, lastRunFailure, rmSync, ROOT, NODE } from './helpers.mjs';

console.log('\nCoderHub OS portafolio: privacy + links (coderhub-portafolio)');

const SKILL = '.agents/skills/coderhub-portafolio';
const BUILD = join(ROOT, SKILL, 'build.mjs');
const FIXTURE = join(ROOT, SKILL, 'examples', 'martin');
// The CV PDF is re-rendered with Chromium. The quick CI job has no browser: there
// the site is built from a copy of the fixture with cv_pdf: null and the PDF
// checks are skipped: run this test locally (with Chromium) before a release.
const HAS_CHROMIUM = (() => { try { return existsSync(chromium.executablePath()); } catch { return false; } })();
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
  let buildRoot = FIXTURE;
  if (!HAS_CHROMIUM) {
    buildRoot = mkdtempSync(join(tmpdir(), 'coderhub-portafolio-fx-'));
    cpSync(FIXTURE, buildRoot, { recursive: true });
    const cfgPath = join(buildRoot, 'config', 'portafolio.yml');
    const noPdf = { ...(yaml.load(readFileSync(cfgPath, 'utf8')) || {}), cv_pdf: null };
    writeFileSync(cfgPath, yaml.dump(noPdf));
  }
  try {
    const stdout = run(NODE, [BUILD, `--root=${buildRoot}`, `--out=${out}`, '--no-og'], { timeout: 120000 });
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

      if (!HAS_CHROMIUM) pass('CV PDF checks skipped: Chromium is not installed (run them locally before a release)');
      else {
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

      }

      // "Copy for AI" button: present in every theme and language, the embedded
      // markdown profile passes the same privacy scan, and `boton_ia: false`
      // drops both. The terminal theme has no automatic stack eyebrow.
      {
        const AI_SCRIPT = /<script type="text\/markdown" id="ai-profile">([\s\S]*?)<\/script>/;
        const LABELS = { 'index.html': ['Copiar para IA', '¡Copiado!'], 'en/index.html': ['Copy for AI', 'Copied!'] };
        const fx = mkdtempSync(join(tmpdir(), 'coderhub-portafolio-ai-'));
        const fxCfg = join(fx, 'config', 'portafolio.yml');
        cpSync(FIXTURE, fx, { recursive: true });
        const baseCfg = yaml.load(readFileSync(join(FIXTURE, 'config', 'portafolio.yml'), 'utf8')) || {};
        const noEyebrow = { ...baseCfg, cv_pdf: null, eyebrow: null, es: { ...(baseCfg.es || {}) } };
        delete noEyebrow.eyebrow;
        delete noEyebrow.es.eyebrow;
        const buildAi = (cfgObj, theme) => {
          writeFileSync(fxCfg, yaml.dump(cfgObj));
          const dir = mkdtempSync(join(tmpdir(), `coderhub-portafolio-${theme}-`));
          const ok = run(NODE, [BUILD, `--root=${fx}`, `--out=${dir}`, `--theme=${theme}`, '--no-og'], { timeout: 120000 }) !== null;
          if (!ok) {
            const d = lastRunFailure();
            fail(`build.mjs --theme=${theme} failed (exit ${d?.status ?? '?'}): ${(d?.stderr || d?.stdout || '').trim().slice(0, 400)}`);
          }
          return { dir, ok };
        };
        try {
          for (const theme of ['minimalista', 'glassmorphism', 'neobrutalism', 'terminal']) {
            const { dir, ok } = buildAi(noEyebrow, theme);
            try {
              if (!ok) continue;
              for (const [rel, [label, done]] of Object.entries(LABELS)) {
                const html = readFileSync(join(dir, rel), 'utf8');
                const actions = html.match(/<div class="hero__actions">([\s\S]*?)<\/div>/)?.[1] || '';
                const btn = actions.match(/<button[^>]*\bdata-copy-ai\b[^>]*>[\s\S]*?<\/button>/)?.[0] || '';
                const okBtn = /class="button button--ghost button--ai"/.test(btn) && btn.includes(label) && btn.includes(`data-copied="${done}"`)
                  && /<svg\b/.test(btn) && /aria-live="polite"/.test(actions);
                (okBtn ? pass : fail)(`${theme} ${rel}: "${label}" button in .hero__actions (icon, aria-live)`);
                const md = html.match(AI_SCRIPT)?.[1] || '';
                if (md.trim().startsWith('# ')) pass(`${theme} ${rel}: embedded markdown profile`);
                else fail(`${theme} ${rel}: no <script type="text/markdown" id="ai-profile"> profile`);
                const lower = md.toLowerCase();
                const leaked = secrets.filter(([, v]) => v.trim().length >= 4 && lower.includes(v.trim().toLowerCase()));
                const bad = forbidden.filter(([, test]) => test(md));
                if (leaked.length || bad.length) fail(`${theme} ${rel}: embedded profile leaks ${[...leaked.map(([f, v]) => `${f} "${v}"`), ...bad.map(([l]) => l)].join(', ')}`);
                else pass(`${theme} ${rel}: embedded profile passes the privacy scan`);
                if (rel === 'en/index.html') {
                  const llms = readFileSync(join(dir, 'llms.txt'), 'utf8');
                  (md.trim() === llms.trim() ? pass : fail)(`${theme}: the English profile is the same text as llms.txt`);
                }
                const eyebrow = /hero__eyebrow/.test(html);
                if (theme === 'terminal') (eyebrow ? fail : pass)(`terminal ${rel}: no automatic stack eyebrow`);
                else (eyebrow ? pass : fail)(`${theme} ${rel}: automatic stack eyebrow`);
              }
            } finally {
              rmSync(dir, { recursive: true, force: true });
            }
          }

          // boton_ia: false (and an explicit eyebrow, which terminal still shows).
          const { dir, ok } = buildAi({ ...baseCfg, cv_pdf: null, boton_ia: false }, 'terminal');
          try {
            if (ok) {
              for (const rel of Object.keys(LABELS)) {
                const html = readFileSync(join(dir, rel), 'utf8');
                const gone = !/data-copy-ai/.test(html) && !/id="ai-profile"/.test(html);
                (gone ? pass : fail)(`boton_ia: false drops the button and the profile in ${rel}`);
                (/hero__eyebrow/.test(html) ? pass : fail)(`terminal ${rel}: explicit eyebrow is still shown`);
              }
            }
          } finally {
            rmSync(dir, { recursive: true, force: true });
          }

          // boton_ia must be a boolean.
          writeFileSync(fxCfg, yaml.dump({ ...baseCfg, cv_pdf: null, boton_ia: 'si' }));
          const badDir = mkdtempSync(join(tmpdir(), 'coderhub-portafolio-bad-'));
          const res = run(NODE, [BUILD, `--root=${fx}`, `--out=${badDir}`, '--no-og'], { timeout: 120000 });
          rmSync(badDir, { recursive: true, force: true });
          const msg = res === null ? `${lastRunFailure()?.stderr || ''}${lastRunFailure()?.stdout || ''}` : '';
          (res === null && /boton_ia/.test(msg) ? pass : fail)('build.mjs rejects a non-boolean boton_ia');
        } finally {
          rmSync(fx, { recursive: true, force: true });
        }
      }

      // cv.md parser: a bullet that is only a place is not an achievement.
      const { isLocationBullet } = await import(pathToFileURL(BUILD).href);
      const cases = [['Buenos Aires, Argentina.', true], ['Córdoba', true], ['Madrid, Spain (remote)', true],
        ['Led the migration of 14 services, cutting p95 latency by 38%.', false], ['Mentor two junior engineers, weekly reviews', false]];
      const wrong = cases.filter(([t, want]) => isLocationBullet(t, 'Córdoba') !== want);
      if (wrong.length) fail(`isLocationBullet misclassifies: ${wrong.map(([t]) => t).join(' | ')}`);
      else pass('isLocationBullet tells place-only bullets from achievements');

      // Pilot findings: visible job search, literal " -- ", demo→docs, stale portfolio URL in the CV base.
      const { jobSearchPhrases, hasLiteralDoubleDash, isDocsUrl, stalePortfolioUrl } = await import(pathToFileURL(BUILD).href);
      const det = [
        ['jobSearchPhrases flags seeking/open to/buscando',
          JSON.stringify(jobSearchPhrases('Engineer seeking remote roles. Open to relocation. Buscando nuevos desafíos')) === '["seeking","open to","buscando"]'
          && jobSearchPhrases('Led the migration of 14 services').length === 0],
        ['hasLiteralDoubleDash flags " -- " only', hasLiteralDoubleDash('Built X -- cut costs') && !hasLiteralDoubleDash('run with --no-og') && !hasLiteralDoubleDash('a - b')],
        ['isDocsUrl tells docs from demos', ['https://docs.foo.dev', 'https://foo.dev/docs/intro', 'https://foo.dev/documentation'].every(isDocsUrl)
          && !['https://foo.dev', 'https://foo.dev/dockerfile', 'https://github.com/a/docs-site'].some(isDocsUrl)],
        ['stalePortfolioUrl flags an old or missing site URL in the CV base',
          stalePortfolioUrl('<a href="https://old.vercel.app">old</a>', 'https://old.vercel.app', 'https://martin.github.io/')?.kind === 'distinta'
          && stalePortfolioUrl('<p>x</p>', 'https://martin.github.io', 'https://martin.github.io/')?.kind === 'falta'
          && stalePortfolioUrl('<a href="https://martin.github.io/">', 'https://martin.github.io', 'https://martin.github.io/') === null
          && stalePortfolioUrl('<p>x</p>', '', 'https://martin.github.io/') === null],
      ];
      for (const [name, ok] of det) (ok ? pass : fail)(name);
    }
  } finally {
    rmSync(out, { recursive: true, force: true });
    if (buildRoot !== FIXTURE) rmSync(buildRoot, { recursive: true, force: true });
  }
}
