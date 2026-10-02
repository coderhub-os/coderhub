---
name: coderhub-linkedin
description: >-
  CoderHub OS: optimiza el perfil de LinkedIn para aparecer en las búsquedas de
  LinkedIn Recruiter. Se invoca como `/coderhub linkedin`. Propone el texto de
  cada sección (Headline con 3 variantes, About, Experience, Skills, Featured,
  Projects, Education, URL, visibilidad y Open to Work) con los datos del
  cliente, respetando el modo stealth. No toca LinkedIn: devuelve los textos
  para pegar.
---

# CoderHub — LinkedIn

Optimiza el perfil de LinkedIn del cliente para que aparezca en las búsquedas que hacen los recruiters en LinkedIn Recruiter.

- **Charla:** en español con "vos", según `modes/_coderhub.md` (cargalo si no está en contexto).
- **Textos del perfil:** **siempre en inglés**, aunque `language.output` diga otra cosa. La versión en español sale después con `/coderhub traducir`.
- Todas las rutas son relativas a `PROJECT_ROOT` (la carpeta con `AGENTS.md` y `modes/`). Los references están en `.agents/skills/coderhub-linkedin/references/`.

## Datos del cliente (de dónde sale cada cosa)

No hay un archivo de perfil aparte: todo sale de los datos que el motor ya tiene. **No crees archivos de datos nuevos.**

| Qué necesito | De dónde |
|---|---|
| Nombre, email, LinkedIn, GitHub, portfolio, ubicación | `config/profile.yml` → `candidate.*`, `location.*` |
| Stack, roles, fechas, logros con números, educación, certificaciones | `cv.md` (+ `article-digest.md` si existe, + `narrative.proof_points` de `profile.yml`) |
| Rol target y seniority | `config/profile.yml` → `target_roles`, y "Your Target Roles" en `modes/_profile.md` |
| Remoto, países, disponibilidad | `config/profile.yml` → `location`, `compensation` |
| Diferenciador | `narrative.headline` / `narrative.superpowers` de `profile.yml` y "Cross-cutting Advantage" de `modes/_profile.md` |
| Idiomas y nivel de inglés | `cv.md` (sección de idiomas o skills) |
| Modo stealth | Sección `## Stealth` de `modes/_profile.md` (ver Step 2) |
| Voz del cliente | `modes/_writing.md`, `voice-dna.md` si existe y "Writing Style" de `modes/_profile.md` |

## Pre-requisitos

- `cv.md` y `config/profile.yml` existen y tienen contenido real.
- Si falta alguno: *"Todavía no tengo tu CV cargado. Corré primero `/coderhub interview` y volvemos."* No avances.

## Outcome

- **Capa visual e identidad** (recomendaciones, no texto para pegar): foto de perfil, banner y nombre visible. Ver Step 3.0.
- 9 secciones con texto listo para pegar:
  1. Headline (3 variantes, el cliente elige)
  2. About
  3. Experience (cada rol)
  4. Skills (las 50 más relevantes para su stack)
  5. Featured
  6. Projects
  7. Education
  8. URL personalizada
  9. Visibilidad y "Open to Work" (según modo stealth)
- Estrategia de keywords explicada.
- **Stealth ON** → toda la estrategia es "discreto pero visible para LinkedIn Recruiter".
- El documento final se guarda en `output/linkedin/` (Step 7).

---

## Step 1 — Leer los datos y validar

1. Leé `cv.md`, `config/profile.yml`, `modes/_profile.md` y, si existen, `article-digest.md` y `modes/_custom.md`.
2. Verificá que estén estos mínimos:
   - Identidad (nombre, URL de LinkedIn)
   - Stack técnico (principal + secundario)
   - Rol actual + roles previos
   - Logros con números
   - Rol target
3. Si falta algo, decile al cliente qué falta y pedíselo en la charla. Lo que te dé y sea un dato de CV (un logro, una métrica, un rol) va a `cv.md` **solo con su OK**, mostrándole el diff. Nunca lo inventes.

## Step 2 — Modo stealth

Leé `references/stealth-mode.md`.

