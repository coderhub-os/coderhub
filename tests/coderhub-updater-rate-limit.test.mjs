// tests/coderhub-updater-rate-limit.test.mjs — D19: GitHub's API rate limit
// is its own status, and the updater authenticates with the gh token.
//
// The regression: GitHub allows 60 unauthenticated API requests per hour per
// IP. On a shared network (corporate VPN, office NAT) that quota is spent by
// other people, the releases API answers 403, curl --fail returns null, and
// check() reported `offline` — which AGENTS.md tells the agent to swallow at
// session start. A client on their employer's network never heard about a
// release, and nothing said why.
//
// Driven through the same ctx.curlGet seam as the other updater tests, with
// no network and no gh:
//   - releases lookup fails + /rate_limit says 0 left → `rate-limited` with
//     the reset time; any other /rate_limit answer keeps `offline`
//   - resolveTargetRef() names the limit and the reset time when it throws
//   - curlAuthPlan() sends the token to api.github.com only, via stdin
//   - readGhToken() is '' when gh is missing or logged out
//   - check still prints its status when curl dies before reading stdin (EPIPE)
import { mkdtempSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from 'fs';
import { spawnSync } from 'child_process';
import { tmpdir } from 'os';
import { join, delimiter } from 'path';
import { pass, fail, ROOT } from './helpers.mjs';
import { gitIn } from '../update-system.mjs';
import { checkStatus, resolveTargetRef, curlAuthPlan, readGhToken } from '../update-system.mjs';

console.log('\nCoderHub OS updater: GitHub rate limit + gh token (D19)');

const RESET_EPOCH = 1790776433; // 2026-09-30T13:53:53Z
const RATE = (remaining, reset = RESET_EPOCH) =>
  JSON.stringify({ rate: { limit: 60, remaining, reset, used: 60 - remaining } });

/** curlGet double: the releases API always fails; /rate_limit answers `rate`. */
function releasesDown(rate) {
  const urls = [];
  const fn = async (url) => {
    urls.push(url);
    if (url.endsWith('/rate_limit')) return rate;
    return null;
  };
  return { fn, urls };
}

const check = (rate) => {
  const curl = releasesDown(rate);
  return checkStatus(['check'], {}, { curlGet: curl.fn, localVersion: () => '1.0.1', readMarker: () => null })
    .then(res => ({ res, urls: curl.urls }));
};

// ── 1. Quota exhausted → rate-limited, with the reset time ──
{
  const { res, urls } = await check(RATE(0));
  if (res.status === 'rate-limited' && res.local === '1.0.1') pass('releases lookup failed with 0 requests left → rate-limited');
  else fail(`quota exhausted → ${JSON.stringify(res)}`);
  if (res.resetAt === new Date(RESET_EPOCH * 1000).toISOString()) pass('rate-limited carries resetAt as an ISO timestamp');
  else fail(`resetAt was ${JSON.stringify(res.resetAt)}`);
  if (urls.some(u => u === 'https://api.github.com/rate_limit')) pass('the diagnosis asks /rate_limit (which does not spend quota)');
  else fail(`asked: ${JSON.stringify(urls)}`);
}

// ── 2. Quota left, or /rate_limit unreachable → still offline ──
for (const [rate, label] of [[RATE(12), 'requests left'], [null, '/rate_limit unreachable'], ['not json', 'garbled /rate_limit']]) {
  const { res } = await check(rate);
  if (res.status === 'offline') pass(`releases lookup failed, ${label} → offline`);
  else fail(`${label} → ${JSON.stringify(res)}`);
}

// ── 3. A working releases API never pays for the /rate_limit probe ──
{
  const urls = [];
  const fn = async (url) => {
    urls.push(url);
    return url.includes('/releases/latest') ? JSON.stringify({ tag_name: 'coderhub-v1.0.1', published_at: '', body: '' }) : null;
  };
  await checkStatus(['check'], {}, { curlGet: fn, localVersion: () => '1.0.1', readMarker: () => null });
  if (!urls.some(u => u.endsWith('/rate_limit'))) pass('a successful release lookup does not probe /rate_limit');
  else fail(`asked: ${JSON.stringify(urls)}`);
}

// ── 4. apply's resolveTargetRef names the limit and when it resets ──
{
  let threw = null;
  try { await resolveTargetRef([], {}, { curlGet: releasesDown(RATE(0)).fn }); } catch (err) { threw = err; }
  if (threw && /rate limit/i.test(threw.message) && threw.message.includes(new Date(RESET_EPOCH * 1000).toISOString())) {
    pass('resolveTargetRef throws naming the rate limit and its reset time');
  } else {
    fail(threw ? `message: ${threw.message}` : 'did not throw');
  }
  if (threw && /gh auth login/.test(threw.message)) pass('the rate-limit error points at gh auth login');
  else fail('the rate-limit error does not mention gh auth login');
}
{
  let threw = null;
  try { await resolveTargetRef([], {}, { curlGet: releasesDown(RATE(30)).fn }); } catch (err) { threw = err; }
  if (threw && !/rate limit/i.test(threw.message) && /--channel main/.test(threw.message)) {
    pass('with quota left, resolveTargetRef keeps the connection error');
  } else {
    fail(threw ? `message: ${threw.message}` : 'did not throw');
  }
}

// ── 5. curlAuthPlan: token only to api.github.com, never on argv ──
{
  const plan = curlAuthPlan('https://api.github.com/repos/coderhub-os/coderhub/releases/latest', 'gho_secret');
  if (plan.args.join(' ') === '--header @-' && plan.stdin === 'Authorization: Bearer gho_secret\n') {
    pass('api.github.com gets the token as a header read from stdin');
  } else {
    fail(`api plan: ${JSON.stringify(plan)}`);
  }
  if (!plan.args.some(a => a.includes('gho_secret'))) pass('the token never appears in curl argv');
  else fail('the token is on argv');
}
for (const [url, token, label] of [
  ['https://raw.githubusercontent.com/coderhub-os/coderhub/main/VERSION', 'gho_secret', 'raw.githubusercontent.com'],
  ['https://api.github.com.evil.example/x', 'gho_secret', 'a lookalike host'],
  ['https://api.github.com/repos/coderhub-os/coderhub/releases/latest', '', 'no token'],
]) {
  const plan = curlAuthPlan(url, token);
  if (plan.args.length === 0 && plan.stdin === null) pass(`${label} → no auth header`);
  else fail(`${label} → ${JSON.stringify(plan)}`);
}

// ── 6. readGhToken: the trimmed token, or '' when gh is missing/logged out ──
{
  const ok = readGhToken(() => 'gho_abc123\n');
  if (ok === 'gho_abc123') pass('readGhToken returns the trimmed gh auth token');
  else fail(`readGhToken → ${JSON.stringify(ok)}`);
  const missing = readGhToken(() => { throw Object.assign(new Error('spawn gh ENOENT'), { code: 'ENOENT' }); });
  if (missing === '') pass('gh not installed → no token, no throw');
  else fail(`gh missing → ${JSON.stringify(missing)}`);
  const multi = readGhToken(() => 'two words\n');
  if (multi === '') pass('output that is not a single token is ignored');
  else fail(`odd output → ${JSON.stringify(multi)}`);
}

// ── 7. check survives a curl that exits before reading its stdin ──
// The token travels to curl over stdin. A curl that fails at once (no network,
// blocked, missing) closes that pipe first, and on Linux the write is EPIPE: an
// unhandled 'error' event on stdin killed check before it printed a status.
// POSIX only: the doubles are shell scripts.
if (process.platform === 'win32') {
  pass('check vs. a curl that exits early: skipped on Windows (shell-script doubles)');
} else {
  for (const [label, ghScript] of [
    ['gh logged out', '#!/bin/sh\nexit 1\n'],
    ['gh with a token', '#!/bin/sh\necho gho_faketoken\n'],
  ]) {
    const dir = mkdtempSync(join(tmpdir(), 'co-epipe-'));
    try {
      writeFileSync(join(dir, 'VERSION'), '1.0.0\n');
      gitIn(dir, 'init', '-q', '-b', 'main', '.');
      gitIn(dir, 'config', 'user.email', 'test@example.com');
      gitIn(dir, 'config', 'user.name', 'Test');
      gitIn(dir, 'config', 'core.hooksPath', join(dir, 'no-such-hooks'));
      gitIn(dir, 'add', '-A');
      gitIn(dir, 'commit', '-qm', 'initial');
      const script = join(dir, 'update-system.mjs');
      copyFileSync(join(ROOT, 'update-system.mjs'), script);
      const bin = join(dir, 'fake-bin');
      mkdirSync(bin);
      writeFileSync(join(bin, 'curl'), '#!/bin/sh\nexit 1\n', { mode: 0o755 });
      writeFileSync(join(bin, 'gh'), ghScript, { mode: 0o755 });
      const env = { ...process.env, PATH: `${bin}${delimiter}${process.env.PATH}` };
      let status = null;
      let res = null;
      for (let i = 0; i < 5 && status !== 'bad'; i++) {
        res = spawnSync(process.execPath, [script, 'check'], { cwd: dir, encoding: 'utf-8', env });
        try { status = JSON.parse(res.stdout.trim()).status; } catch { status = 'bad'; }
      }
      if (status === 'offline') pass(`check prints its status when curl exits before reading stdin (${label})`);
      else fail(`check printed no status (${label}): ${String(res.stderr).split('\n').find((l) => /Error/.test(l)) || res.stdout}`);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
}
