# Módulo 4 — CV que pasa filtros

Buena parte de este módulo CoderHub OS ya lo hace solo: las keywords de cada oferta (`/coderhub oferta`), el CV a medida (`/coderhub pdf`) y el chequeo de ATS (`/coderhub ats`). El ejercicio pasa a ser **revisar lo que hizo la IA y mejorar la materia prima** (`cv.md`).

En Skool el módulo tiene 6 lecciones y el workbook ejercicios en 3: la 4-1, la 4-3 y la 4-5.

## 4-0 · Introducción

Sin ejercicio. Ofrecé arrancar con la 4-1.

## 4-1 · Cómo crear un CV que pase los filtros ATS

| # | Pregunta | Tipo | Prellenar desde |
|---|---|---|---|
| 1 | Una oferta que te interese: palabras clave por tipo (herramienta o lenguaje, soft skill, certificación o metodología) y cómo incluirlas en tu CV | C | una oferta ya evaluada en `reports/` (su bloque de keywords). Si no hay ninguna, pedile que pegue una JD y corré `/coderhub oferta` |
| 2 | Qué cambios harías para que tu CV sea más legible para un ATS | A | `cv.md`: secciones (perfil, experiencia, educación, habilidades, idiomas) y formato |
| 3 | Tres frases de tu CV reescritas con verbos de acción | A | bullets débiles de `cv.md` ("Responsable de", "Encargado de", "Participé en"): proponé la versión con verbo de acción y resultado, el cliente corrige |

**Regla de calidad:** un verbo de acción + qué hiciste + resultado. Sin números inventados: si el cliente no tiene el número, va sin número.

**Destinos:** 3 → `cv.md` (antes → después de cada bullet, con OK). Lo demás, el cuaderno.

**Habilita:** cada CV a medida que genera `/coderhub pdf` parte de bullets más fuertes. Las keywords por oferta las agrega CoderHub solo. Próxima: 4-3.

## 4-2 · Usá la plantilla Typst

Sin ejercicio: la plantilla la reemplaza `/coderhub pdf`, que genera el CV con formato ATS-friendly a partir de `cv.md`. Ofrecé correrlo.

## 4-3 · Método Harvard, el CV infalible

| # | Pregunta | Tipo | Prellenar desde |
|---|---|---|---|
| 1 | Tu CV con la estructura y el formato del método | C | — |

**Lo hace `/coderhub pdf`**: el CV que genera ya sigue un formato limpio de una columna, con texto seleccionable y secciones estándar. Ofrecé generarlo para una oferta (o general, si no tiene ninguna) y revisarlo juntos. Si prefiere seguir con su plantilla propia, también vale: anotalo.

**Destinos:** solo el cuaderno (qué CV generó y para qué oferta).

**Habilita:** CV listo para mandar. Próxima: 4-5.

## 4-4 · La carta de presentación (cover letter)

Sin ejercicio en el workbook. La genera `/coderhub cover` para cada oferta. Si hizo la 2-2, esa carta ya está como muestra de su voz.

## 4-5 · Errores comunes y cómo evitarlos

| # | Pregunta | Tipo | Prellenar desde |
|---|---|---|---|
| 1 | Checklist: título y contacto visibles, resumen actualizado, logros medibles, skills agrupadas, formato pedido, keywords del puesto, ortografía, sin elementos visuales que rompan el ATS | A | revisá `cv.md` vos y marcá qué cumple y qué no |
| 2 | Errores que corregiste: muy largo, información irrelevante, ortografía, formato inconsistente, tablas o logos, idiomas mezclados, tercera persona, logros poco específicos | A | lo mismo: señalá los que encontraste en `cv.md` |
| 3 | Una experiencia reescrita: antes y después (frases cortas, verbos de acción, resultados) | A | elegí la experiencia más débil de `cv.md`, proponé el después, el cliente corrige |

**Regla de calidad:** el "después" es más corto que el "antes", empieza con verbos y muestra resultados.

**Destinos:** 3 → `cv.md` (antes → después, con OK).

**Habilita:** CV más fuerte en todas las versiones. Para medirlo: lección 4-6. Próxima: 5-1.

## 4-6 · Hora de ver su puntaje

Sin ejercicio propio en el workbook. Ofrecé `/coderhub ats` sobre el último CV generado (chequeo de compatibilidad con ATS) y, si quiere una nota externa, el Resume Checker de Silver Dev (`https://open.silver.dev/resume-checker`, objetivo: S). Anotá el resultado en la lección 4-5.
