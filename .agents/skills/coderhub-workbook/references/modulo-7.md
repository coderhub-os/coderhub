# Módulo 7 — Entrevista conductual

El módulo que más le sirve al producto: las historias que salen de acá son las que usa `/coderhub interview-prep` para preparar cada entrevista y `apply` para responder formularios. Todo termina en `interview-prep/story-bank.md`.

## 7-0 · Introducción

Sin ejercicio. Ofrecé arrancar con la 7-1.

## 7-1 · Cómo funciona una entrevista conductual

Dos partes: la materia prima (situaciones reales) y las 10 preguntas más frecuentes.

| # | Pregunta | Tipo | Prellenar desde |
|---|---|---|---|
| 1 | Un error o desafío: situación concreta, qué salió mal, qué aprendiste | A | historias `[Failure]` del story bank, errores de la 2-1 |
| 2 | Un logro: situación, tu aporte específico, resultado o impacto | A | logros de la 1-4, `article-digest.md` |
| 3 | Un conflicto: con quién fue (rol, no nombre), qué estaba en juego, cómo lo manejaste | A | story bank |
| 4 | Las 10 preguntas más frecuentes, con tu discurso: contame sobre vos · por qué esta empresa · mayor fortaleza y una debilidad · un proyecto desafiante · trabajo bajo presión · explicar algo complejo a alguien no técnico · tecnologías que manejás con más fluidez · cómo te mantenés actualizado · trabajo en equipo y tu rol · el error más grande y cómo lo solucionaste | A | todo lo anterior: proponé qué historia o dato responde cada pregunta y armá un borrador **en sus palabras**; el cliente corrige |

**Regla de calidad:** situaciones reales y concretas (una vez, un proyecto, una fecha), no "siempre que hay presión me organizo". El aporte es **suyo** ("yo propuse", no "el equipo decidió"). En el conflicto, nada de hablar mal de la otra persona.

Las 10 preguntas son largas: ofrecé hacerlas en tandas (por ejemplo 1-3 hoy y el resto otro día). La lección queda `en-curso` hasta completarlas.

**Destinos:**
- 1, 2 y 3 → `interview-prep/story-bank.md`, una historia cada una (`[Failure]`, `[Achievement]`, `[Conflict]`). Si ya existe una historia sobre lo mismo, proponé mejorarla en vez de duplicar.
- 4 → el cuaderno. Las respuestas que se apoyan en una historia nueva (proyecto desafiante, presión, trabajo en equipo) → story bank también. "Contame sobre vos" → `### Pitch` en `modes/_profile.md` si la 7-3 todavía no lo dejó.

**Habilita:** `/coderhub interview-prep` arma la prep de cada entrevista con tus historias reales, y `apply` las usa en las preguntas abiertas de los formularios. Próxima: 7-2.

## 7-2 · Framework STAR y cómo estructurar tus respuestas

| # | Pregunta | Tipo | Prellenar desde |
|---|---|---|---|
| 1 | Respondé con STAR: "contame de una vez que tuviste que resolver un problema bajo presión". S (contexto), T (tu responsabilidad), A (qué hiciste vos, con verbos concretos), R (resultado + aprendizaje) | A | elegí con el cliente una de las situaciones de la 7-1 y proponé la estructura STAR a partir de lo que ya contó |
| 2 | Chequeo: se cuenta en menos de 2 minutos? queda claro tu aporte personal? hay un aprendizaje explícito? | C | — |

**Regla de calidad:** la A es la parte más larga y tiene verbos en primera persona (analicé, propuse, implementé, coordiné). La R tiene resultado y aprendizaje. Si leída en voz alta pasa los 2 minutos, ayudalo a cortar contexto (la S suele sobrar).

**Destinos:** la historia → `interview-prep/story-bank.md` (`[Pressure]`, `Best for questions about: pressure, deadlines, problem solving`). Si es una historia de la 7-1, reemplazá esa versión por esta (antes → después).

**Habilita:** una historia que podés adaptar a muchas preguntas. `npm run star` te muestra cuáles tenés y para qué sirve cada una. Próxima: 7-3.

## 7-3 · Cómo presentarte frente a cámara

| # | Pregunta | Tipo | Prellenar desde |
|---|---|---|---|
| 1 | Checklist antes de grabarte: cámara a la altura de los ojos, luz de frente, fondo simple, espalda recta y hombros relajados, notificaciones apagadas | C | — |
| 2 | Grabate respondiendo el STAR de la 7-2 (1-2 minutos). Miralo sin sonido: qué comunica tu cuerpo. Con sonido: hablás claro, divagás, te justificás? | C | — |
| 3 | Tu pitch: quién sos, qué hacés, qué te diferencia, qué buscás | A+B | `narrative.headline`, diferencial de la 6-1, rol de la 6-2: armá el esqueleto y el cliente lo dice con sus palabras |

**Regla de calidad:** el pitch dura menos de 1 minuto dicho en voz alta, nombra un logro concreto y termina con lo que busca. La grabación no se lee: se graba.

**Destinos:** 3 → `modes/_profile.md` → `### Pitch`, y la línea más fuerte como `narrative.headline` si mejora la actual. 2 → el cuaderno (lo que notó). `accion-pendiente` hasta que se graba; con `listo`, anotá lo que vio.

**Habilita:** "contame sobre vos" deja de ser improvisado. Próxima: 7-4.

## 7-4 · Auto-evaluación con IA

| # | Pregunta | Tipo | Prellenar desde |
|---|---|---|---|
| 1 | Simulá una entrevista de 10-15 minutos con tu CV y una job description real | C | una oferta de `reports/` o la que pegue el cliente |
| 2 | Feedback: lo que hiciste bien, lo que podés mejorar, la pregunta que te descolocó | A | la sesión de práctica |

**Lo hace `/coderhub interview/practice`** (la simulación) y `/coderhub interview/debrief` (el feedback, que además guarda lo aprendido). Ofrecé correr la práctica ahora con la oferta elegida. Al terminar, anotá en el cuaderno las tres respuestas de 2.

**Destinos:** el cuaderno. Si la pregunta que lo descolocó pide una historia que no tiene, ofrecé armarla (→ story bank).

**Habilita:** practicás contra una oferta real, no contra preguntas genéricas. Próxima: 8-1.
