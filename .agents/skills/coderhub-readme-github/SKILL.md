---
name: coderhub-readme-github
description: >-
  CoderHub OS: genera (o rehace) el profile README de GitHub del cliente, el
  repo especial usuario/usuario que se muestra arriba del perfil. Se invoca
  como `/coderhub readme-github`. Lee los datos del cliente y sus proyectos
  reales (vía gh api) y arma un README que posiciona: hero, value prop con
  números, stack curado, proyectos con outcome y contacto. Siempre en inglés.
  No es para READMEs de proyectos.
---

# CoderHub — README de perfil de GitHub

Arma el **profile README** del cliente (el repo especial `usuario/usuario`) como **landing page profesional**: posicionamiento arriba, proyectos reales como prueba, cero decoración.

- **Charla:** en español con "vos", según `modes/_coderhub.md` (cargalo si no está en contexto).
- **README:** **siempre en inglés** (ver Step 3).
- Todas las rutas son relativas a `PROJECT_ROOT` (la carpeta con `AGENTS.md` y `modes/`). Los references están en `.agents/skills/coderhub-readme-github/references/`.

## Pre-requisitos

- `cv.md` y `config/profile.yml` con contenido real. Si faltan: *"Todavía no tengo tu CV cargado. Corré primero `/coderhub interview` y volvemos."* y pará.
- **Usuario de GitHub:** sale de `candidate.github` en `config/profile.yml` (ej. `github.com/usuario` → `usuario`). Si no está, preguntalo. Con `gh` o con la API pública se traen los proyectos reales.

## Datos del cliente

No hay un archivo de perfil aparte. **No crees archivos de datos nuevos.**

| Qué necesito | De dónde |
|---|---|
| Nombre, usuario de GitHub, links (LinkedIn, portfolio, email) | `config/profile.yml` → `candidate.*` |
| Rol actual, años, stack, logros con números | `cv.md` (+ `article-digest.md`, + `narrative.proof_points` de `profile.yml`) |
| Rol target | `target_roles` de `profile.yml` y "Your Target Roles" de `modes/_profile.md` |
| Diferenciador | `narrative.headline` / `narrative.superpowers` y "Cross-cutting Advantage" de `modes/_profile.md` |
| Reglas que el cliente ya marcó | Sección `## coderhub-readme-github` de `modes/_custom.md`, si existe |

## Outcome

- Un `README.md` de perfil listo para pegar en `usuario/usuario`, guardado en `output/github/{YYYY-MM-DD}_readme-perfil.md`.
- Método CoderHub: hero de posicionamiento, value prop con números, stack curado (4-6), **proyectos con outcome** (la estrella), connect compacto, personalidad opcional en `<details>`.
- Instrucciones para publicarlo.
- Coherente con el CV y el LinkedIn (`/coderhub linkedin`): misma historia.

## Step 1 — Leer los datos y la quality bar

1. Leé `cv.md`, `config/profile.yml`, `modes/_profile.md` y, si existen, `article-digest.md` y `modes/_custom.md`. Extraé: identidad, rol + años, stack (principal + AI si usa), logros con números, rol target, diferenciadores.
2. **Leé `references/quality-bar.md` antes de generar**: profile vs project README, hero de posicionamiento, proyectos como prueba, señal vs decoración, anti-patterns. Es el nivel a igualar.
3. Si falta el usuario de GitHub, preguntalo.

## Step 2 — Traer los proyectos y la actividad reales

GitHub es una fuente gratis y sin setup. Traé material real: no inventes proyectos.

```bash
gh api users/{usuario} --jq '"desde \(.created_at[0:10]) · repos:\(.public_repos) · followers:\(.followers)"'
gh api "users/{usuario}/repos?sort=pushed&per_page=100" --jq 'sort_by(-.stargazers_count)[] | select(.fork==false) | "\(.name) ⭐\(.stargazers_count) · \(.language // "?") · \(.description // "")· \(.html_url)"'
```

**Curá (quality-bar §4):** elegí **3-8 proyectos**: los que tienen estrellas, un producto real o deployado, o son relevantes al **rol target** (un proyecto de AI o agentes hoy es un diferencial fuerte). **Nunca** los vuelques todos ni listes sandboxes de aprendizaje o tutoriales (señalizan junior). Si un repo relevante no tiene descripción, inferí qué resuelve de su contenido (`gh api repos/{usuario}/{repo}/readme`) o preguntale al cliente: no inventes el outcome.

Si el cliente **no tiene proyectos públicos fuertes**, no fuerces la sección: apoyate en value prop + experiencia + (si escribe) un feed de blog.

## Step 3 — Idioma y arquetipo

- **Idioma: siempre inglés.** Regla dura de CoderHub: el profile README es una superficie **global y profesional** (recruiters internacionales, roles remotos en dólares). Va en inglés aunque el cliente apunte solo a LATAM y aunque `language.output` diga otra cosa. No mezcles idiomas.
- **Arquetipo (quality-bar §7):** por default **Descriptive + Projects curados + Badges seleccionados** (+ toque Minimalistic). Evitá "A Little Bit of Everything". Sumá un **auto-feed** (blog o releases) solo si el cliente tiene contenido real que mostrar (§6).

