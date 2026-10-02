// tests/coderhub-guards.test.mjs — CoderHub OS divergence guards.
// Fails when an upstream sync silently reverts a CoderHub divergence
// (see .github/DIVERGENCIAS.md): the updater pointing back at upstream,
// "career-ops" reappearing on a client-visible surface (READMEs, updater and
// AGENTS.md blocks, the router's front matter and `modes` block, every file of
// the .agents/skills/coderhub-* skills), the voice layer dropping out of
// SYSTEM_PATHS, a coderhub-* skill dir not shipped by SYSTEM_PATHS (or claimed
// by USER_PATHS) (A5), or the router `modes` block losing one of the 4 skills
// or pointing at a SKILL.md that is missing or misnamed (D5b).
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';
import { pathToFileURL } from 'url';
import { pass, fail, ROOT } from './helpers.mjs';
import { extractArrayFromSource } from '../update-system.mjs';
import { isNestedCheckout } from '../lib/mjs-files.mjs';

console.log('\nCoderHub OS divergence guards');

const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');
const block = (text, name) => {
  const m = text.match(new RegExp(`coderhub:start ${name}\\b[\\s\\S]*?coderhub:end ${name}\\b`));
  return m ? m[0] : null;
};
const filesUnder = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const child = join(dir, e.name);
  if (!e.isDirectory()) return [child];
  return isNestedCheckout(child) ? [] : filesUnder(child);
});
const covers = (entry, path) => entry === path || (entry.endsWith('/') && `${path}/`.startsWith(entry));

// 1. D1/D3/D7 — nothing that phones home may point at the upstream org.
for (const rel of ['update-system.mjs', 'user-agent.mjs', 'modes/update.md']) {
  if (read(rel).includes('career-ops-hq')) fail(`${rel} references career-ops-hq (D1/D3/D7 reverted?)`);
  else pass(`${rel} does not reference career-ops-hq`);
}

// 2. D1 — updater constants and tag prefix.
const updater = read('update-system.mjs');
const d1 = [
  "const CANONICAL_REPO = 'https://github.com/coderhub-os/coderhub.git';",
  "const RELEASE_TAG_PREFIX = 'coderhub-v';",
];
const missingD1 = d1.filter((s) => !updater.includes(s));
if (missingD1.length === 0) pass('update-system.mjs keeps the D1 repo and tag prefix');
else fail(`update-system.mjs lost D1: ${missingD1.join(' | ')}`);

// 3. SYSTEM_PATHS ships the CoderHub layer to clients.
if (!existsSync(join(ROOT, 'modes', '_coderhub.md'))) fail('modes/_coderhub.md is missing');
else if (!updater.includes("'modes/_coderhub.md'")) fail('modes/_coderhub.md is not in SYSTEM_PATHS');
else pass('modes/_coderhub.md exists and is in SYSTEM_PATHS');

// 3b. A5 — every .agents/skills/coderhub-* dir ships via SYSTEM_PATHS and is not user data.
const SKILLS = '.agents/skills';
const coderhubSkills = readdirSync(join(ROOT, SKILLS), { withFileTypes: true })
  .filter((e) => e.isDirectory() && e.name.startsWith('coderhub-'))
  .map((e) => `${SKILLS}/${e.name}`);
const systemPaths = extractArrayFromSource(updater, 'SYSTEM_PATHS');
const userPaths = extractArrayFromSource(updater, 'USER_PATHS');
if (systemPaths.length === 0 || userPaths.length === 0) fail('SYSTEM_PATHS or USER_PATHS not found in update-system.mjs');
if (coderhubSkills.length === 0) fail(`no ${SKILLS}/coderhub-* skill dirs found (A5)`);
for (const dir of coderhubSkills) {
  const user = userPaths.filter((e) => covers(e, dir) || e.startsWith(`${dir}/`));
  if (!systemPaths.some((e) => covers(e, dir))) fail(`${dir} is not covered by SYSTEM_PATHS (A5): clients would never get it`);
  else if (user.length > 0) fail(`${dir} is claimed by USER_PATHS (${user.join(', ')}) (A5): the updater would skip it`);
  else pass(`${dir} is shipped by SYSTEM_PATHS`);
}

