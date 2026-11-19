// tests/coderhub-updater-client-repo.test.mjs — D24: a client install updates
// from its own repo (coderhub-os/coderhub-<name>), never from the template.
//
// The template repo goes private, so an install whose origin is a client repo
// must find releases with `git ls-remote` against origin (the client's own
// credentials) instead of the anonymous releases API. Driven through seams,
// with no network:
//   - clientRepoSlug() recognises client remotes and nothing else
//   - highestReleaseTagName() picks the newest release tag, ignoring junk
//   - clientLatestRelease() maps ls-remote success/failure to check statuses
//   - checkStatus() in client mode offers the release from origin and refuses
//     the main channel
//   - a real ls-remote against a local bare repo (credential-free) works
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { pass, fail } from './helpers.mjs';
import {
  clientRepoSlug, highestReleaseTagName, clientLatestRelease, clientLsRemote, checkStatus, gitIn,
} from '../update-system.mjs';

console.log('\nCoderHub OS updater: updates from the client repo (D24)');

const eq = (label, got, want) => {
  if (JSON.stringify(got) === JSON.stringify(want)) pass(label);
  else fail(`${label}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
};

eq('https client remote', clientRepoSlug('https://github.com/coderhub-os/coderhub-ariel-mirra.git'), 'coderhub-os/coderhub-ariel-mirra');
eq('ssh client remote', clientRepoSlug('git@github.com:coderhub-os/coderhub-juan.duque'), 'coderhub-os/coderhub-juan.duque');
eq('template is not a client', clientRepoSlug('https://github.com/coderhub-os/coderhub.git'), '');
eq('a fork is not a client', clientRepoSlug('https://github.com/someone/coderhub-x.git'), '');
eq('a local path is not a client', clientRepoSlug('/tmp/mirror.git'), '');

const LS = [
  'a'.repeat(40) + '\trefs/tags/coderhub-v2.2.0',
  'b'.repeat(40) + '\trefs/tags/coderhub-v2.2.0^{}',
  'c'.repeat(40) + '\trefs/tags/coderhub-v2.10.0',
  'd'.repeat(40) + '\trefs/tags/web-v9.0.0',
  'e'.repeat(40) + '\trefs/tags/coderhub-vpreview',
].join('\n');
eq('newest release tag by semver', highestReleaseTagName(LS), 'coderhub-v2.10.0');
eq('no release tags', highestReleaseTagName('x\trefs/tags/web-v1.0.0'), '');

const okProbe = () => ({ ok: true, out: LS });
const noCurl = async () => null;
eq('release found over git', await clientLatestRelease({ lsRemote: okProbe, curlGet: noCurl }),
  { status: 'ok', tagName: 'coderhub-v2.10.0', version: '2.10.0', publishedAt: '', changelog: '' });
const withNotes = async () => JSON.stringify({ body: 'Novedades', published_at: '2026-11-20T00:00:00Z' });
eq('release notes when the API answers', (await clientLatestRelease({ lsRemote: okProbe, curlGet: withNotes })).changelog, 'Novedades');
eq('git failure is offline with the reason',
  await clientLatestRelease({ lsRemote: () => ({ ok: false, detail: 'Authentication failed' }), curlGet: noCurl }),
  { status: 'offline', detail: 'git ls-remote origin: Authentication failed' });
eq('no tags is no-remote-version', (await clientLatestRelease({ lsRemote: () => ({ ok: true, out: '' }) , curlGet: noCurl })).status, 'no-remote-version');

const release = async () => ({ status: 'ok', tagName: 'coderhub-v2.3.0', version: '2.3.0', publishedAt: '', changelog: 'x' });
const base = { clientRelease: release, localVersion: () => '2.2.0', localShortSha: () => '', readMarker: () => null };
eq('client mode offers the release from origin', (await checkStatus(['check'], {}, base)).status, 'update-available');
eq('client mode up to date', (await checkStatus(['check'], {}, { ...base, localVersion: () => '2.3.0' })).status, 'up-to-date');
eq('client mode refuses the main channel', (await checkStatus(['check', '--channel', 'main'], {}, base)).status, 'offline');

// A real ls-remote, credential-free, against a local bare repo.
const dir = mkdtempSync(join(tmpdir(), 'coderhub-d24-'));
try {
  gitIn(dir, 'init', '--quiet', '--bare', 'remote.git');
  gitIn(dir, 'init', '--quiet', 'work');
  const work = join(dir, 'work');
  gitIn(work, '-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '--quiet', '--allow-empty', '-m', 'x');
  gitIn(work, '-c', 'user.email=t@t', '-c', 'user.name=t', 'tag', '-a', 'coderhub-v2.3.0', '-m', 'v');
  gitIn(work, 'push', '--quiet', join(dir, 'remote.git'), 'refs/tags/coderhub-v2.3.0');
  const probe = clientLsRemote(['--tags'], [], join(dir, 'remote.git'));
  eq('ls-remote against a real repo', probe.ok && highestReleaseTagName(probe.out), 'coderhub-v2.3.0');
  const missing = clientLsRemote(['--tags'], [], join(dir, 'nope.git'));
  eq('ls-remote failure is reported, not thrown', missing.ok, false);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
