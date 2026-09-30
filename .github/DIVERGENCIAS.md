# Divergencias de CoderHub OS respecto de upstream

Este repo es un mirror de `career-ops-hq/career-ops` (remote `upstream`) con una capa CoderHub encima. Acá está **todo** lo que difiere de upstream, para resolver cada sync sin adivinar.

**Regla:** se cambia lo que el cliente ve y lo interno queda igual. Siguen como upstream `CAREER_OPS_*`, los nombres de scripts, `.agents/skills/career-ops/`, `career-ops-plugin-*`, los nombres de los plugins y las descripciones de `package.json` y de los plugins (el test `project-identity` exige que coincidan).

**Ante la duda, como upstream, y se anota acá.**

Tipos: **D** = parche sobre un archivo de upstream · **A** = archivo nuevo (upstream nunca lo toca) · **X** = check desactivado · **R** = asset reemplazado en el mismo path.

Los parches en código van entre marcadores `coderhub:start <nombre>` / `coderhub:end <nombre>`, o con un comentario `// coderhub (Dn)` en la línea. Buscá `coderhub` en el diff del conflicto.

`tests/coderhub-guards.test.mjs` falla si un sync revierte D1, D3 o D7, si se pierde el import de la capa (D4), si falta el aviso de `rate-limited` (D19), si vuelve "career-ops" a una superficie visible o si `modes/_coderhub.md` sale de SYSTEM_PATHS.

## Divergencias

