# Módulo 6 — Prospección y networking

Los mensajes los arma CoderHub (`/coderhub contacto` y este ejercicio). Lo que el cliente pone: su diferencial, a quién quiere llegar y el foco de la búsqueda (rol, empresas, país), que además define qué ofertas busca `/coderhub scan`.

## 6-0 · Introducción

Sin ejercicio. Ofrecé arrancar con la 6-1.

## 6-1 · Tu marca personal como punto de partida

| # | Pregunta | Tipo | Prellenar desde |
|---|---|---|---|
| 1 | Cuando alguien entra hoy a tu LinkedIn, qué creés que piensa de vos en 10 segundos | B | — |
| 2 | Qué se nota más hoy en tu perfil: experiencia técnica, creatividad, liderazgo, comunicación clara, potencial sin explotar, perfil confuso | B | — |
| 3 | Qué NO te gustaría que piensen de vos profesionalmente | B | — |
| 4 | Qué sabés hacer bien y además disfrutás | B | — |
| 5 | En qué situaciones otras personas suelen pedirte ayuda u opinión | A+B | — |
| 6 | "Me diferencio porque…" | B | — |
| 7 | Mapa de 5 personas clave (están donde querés estar o te pueden acercar): nombre, rol, empresa, por qué es clave | A | `data/contacts.tsv`, personas de la 3-4 |
| 8 | Frecuencia posible para vos hoy (1 post por mes, 2+ comentarios por semana) y tipo de contenido (reflexiones, aprendizajes, proyectos propios, opinión del sector) | B | — |

**Regla de calidad:** el diferencial (6) no puede ser genérico: "proactivo", "me adapto rápido", "apasionado", "trabajo en equipo" se rechazan y se repregunta con la 5: *"Cuando te piden ayuda, qué te piden?"*. La frecuencia tiene que ser realista: mejor 1 post por mes cumplido que 1 por semana que no pasa.

**Destinos:**
- 6 → `modes/_profile.md` → `## Your Cross-cutting Advantage` (línea `**In the candidate's words:**`).
- 7 → `data/contacts.tsv`.
- El resto, el cuaderno.

**Habilita:** el diferencial aparece en tu CV, tu LinkedIn y tus respuestas de entrevista. Próxima: 6-2.

## 6-2 · Prospección 1.0

| # | Pregunta | Tipo | Prellenar desde |
|---|---|---|---|
| 1 | Rol al que apuntás hoy | A | `target_roles.primary`, lección 1-2 |
| 2 | Tipo de empresa: startups, medianas, corporaciones, indistinto | A | lección 1-3 |
| 3 | País o región objetivo | A | `location.country`, `compensation.location_flexibility` |
| 4 | Invitaciones por día que vas a mandar y qué días (LinkedIn deja unas 100 por semana) | C | — |
| 5 | Qué preguntas vas a usar para abrir conversaciones (cómo llegaste a ese rol, qué se valora en tu puesto, qué skills priorizarías si empezaras de nuevo, cómo es el proceso de selección, dónde están buscando perfiles así) | C | — |

**Regla de calidad:** un rol (no tres), un tipo de empresa preferido y una región. Si el cliente dice "cualquier cosa", repreguntá con lo que ya respondió en la 1-3.

**Destinos:**
- 1 → `target_roles.primary` (si cambió).
- 3 → `location.country` y `compensation.location_flexibility` (si cambió).
- 2 → `modes/_profile.md` → `### Company preferences`.

**Habilita:** `/coderhub scan` busca ofertas para ese rol y esa región, y el puntaje de cada oferta mira si la empresa es del tipo que buscás. Ofrecé correr un `scan`. Próxima: 6-3.

## 6-3 · Prospección 2.0

| # | Pregunta | Tipo | Prellenar desde |
|---|---|---|---|
| 1 | Cuántos posts viste esta semana de gente que consiguió trabajo o fue promovida | C | — |
| 2 | Un post real: el comentario público que dejarías | C | el cliente pega el post (o nombre, empresa y rol nuevo); vos armás el borrador |
| 3 | El mensaje privado después del comentario | C | ídem; usá el rol de la 6-2 |

**Regla de calidad:** el comentario felicita algo concreto, no "felicitaciones!". El mensaje privado es corto, nombra el rol que busca y no suena a plantilla.

**Destinos:** la persona → `data/contacts.tsv` (`type: peer` u `other`, `notes: workbook 6-3`). La lección queda en `accion-pendiente` hasta que lo manda.

**Habilita:** una vía de entrada que no compite con 300 postulaciones. Próxima: 6-4.

## 6-4 · Prospección 3.0

| # | Pregunta | Tipo | Prellenar desde |
|---|---|---|---|
| 1 | Tenés LinkedIn Premium? | A | — |
| 2 | Con Premium: rol que vas a buscar, cuántos recruiters vas a contactar por semana y tu mensaje | C | rol de la 6-2; el mensaje lo armás vos y el cliente lo ajusta |
| 3 | Sin Premium: las búsquedas de esta semana (`"{rol}" AND "hiring"`, `"{rol}" AND "looking for"`, `"{rol}" AND "join our team"`) | C | armalas vos con el rol de la 6-2 y sus variantes (`/coderhub titles` sugiere títulos adyacentes) |

**Regla de calidad:** el mensaje al recruiter dice qué rol busca, una prueba concreta (un logro de la 1-4) y una pregunta fácil de responder.

**Destinos:** los recruiters que contacte → `data/contacts.tsv` (`type: recruiter`). `accion-pendiente` hasta que vuelve con `listo`.

**Habilita:** búsqueda activa además de las ofertas que encuentra `scan`. Próxima: 7-1.

## 6-5 · Más plantillas para mensajes (bonus)

Sin ejercicio. Para un mensaje puntual, `/coderhub contacto`.
