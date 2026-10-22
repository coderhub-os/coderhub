// tests/coderhub-guards.test.mjs — CoderHub OS divergence guards.
// Fails when an upstream sync silently reverts a CoderHub divergence
// (see .github/DIVERGENCIAS.md): the updater pointing back at upstream,
// "career-ops" reappearing on a client-visible surface (READMEs, updater and
// AGENTS.md blocks, the router's front matter and `modes` block, every file of
// the .agents/skills/coderhub-* skills), the voice layer dropping out of
// SYSTEM_PATHS, a coderhub-* skill dir not shipped by SYSTEM_PATHS (or claimed
// by USER_PATHS) (A5), or the router `modes` block losing one of the 6 skills
// or pointing at a SKILL.md that is missing or misnamed (D5b), or a gh
// issue/pr call in the sync workflow left without a target repo (A4), or the
// web UI dropping out of SYSTEM_PATHS or losing its brand or palette (D20/D22).
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';
import { pathToFileURL } from 'url';
import { pass, fail, ROOT } from './helpers.mjs';
import { extractArrayFromSource } from '../update-system.mjs';
import { listTree } from '../lib/walk-tree.mjs';

console.log('\nCoderHub OS divergence guards');

const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');
const block = (text, name) => {
  const m = text.match(new RegExp(`coderhub:start ${name}\\b[\\s\\S]*?coderhub:end ${name}\\b`));
  return m ? m[0] : null;
};
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

// 3d. D20 — the web UI ships to clients and shows the CoderHub OS brand.
if (!systemPaths.includes('web/')) fail("web/ is not in SYSTEM_PATHS (D20): apply would stop updating the web UI");
else pass('web/ is shipped by SYSTEM_PATHS');
if (/<BetaBanner\b/.test(read('web/src/components/app-shell.tsx'))) fail('app-shell.tsx renders BetaBanner again (D20): its Report a bug opens issues on another repo');
else pass('the web UI renders no Report a bug pill');
// D22 — the web UI wears the CoderHub palette (override block at the end of globals.css).
const webCss = block(read('web/src/app/globals.css'), 'web-colors');
if (!webCss || !/--color-brand:\s*#0099ff/i.test(webCss)) fail('web/src/app/globals.css lost the CoderHub web-colors block (D22)');
else pass('the web UI keeps the CoderHub palette');
if (!/id="isotipo"/.test(read('web/src/app/icon.svg'))) fail('web/src/app/icon.svg is not the CoderHub isotipo (D22)');
else pass('the web UI icon is the CoderHub isotipo');
// Visible text in web/src never says "career-ops". Skipped: comment lines, test
// files, identifiers (`@/lib/career-ops` imports, `career-ops:*` storage keys,
// `.career-ops-web`, `CAREER_OPS_*`), the upstream repo constant of the
// unrendered Report a bug pill, and the OS scheduler ids, which the
// install/uninstall scripts in web/scripts must match byte for byte.
const WEB_ID = /\.career-ops-web|CAREER_OPS_|career-ops:[a-z]|career-ops-[a-z]|@\/lib\/career-ops"|"\.\/career-ops"|career-ops recurring scan|io\.career-ops\.scheduled-scan|"career-ops-hq\/career-ops"/g;
const webLeaks = [];
for (const file of listTree(join(ROOT, 'web', 'src'), { match: /\.(tsx?|mjs)$/ })) {
  if (/\.test\./.test(file)) continue;
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
    if (/career[- ]ops/i.test(line.replace(WEB_ID, ''))) webLeaks.push(`${relative(ROOT, file)}:${i + 1}`);
  });
}
if (webLeaks.length) fail(`web UI text says "career-ops" (D20): ${webLeaks.join(', ')}`);
else pass('web UI text never says "career-ops"');