| ID | Archivo(s) | Tipo | Qué cambia | Cómo re-aplicar si hay conflicto |
|---|---|---|---|---|
| D1 | `update-system.mjs` (`CANONICAL_REPO`, `RAW_VERSION_URL`, `RELEASES_API`, `checkMainChannel`, `RELEASE_TAG_PREFIX`, `RELEASE_TAG_RE`) | D | El updater apunta a `coderhub-os/coderhub`. Los tags son `coderhub-vX.Y.Z`. `RELEASE_TAG_RE` acepta **los dos** prefijos (`coderhub-v` y `career-ops-v`), porque el harness de upgrade de upstream usa tags `career-ops-v*` como "versión vieja". | Quedate con upstream y volvé a poner las 3 URLs + el prefijo + la regex con doble prefijo. El guard lo verifica. |
| D1b | `VERSION`, `.gitattributes` | D | `VERSION` es nuestro (`coderhub-vX.Y.Z` sin prefijo). `.gitattributes` tiene `VERSION merge=ours`. `package.json#version` queda igual que upstream (el updater lee `VERSION`). | Automático con `merge=ours`. **Requiere** `git config merge.ours.driver true` en el clon (y en el job de sync). |
| D1c | 7 entrypoints `.{claude,cursor,opencode,qwen,antigravitycli,grok,kimi}/skills/coderhub/SKILL.md`, `scaffolder/bin/skill-entrypoints.mjs`, `update-system.mjs`, `gemini-eval.mjs`, `docs/SUPPORTED_CLIS.md`, `test-all.mjs`, `tests/skill-project-root.test.mjs`, `tests/updater-materialized-skill-drift.test.mjs` | D | Claude Code nombra la skill por la carpeta, así que los entrypoints van en `*/skills/coderhub/` (de ahí sale `/coderhub`). El canónico sigue en `.agents/skills/career-ops/SKILL.md` y los entrypoints apuntan a él. | Si upstream agrega un CLI nuevo, su entrypoint va en `skills/coderhub/` y se suma a `SKILL_ENTRYPOINTS` y a los tests que listan entrypoints. Si upstream renombra archivos de esta lista, re-aplicá el rename `career-ops` → `coderhub` solo en la carpeta del entrypoint. |
| D2 | `update-system.mjs` (bloque `banner`) | D | El banner del manifiesto al final de `apply` se cambia por una línea CoderHub con link a Instagram. | Quedate con el bloque `coderhub:start banner`. |
| D3 | `user-agent.mjs` (bloque `ua`), `tests/user-agent.test.mjs` | D | `DEFAULT_USER_AGENT` = `Mozilla/5.0 (compatible; coderhub/1.0)`, sin URL. El test fija el mismo literal. | Quedate con el nuestro en los dos archivos. Los UAs browser-like siguen como upstream. |
| D4 | `AGENTS.md` (bloques `title`, `capa`, `update-prompt`, `what-is`, `ready`, `manifesto`, `hired-wall`) | D | Título CoderHub OS. El bloque `capa` importa `@modes/_coderhub.md` (en una línea sola, sin backticks, para que Claude Code lo cargue) y además lo pide en texto. El chequeo de update, "qué es", el mensaje de "listo" y las secciones de manifiesto y Hired Wall quedan neutralizados, no borrados: las secciones que exigen los tests siguen ahí. | Aceptá upstream fuera de los bloques y re-aplicá cada bloque. La sección "Origin" queda **como upstream** (decisión F1). |
| D5 | `.agents/skills/career-ops/SKILL.md` (`name`, `description`, bloque `presentation`) | D | `name: coderhub`, descripción en español y bloque de presentación con la **regla de render**: todo `/career-ops X` de este archivo, de `modes/*.md` o del stdout de un script se muestra como `/coderhub X`. El menú y las frases de routing quedan en inglés, como upstream (los tests fijan `/career-ops latex`, `email`, `offer-prep` y "Resolve every path in this router"). | Aceptá upstream y re-aplicá `name`, `description` y el bloque. |
| D6 | `CLAUDE.md`, `OPENCODE.md`, `CODEX.md`, `GEMINI.md`, `KIMI.md` | — | **Ninguna: quedan como upstream.** El test #1088 exige que `CLAUDE.md` tenga solo `@AGENTS.md` más un comentario. El `@modes/_coderhub.md` va en el bloque `capa` de `AGENTS.md` (D4): Claude Code resuelve imports anidados y lo carga igual, y los otros CLIs siguen la instrucción en texto del mismo bloque. | — |
| D7 | `modes/update.md` | D | URLs del motor a `coderhub-os/coderhub`. El mensaje de `offline` nombra el límite de 60 consultas por hora de GitHub (D18). | Quedate con el nuestro. El guard lo verifica. |
| D8 | `doctor.mjs` | D | Header "CoderHub OS doctor" y el skeleton de `data/pipeline.md` dice `/coderhub pipeline`. | Re-aplicá las 2 líneas. |
| D9 | `package.json`, `CITATION.cff` | D | `name: coderhub`, `homepage: https://arielmirra.com/vsl`, `repository: https://github.com/coderhub-os/coderhub`. `CITATION.cff`: `url` = homepage y `repository-code` = repo (el test `project-identity` exige las dos igualdades). `description`, `version` y los nombres/descripciones de los plugins siguen como upstream. | Aceptá upstream (deps, scripts) y re-aplicá los 3 campos + los 2 de CITATION. |
| D10 | `README.md`, 16 `README.<lang>.md`, `.gitattributes` | D | `README.md` reescrito en español con "vos", sin "career-ops". Los 16 localizados son stubs que apuntan a `README.md` (el updater y los tests los necesitan). `.gitattributes` tiene `README*.md merge=ours`. | Automático con `merge=ours`. Si upstream agrega un idioma nuevo, creá su stub (copiá `README.es.md`). |
| D10a | `README.md` y stubs, fila Human-in-the-Loop | D | La fila HITL con el marcador `<!-- hitl: absolute guarantee… -->` queda **en inglés, textual como upstream** en `README.md`: el test `readme-hitl-markers` exige "never submits an application" y prohíbe hedges. Todos los READMEs dicen "A-H" y nunca "A-F". | Si upstream cambia esa fila o el marcador, copiala textual de upstream. |
| D10b | `README.md` | D | No enlaza `LEGAL_DISCLAIMER.md` (su sección "Aviso" en español lo reemplaza) ni `TRADEMARK.md`. Nombra `docs/CODEX.md` solo como texto, sin link. No tiene sponsors, videos, manifiesto, Hired Wall, autor, prensa ni contribuidores. | — |
| R11 | `docs/wordmark-dark.svg`, `docs/wordmark-light.svg` | R | Wordmark CoderHub (de `brand_context/assets/logos/logo.svg`). El dark es el original (texto blanco). El light es el mismo SVG con `.cls-2` en `#0A1628`. `aria-label="CoderHub OS"`. | Quedate con los nuestros. |
| R11b | `docs/logo.png`, `docs/avatar-*`, `docs/og-image.*`, `docs/hero-banner.*`, `docs/demo.gif`, `docs/hired-wall.svg`, `docs/manifesto-wall.svg`, `docs/press/`, `docs/sponsors/` | — | **No se tocan.** El README nuevo no los muestra, así que el cliente no los ve. `docs/logo.png` lo usa `tests/profile-photo` como PNG de prueba. | — |
| D14 | `scan.mjs` (nota única del manifiesto) | D | El bloque queda apagado con `if (false && …)`, sin borrar, para que el merge siga limpio. | Re-poné `false &&` en la condición. |
| D15 | `openrouter-runner.mjs` (los 2 `fetch`) | D | Headers `HTTP-Referer: https://arielmirra.com/vsl` y `X-Title: CoderHub OS`. | Re-aplicá en los 2 `fetch`. |
| A1 | `modes/_coderhub.md`, entrada en `SYSTEM_PATHS` de `update-system.mjs` | A | Capa de voz, idioma y nombre. Rige todo lo visible, no toca reglas duras ni datos. Va en SYSTEM_PATHS para que el updater la mande a los clientes. | La entrada en SYSTEM_PATHS es la única línea que puede chocar. El guard lo verifica. |
| A2 | `tests/coderhub-guards.test.mjs` | A | Los guards de arriba. `test-all.mjs` lo descubre solo. | — |
| A3 | `.github/DIVERGENCIAS.md` | A | Este archivo. | — |
| A4 | `.github/workflows/coderhub-sync.yml` | A | Sync semanal (viernes 9:00 ART, más `workflow_dispatch`). Mergea `upstream/main` en la rama `coderhub/sync-upstream` cortada de `next`, con `merge.ours.driver true`, corre la suite y abre o actualiza un PR a `next` con review de arielmirra (en draft si fallan los tests). Si hay conflictos que `merge=ours` no resuelve, no pushea nada y abre o comenta el issue `[sync] Conflictos con upstream`, asignado a arielmirra. Pushea con la GitHub App `coderhub-sync` de la org (var `CODERHUB_SYNC_CLIENT_ID`, secret `CODERHUB_SYNC_PRIVATE_KEY`), porque `GITHUB_TOKEN` no puede pushear cambios en `.github/workflows/` y sus PRs no disparan `Tests`. El cron corre solo desde `main`. | — |
| D16 | `.github/workflows/test.yml` | D | `pull_request.branches: [main, next]`. El job `upgrade-gate` baja los tags `career-ops-v*` de upstream antes del harness (bloque `upstream-tags`). El repo del motor no tiene esos tags, para que "career-ops" no aparezca en Tags ni Releases, y los tags viven solo en el runner (opción A). | Re-aplicá la rama y el bloque. |
| D17 | `upgrade-tests.mjs` (`CANONICAL_CODERHUB`, `writeGitConfig`) | D | El harness redirige al mirror local también `coderhub-os/coderhub`. Sin esto, cuando el updater viejo se autoactualiza, el nuevo (D1) baja del repo real y el gate prueba contra el `main` publicado en vez del commit del PR. | Re-agregá la constante y su línea `insteadOf`. |
| D18 | `update-system.mjs` (bloques `msg-toplevel`, `msg-release-api`, `msg-release-tag`, línea del header de `.gitignore`) | D | Los errores del updater dicen "CoderHub OS" en vez de "career-ops". `msg-release-api` además avisa que la causa puede ser el límite de 60 requests por hora sin autenticar de la API de GitHub (red compartida o VPN), no solo falta de conexión. `msg-release-tag` no menciona el componente `web` de upstream, que acá no existe. El header del bloque que el updater agrega al `.gitignore` del cliente dice "CoderHub OS". El User-Agent `career-ops-update-checker` queda como upstream (interno). El guard lo verifica. | Aceptá upstream fuera de los bloques y re-aplicá los 3 bloques y la línea `// coderhub (D18)`. |
| D19 | `update-system.mjs` (bloques `gh-token`, `gh-token-auth`, `gh-token-auth-stdin`, `rate-limited-status`, `rate-limited-reset`, `msg-rate-limit`), `AGENTS.md` y `modes/update.md` (bloque `rate-limited`), fila `rate-limited` en `docs/SCRIPTS.md` | D | Si `gh` está logueado, `curlGet` manda su token a `api.github.com` (y solo ahí), por stdin con `--header @-` para que no quede en la lista de procesos: 5.000 requests por hora por usuario en vez de 60 por IP. Si el lookup del release falla, pregunta a `/rate_limit` (no gasta cuota): con `remaining: 0`, `check` devuelve `rate-limited` con `resetAt` en vez de `offline`, y `apply` tira un error con la hora de reset y `gh auth login`. El agente avisa `rate-limited` una vez por sesión (`offline` sigue en silencio). `tests/coderhub-updater-rate-limit.test.mjs` lo cubre y el guard verifica los bloques visibles. | Aceptá upstream fuera de los bloques y re-aplicalos. Si upstream agrega auth propia, quedate con la de upstream y sacá `gh-token`. |
| X1 | `test-all.mjs` (bloque `sponsors-check`, check #76) | X | El chequeo de `.github/scripts/sponsors.mjs --check` queda apagado (`const r = { status: 0 }`): el README en español no tiene la sección Sponsors de upstream. | Re-poné el bloque. Si upstream mueve el check, buscá `sponsors.mjs', '--check'`. |
| X2 | Workflows de GitHub Actions | X | 24 workflows apagados en el repo (upstream tiene más de los 23 del plan). Solo `Tests` y `CoderHub upstream sync` (A4) quedan activos. Dependabot sigue activo. | Después de cada sync que agregue un workflow, apagalo: `gh workflow disable <nombre> --repo coderhub-os/coderhub`. Está en el checklist de release. |
| ~~D13~~ | `.gitignore` | — | **Revertida.** Igual que upstream: los datos del cliente no se versionan. | — |

## Pendientes conocidos (el cliente casi no los ve)

- **Dashboard Go:** `dashboard/internal/ui/screens/pipeline.go`, `progress.go` y `stats.go` muestran strings de crédito de career-ops. Van en una etapa posterior.
- **Stdout de scripts que dice `/career-ops X`:** `generate-pdf.mjs`, `match-star`, `negotiation-roi`, `plugins.mjs`, `scan-ats-full`, `scan-interamt`, `scan.mjs` (~L4020 y el skeleton de pipeline ~L2671) y `lib/latex-content`. Los cubre la regla de render de D5: el agente los muestra como `/coderhub X`.
- **Links a upstream que no se ejecutan:** `hired-share.mjs` (`REPO_URL`) y `manifesto.mjs` (`PAGE`). El cliente nunca los corre.
- **`scaffolder/bin/cli.mjs`:** la URL de Docs apunta a upstream. El scaffolder `npx` no es parte del flujo de CoderHub.
- **Docs internos e issue templates** siguen enlazando `career-ops-hq`: `docs/CODEX.md` (17 menciones), `LEGAL_DISCLAIMER.md` (5), `.github/ISSUE_TEMPLATE/`. El README no los enlaza.
- **`package-lock.json`** (untracked en la raíz) conserva el nombre de upstream.
- **Rate limit sin `gh`:** un cliente sin `gh` logueado sigue con 60 pedidos por hora por IP. En una red compartida puede quedarse sin cuota; desde D19 se entera (`rate-limited`) en vez de no saber nada. `--channel main` (`checkMainChannel`) no distingue el rate limit: sigue diciendo `offline`.

## Sync con upstream

El job `coderhub-sync.yml` (A4) hace los pasos 1 a 4 cada viernes y deja un PR. A mano:

1. `git config merge.ours.driver true` (una vez por clon; el job de sync lo hace solo).
2. `git fetch upstream --tags` y mergeá `upstream/main` en `next`.
3. Conflictos: resolvelos con esta tabla. `VERSION` y `README*.md` se resuelven solos.
4. `node test-all.mjs --quick`. Los guards tienen que pasar.
5. Revisá si hay workflows nuevos (X2) o idiomas nuevos de README (D10).

## Release

El updater de los clientes lee `VERSION` de `main` (`RAW_VERSION_URL`) y el tag del último release (`RELEASES_API`, `/releases/latest`). Los dos tienen que coincidir.

1. **Versión.** En `next`, poné la nueva en `VERSION` (`X.Y.Z`, sin prefijo) y commiteá `chore(release): coderhub vX.Y.Z`. `package.json#version` queda como upstream (D1b).
2. **CI.** Abrí un PR `next` → `main`. Tiene que pasar `Tests` entero, incluido el `upgrade-gate`.
3. **Merge sin squash.** Con `Tests` en verde, `git push origin next:main` (fast-forward). Nunca squash ni rebase: se pierde el ancestro común con upstream y el próximo sync choca en todo el repo. GitHub marca el PR como mergeado solo.
4. **Tag y release.** `gh release create coderhub-vX.Y.Z --repo coderhub-os/coderhub --target main --title "CoderHub OS vX.Y.Z" --notes-file <notas>`. Sin `--prerelease`: tiene que quedar como Latest.
5. **Changelog.** Va en las notas del release, en español, y dice solo qué cambia para el cliente. Sin "career-ops": `/coderhub update` le muestra las notas al cliente. La versión del motor (`git show $(git merge-base next upstream/main):VERSION`) se anota en la tabla de abajo, en el mismo commit de release. `CHANGELOG.md` queda como upstream.
6. **Workflows.** `gh workflow list --repo coderhub-os/coderhub --all`. Todo lo que quedó `active` salvo `Tests`, `CoderHub upstream sync` y `Dependabot Updates` se apaga con `gh workflow disable` (X2). Los workflows nuevos aparecen recién cuando llegan a `main`.
7. **Verificación.** En el piloto, `/coderhub update` tiene que ofrecer la versión nueva y el apply tiene que terminar con el banner de CoderHub (D2).

## Motor por versión

| CoderHub OS | career-ops |
|---|---|
| v1.0.0 | v1.34.0 |
| v1.0.1 | v1.34.0 |
