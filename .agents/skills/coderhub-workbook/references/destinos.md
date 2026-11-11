# Destinos: cómo se escribe en cada archivo

Cada ficha de lección dice a qué archivo va cada dato. Acá está **cómo** se escribe en cada uno. Los modos y scripts de CoderHub OS leen estos archivos con formatos fijos: respetalos al pie de la letra.

Reglas comunes:

- Todo con OK del cliente (Step 5 del `SKILL.md`), mostrando antes → después si ya había algo.
- Escribís **lo que el cliente confirmó**, no tu versión mejorada.
- Los archivos de datos del cliente están en `DATA_ROOT` y son suyos: el updater nunca los toca y no se suben a GitHub.

## `config/profile.yml`

YAML. Editá solo las claves de abajo y dejá el resto como está (comentarios incluidos). Si la clave padre no existe, creala.

| Dato del workbook | Clave | Formato |
|---|---|---|
| Rol objetivo (1-2, 6-2) | `target_roles.primary` | lista de títulos, en el idioma en que se publican las ofertas (`"Backend Engineer"`) |
| Especialización / caminos (1-2, 8-3) | `target_roles.archetypes` | `- name: "Backend Engineer"`, `level: "Semi Senior"`, `fit: primary\|secondary\|adjacent` |
| Banda: mínimo aceptable (1-3) | `compensation.minimum` | solo el número, con coma de miles: `"2,500"` |
| Banda: justo de mercado y aspiracional (1-3) | `compensation.target_range` | `"3,200-4,000"` (justo-aspiracional) |
| Moneda (1-3) | `compensation.currency` | `"USD"`, `"ARS"`, `"EUR"`… |
| Modalidad y beneficios de ubicación (1-3) | `compensation.location_flexibility` | texto corto: `"Remoto 100%. Híbrido solo en CABA."` |
| País (6-2) | `location.country` | solo si está vacío o el cliente lo corrige |
| Headline / pitch en una línea (3-1, 7-3) | `narrative.headline` | una línea |
| Fortalezas con prueba (1-1, 6-1) | `narrative.superpowers` | lista de 3-5 frases cortas, cada una con un hecho |
| Logros clave (1-4, 5-1) | `narrative.proof_points` | `- name:`, `url:` (solo si existe), `hero_metric:` |

**Montos de la banda:** `salary-gap.mjs` los lee con `parseAmount()` (`providers/_salary-text.mjs`), que descarta cualquier string con texto alrededor del número. Por eso van **sin moneda, sin período y con coma de miles**: `"2,500"`, `"3,200-4,000"`, `"120,000-150,000"` (o `"3.2k-4k"`). Nunca `"USD 2.500"`, `"3.200/mes"` ni `"$3K/month"`: el script los descarta y la banda no cuenta. La moneda va en `compensation.currency`. Mensual o anual (no conviertas): como comentario en la misma línea (`target_range: "3,200-4,000"  # USD/month — CoderHub workbook 1-3`) y en `## Your Comp Targets` de `modes/_profile.md`.

Si el valor que ya hay no cumple esto (por ejemplo `"$8,000-12,000/month"`), mostralo en el antes → después y proponé el formato nuevo aunque los números no cambien.

## `modes/_profile.md`

Markdown, del cliente. Lo leen los modos de evaluación, CV y entrevista. Tiene secciones fijas (`## Your Target Roles`, `## Your Exit Narrative`, `## Your Cross-cutting Advantage`, `## Your Comp Targets`, …): no las borres ni las renombres. `doctor.mjs` (vía `lib/personalization.mjs`) chequea esas secciones por su título exacto, y mientras alguna sigue con el texto del template, las evaluaciones puntúan contra los arquetipos del autor del template y no contra los del cliente.

Dos lecciones escriben **en las secciones fijas**, no solo en la sección del workbook:

- **1-2 → `## Your Target Roles`.** Es una tabla `| Archetype | Thematic axes | What they buy |`. Si la sección sigue siendo el template (`node doctor.mjs --json` lista `targetRoles` en `unpersonalized`), proponé reemplazar las filas de ejemplo por una fila por cada arquetipo de `target_roles.archetypes`, con los temas que el cliente confirmó como ejes. Dejá el encabezado de la tabla y no copies las filas de ejemplo. Si ya está personalizada, agregá una fila solo si el arquetipo es nuevo.
- **1-3 → `## Your Comp Targets`.** Una línea al principio de la sección, debajo del comentario si lo hay: `Target range: 3,200-4,000 USD/month (fair–aspirational). Minimum: 2,500 USD/month. Source: CoderHub workbook 1-3.` Si ya hay una línea `Target range:`, reemplazala (antes → después). El resto de la sección (la guía general) queda como está.

Lo demás del workbook va en **una sección propia al final**, `## Your CoderHub Workbook Context`, con estas subsecciones (`###`). Creá la sección si no existe y reemplazá solo la subsección que cambió:

```markdown
## Your CoderHub Workbook Context

<!-- Escrito por /coderhub workbook a partir de las respuestas del cliente. Fuente: data/workbook.md -->

### Skills and gaps
- **Strong:** Java, Spring Boot, SQL (1-1, 1-2)
- **Gaps to close:** system design, Kubernetes (1-2)
- **Soft skills:** …
- **English:** B2 (test digispeak, 2026-11-06). Weak spots: speaking fluency (1-1)

### Technical self-assessment (8-2)
| Topic | Level |
|---|---|
| Big-O | medium |

### Company preferences (1-3, 6-2)
- **Company types:** startup, corpo técnica
- **Benefits that matter:** remoto, cursos
- **Current comp:** USD 1.800/mes (private, never share in applications)

### Pitch (7-3)
Who I am / what I do / what sets me apart / what I want, in the candidate's words.

### Interview focus (8-3)
- **Evaluated most in my role:** …
- **Unlikely to be asked:** …
```

- Los labels en inglés (como el resto del archivo); los valores en el idioma en que los dio el cliente.
- El diferencial de 6-1 va además en `## Your Cross-cutting Advantage`: agregá una línea `**In the candidate's words:** …` debajo del texto que haya, sin borrarlo.
- El sueldo actual es **privado**: dejalo marcado así y nunca lo uses en formularios ni mensajes.

## `article-digest.md`

Los proof points (logros y proyectos con números). Lo leen la evaluación de ofertas, `apply` y la generación de CVs. Un bloque por logro o proyecto, separados por `---`:

```markdown
---

## {Nombre del proyecto o logro} -- {qué es, en 3-6 palabras}

**Hero metrics:** {el resultado con número, como lo confirmó el cliente}

**Stack:** {herramientas}

**Proof points:**
- {impacto concreto}
- {lo que aprendió o la decisión técnica clave}

**Source:** CoderHub workbook {X-Y}, user-stated {YYYY-MM-DD}
```

Si el archivo no existe, creálo con el encabezado `# Article Digest -- Proof Points` y una línea que diga que lo arma el cliente. Si el mismo proyecto ya tiene bloque, proponé sumar los puntos nuevos a ese bloque en vez de duplicarlo.

## `interview-prep/story-bank.md`

Las historias STAR+R. Lo leen `interview-prep`, `apply`, `npm run star`, `negotiation-roi.mjs` y `story-provenance-check.mjs` **con un formato literal**. Si el archivo no existe, creálo copiando `templates/story-bank.template.md`.

Cada historia es un bloque `### ` bajo `## Stories`, exactamente así:

```markdown
### [Theme] Story Title
**Source:** CoderHub workbook 7-1
**S (Situation):** El contexto, en una línea.
**T (Task):** De qué era responsable.
**A (Action):** Qué hizo él, concreto.
**R (Result):** Qué cambió.
**Reflection:** Qué aprendió o qué haría distinto.
**Best for questions about:** conflict, pressure, failure
**Provenance:** user-stated 2026-11-06
```

- Labels **en inglés**, siempre. El contenido, en el idioma en que lo contó el cliente.
- `**A (Action):**` es obligatorio: sin eso `npm run star` no ve la historia.
- Un campo por línea. Sin tablas, sin `#`/`##` y sin bloques de código dentro de una historia.
- `**Provenance:**` va solo si **el cliente confirmó los números** de la historia, con exactamente `user-stated YYYY-MM-DD`. Si dijo que no puede confirmarlos: `user-cannot-confirm`. Si la historia no tiene números, no pongas la línea. Nada después del valor.
- `[Theme]`: una palabra o dos en inglés (`[Failure]`, `[Conflict]`, `[Achievement]`, `[Pressure]`, `[Teamwork]`, `[Learning]`).

## `data/contacts.tsv`

La agenda de la búsqueda (lo lee `contacts.mjs`). Una persona por línea, separada por **tabs**, sin encabezado (puede haber una primera línea de comentario con `#`):

```
{name}\t{company}\t{type}\t{title}\t{phone}\t{email}\t{linkedin}\t{tracker#|-}\t{notes}
```

- `type`: `recruiter`, `hiring-manager`, `peer`, `interviewer`, `internal-referral` u `other`.
- Mínimo: nombre y empresa. Los canales que no hay, vacíos. Tracker: `-`.
- `notes`: `workbook 3-4: por qué es clave`.
- Si la persona ya está (mismo nombre y empresa), actualizá esa línea en vez de agregar otra.

## `writing-samples/`

Muestras de cómo escribe el cliente (las usa la generación de voz). Un archivo por texto: `writing-samples/workbook-{X-Y}-{slug}.md`, con el texto tal cual lo escribió, sin correcciones. Solo si el cliente quiere.

## `cv.md`

Solo en la lección 4-5 (reescribir bullets). Proponé el cambio como antes → después de cada bullet y aplicá solo los que el cliente aprueba. No toques el resto del CV. Si quiere un CV nuevo para una oferta, eso es `/coderhub pdf`.