// 3c. D5b — the router `modes` block maps the 4 coderhub skills to SKILL.md files that exist.
const router = read('.agents/skills/career-ops/SKILL.md');
const modes = block(router, 'modes');
const MODE_SKILLS = ['coderhub-linkedin', 'coderhub-readme-github', 'coderhub-banner', 'coderhub-traducir'];
if (!modes) fail('router lost the coderhub modes block (D5b)');
else {
  for (const name of MODE_SKILLS) {
    const rel = `${SKILLS}/${name}/SKILL.md`;
    const fm = existsSync(join(ROOT, rel)) ? (read(rel).match(/^---\n([\s\S]*?)\n---/) || [null, ''])[1] : null;
    const fmName = fm === null ? null : (fm.match(/^name:\s*['"]?([^'"\n]+?)['"]?\s*$/m) || [null, null])[1];
    if (!modes.includes(`\`${rel}\``)) fail(`router modes block does not reference ${rel} (D5b)`);
    else if (fm === null) fail(`router modes block points at ${rel}, which does not exist (D5b)`);
    else if (fmName !== name) fail(`${rel} front matter name is "${fmName}", expected "${name}" (D5b)`);
    else pass(`router modes block resolves ${name}`);
  }
}

// 4. Client-visible surfaces carry no "career-ops".
const visible = {};
for (const name of readdirSync(ROOT).filter((f) => /^README[\w.-]*\.md$/.test(f))) {
  visible[name] = read(name);
}
visible['update-system.mjs (banner)'] = block(updater, 'banner');
for (const b of ['msg-toplevel', 'msg-release-api', 'msg-release-tag', 'msg-rate-limit']) {
  visible[`update-system.mjs (${b})`] = block(updater, b);
}
visible['modes/update.md (rate-limited)'] = block(read('modes/update.md'), 'rate-limited');
visible['update-system.mjs (.gitignore header)'] = (updater.match(/^  '# Added by .*$/m) || [null])[0];
visible['doctor.mjs (header)'] = (read('doctor.mjs').match(/console\.log\('\\n[^']*doctor'\)/) || [null])[0];
const agents = read('AGENTS.md');
for (const b of ['title', 'update-prompt', 'rate-limited', 'what-is', 'ready', 'manifesto', 'hired-wall']) {
  visible[`AGENTS.md (${b})`] = block(agents, b);
}
// The `capa` and router `presentation` blocks name "career-ops" on purpose:
// they are the render rule that hides it. Only the router's front matter is checked.
visible['router (front matter)'] = (router.match(/^---\n[\s\S]*?\n---/) || [null])[0];
if (!block(router, 'presentation')) fail('router lost the coderhub presentation block (D5)');
visible['router (modes)'] = modes;
for (const dir of coderhubSkills) {
  for (const file of filesUnder(join(ROOT, dir))) visible[relative(ROOT, file)] = readFileSync(file, 'utf8');
}
const capa = block(agents, 'capa');
if (!capa) fail('AGENTS.md lost the coderhub capa block (D4)');
else if (!/^@modes\/_coderhub\.md$/m.test(capa)) fail('AGENTS.md capa block lost the @modes/_coderhub.md import (D4)');
else pass('AGENTS.md capa block imports @modes/_coderhub.md');

for (const [where, text] of Object.entries(visible)) {
  if (text === null) fail(`${where}: coderhub block or line not found`);
  else if (/career-ops/i.test(text)) fail(`${where}: shows "career-ops" to the client`);
  else pass(`${where}: no "career-ops"`);
}

// 5. D3 — scraping identifies as coderhub.
const { DEFAULT_USER_AGENT } = await import(pathToFileURL(join(ROOT, 'user-agent.mjs')).href);
if (/coderhub/.test(DEFAULT_USER_AGENT) && !/career-ops/.test(DEFAULT_USER_AGENT)) pass('DEFAULT_USER_AGENT is coderhub');
else fail(`DEFAULT_USER_AGENT is not coderhub: ${DEFAULT_USER_AGENT}`);
