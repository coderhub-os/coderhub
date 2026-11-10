# Módulo 5 — Portfolio técnico

El README de GitHub lo arma `/coderhub readme-github` y el portfolio web `/coderhub portafolio`. Este módulo junta la materia prima: qué proyectos muestran lo que sabe.

## 5-0 · Introducción

Sin ejercicio. Ofrecé arrancar con la 5-1.

## 5-1 · Portafolio: cómo demostrar lo que sabés

| # | Pregunta | Tipo | Prellenar desde |
|---|---|---|---|
| 1 | Tus 3 proyectos clave: qué problema resolvía, herramientas que usaste, qué aprendiste | A | `cv.md` (proyectos), `article-digest.md`, `narrative.proof_points` y sus repos públicos (`gh api users/{usuario}/repos?sort=pushed&per_page=100`, usuario de `candidate.github`) |

**Regla de calidad:** un problema real ("los turnos se pisaban") y no una tecnología ("una app en React"). Que al menos uno muestre algo relevante para el rol objetivo de la 1-3. Un tutorial seguido paso a paso no cuenta como proyecto clave.

**Destinos:** cada proyecto → `article-digest.md` (si no tiene bloque) y, el más fuerte, a `narrative.proof_points`.

**Habilita:** `/coderhub readme-github` y `/coderhub portafolio` ya saben qué proyectos mostrar. Próxima: 5-2.

## 5-2 · Optimizá tu perfil de GitHub

| # | Pregunta | Tipo | Prellenar desde |
|---|---|---|---|
| 1 | Auditoría: README de perfil con descripción clara, repos pineados elegidos, links de contacto y LinkedIn, feedback de un colega o mentor | C | revisá su perfil con `gh api users/{usuario}` y decile qué falta |
| 2 | Feedback que recibiste sobre tu perfil | A | — (después de pedirlo) |

**Lo hace `/coderhub readme-github`** (el README) y `/coderhub banner` (el banner). Ofrecé correrlos. Lo que hace el cliente: pinear los repos (sugerí cuáles, según la 5-1), pedir feedback. La lección queda en `accion-pendiente` hasta que vuelve con el feedback.

**Destinos:** solo el cuaderno.

**Habilita:** un GitHub que acompaña al CV. Próxima: 5-3.

## 5-3 · Plantillas y frameworks: tu portfolio online

| # | Pregunta | Tipo | Prellenar desde |
|---|---|---|---|
| 1 | Plantilla elegida, personalización (nombre y bio, links, al menos dos proyectos reales) y dónde lo deployaste | C | — |
| 2 | Link a tu portfolio online y al post donde lo compartiste | A | — (cuando lo tenga) |

**Lo hace `/coderhub portafolio`**: arma el sitio con sus datos y proyectos, sin plantilla que clonar. Ofrecé correrlo. Si prefiere una plantilla propia, ayudalo con la personalización. El post de lanzamiento: qué tecnologías usó, qué aprendió, cómo fue el proceso.

**Destinos:** el link del portfolio → `config/profile.yml` → `candidate.portfolio_url` (con OK, si está vacío o cambió).

**Habilita:** los CVs y el LinkedIn enlazan tu portfolio. Próxima: 6-1.
