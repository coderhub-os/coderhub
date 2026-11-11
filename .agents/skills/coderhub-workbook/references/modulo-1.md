# Módulo 1 — A qué rol apuntar

Cómo leer una ficha: **Preguntas** (con su tipo A/B/C y de dónde prellenar), **Regla de calidad** (cuándo repreguntar), **Destinos** (formato en `destinos.md`), **Habilita** (lo que decís al cerrar).

## 1-0 · Introducción

Sin ejercicio. Ofrecé arrancar con la 1-1.

## 1-1 · En dónde estás parado hoy

Autodiagnóstico: habilidades, FODA, motivaciones y nivel de inglés.

| # | Pregunta | Tipo | Prellenar desde |
|---|---|---|---|
| 1 | Habilidades técnicas que dominás | A | `cv.md` (skills y stack de cada experiencia), `profile.yml` |
| 2 | Habilidades blandas que te destacan | A | `cv.md` (logros que las muestran); si no hay, preguntá |
| 3 | Áreas donde te gustaría mejorar | B | — |
| 4 | FODA: fortalezas, oportunidades, debilidades, amenazas (en relación a tu desarrollo profesional) | B | podés mostrar las fortalezas de la 1 como punto de partida, el resto lo escribe el cliente |
| 5 | Qué te motiva a crecer profesionalmente | B | — |
| 6 | Qué miedos o creencias te bloquean | B | — |
| 7 | Qué podrías hacer esta semana para dar un paso hacia tu objetivo | B | — |
| 8 | Test de inglés: resultado y áreas a reforzar | C | link: `https://englishtest.digispeak.site/` |

**Regla de calidad:** honesto y concreto. Una fortaleza sin un hecho atrás ("soy responsable") se repregunta: *"Cuándo se notó eso? Contame una situación."* Las debilidades no se maquillan. En 7, una acción chica y con fecha, no "mejorar mi inglés".

**Destinos:**
- 1, 2, 3 y 8 → `modes/_profile.md` → `### Skills and gaps` (Strong, Soft skills, Gaps to close, English).
- Fortalezas del FODA con un hecho atrás → `config/profile.yml` → `narrative.superpowers` (proponé 3 como máximo).
- 5, 6, 7 y el resto del FODA → solo el cuaderno.

**Habilita:** el nivel de inglés pesa en el puntaje de las ofertas que piden inglés y las fortalezas alimentan el resumen del CV y el LinkedIn. Próxima: 1-2.

## 1-2 · Tu camino técnico y tu especialización

Contrastar el stack propio contra el roadmap del rol.

| # | Pregunta | Tipo | Prellenar desde |
|---|---|---|---|
| 1 | Rol que elegiste | A | `profile.yml` → `target_roles.primary`, lección 1-1 |
| 2 | Qué ya dominás del roadmap (`https://roadmap.sh`) | A | `cv.md` + 1-1. Podés listar los temas del roadmap del rol y marcar los que el CV ya prueba |
| 3 | Qué te falta aprender | A | lo que el roadmap pide y el CV no muestra (proponelo, el cliente confirma) |
| 4 | Qué te gustaría mejorar o explorar más adelante | B | — |

**Regla de calidad:** "lo domino" = lo usaste en un proyecto o trabajo, no "vi un curso". Si en 3 aparecen más de 5 temas, pedí que elija los 3 que más pesan para el rol.

**Destinos:** 1 → `target_roles.primary` y `target_roles.archetypes` (si cambió), y `modes/_profile.md` → `## Your Target Roles` (ver `destinos.md`). 2 y 3 → `modes/_profile.md` → `### Skills and gaps`.

**Habilita:** `/coderhub upskill` cruza estos gaps con lo que piden las ofertas que evaluaste. Es imprescindible antes de la primera 1:1 con el mentor. Próxima: 1-3.

## 1-3 · Seniority, modo de trabajo y salario

Expectativas económicas y laborales.

| # | Pregunta | Tipo | Prellenar desde |
|---|---|---|---|
| 1 | Sueldo actual (0 si estás sin trabajo) | A | — (preguntá; es privado) |
| 2 | Banda: mínimo aceptable, justo de mercado y aspiracional | A | `profile.yml` → `compensation` si ya hay algo |
| 3 | Moneda, y si es mensual o anual | A | `profile.yml` → `compensation.currency` |
| 4 | En qué mundo querés alcanzarla (startup, corpo técnica, big four, empresa no tech) y por qué | A+B | — |
| 5 | Beneficios que valorás (flexibilidad, remoto, cursos, otros) | A | — |

**Regla de calidad:** la banda tiene tres números distintos y en orden (mín < justo < aspiracional). Si el aspiracional es más del doble del actual, preguntá en qué se basa (no lo bajes vos: que lo justifique). El "por qué" de 4 tiene que ser del cliente.

**Destinos:**
- 2 y 3 → `compensation.minimum`, `compensation.target_range`, `compensation.currency` (montos sin moneda ni período: ver `destinos.md`), y la línea `Target range:` de `modes/_profile.md` → `## Your Comp Targets`.
- 5 (remoto, ubicación) → `compensation.location_flexibility`.
- 1, 4 y 5 → `modes/_profile.md` → `### Company preferences` (el sueldo actual marcado como privado).

**Habilita:** cada oferta se puntúa contra tu rango y `/coderhub offer-prep` usa el mínimo para negociar. Próxima: 1-4.

## 1-4 · Plan de formación técnica (bonus)

Tres logros reescritos con impacto + una mejora técnica prioritaria.

| # | Pregunta | Tipo | Prellenar desde |
|---|---|---|---|
| 1 | Tres logros o proyectos técnicos: proyecto, impacto, resultado | A | `cv.md` (bullets con números), `article-digest.md`, `narrative.proof_points` |
| 2 | Tu mejora técnica prioritaria (una, con retorno rápido) | A | los gaps de la 1-2 |
| 3 | En cuánto tiempo te proponés lograrla | A | — |

**Regla de calidad:** cada logro tiene **resultado** (qué cambió: tiempo, plata, errores, usuarios, equipo). "Desarrollé la API de pagos" es una tarea: repreguntá por el impacto. Si no hay número real, se acepta un resultado cualitativo concreto ("dejó de haber reclamos por…"), nunca un número inventado. La mejora es una sola y con plazo.

**Destinos:**
- 1 → `article-digest.md` (un bloque por logro) y `narrative.proof_points` (los 1-2 más fuertes).
- 2 y 3 → solo el cuaderno (y mencioná `/coderhub training` para evaluar un curso).

**Habilita:** los CVs a medida y las respuestas de `apply` usan estos logros como prueba. Próxima: 2-1.