## Step 4 — Escribir el README (por bloques)

Estructura canónica (quality-bar §2), con los datos reales:

1. **Hero:** posicionamiento en 1 línea: *qué construís + para quién + diferenciador*. Nada de "Hi 👋" ni typing SVG. Opcional: banner con el tagline (`/coderhub banner` lo genera en `output/github/assets/banner.png`).
2. **Value prop** (blockquote): 2-3 frases con al menos **un número** + rol actual + qué shippeás.
3. **Stack:** 4-6 badges de shields.io del stack **real** (incluí AI si aplica). No 20.
4. **Proyectos:** 3-8 curados. Cada uno: `**[nombre](link)**` + tag (`open source`/`private`) + qué resuelve (1 línea) + outcome o número + *stack en itálica*. El reframe *"Not a X. A Y."* solo en los 2-3 que lo merecen, y nunca si existe `voice-dna.md` (prohíbe los paralelismos negativos).
5. **Experiencia** (opcional): rol y empresa actual + 1 línea. Link a la empresa solo si está en `cv.md` o el cliente te lo da; si no, el nombre solo. Con stealth on (sección `## Stealth` de `modes/_profile.md`), nada que muestre que está buscando.
6. **Connect:** fila compacta de badges: LinkedIn, portfolio, email, CV.
7. **Personalidad** (opcional): random facts en `<details>` + quote de cierre.

**Confirmá bloque por bloque** con el cliente (sobre todo el hero y qué proyectos entran): es su marca personal.

## Step 5 — Humanizar (anti-slop)

Antes de entregar, pasá el texto por el filtro anti-slop (quality-bar §8 y `.agents/skills/coderhub-linkedin/references/bullets.md` §3): fuera "passionate about", "always learning" y los slogans genéricos. Cada frase dice algo específico o se va. Cero decoración (typing, visitor counter, snake, trophy, spotify, memes, gifs de bienvenida). Rigen también `modes/_writing.md` y `voice-dna.md` si existe.

## Step 6 — Guardar e instrucciones para publicarlo

1. Guardalo en `output/github/{YYYY-MM-DD}_readme-perfil.md` (creá `output/github/` si no existe). Mostrá la ruta.
2. Instrucciones:
   ```
   Para que se vea en tu perfil, el archivo va en un repo especial con TU MISMO nombre de usuario:
   1. Creá el repo público  github.com/{usuario}/{usuario}
   2. Pegá este contenido como README.md en la raíz
   3. Commit → aparece arriba de tu perfil al instante
   ```
   Si el repo ya existe, es reemplazar su `README.md`. Si usás el banner, subí `banner.png` a `assets/` del mismo repo.
3. Recordá la **coherencia**: que el rol target y los logros coincidan con su CV y su LinkedIn.

No crees el repo ni pushees nada por el cliente: le das el archivo y los pasos.

## Reglas

- **Profile README ≠ project README.** Nada de installation, usage, contributing, license, coverage ni TOC. Es una landing page profesional: posicionamiento + prueba + contacto.
- **Hero = posicionamiento, no saludo.** Prohibido "Hi 👋 welcome to my profile" y el typing SVG genérico. Primera línea = qué construís + para quién + diferenciador.
- **Los proyectos son la prueba y salen del GitHub real.** Curá 3-8 (calidad > catálogo), cada uno con link + outcome + stack. Nunca inventes proyectos ni outcomes; nunca vuelques sandboxes ni tutoriales.
- **Señal, no decoración.** Fuera visitor counters, typing SVG, snake, trophy, spotify, memes, gifs de bienvenida, fancy fonts. Stack = 4-6 badges reales. Si un widget solo se explica como "es lindo", va afuera.
- **Coherencia con CV y LinkedIn.** Mismo rol target, mismos logros con números, mismo stack priorizado.
- **Anti-slop.** Cero "passionate about", "always learning" o slogans genéricos.
- **Siempre en inglés**, aunque el cliente apunte solo a LATAM.
- **Números: nunca inventados.** Solo los de `cv.md`, `article-digest.md`, `profile.yml` o los que el cliente te dé en la charla.

## Si el cliente marca un problema

Si el cliente marca algo (un proyecto flojo, decoración de más, el hero genérico), proponé sumar la regla con la fecha de hoy a la sección `## coderhub-readme-github` de `modes/_custom.md` (creala si no existe) y escribila solo con su OK. Este `SKILL.md` lo pisa cada update; `modes/_custom.md` es del cliente y no se toca.

## Troubleshooting

- **No tiene proyectos públicos fuertes:** no fuerces la sección; apoyate en value prop + experiencia + feed de blog si escribe. Un README corto y bien posicionado le gana a uno lleno de repos flojos.
- **`gh` no está o no está logueado:** usá la API pública (`https://api.github.com/users/{usuario}/repos`) o pedile que pegue sus proyectos destacados.
- **El README no aparece en el perfil:** el repo tiene que llamarse exactamente igual que el usuario, ser **público** y tener el `README.md` en la raíz.