- Buscá la línea `Stealth: on` o `Stealth: off` en la sección `## Stealth` de `modes/_profile.md`.
- Si no está, preguntá: *"Tu empresa actual puede enterarse de que estás buscando?"*. Con la respuesta, proponé agregar esto al final de `modes/_profile.md` y escribilo solo con su OK:

  ```markdown
  ## Stealth

  Stealth: on   <!-- on = la empresa actual no debe enterarse de la búsqueda -->
  ```

- **Stealth ON** → "Signal interest to recruiters" sí, frame verde público no; el engagement evita posts de hiring.
- **Stealth OFF** → frame verde opcional; el engagement puede incluir la búsqueda activa.

## Step 3 — Construir las secciones

**Antes de generar, leé `references/quality-bar.md`**: es el método CoderHub para un buen perfil (qué sí, qué no y por qué en cada sección). Para los bullets, leé `references/bullets.md`. Se copia el nivel y las reglas, nunca los datos de los ejemplos.

Usá las plantillas de `references/section-templates.md`. Cada sección se llena con los datos del cliente, no se inventa. Si `modes/_writing.md` o `voice-dna.md` prohíben algo que usan las plantillas (em dashes, ciertas palabras), ganan ellos. En las variantes A y C del headline, el stack va curado (las keywords del rol target), no entero (`quality-bar.md` §5).

### 3.0 Capa visual e identidad (foto · banner · nombre visible)

Es lo **primero que ve un humano** y donde más rinde el cambio, pero no es texto para pegar: son recomendaciones. Ver `quality-bar.md` §2-§4. Entregá:

- **Foto:** si la actual es formal-RRHH (traje, corbata, foto carnet), recomendá rehacerla: fondo claro, chomba o remera lisa, más luz, idealmente un fondo "de ingeniero". Se puede usar IA (ojo que cambia la cara: que siga siendo reconocible).
- **Banner:** stack completo (incluida AI), tipografía clara, alineado al headline. Ofrecé `/coderhub banner`, que lo genera en 3 estilos.
- **Nombre visible:** un solo nombre de pila + apellido.

Presentalo como checklist de la semana. No bloquea el resto.

### 3.1 Headline (3 variantes)

Generá 3 opciones con `references/section-templates.md`:

- **A — Keyword-heavy:** roles + tecnologías separadas por `·` + diferenciador + 🌍 si es remoto.
- **B — Narrativo:** rol + stack agrupado + "Building/Specialized in..." + Open to Remote (con stealth on, sin "Open to": dejá solo 🌍 Remote o nada).
- **C — Máximo SEO:** todo el stack apilado, separadores `·`, sin texto narrativo.

Mostrá las 3 y recomendá la que mejor balancea SEO y lectura humana para este perfil (respetando `quality-bar.md` §5: senior, sin eslóganes, sin cerrar el dominio):

```
HEADLINE — 3 opciones:

Opción A (keyword-heavy):
  {texto A}

Opción B (narrativo):
  {texto B}

Opción C (máximo SEO):
  {texto C}

Te recomiendo la {X} porque {razón basada en tu perfil}.

Cuál elegís? (A / B / C / mezcla)
```

### 3.2 About

1. **Línea 1 (lo único visible sin expandir):** rol + años de experiencia + stack core + 1 diferenciador.
2. **Líneas 2-3:** trayectoria + 1 logro con número de `cv.md`, sin nombrar la empresa actual (`quality-bar.md` §6).
3. **"What I bring to the table:"** 4-6 bullets agrupando capacidades.
4. **🌍 disponibilidad + 🗣️ idiomas.**
5. **Tech Stack:** todas las skills separadas por `·` (LinkedIn indexa este bloque).
6. **CTA + links.**

Stealth ON → CTA **"Open to new opportunities — let's connect!"**. Stealth OFF → puede ser **"Actively seeking new opportunities — let's chat!"**.

### 3.3 Experience (por cada rol)

Para cada rol de `cv.md` (curado según `quality-bar.md` §9):
1. Título sugerido alineado al target, con keywords.
2. Descripción:
   - 1 línea de contexto
   - "Key achievements:" con 4-5 bullets en el rol más reciente y hasta 3 en los anteriores (cap de `references/bullets.md`)
   - Cada bullet: verbo de acción + qué hizo + tecnologías + métrica si la hay
   - Última línea: "Tech stack: X · Y · Z"

