// tests/coderhub-guards.test.mjs — CoderHub OS divergence guards.
// Fails when an upstream sync silently reverts a CoderHub divergence
// (see .github/DIVERGENCIAS.md): the updater pointing back at upstream,
// "career-ops" reappearing on a client-visible surface, or the voice layer
// dropping out of SYSTEM_PATHS.
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import { pass, fail, ROOT } from './helpers.mjs';

console.log('\nCoderHub OS divergence guards');

const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');
const block = (text, name) => {
  const m = text.match(new RegExp(`coderhub:start ${name}\\b[\\s\\S]*?coderhub:end ${name}\\b`));
  return m ? m[0] : null;
};

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

// 4. Client-visible surfaces carry no "career-ops".
const visible = {};
for (const name of readdirSync(ROOT).filter((f) => /^README[\w.-]*\.md$/.test(f))) {
  visible[name] = read(name);
}
visible['update-system.mjs (banner)'] = block(updater, 'banner');
for (const b of ['msg-toplevel', 'msg-release-api', 'msg-release-tag']) {
  visible[`update-system.mjs (${b})`] = block(updater, b);
}
visible['update-system.mjs (.gitignore header)'] = (updater.match(/^  '# Added by .*$/m) || [null])[0];
visible['doctor.mjs (header)'] = (read('doctor.mjs').match(/console\.log\('\\n[^']*doctor'\)/) || [null])[0];
const agents = read('AGENTS.md');
for (const b of ['title', 'update-prompt', 'what-is', 'ready', 'manifesto', 'hired-wall']) {
  visible[`AGENTS.md (${b})`] = block(agents, b);
}
// The `capa` and router `presentation` blocks name "career-ops" on purpose:
// they are the render rule that hides it. Only the router's front matter is checked.
const router = read('.agents/skills/career-ops/SKILL.md');
visible['router (front matter)'] = (router.match(/^---\n[\s\S]*?\n---/) || [null])[0];
if (!block(router, 'presentation')) fail('router lost the coderhub presentation block (D5)');
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