// 3e. D21 — /coderhub panel tells the client to run upstream's launcher; if the
// launcher, its flags, its install step or the Node floor move, the skill is stale.
const panel = read(`${SKILLS}/coderhub-panel/SKILL.md`);
const pkgJson = JSON.parse(read('package.json'));
const webPkg = JSON.parse(read('web/package.json'));
const uiServer = read('scripts/ui-server.mjs');
const nodeFloor = (webPkg.engines?.node || '').match(/>=\s*(\d+\.\d+)/)?.[1];
const panelDrift = [];
if (!/scripts\/ui-server\.mjs/.test(pkgJson.scripts?.ui || '')) panelDrift.push('package.json no longer has an `ui` script that runs scripts/ui-server.mjs');
for (const flag of ['--port', '--no-open']) if (!uiServer.includes(flag)) panelDrift.push(`scripts/ui-server.mjs lost ${flag}`);
if (!/let port = 3000;/.test(uiServer)) panelDrift.push('scripts/ui-server.mjs default port is no longer 3000');
if (!nodeFloor) panelDrift.push('web/package.json has no `engines.node >=X.Y`');
else if (!panel.includes(`Node ${nodeFloor}`)) panelDrift.push(`the skill does not say Node ${nodeFloor}, the web/package.json floor`);
if (!read('docs/WEB_UI.md').includes('npm --prefix web ci')) panelDrift.push('docs/WEB_UI.md no longer installs with `npm --prefix web ci`');
for (const cmd of ['npm --prefix web ci', 'npm run ui', '--port=3030', '--no-open', 'http://127.0.0.1:3000']) if (!panel.includes(cmd)) panelDrift.push(`the skill lost \`${cmd}\``);
if (panelDrift.length) fail(`coderhub-panel is out of sync with the web UI launcher (D21): ${panelDrift.join('; ')}`);
else pass('coderhub-panel matches the web UI launcher (script, flags, port, Node floor, install)');
const WEB_BRAND = ['web/src/app/layout.tsx', 'web/src/components/app-shell.tsx', 'web/src/components/mobile-nav.tsx', 'scripts/ui-server.mjs'];
for (const rel of WEB_BRAND) {
  const text = read(rel);
  if (!text.includes('CoderHub OS') || /[Cc]areer-ops (Local Web UI|Web Server|UI\.\.\.)|>career-ops<|title: "career-ops/.test(text)) fail(`${rel} lost the CoderHub OS brand (D20)`);
  else pass(`${rel} shows the CoderHub OS brand`);
}

// 3c. D5b — the router `modes` block maps the 5 coderhub skills to SKILL.md files that exist.
const router = read('.agents/skills/career-ops/SKILL.md');
const modes = block(router, 'modes');
const MODE_SKILLS = ['coderhub-linkedin', 'coderhub-readme-github', 'coderhub-banner', 'coderhub-traducir', 'coderhub-portafolio', 'coderhub-panel'];
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
  for (const file of listTree(join(ROOT, dir))) visible[relative(ROOT, file)] = readFileSync(file, 'utf8');
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

// 6. A4 — every repo-scoped gh call in the sync workflow targets this fork.
// gh resolves an untargeted call from the git remotes, and the sync checkout
// has an `upstream` remote: that once filed issues on career-ops-hq/career-ops.
const SYNC_WF = '.github/workflows/coderhub-sync.yml';
const syncWf = read(SYNC_WF);
const GH_REPO_LINE = /^ {2}GH_REPO: \$\{\{ github\.repository \}\}\s*$/m;
const topEnv = (syncWf.match(/^env:\n((?: {2}.*\n|\s*\n)*)/m) || [null, ''])[1];
const wfHasGhRepo = GH_REPO_LINE.test(topEnv);
const ghRepoOverrides = syncWf.split('\n').filter((l) => /\bGH_REPO\s*[:=]/.test(l) && !/GH_REPO: \$\{\{ github\.repository \}\}/.test(l));
const untargeted = syncWf.split('\n').map((l, i) => [i + 1, l])
  .filter(([, l]) => /\bgh\s+(issue|pr)\b/.test(l) && !/^\s*#/.test(l))
  .filter(([, l]) => !wfHasGhRepo && !/\s(--repo|-R)[\s=]/.test(l));
if (ghRepoOverrides.length > 0) fail(`${SYNC_WF} sets GH_REPO to something other than github.repository (A4): ${ghRepoOverrides[0].trim()}`);
else if (untargeted.length > 0) fail(`${SYNC_WF} has gh issue/pr calls with no target repo (A4), e.g. line ${untargeted[0][0]}`);
else if (!/\bgh\s+(issue|pr)\b/.test(syncWf)) fail(`${SYNC_WF}: no gh issue/pr calls found; update this guard (A4)`);
else pass(`${SYNC_WF}: every gh issue/pr call targets the fork`);