### 3.4 Skills (50 máximo)

Tres grupos:

- **Obligatorias (~15):** las más buscadas del stack principal.
- **Importantes (~25):** stack secundario + soft skills (Project Management, Team Leadership, etc.).
- **Tendencia/IA (~10):** AI Agents, Claude AI, MCP, Prompt Engineering, LLM Integration (solo las que el cliente usa de verdad).

Recomendá: top 3 visibles = las 3 más buscadas para el rol target; sacar las irrelevantes; pedir endorsements.

### 3.5 Featured

Qué destacar según sus links: portfolio, certificaciones, posts técnicos, demo de un proyecto.

### 3.6 Projects

Por cada logro con número de `cv.md`, un Project: nombre (con métrica si aplica), 2-3 líneas de descripción, tecnologías.

### 3.7 Education

Lo que está en `cv.md`. Sugerí 1 línea con materias relevantes al stack target.

### 3.8 URL personalizada

`linkedin.com/in/{nombre-apellido}` si está disponible, o mantener la actual.

### 3.9 Visibilidad y Open to Work

Según `references/stealth-mode.md`:

| Setting | Stealth ON | Stealth OFF |
|---|---|---|
| Open to Work visible para todos (frame verde) | ❌ No | Opcional (ver `quality-bar.md` §13) |
| Open to Work visible solo para recruiters | ✅ Sí | ✅ Sí |
| Signal interest to recruiters | ✅ Sí | ✅ Sí |
| Profile viewing options | "Your name and headline" | "Your name and headline" |
| Share profile updates with network | Discrecional | ✅ Sí |

Open to Work con: títulos (rol target + variantes), tipos (Full-time/Contract/Freelance según el objetivo), ubicaciones (Remote/país/Worldwide de `profile.yml`), fecha de inicio ("Immediately"/"Flexible").

## Step 4 — Estrategia de keywords

Después de los textos, explicá cómo pesa cada campo en LinkedIn Recruiter (`references/linkedin-seo-strategy.md`). Cerrá con las 10-15 keywords prioritarias para su rol target y en qué campos tienen que aparecer.

## Step 5 — Engagement (según stealth)

Acciones diarias y semanales para sumar visibilidad orgánica, según `references/engagement-strategy.md`.

## Step 6 — Documento final

Un documento con:

1. 🎨 Capa visual (foto · banner · nombre visible): checklist de la semana
2. ✅ Cambios sección por sección (textos listos para pegar)
3. 🎯 Keywords prioritarias y dónde van
4. 📅 Plan de engagement de esta semana
5. ⚙️ Settings a verificar
6. 📊 Una métrica esperada (ej. "30-50% más profile views en 14 días si aplicás todo")

Los encabezados y explicaciones del documento van en español; los textos para pegar, en inglés.

## Step 7 — Guardar

Guardalo en `output/linkedin/{YYYY-MM-DD}_linkedin-optimizado.md` (creá `output/linkedin/` si no existe). Mostrale la ruta para que lo tenga a mano mientras pega sección por sección, y ofrecé `/coderhub traducir` para la versión en español.

## Reglas

1. **El modo stealth no se negocia.** Si está ON, nunca recomiendes acciones públicas que delaten la búsqueda.
2. **Confirmá antes de cada sección.** El cliente aprueba o ajusta cada bloque antes de pasar al siguiente.
3. **Nunca toques LinkedIn.** Devolvés textos y el cliente los pega. Es deliberado: que los revise una vez más y se sienta dueño del cambio.
4. **No inventes logros ni números.** Solo los de `cv.md`, `article-digest.md` o `profile.yml`, o los que el cliente te dé en la charla (y que se sumen a `cv.md` con su OK).
5. **Idioma:** textos del perfil en inglés; la charla y las explicaciones, en español. El español del perfil sale con `/coderhub traducir`.
6. **CV y LinkedIn cuentan la misma historia:** mismo rol target, mismos logros. Si algo cambia acá y no está en `cv.md`, avisá.
